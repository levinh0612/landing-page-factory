import { PayOS } from '@payos/node';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import { config } from '../../lib/config.js';

function getPayOS() {
  if (!config.PAYOS_CLIENT_ID || !config.PAYOS_API_KEY || !config.PAYOS_CHECKSUM_KEY) return null;
  return new PayOS({
    clientId: config.PAYOS_CLIENT_ID,
    apiKey: config.PAYOS_API_KEY,
    checksumKey: config.PAYOS_CHECKSUM_KEY,
  });
}

export interface InitiatePaymentInput {
  bookingId?: string;
  amount: number;        // VND
  description: string;  // max 25 chars
  buyerName: string;
  buyerPhone: string;
  cancelUrl: string;
  returnUrl: string;
}

export async function initiate(projectSlug: string, input: InitiatePaymentInput) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) throw new AppError(404, `Project '${projectSlug}' not found`);

  const orderCode = Date.now();

  const payment = await prisma.payment.create({
    data: {
      projectId: project.id,
      bookingId: input.bookingId ?? null,
      amount: input.amount,
      status: 'PENDING',
      provider: 'payos',
      orderCode: String(orderCode),
    },
  });

  const payos = getPayOS();
  if (!payos) {
    const mockUrl = `${config.PUBLIC_API_URL ?? 'http://localhost:5001'}/api/projects/${projectSlug}/payments/${payment.id}/mock-success`;
    return { payment, paymentUrl: mockUrl, qrCode: null, note: 'PayOS not configured — mock mode' };
  }

  const webhookUrl = `${config.PUBLIC_API_URL}/api/projects/${projectSlug}/payments/webhook`;

  // Register webhook URL with PayOS (one-time per project, best-effort)
  payos.webhooks.confirm(webhookUrl).catch(() => {});

  const res = await payos.paymentRequests.create({
    orderCode,
    amount: input.amount,
    description: input.description.slice(0, 25),
    buyerName: input.buyerName,
    buyerPhone: input.buyerPhone,
    cancelUrl: input.cancelUrl,
    returnUrl: input.returnUrl,
    items: [{ name: input.description.slice(0, 25), quantity: 1, price: input.amount }],
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { paymentUrl: res.checkoutUrl, metadata: res as any },
  });

  return { payment, paymentUrl: res.checkoutUrl, qrCode: (res as any).qrCode ?? null };
}

export async function handleWebhook(projectSlug: string, body: any) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) throw new AppError(404, `Project '${projectSlug}' not found`);

  const payos = getPayOS();
  if (!payos) throw new AppError(503, 'PayOS not configured');

  // body shape from PayOS: { code, desc, success, data, signature }
  const webhookData = await payos.webhooks.verify(body);

  if (webhookData.code === '00') {
    const orderCode = String(webhookData.orderCode);
    await prisma.payment.updateMany({
      where: { orderCode, projectId: project.id },
      data: { status: 'PAID', paidAt: new Date(), metadata: webhookData as any },
    });
    const paid = await prisma.payment.findFirst({ where: { orderCode } });
    if (paid?.bookingId) {
      await prisma.booking.update({ where: { id: paid.bookingId }, data: { status: 'CONFIRMED' } });
    }
  }

  return { received: true };
}

// Dev only — simulate successful payment
export async function mockSuccess(projectSlug: string, paymentId: string) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, project: { slug: projectSlug } },
  });
  if (!payment) throw new AppError(404, 'Payment not found');

  await prisma.payment.update({ where: { id: paymentId }, data: { status: 'PAID', paidAt: new Date() } });
  if (payment.bookingId) {
    await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'CONFIRMED' } });
  }
  return payment;
}

export async function list(projectSlug: string, query: { status?: string; page?: string; limit?: string }) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) throw new AppError(404, `Project '${projectSlug}' not found`);

  const page = Math.max(1, parseInt(query.page ?? '1'));
  const limit = Math.min(100, parseInt(query.limit ?? '20'));
  const skip = (page - 1) * limit;

  const where = { projectId: project.id, ...(query.status ? { status: query.status as any } : {}) };

  const [items, total] = await Promise.all([
    prisma.payment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { booking: true } }),
    prisma.payment.count({ where }),
  ]);

  return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}
