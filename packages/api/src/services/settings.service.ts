import { prisma } from '../lib/prisma.js';

export async function getAll(section?: string) {
  const where = section ? { section } : {};
  return prisma.setting.findMany({ where, orderBy: [{ section: 'asc' }, { key: 'asc' }] });
}

export async function bulkUpdate(settings: Array<{ key: string; value: string }>) {
  const results = await Promise.all(
    settings.map(({ key, value }) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
  return results;
}
