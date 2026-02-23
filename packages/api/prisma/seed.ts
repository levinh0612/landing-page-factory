import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __seedDirname = path.dirname(fileURLToPath(import.meta.url));

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

  // Editor user
  const editorHash = await bcrypt.hash('password123', 12);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@lpf.local' },
    update: {},
    create: {
      email: 'editor@lpf.local',
      passwordHash: editorHash,
      name: 'Editor User',
      role: 'EDITOR',
    },
  });
  console.info(`User: ${editor.email}`);

  // Viewer user
  const viewerHash = await bcrypt.hash('password123', 12);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@lpf.local' },
    update: {},
    create: {
      email: 'viewer@lpf.local',
      passwordHash: viewerHash,
      name: 'Viewer User',
      role: 'VIEWER',
    },
  });
  console.info(`User: ${viewer.email}`);

  // Config schemas for templates
  const educationConfigSchema = {
    fields: [
      { key: 'schoolName', label: 'School Name', type: 'text', default: 'ABC Education Center', required: true },
      { key: 'heroTitle', label: 'Hero Title', type: 'text', default: 'Empowering Minds, Shaping Futures', required: true },
      { key: 'heroSubtitle', label: 'Hero Subtitle', type: 'textarea', default: 'Discover our world-class educational programs.', required: false },
      { key: 'primaryColor', label: 'Primary Color', type: 'color', default: '#2563eb' },
      { key: 'showContact', label: 'Show Contact Section', type: 'boolean', default: true },
    ],
  };

  const restaurantConfigSchema = {
    fields: [
      { key: 'restaurantName', label: 'Restaurant Name', type: 'text', default: 'My Restaurant', required: true },
      { key: 'tagline', label: 'Tagline', type: 'text', default: 'Authentic cuisine, unforgettable experience', required: true },
      { key: 'primaryColor', label: 'Primary Color', type: 'color', default: '#dc2626' },
      { key: 'cuisineType', label: 'Cuisine Type', type: 'select', default: 'Vietnamese', options: ['Vietnamese', 'Italian', 'Japanese', 'Mexican', 'French', 'Other'] },
      { key: 'showReservation', label: 'Show Reservation Form', type: 'boolean', default: true },
      { key: 'menuUrl', label: 'Menu PDF URL', type: 'url', default: '' },
    ],
  };

  const clinicConfigSchema = {
    fields: [
      { key: 'clinicName', label: 'Clinic Name', type: 'text', default: 'Care Clinic', required: true },
      { key: 'specialty', label: 'Specialty', type: 'select', default: 'General', options: ['General', 'Dental', 'Dermatology', 'Pediatrics', 'Orthopedics'] },
      { key: 'heroTitle', label: 'Hero Title', type: 'text', default: 'Your Health, Our Priority', required: true },
      { key: 'primaryColor', label: 'Primary Color', type: 'color', default: '#059669' },
      { key: 'showAppointment', label: 'Show Appointment Form', type: 'boolean', default: true },
      { key: 'phoneNumber', label: 'Phone Number', type: 'text', default: '' },
    ],
  };

  const saasConfigSchema = {
    fields: [
      { key: 'productName', label: 'Product Name', type: 'text', default: 'SaaS Product', required: true },
      { key: 'heroTitle', label: 'Hero Title', type: 'text', default: 'Launch faster, scale smarter', required: true },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea', default: 'The all-in-one platform for modern teams.', required: false },
      { key: 'primaryColor', label: 'Primary Color', type: 'color', default: '#7c3aed' },
      { key: 'ctaText', label: 'CTA Button Text', type: 'text', default: 'Start Free Trial' },
      { key: 'showPricing', label: 'Show Pricing Section', type: 'boolean', default: true },
    ],
  };

  const portfolioConfigSchema = {
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', default: 'John Doe', required: true },
      { key: 'title', label: 'Professional Title', type: 'text', default: 'Creative Designer', required: true },
      { key: 'bio', label: 'Bio', type: 'textarea', default: 'Passionate designer with 10+ years of experience.', required: false },
      { key: 'primaryColor', label: 'Primary Color', type: 'color', default: '#0f172a' },
      { key: 'showContact', label: 'Show Contact Form', type: 'boolean', default: true },
    ],
  };

  // Helper: copy template source files into uploads directory
  function seedTemplateFiles(templateId: string, sourceFolder: string) {
    const srcDir = path.resolve(__seedDirname, '../../../templates', sourceFolder);
    const destDir = path.resolve(__seedDirname, '../uploads/templates', templateId, 'v1');
    if (fs.existsSync(destDir)) return; // already seeded
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
      const srcFile = path.join(srcDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, path.join(destDir, file));
      }
    }
  }

  // PetCare Anime template config schema
  const PETCARE_ANIME_ID = 'aa000000-0000-0000-0000-000000000001';
  const KARINOX_CF_ID = 'bb000000-0000-0000-0000-000000000001';
  const karinoxCfConfigSchema = {
    fields: [
      { key: 'brandName', label: 'Tên thương hiệu', type: 'text', default: 'Karinox Coffee', required: true },
      { key: 'tagline', label: 'Tagline', type: 'text', default: 'Hương vị đặc trưng - Không gian riêng tư' },
      { key: 'heroTitle', label: 'Tiêu đề Hero', type: 'text', default: 'Cà Phê Karinox', required: true },
      { key: 'heroSubtitle', label: 'Mô tả Hero', type: 'textarea', default: 'Nơi bạn tìm thấy hương vị cà phê đặc trưng và không gian thư giãn tuyệt vời' },
      { key: 'primaryColor', label: 'Màu chính', type: 'color', default: '#32373c' },
      { key: 'accentColor', label: 'Màu nhấn', type: 'color', default: '#c8a96e' },
      { key: 'aboutText', label: 'Giới thiệu thương hiệu', type: 'textarea', default: 'Karinox Coffee ra đời từ niềm đam mê với hạt cà phê Việt Nam.' },
      { key: 'foundedYear', label: 'Năm thành lập', type: 'text', default: '2020' },
      { key: 'phone', label: 'Số điện thoại', type: 'text', default: '0325 013 789', required: true },
      { key: 'email', label: 'Email', type: 'email', default: 'karinox.coffee@gmail.com' },
      { key: 'zalo', label: 'Zalo', type: 'text', default: '0325013789' },
      { key: 'facebook', label: 'Facebook URL', type: 'url', default: '' },
      { key: 'instagram', label: 'Instagram URL', type: 'url', default: '' },
      { key: 'tiktok', label: 'TikTok URL', type: 'url', default: '' },
      { key: 'youtube', label: 'YouTube URL', type: 'url', default: '' },
      { key: 'shopee', label: 'Shopee URL', type: 'url', default: '' },
      { key: 'store1Name', label: 'Cửa hàng 1 - Tên', type: 'text', default: 'Ninh Thuận' },
      { key: 'store1Address', label: 'Cửa hàng 1 - Địa chỉ', type: 'text', default: 'Lô TM27-1 Hoàng Diệu, Phan Rang-Tháp Chàm' },
      { key: 'store1MapUrl', label: 'Cửa hàng 1 - Google Maps URL', type: 'url', default: '' },
      { key: 'store2Name', label: 'Cửa hàng 2 - Tên', type: 'text', default: 'Gia Lai' },
      { key: 'store2Address', label: 'Cửa hàng 2 - Địa chỉ', type: 'text', default: '212 Nguyễn Tất Thành, Pleiku' },
      { key: 'store2MapUrl', label: 'Cửa hàng 2 - Google Maps URL', type: 'url', default: '' },
      { key: 'bookingWebhook', label: 'Booking Webhook URL', type: 'url', default: '' },
      { key: 'payosClientId', label: 'PayOS Client ID', type: 'text', default: '' },
      { key: 'payosApiKey', label: 'PayOS API Key', type: 'password', default: '' },
      { key: 'member1Name', label: 'Thành viên cấp 1', type: 'text', default: 'Basic' },
      { key: 'member1Price', label: 'Phí cấp 1 (VND)', type: 'text', default: 'Miễn phí' },
      { key: 'member1Perks', label: 'Quyền lợi cấp 1', type: 'textarea', default: 'Tích điểm mỗi lần mua|Sinh nhật tặng 1 ly cà phê|Thông báo khuyến mãi sớm' },
      { key: 'member2Name', label: 'Thành viên cấp 2', type: 'text', default: 'Silver' },
      { key: 'member2Price', label: 'Phí cấp 2 (VND)', type: 'text', default: '199.000' },
      { key: 'member2Perks', label: 'Quyền lợi cấp 2', type: 'textarea', default: 'Tất cả quyền lợi Basic|Giảm 10% mọi đơn hàng|Ưu tiên đặt bàn cuối tuần|Tặng 1 combo mỗi tháng' },
      { key: 'member3Name', label: 'Thành viên cấp 3', type: 'text', default: 'Gold' },
      { key: 'member3Price', label: 'Phí cấp 3 (VND)', type: 'text', default: '499.000' },
      { key: 'member3Perks', label: 'Quyền lợi cấp 3', type: 'textarea', default: 'Tất cả quyền lợi Silver|Giảm 20% mọi đơn hàng|Bàn VIP riêng tư|Thức uống chào mừng miễn phí|Tư vấn cà phê 1-1 với chuyên gia' },
      { key: 'footerTagline', label: 'Footer tagline', type: 'text', default: 'Hương vị đặc trưng từ vùng cao nguyên' },
    ],
  };

  const petcareAnimeConfigSchema = {
    fields: [
      { key: 'shopName', label: 'Tên cửa hàng', type: 'text', default: 'PetCare Shop', required: true },
      { key: 'heroTitle', label: 'Tiêu đề Hero', type: 'text', default: 'Thiên Đường Cho Thú Cưng Của Bạn', required: true },
      { key: 'heroSubtitle', label: 'Mô tả Hero', type: 'textarea', default: 'Dịch vụ chăm sóc thú cưng toàn diện: Pet Shop, Grooming, Spa, Hotel', required: false },
      { key: 'primaryColor', label: 'Màu chủ đạo', type: 'color', default: '#FF6B9D' },
      { key: 'phone', label: 'Số điện thoại', type: 'text', default: '0785877686', required: true },
      { key: 'address', label: 'Địa chỉ', type: 'text', default: '41B Trường Chinh, TP.HCM', required: true },
      { key: 'zalo', label: 'Zalo', type: 'text', default: '0785877686' },
      { key: 'facebook', label: 'Facebook URL', type: 'url', default: '' },
      { key: 'showBooking', label: 'Hiện form đặt lịch', type: 'boolean', default: true },
      { key: 'showPricing', label: 'Hiện bảng giá', type: 'boolean', default: true },
      { key: 'showGallery', label: 'Hiện gallery', type: 'boolean', default: true },
    ],
  };

  // E-Card template IDs
  const ECARD_CLASSIC_ID = 'ee000000-0000-0000-0000-000000000001';
  const ECARD_ANIME_ID = 'ee000000-0000-0000-0000-000000000002';
  const ECARD_MODERN_ID = 'ee000000-0000-0000-0000-000000000003';

  const ecardClassicConfigSchema = {
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', default: 'Jonathan Smith', required: true },
      { key: 'jobTitle', label: 'Job Title', type: 'text', default: 'Senior Product Manager', required: true },
      { key: 'company', label: 'Company', type: 'text', default: 'Acme Corporation' },
      { key: 'phone', label: 'Phone', type: 'text', default: '+1 (555) 123-4567' },
      { key: 'email', label: 'Email', type: 'text', default: 'jonathan@acmecorp.com' },
      { key: 'avatarUrl', label: 'Avatar URL', type: 'url', default: '' },
      { key: 'tagline', label: 'Tagline', type: 'text', default: 'Turning ideas into products people love' },
      { key: 'accentColor', label: 'Accent Color', type: 'color', default: '#1e3a5f' },
      { key: 'address', label: 'Address', type: 'text', default: 'New York, NY, USA' },
      { key: 'website', label: 'Website URL', type: 'url', default: 'https://jonathansmith.com' },
      { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'url', default: '' },
      { key: 'facebookUrl', label: 'Facebook URL', type: 'url', default: '' },
      { key: 'showQR', label: 'Show QR Code', type: 'boolean', default: true },
      { key: 'qrValue', label: 'QR Code Value (URL)', type: 'url', default: 'https://jonathansmith.com' },
    ],
  };

  const ecardAnimeConfigSchema = {
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', default: 'Sakura Tanaka', required: true },
      { key: 'jobTitle', label: 'Job Title', type: 'text', default: 'Digital Artist & Illustrator', required: true },
      { key: 'company', label: 'Company / Studio', type: 'text', default: 'Sakura Creative Studio' },
      { key: 'phone', label: 'Phone', type: 'text', default: '+84 012 345 6789' },
      { key: 'email', label: 'Email', type: 'text', default: 'sakura@creative.studio' },
      { key: 'avatarUrl', label: 'Avatar URL', type: 'url', default: '' },
      { key: 'tagline', label: 'Tagline', type: 'text', default: '✨ Bringing dreams to life, one brushstroke at a time' },
      { key: 'primaryColor', label: 'Primary Color (Pink)', type: 'color', default: '#FF6B9D' },
      { key: 'accentColor', label: 'Accent Color (Purple)', type: 'color', default: '#7C3AED' },
      { key: 'address', label: 'Address', type: 'text', default: 'Ho Chi Minh City, Vietnam' },
      { key: 'instagramUrl', label: 'Instagram URL', type: 'url', default: '' },
      { key: 'tiktokUrl', label: 'TikTok URL', type: 'url', default: '' },
      { key: 'zaloUrl', label: 'Zalo URL', type: 'url', default: '' },
      { key: 'showQR', label: 'Show QR Code', type: 'boolean', default: true },
      { key: 'qrValue', label: 'QR Code Value (URL)', type: 'url', default: 'https://instagram.com/sakura.art' },
    ],
  };

  const ecardModernConfigSchema = {
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', default: 'Alex Chen', required: true },
      { key: 'jobTitle', label: 'Job Title', type: 'text', default: 'Full-Stack Engineer', required: true },
      { key: 'company', label: 'Company', type: 'text', default: 'TechVentures Inc.' },
      { key: 'phone', label: 'Phone', type: 'text', default: '+1 (415) 987-6543' },
      { key: 'email', label: 'Email', type: 'text', default: 'alex@techventures.io' },
      { key: 'avatarUrl', label: 'Avatar URL', type: 'url', default: '' },
      { key: 'tagline', label: 'Tagline', type: 'text', default: 'Building products at the intersection of design and engineering' },
      { key: 'accentColor', label: 'Accent Color', type: 'color', default: '#0ea5e9' },
      { key: 'address', label: 'Location', type: 'text', default: 'San Francisco, CA' },
      { key: 'website', label: 'Website URL', type: 'url', default: 'https://alexchen.dev' },
      { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'url', default: '' },
      { key: 'githubUrl', label: 'GitHub URL', type: 'url', default: '' },
      { key: 'twitterUrl', label: 'Twitter / X URL', type: 'url', default: '' },
      { key: 'showQR', label: 'Show QR Code', type: 'boolean', default: true },
      { key: 'qrValue', label: 'QR Code Value (URL)', type: 'url', default: 'https://alexchen.dev' },
    ],
  };

  // Templates
  const templates = await Promise.all([
    prisma.template.upsert({
      where: { slug: 'education-starter' },
      update: { configSchema: educationConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        name: 'Education Starter',
        slug: 'education-starter',
        category: 'education',
        description: 'A clean landing page for schools and educational institutions.',
        techStack: ['React', 'Tailwind CSS', 'Vite'],
        plugins: ['contact-form', 'gallery'],
        status: 'ACTIVE',
        configSchema: educationConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.template.upsert({
      where: { slug: 'restaurant-deluxe' },
      update: { configSchema: restaurantConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        name: 'Restaurant Deluxe',
        slug: 'restaurant-deluxe',
        category: 'restaurant',
        description: 'Elegant restaurant landing page with menu showcase and reservations.',
        techStack: ['React', 'Tailwind CSS', 'Framer Motion'],
        plugins: ['menu', 'reservation', 'gallery'],
        status: 'ACTIVE',
        configSchema: restaurantConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.template.upsert({
      where: { slug: 'clinic-care' },
      update: { configSchema: clinicConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        name: 'Clinic Care',
        slug: 'clinic-care',
        category: 'healthcare',
        description: 'Professional landing page for clinics and healthcare providers.',
        techStack: ['React', 'Tailwind CSS'],
        plugins: ['appointment', 'team', 'testimonials'],
        status: 'ACTIVE',
        configSchema: clinicConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.template.upsert({
      where: { slug: 'saas-launch' },
      update: { configSchema: saasConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        name: 'SaaS Launch',
        slug: 'saas-launch',
        category: 'saas',
        description: 'Modern SaaS product launch page with pricing and features.',
        techStack: ['React', 'Tailwind CSS', 'Vite'],
        plugins: ['pricing', 'features', 'testimonials', 'faq'],
        status: 'ACTIVE',
        configSchema: saasConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.template.upsert({
      where: { slug: 'portfolio-minimal' },
      update: { configSchema: portfolioConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        name: 'Portfolio Minimal',
        slug: 'portfolio-minimal',
        category: 'portfolio',
        description: 'Minimalist portfolio template for creatives and freelancers.',
        techStack: ['React', 'Tailwind CSS'],
        plugins: ['gallery', 'contact-form'],
        status: 'DRAFT',
        configSchema: portfolioConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.template.upsert({
      where: { slug: 'petcare-anime' },
      update: { configSchema: petcareAnimeConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        id: PETCARE_ANIME_ID,
        name: 'PetCare Anime',
        slug: 'petcare-anime',
        category: 'petcare',
        description: 'Landing page phong cách anime/kawaii cho tiệm thú cưng. Đầy đủ: đặt lịch, bảng giá, gallery, thanh toán, CSKH.',
        techStack: ['HTML', 'CSS', 'JavaScript'],
        plugins: ['booking', 'pricing', 'gallery', 'payment', 'faq', 'chat-widget'],
        status: 'ACTIVE',
        version: 1,
        filePath: `templates/${PETCARE_ANIME_ID}/v1`,
        configSchema: petcareAnimeConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.template.upsert({
      where: { slug: 'karinox-cf' },
      update: { configSchema: karinoxCfConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        id: KARINOX_CF_ID,
        name: 'Karinox Coffee',
        slug: 'karinox-cf',
        category: 'cafe',
        description: 'Landing page thương hiệu cà phê cao cấp. Đầy đủ: menu, đặt bàn, giỏ hàng, membership, hệ thống cửa hàng.',
        techStack: ['HTML', 'CSS', 'JavaScript'],
        plugins: ['booking', 'cart', 'payment', 'membership', 'gallery'],
        status: 'ACTIVE',
        version: 1,
        filePath: `templates/${KARINOX_CF_ID}/v1`,
        configSchema: karinoxCfConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.template.upsert({
      where: { slug: 'ecard-classic' },
      update: { configSchema: ecardClassicConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        id: ECARD_CLASSIC_ID,
        name: 'E-Card Classic',
        slug: 'ecard-classic',
        category: 'e-card',
        description: 'Professional digital business card — navy accent, serif typography, clean layout.',
        techStack: ['HTML', 'CSS', 'JavaScript'],
        plugins: ['qr-code'],
        status: 'ACTIVE',
        version: 1,
        filePath: `templates/${ECARD_CLASSIC_ID}/v1`,
        configSchema: ecardClassicConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.template.upsert({
      where: { slug: 'ecard-anime' },
      update: { configSchema: ecardAnimeConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        id: ECARD_ANIME_ID,
        name: 'E-Card Anime',
        slug: 'ecard-anime',
        category: 'e-card',
        description: 'Cute & creative digital business card — pink-purple gradient, Nunito font, sparkle animations.',
        techStack: ['HTML', 'CSS', 'JavaScript'],
        plugins: ['qr-code'],
        status: 'ACTIVE',
        version: 1,
        filePath: `templates/${ECARD_ANIME_ID}/v1`,
        configSchema: ecardAnimeConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.template.upsert({
      where: { slug: 'ecard-modern' },
      update: { configSchema: ecardModernConfigSchema as unknown as Prisma.InputJsonValue },
      create: {
        id: ECARD_MODERN_ID,
        name: 'E-Card Modern',
        slug: 'ecard-modern',
        category: 'e-card',
        description: 'Minimal modern digital business card — white canvas, Inter font, single accent color.',
        techStack: ['HTML', 'CSS', 'JavaScript'],
        plugins: ['qr-code'],
        status: 'ACTIVE',
        version: 1,
        filePath: `templates/${ECARD_MODERN_ID}/v1`,
        configSchema: ecardModernConfigSchema as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);

  // Seed e-card template files into uploads directory
  seedTemplateFiles(ECARD_CLASSIC_ID, 'ecard-classic');
  seedTemplateFiles(ECARD_ANIME_ID, 'ecard-anime');
  seedTemplateFiles(ECARD_MODERN_ID, 'ecard-modern');

  console.info(`Templates: ${templates.length} created`);

  // Client IDs
  const KARINOX_CLIENT_ID = 'dd000000-0000-0000-0000-000000000001';

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
    prisma.client.upsert({
      where: { id: KARINOX_CLIENT_ID },
      update: {},
      create: {
        id: KARINOX_CLIENT_ID,
        name: 'Karinox Coffee',
        email: 'karinox.coffee@gmail.com',
        phone: '0325013789',
        company: 'Karinox Coffee',
        notes: 'Thương hiệu cà phê tại Ninh Thuận & Gia Lai',
      },
    }),
    prisma.client.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Nguyen Thi Bich',
        email: 'bich.petshop@example.com',
        phone: '0901122334',
        company: '2 Mèo 1 Gâu Pet Shop',
        notes: 'Tiệm thú cưng phong cách anime tại TP.HCM',
      },
    }),
  ]);
  console.info(`Clients: ${clients.length} created`);

  // Project IDs
  const KARINOX_PROJECT_ID = 'cc000000-0000-0000-0000-000000000001';

  // Projects with config values
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { slug: 'abc-edu-landing' },
      update: {
        config: {
          schoolName: 'ABC Education Center',
          heroTitle: 'Building Tomorrow\'s Leaders Today',
          heroSubtitle: 'Join our community of 500+ students and 50+ experienced educators.',
          primaryColor: '#1d4ed8',
          showContact: true,
        } as unknown as Prisma.InputJsonValue,
      },
      create: {
        clientId: clients[0].id,
        templateId: templates[0].id,
        name: 'ABC Education Landing Page',
        slug: 'abc-edu-landing',
        status: 'IN_PROGRESS',
        deployTarget: 'VERCEL',
        config: {
          schoolName: 'ABC Education Center',
          heroTitle: 'Building Tomorrow\'s Leaders Today',
          heroSubtitle: 'Join our community of 500+ students and 50+ experienced educators.',
          primaryColor: '#1d4ed8',
          showContact: true,
        } as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.project.upsert({
      where: { slug: 'pho-saigon-web' },
      update: {
        config: {
          restaurantName: 'Pho Saigon',
          tagline: 'Authentic Vietnamese Cuisine Since 1995',
          primaryColor: '#b91c1c',
          cuisineType: 'Vietnamese',
          showReservation: true,
          menuUrl: '',
        } as unknown as Prisma.InputJsonValue,
      },
      create: {
        clientId: clients[1].id,
        templateId: templates[1].id,
        name: 'Pho Saigon Website',
        slug: 'pho-saigon-web',
        status: 'DRAFT',
        deployTarget: 'NETLIFY',
        config: {
          restaurantName: 'Pho Saigon',
          tagline: 'Authentic Vietnamese Cuisine Since 1995',
          primaryColor: '#b91c1c',
          cuisineType: 'Vietnamese',
          showReservation: true,
          menuUrl: '',
        } as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.project.upsert({
      where: { id: KARINOX_PROJECT_ID },
      update: {
        config: {
          brandName: 'Karinox Coffee',
          tagline: 'Hương vị đặc trưng - Không gian riêng tư',
          heroTitle: 'Cà Phê Karinox',
          heroSubtitle: 'Nơi bạn tìm thấy hương vị cà phê đặc trưng và không gian thư giãn tuyệt vời',
          primaryColor: '#32373c',
          accentColor: '#c8a96e',
          phone: '0325 013 789',
          email: 'karinox.coffee@gmail.com',
          zalo: '0325013789',
          store1Name: 'Ninh Thuận',
          store1Address: 'Lô TM27-1 Hoàng Diệu, Phan Rang-Tháp Chàm',
          store2Name: 'Gia Lai',
          store2Address: '212 Nguyễn Tất Thành, Pleiku',
          footerTagline: 'Hương vị đặc trưng từ vùng cao nguyên',
        } as unknown as Prisma.InputJsonValue,
      },
      create: {
        id: KARINOX_PROJECT_ID,
        templateId: KARINOX_CF_ID,
        clientId: KARINOX_CLIENT_ID,
        name: 'Karinox Coffee - Official',
        slug: 'karinox-cf',
        status: 'IN_PROGRESS',
        deployTarget: 'VERCEL',
        config: {
          brandName: 'Karinox Coffee',
          tagline: 'Hương vị đặc trưng - Không gian riêng tư',
          heroTitle: 'Cà Phê Karinox',
          heroSubtitle: 'Nơi bạn tìm thấy hương vị cà phê đặc trưng và không gian thư giãn tuyệt vời',
          primaryColor: '#32373c',
          accentColor: '#c8a96e',
          aboutText: 'Karinox Coffee ra đời từ niềm đam mê với hạt cà phê Việt Nam. Chúng tôi mang đến không gian thư giãn sang trọng và hương vị cà phê đặc trưng từ vùng cao nguyên Gia Lai và Ninh Thuận.',
          foundedYear: '2020',
          phone: '0325 013 789',
          email: 'karinox.coffee@gmail.com',
          zalo: '0325013789',
          store1Name: 'Ninh Thuận',
          store1Address: 'Lô TM27-1 Hoàng Diệu, Phan Rang-Tháp Chàm',
          store2Name: 'Gia Lai',
          store2Address: '212 Nguyễn Tất Thành, Pleiku',
          member1Name: 'Basic',
          member1Price: 'Miễn phí',
          member1Perks: 'Tích điểm mỗi lần mua|Sinh nhật tặng 1 ly cà phê|Thông báo khuyến mãi sớm',
          member2Name: 'Silver',
          member2Price: '199.000',
          member2Perks: 'Tất cả quyền lợi Basic|Giảm 10% mọi đơn hàng|Ưu tiên đặt bàn cuối tuần|Tặng 1 combo mỗi tháng',
          member3Name: 'Gold',
          member3Price: '499.000',
          member3Perks: 'Tất cả quyền lợi Silver|Giảm 20% mọi đơn hàng|Bàn VIP riêng tư|Thức uống chào mừng miễn phí|Tư vấn cà phê 1-1 với chuyên gia',
          footerTagline: 'Hương vị đặc trưng từ vùng cao nguyên',
        } as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.project.upsert({
      where: { slug: 'hai-meo-mot-gau' },
      update: {
        config: {
          shopName: '2 Mèo 1 Gâu Pet Shop',
          heroTitle: 'Thiên Đường Cho Thú Cưng Của Bạn 🐱🐶',
          heroSubtitle: 'Dịch vụ Grooming, Spa, Hotel & Shop thú cưng tại TP.HCM. Đội ngũ chuyên nghiệp, tận tâm 5★',
          primaryColor: '#FF6B9D',
          phone: '0901122334',
          address: '123 Đường Thú Cưng, Quận 7, TP.HCM',
          zalo: '0901122334',
          facebook: 'https://facebook.com/2meo1gau',
          showBooking: true,
          showPricing: true,
          showGallery: true,
        } as unknown as Prisma.InputJsonValue,
      },
      create: {
        clientId: clients[2].id,
        templateId: templates[5].id, // petcare-anime (index 5)
        name: '2 Mèo 1 Gâu - Landing Page',
        slug: 'hai-meo-mot-gau',
        status: 'IN_PROGRESS',
        deployTarget: 'VERCEL',
        domain: '2meo1gau.vercel.app',
        config: {
          shopName: '2 Mèo 1 Gâu Pet Shop',
          heroTitle: 'Thiên Đường Cho Thú Cưng Của Bạn 🐱🐶',
          heroSubtitle: 'Dịch vụ Grooming, Spa, Hotel & Shop thú cưng tại TP.HCM. Đội ngũ chuyên nghiệp, tận tâm 5★',
          primaryColor: '#FF6B9D',
          phone: '0901122334',
          address: '123 Đường Thú Cưng, Quận 7, TP.HCM',
          zalo: '0901122334',
          facebook: 'https://facebook.com/2meo1gau',
          showBooking: true,
          showPricing: true,
          showGallery: true,
        } as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);
  console.info(`Projects: ${projects.length} created`);

  // Activity logs
  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, projectId: projects[0].id, action: 'project.created', entityType: 'project', entityId: projects[0].id, details: 'Created project ABC Education Landing Page' },
      { userId: admin.id, projectId: projects[0].id, action: 'project.status_changed', entityType: 'project', entityId: projects[0].id, details: 'Status changed to IN_PROGRESS' },
      { userId: admin.id, projectId: projects[1].id, action: 'project.created', entityType: 'project', entityId: projects[1].id, details: 'Created project Pho Saigon Website' },
      { userId: editor.id, action: 'auth.login', entityType: 'user', entityId: editor.id, details: 'Editor user logged in' },
      { userId: admin.id, action: 'template.created', entityType: 'template', entityId: templates[0].id, details: 'Created template Education Starter' },
      { userId: admin.id, action: 'template.created', entityType: 'template', entityId: templates[5].id, details: 'Created template PetCare Anime' },
      { userId: admin.id, action: 'template.uploaded', entityType: 'template', entityId: templates[5].id, details: 'Uploaded files for PetCare Anime v1' },
      { userId: admin.id, projectId: projects[2].id, action: 'project.created', entityType: 'project', entityId: projects[2].id, details: 'Created project 2 Mèo 1 Gâu - Landing Page' },
      { userId: admin.id, action: 'template.created', entityType: 'template', entityId: KARINOX_CF_ID, details: 'Created template Karinox Coffee' },
      { userId: admin.id, action: 'template.uploaded', entityType: 'template', entityId: KARINOX_CF_ID, details: 'Uploaded files for Karinox Coffee v1' },
      { userId: admin.id, projectId: KARINOX_PROJECT_ID, action: 'project.created', entityType: 'project', entityId: KARINOX_PROJECT_ID, details: 'Created project Karinox Coffee - Official' },
    ],
    skipDuplicates: true,
  });
  console.info('Activity logs created');

  // ─── Built-in Plugins ──────────────────────────────────────────────────────
  const builtInPlugins = [
    { slug: 'booking', name: 'Booking System', description: 'Allow visitors to book appointments directly from the landing page', category: 'booking', icon: '📅' },
    { slug: 'contact-form', name: 'Contact Form', description: 'Capture leads with a customizable contact form and email notifications', category: 'contact', icon: '📬' },
    { slug: 'payment', name: 'Payment Gateway', description: 'Accept payments via PayOS, Stripe, or VNPay', category: 'payment', icon: '💳' },
    { slug: 'analytics', name: 'Analytics', description: 'Track page views, conversion rates, and visitor behavior', category: 'analytics', icon: '📊' },
    { slug: 'seo', name: 'SEO Optimizer', description: 'Automated meta tags, structured data, and sitemap generation', category: 'seo', icon: '🔍' },
    { slug: 'live-chat', name: 'Live Chat', description: 'Embed a live chat widget (Tidio, Crisp, or Tawk.to) on the page', category: 'chat', icon: '💬' },
    { slug: 'gallery', name: 'Photo Gallery', description: 'Lightbox gallery with masonry layout and lazy loading', category: 'gallery', icon: '🖼️' },
    { slug: 'video-player', name: 'Video Player', description: 'Embed YouTube, Vimeo, or self-hosted videos with autoplay options', category: 'video', icon: '▶️' },
    { slug: 'countdown', name: 'Countdown Timer', description: 'Create urgency with customizable countdown timers and launch events', category: 'countdown', icon: '⏱️' },
  ];

  for (const plugin of builtInPlugins) {
    await prisma.plugin.upsert({
      where: { slug: plugin.slug },
      update: { name: plugin.name, description: plugin.description, category: plugin.category, icon: plugin.icon },
      create: { ...plugin, isBuiltIn: true },
    });
  }
  console.info(`Plugins: ${builtInPlugins.length} seeded`);

  // ─── Marketplace Templates ─────────────────────────────────────────────────
  const curatedTemplates = [
    // Landing pages
    { slug: 'html5up-massively', name: 'Massively', description: 'Big background imagery and the massively opinionated design language', category: 'landing-page', tags: ['blog', 'magazine', 'bold'], previewUrl: 'https://html5up.net/massively', sourceUrl: 'https://github.com/html5up/massively', githubRepo: null, stars: 3200, source: 'curated' },
    { slug: 'html5up-stellar', name: 'Stellar', description: 'Beautifully designed landing page with an innovative scroll-based layout', category: 'landing-page', tags: ['minimal', 'clean', 'scroll'], previewUrl: 'https://html5up.net/stellar', sourceUrl: 'https://github.com/html5up/stellar', githubRepo: null, stars: 4100, source: 'curated' },
    { slug: 'html5up-editorial', name: 'Editorial', description: 'Sleek magazine-style layout with sidebar navigation', category: 'landing-page', tags: ['sidebar', 'magazine', 'content'], previewUrl: 'https://html5up.net/editorial', sourceUrl: 'https://github.com/html5up/editorial', githubRepo: null, stars: 2800, source: 'curated' },
    { slug: 'html5up-phantom', name: 'Phantom', description: 'Clean tile-based layout perfect for showcasing products or projects', category: 'landing-page', tags: ['tiles', 'portfolio', 'grid'], previewUrl: 'https://html5up.net/phantom', sourceUrl: 'https://github.com/html5up/phantom', githubRepo: null, stars: 2200, source: 'curated' },
    { slug: 'startbootstrap-agency', name: 'Agency', description: 'One-page theme for agencies and freelancers with portfolio section', category: 'landing-page', tags: ['agency', 'one-page', 'portfolio'], previewUrl: 'https://startbootstrap.com/theme/agency', sourceUrl: 'https://github.com/StartBootstrap/startbootstrap-agency', githubRepo: 'StartBootstrap/startbootstrap-agency', stars: 7200, source: 'curated' },
    // E-commerce
    { slug: 'html5up-store', name: 'Store', description: 'Clean product showcase with grid layout and cart-ready design', category: 'e-commerce', tags: ['store', 'products', 'grid'], previewUrl: 'https://html5up.net/overflow', sourceUrl: 'https://github.com/html5up/overflow', githubRepo: null, stars: 1900, source: 'curated' },
    { slug: 'startbootstrap-shop', name: 'Shop Homepage', description: 'Bootstrap e-commerce homepage with product cards and featured items', category: 'e-commerce', tags: ['bootstrap', 'shop', 'cards'], previewUrl: 'https://startbootstrap.com/template/shop-homepage', sourceUrl: 'https://github.com/StartBootstrap/startbootstrap-shop-homepage', githubRepo: 'StartBootstrap/startbootstrap-shop-homepage', stars: 1500, source: 'curated' },
    { slug: 'colorlib-cart', name: 'Cart eCommerce', description: 'Full ecommerce template with cart, product pages, and checkout flow', category: 'e-commerce', tags: ['cart', 'checkout', 'full'], previewUrl: 'https://colorlib.com/wp/template/cart/', sourceUrl: 'https://colorlib.com/wp/template/cart/', githubRepo: null, stars: 1200, source: 'curated' },
    // E-learning
    { slug: 'html5up-learn', name: 'Learn', description: 'Course-focused layout with module lists, instructors, and enrollment CTAs', category: 'e-learning', tags: ['course', 'education', 'lms'], previewUrl: 'https://html5up.net/lens', sourceUrl: 'https://github.com/html5up/lens', githubRepo: null, stars: 1600, source: 'curated' },
    { slug: 'startbootstrap-course', name: 'Course Landing', description: 'Clean course landing page with curriculum, instructor bio, and FAQ', category: 'e-learning', tags: ['curriculum', 'instructor', 'faq'], previewUrl: 'https://startbootstrap.com/template/landing-page', sourceUrl: 'https://github.com/StartBootstrap/startbootstrap-landing-page', githubRepo: 'StartBootstrap/startbootstrap-landing-page', stars: 8100, source: 'curated' },
    { slug: 'colorlib-education', name: 'Educa', description: 'Modern education platform template with course catalog and testimonials', category: 'e-learning', tags: ['catalog', 'testimonials', 'modern'], previewUrl: 'https://colorlib.com/wp/template/educa/', sourceUrl: 'https://colorlib.com/wp/template/educa/', githubRepo: null, stars: 980, source: 'curated' },
    // E-cards
    { slug: 'vcard-portfolio', name: 'vCard Portfolio', description: 'Personal vCard template with social links, skills chart, and timeline', category: 'e-card', tags: ['vcard', 'personal', 'timeline'], previewUrl: 'https://html5up.net/read-only', sourceUrl: 'https://github.com/html5up/read-only', githubRepo: null, stars: 3400, source: 'curated' },
    { slug: 'cv-resume-card', name: 'CV Resume Card', description: 'Clean one-page resume style digital business card', category: 'e-card', tags: ['resume', 'cv', 'one-page'], previewUrl: 'https://startbootstrap.com/theme/resume', sourceUrl: 'https://github.com/StartBootstrap/startbootstrap-resume', githubRepo: 'StartBootstrap/startbootstrap-resume', stars: 6800, source: 'curated' },
    { slug: 'minimal-link-card', name: 'Minimal Link Card', description: 'Linktree-style card with clean minimal design and social icons', category: 'e-card', tags: ['linktree', 'links', 'minimal'], previewUrl: 'https://html5up.net/miniport', sourceUrl: 'https://github.com/html5up/miniport', githubRepo: null, stars: 2100, source: 'curated' },
    { slug: 'creative-portfolio-card', name: 'Creative Portfolio Card', description: 'Bold creative portfolio business card with hero section and work gallery', category: 'e-card', tags: ['creative', 'portfolio', 'bold'], previewUrl: 'https://startbootstrap.com/theme/freelancer', sourceUrl: 'https://github.com/StartBootstrap/startbootstrap-freelancer', githubRepo: 'StartBootstrap/startbootstrap-freelancer', stars: 5100, source: 'curated' },
  ];

  for (const tpl of curatedTemplates) {
    await prisma.marketplaceTemplate.upsert({
      where: { slug: tpl.slug },
      update: { name: tpl.name, description: tpl.description, stars: tpl.stars },
      create: tpl,
    });
  }
  console.info(`Marketplace templates: ${curatedTemplates.length} seeded`);

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
