import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import { sendBookingConfirmation } from '../../services/email.service.js';
import { config } from '../../lib/config.js';

export interface CreateBookingInput {
  service: string;
  petType: string;
  petName: string;
  ownerName: string;
  phone: string;
  bookingDate: string; // ISO date string
  timeSlot: string;
  notes?: string;
  customerEmail?: string;
}

export async function create(projectSlug: string, input: CreateBookingInput) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) throw new AppError(404, `Project '${projectSlug}' not found`);

  // Rate limit: max bookings per calendar month (if configured)
  if (config.MAX_BOOKINGS_PER_MONTH) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const countThisMonth = await prisma.booking.count({
      where: {
        projectId: project.id,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    });

    if (countThisMonth >= config.MAX_BOOKINGS_PER_MONTH) {
      throw new AppError(
        429,
        `Đã đạt giới hạn ${config.MAX_BOOKINGS_PER_MONTH} lịch đặt trong tháng này. Vui lòng thử lại vào tháng sau.`,
      );
    }
  }

  const booking = await prisma.booking.create({
    data: {
      projectId: project.id,
      service: input.service,
      petType: input.petType,
      petName: input.petName,
      ownerName: input.ownerName,
      phone: input.phone,
      bookingDate: new Date(input.bookingDate),
      timeSlot: input.timeSlot,
      notes: input.notes,
    },
  });

  // Fire-and-forget email — don't block response
  sendBookingConfirmation({
    projectName: project.name,
    ownerName: input.ownerName,
    phone: input.phone,
    petName: input.petName,
    petType: input.petType,
    service: input.service,
    bookingDate: new Date(input.bookingDate).toLocaleDateString('vi-VN'),
    timeSlot: input.timeSlot,
    notes: input.notes,
    customerEmail: input.customerEmail,
  }).then(() => {
    prisma.booking.update({ where: { id: booking.id }, data: { emailSent: true } }).catch(() => {});
  }).catch((err) => console.error('[booking] email error:', err));

  return booking;
}

export async function list(projectSlug: string, query: { status?: string; page?: string; limit?: string }) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) throw new AppError(404, `Project '${projectSlug}' not found`);

  const page = Math.max(1, parseInt(query.page ?? '1'));
  const limit = Math.min(100, parseInt(query.limit ?? '20'));
  const skip = (page - 1) * limit;

  const where = {
    projectId: project.id,
    ...(query.status ? { status: query.status as any } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.booking.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.booking.count({ where }),
  ]);

  return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function updateStatus(projectSlug: string, bookingId: string, status: string) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) throw new AppError(404, `Project '${projectSlug}' not found`);

  const booking = await prisma.booking.findFirst({ where: { id: bookingId, projectId: project.id } });
  if (!booking) throw new AppError(404, 'Booking not found');

  return prisma.booking.update({ where: { id: bookingId }, data: { status: status as any } });
}
