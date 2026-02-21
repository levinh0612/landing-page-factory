import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('Seeding database...');

  // Admin user
  const passwordHash = await bcrypt.hash('password123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lpf.local' },
    update: {},
    create: {
      email: 'admin@lpf.local',
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.info(`User: ${admin.email}`);

  // Templates
  const templates = await Promise.all([
    prisma.template.upsert({
      where: { slug: 'education-starter' },
      update: {},
      create: {
        name: 'Education Starter',
        slug: 'education-starter',
        category: 'education',
        description: 'A clean landing page for schools and educational institutions.',
        techStack: ['React', 'Tailwind CSS', 'Vite'],
        plugins: ['contact-form', 'gallery'],
        status: 'ACTIVE',
      },
    }),
    prisma.template.upsert({
      where: { slug: 'restaurant-deluxe' },
      update: {},
      create: {
        name: 'Restaurant Deluxe',
        slug: 'restaurant-deluxe',
        category: 'restaurant',
        description: 'Elegant restaurant landing page with menu showcase and reservations.',
        techStack: ['React', 'Tailwind CSS', 'Framer Motion'],
        plugins: ['menu', 'reservation', 'gallery'],
        status: 'ACTIVE',
      },
    }),
    prisma.template.upsert({
      where: { slug: 'clinic-care' },
      update: {},
      create: {
        name: 'Clinic Care',
        slug: 'clinic-care',
        category: 'healthcare',
        description: 'Professional landing page for clinics and healthcare providers.',
        techStack: ['React', 'Tailwind CSS'],
        plugins: ['appointment', 'team', 'testimonials'],
        status: 'ACTIVE',
      },
    }),
    prisma.template.upsert({
      where: { slug: 'saas-launch' },
      update: {},
      create: {
        name: 'SaaS Launch',
        slug: 'saas-launch',
        category: 'saas',
        description: 'Modern SaaS product launch page with pricing and features.',
        techStack: ['React', 'Tailwind CSS', 'Vite'],
        plugins: ['pricing', 'features', 'testimonials', 'faq'],
        status: 'ACTIVE',
      },
    }),
    prisma.template.upsert({
      where: { slug: 'portfolio-minimal' },
      update: {},
      create: {
        name: 'Portfolio Minimal',
        slug: 'portfolio-minimal',
        category: 'portfolio',
        description: 'Minimalist portfolio template for creatives and freelancers.',
        techStack: ['React', 'Tailwind CSS'],
        plugins: ['gallery', 'contact-form'],
        status: 'DRAFT',
      },
    }),
  ]);
  console.info(`Templates: ${templates.length} created`);

  // Clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Nguyen Van A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        company: 'ABC Education Center',
        notes: 'Referred by existing client',
      },
    }),
    prisma.client.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Tran Thi B',
        email: 'tranthib@example.com',
        phone: '0912345678',
        company: 'Pho Saigon Restaurant',
      },
    }),
  ]);
  console.info(`Clients: ${clients.length} created`);

  // Projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { slug: 'abc-edu-landing' },
      update: {},
      create: {
        clientId: clients[0].id,
        templateId: templates[0].id,
        name: 'ABC Education Landing Page',
        slug: 'abc-edu-landing',
        status: 'IN_PROGRESS',
        deployTarget: 'VERCEL',
      },
    }),
    prisma.project.upsert({
      where: { slug: 'pho-saigon-web' },
      update: {},
      create: {
        clientId: clients[1].id,
        templateId: templates[1].id,
        name: 'Pho Saigon Website',
        slug: 'pho-saigon-web',
        status: 'DRAFT',
        deployTarget: 'NETLIFY',
      },
    }),
  ]);
  console.info(`Projects: ${projects.length} created`);

  // Activity logs
  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, projectId: projects[0].id, action: 'project.created', details: 'Created project ABC Education Landing Page' },
      { userId: admin.id, projectId: projects[0].id, action: 'project.status_changed', details: 'Status changed to IN_PROGRESS' },
      { userId: admin.id, projectId: projects[1].id, action: 'project.created', details: 'Created project Pho Saigon Website' },
    ],
    skipDuplicates: true,
  });
  console.info('Activity logs created');

  console.info('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
