import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import * as activityLog from './activity-log.service.js';
import { fetchWhoisData } from './whois.service.js';
import type {
  CreateDomainRecordInput,
  UpdateDomainRecordInput,
  PaginationInput,
} from '@lpf/shared';
import { DomainStatus } from '@lpf/shared';

export function computeStatus(expiresAt: Date | null | undefined): DomainStatus {
  if (!expiresAt) return DomainStatus.ACTIVE;
  const now = new Date();
  if (expiresAt <= now) return DomainStatus.EXPIRED;
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (expiresAt <= thirtyDays) return DomainStatus.EXPIRING_SOON;
  return DomainStatus.ACTIVE;
}

export async function list(
  query: PaginationInput & { status?: string; clientId?: string },
) {
  const { page, limit, search, sortBy, sortOrder, status, clientId } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { domain: { contains: search, mode: 'insensitive' } },
      { registrar: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (status) where.status = status;
  if (clientId) where.clientId = clientId;

  const [data, total] = await Promise.all([
    prisma.domainRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    }),
    prisma.domainRecord.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string) {
  const record = await prisma.domainRecord.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });
  if (!record) throw new AppError(404, 'Domain record not found');
  return record;
}

export async function create(input: CreateDomainRecordInput, userId?: string) {
  const { fetchWhois, ...data } = input;

  let expiresAt = data.expiresAt ? new Date(data.expiresAt) : undefined;
  let registrar = data.registrar;

  if (fetchWhois) {
    const whois = await fetchWhoisData(data.domain);
    if (whois.expiresAt && !expiresAt) expiresAt = whois.expiresAt;
    if (whois.registrar && !registrar) registrar = whois.registrar;
  }

  const status = computeStatus(expiresAt ?? null);

  const record = await prisma.domainRecord.create({
    data: {
      domain: data.domain,
      clientId: data.clientId,
      projectId: data.projectId ?? null,
      registrar: registrar ?? null,
      purchasedAt: data.purchasedAt ? new Date(data.purchasedAt) : null,
      expiresAt: expiresAt ?? null,
      autoRenew: data.autoRenew ?? false,
      purchaseCost: data.purchaseCost ?? null,
      renewCost: data.renewCost ?? null,
      billedAmount: data.billedAmount ?? null,
      notes: data.notes ?? null,
      status,
    },
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (userId) {
    await activityLog.log({
      userId,
      action: 'domain.created',
      entityType: 'domain_record',
      entityId: record.id,
      details: `Created domain record for ${record.domain}`,
    });
  }

  return record;
}

export async function update(id: string, input: UpdateDomainRecordInput, userId?: string) {
  await getById(id);

  const { fetchWhois, ...data } = input;

  const updateData: Record<string, unknown> = {};

  if (data.domain !== undefined) updateData.domain = data.domain;
  if (data.clientId !== undefined) updateData.clientId = data.clientId;
  if ('projectId' in data) updateData.projectId = data.projectId ?? null;
  if (data.registrar !== undefined) updateData.registrar = data.registrar;
  if (data.purchasedAt !== undefined) updateData.purchasedAt = new Date(data.purchasedAt);
  if (data.autoRenew !== undefined) updateData.autoRenew = data.autoRenew;
  if (data.purchaseCost !== undefined) updateData.purchaseCost = data.purchaseCost;
  if (data.renewCost !== undefined) updateData.renewCost = data.renewCost;
  if (data.billedAmount !== undefined) updateData.billedAmount = data.billedAmount;
  if (data.notes !== undefined) updateData.notes = data.notes;

  let expiresAt: Date | undefined;
  if (data.expiresAt !== undefined) {
    expiresAt = new Date(data.expiresAt);
    updateData.expiresAt = expiresAt;
  }

  // Recompute status if expiresAt changed
  if (expiresAt !== undefined) {
    updateData.status = computeStatus(expiresAt);
  }

  const record = await prisma.domainRecord.update({
    where: { id },
    data: updateData,
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (userId) {
    await activityLog.log({
      userId,
      action: 'domain.updated',
      entityType: 'domain_record',
      entityId: record.id,
      details: `Updated domain record for ${record.domain}`,
    });
  }

  return record;
}

export async function remove(id: string, userId?: string) {
  const record = await getById(id);
  const deleted = await prisma.domainRecord.delete({ where: { id } });

  if (userId) {
    await activityLog.log({
      userId,
      action: 'domain.deleted',
      entityType: 'domain_record',
      entityId: id,
      details: `Deleted domain record for ${record.domain}`,
    });
  }

  return deleted;
}

export async function refreshWhois(id: string, userId?: string) {
  const record = await getById(id);
  const whois = await fetchWhoisData(record.domain);

  const updateData: Record<string, unknown> = {};
  if (whois.expiresAt) updateData.expiresAt = whois.expiresAt;
  if (whois.registrar) updateData.registrar = whois.registrar;

  if (whois.expiresAt) {
    updateData.status = computeStatus(whois.expiresAt);
  }

  const updated = await prisma.domainRecord.update({
    where: { id },
    data: updateData,
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (userId) {
    await activityLog.log({
      userId,
      action: 'domain.whois_refreshed',
      entityType: 'domain_record',
      entityId: id,
      details: `Refreshed WHOIS for ${record.domain}`,
    });
  }

  return updated;
}
