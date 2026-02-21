import { Resend } from 'resend';
import { config } from '../lib/config.js';

const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;
const FROM = 'LPF Platform <onboarding@resend.dev>';
const ADMIN_EMAIL = config.ADMIN_EMAIL ?? 'admin@lpf.local';

export interface BookingEmailData {
  projectName: string;
  ownerName: string;
  phone: string;
  petName: string;
  petType: string;
  service: string;
  bookingDate: string;
  timeSlot: string;
  notes?: string;
  customerEmail?: string;
}

export interface ContactEmailData {
  projectName: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
}

function slotLabel(slot: string) {
  return { morning: 'Sáng (8-12h)', afternoon: 'Chiều (13-17h)', evening: 'Tối (17-20h)' }[slot] ?? slot;
}

function serviceLabel(s: string) {
  return (
    { shop: 'Pet Shop', grooming: 'Grooming', spa: 'Spa', hotel: 'Khách sạn' }[s] ?? s
  );
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  if (!resend) return logFallback('booking-confirmation', data);

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#FF6B9D">🐾 Đặt lịch thành công!</h2>
      <p>Xin chào <strong>${data.ownerName}</strong>,</p>
      <p>Chúng tôi đã nhận được lịch hẹn của bạn tại <strong>${data.projectName}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        ${row('Thú cưng', `${data.petName} (${data.petType === 'cat' ? 'Mèo 🐱' : 'Chó 🐶'})`)}
        ${row('Dịch vụ', serviceLabel(data.service))}
        ${row('Ngày', data.bookingDate)}
        ${row('Khung giờ', slotLabel(data.timeSlot))}
        ${row('Liên hệ', data.phone)}
        ${data.notes ? row('Ghi chú', data.notes) : ''}
      </table>
      <p>Chúng tôi sẽ liên hệ xác nhận lịch qua số <strong>${data.phone}</strong> sớm nhất.</p>
      <p style="color:#888;font-size:12px">Email này được gửi tự động, vui lòng không reply.</p>
    </div>`;

  const tasks = [
    resend.emails.send({ from: FROM, to: ADMIN_EMAIL, subject: `[${data.projectName}] Đặt lịch mới - ${data.ownerName}`, html }),
  ];
  if (data.customerEmail) {
    tasks.push(resend.emails.send({ from: FROM, to: data.customerEmail, subject: `Xác nhận đặt lịch tại ${data.projectName}`, html }));
  }
  await Promise.allSettled(tasks);
}

export async function sendContactNotification(data: ContactEmailData) {
  if (!resend) return logFallback('contact-notification', data);

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#7C3AED">📩 Liên hệ mới từ ${data.projectName}</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        ${row('Họ tên', data.name)}
        ${data.phone ? row('Điện thoại', data.phone) : ''}
        ${data.email ? row('Email', data.email) : ''}
        ${row('Nội dung', data.message)}
      </table>
    </div>`;

  await resend.emails.send({ from: FROM, to: ADMIN_EMAIL, subject: `[${data.projectName}] Liên hệ mới - ${data.name}`, html });
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:8px;background:#f9f9f9;font-weight:bold;width:120px">${label}</td>
    <td style="padding:8px;border-bottom:1px solid #eee">${value}</td>
  </tr>`;
}

function logFallback(type: string, data: unknown) {
  console.info(`[email:${type}] RESEND_API_KEY not set — email skipped:`, JSON.stringify(data, null, 2));
}
