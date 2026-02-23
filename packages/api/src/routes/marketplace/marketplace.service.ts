import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../../lib/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_TEMPLATES = path.resolve(__dirname, '../../../uploads/templates');

export async function getCuratedTemplates(category?: string) {
  return prisma.marketplaceTemplate.findMany({
    where: {
      source: 'curated',
      ...(category ? { category } : {}),
    },
    orderBy: { stars: 'desc' },
  });
}

export async function searchGithub(q: string, githubToken?: string) {
  const query = encodeURIComponent(`${q} template html`);
  const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&per_page=12`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'LPF-Marketplace/1.0',
  };
  if (githubToken) headers['Authorization'] = `token ${githubToken}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const json = await res.json() as any;

  return (json.items ?? []).map((item: any) => ({
    id: String(item.id),
    name: item.name,
    description: item.description ?? '',
    stars: item.stargazers_count,
    url: item.html_url,
    githubRepo: item.full_name,
    previewUrl: item.homepage || null,
    updatedAt: item.updated_at,
  }));
}

export async function importFromUrl(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'LPF-Marketplace/1.0' } });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  let html = await res.text();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const name = titleMatch ? titleMatch[1].trim().slice(0, 100) : 'Imported Template';
  const slug = `imported-${Date.now()}`;

  // Create template record first to get the ID
  const template = await prisma.template.create({
    data: {
      name,
      slug,
      category: 'imported',
      description: `Imported from ${url}`,
      techStack: ['HTML'],
      plugins: [],
      status: 'DRAFT',
    },
  });

  // Inject <base href> so relative assets resolve against source URL
  const baseTag = `<base href="${url}">`;
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  ${baseTag}`);
  } else {
    html = baseTag + '\n' + html;
  }

  // Save to disk: uploads/templates/{templateId}/v1/index.html
  const versionDir = path.join(UPLOADS_TEMPLATES, template.id, 'v1');
  fs.mkdirSync(versionDir, { recursive: true });
  fs.writeFileSync(path.join(versionDir, 'index.html'), html, 'utf-8');

  const filePath = `templates/${template.id}/v1`;
  const fileSize = Buffer.byteLength(html, 'utf-8');

  // Create TemplateVersion record
  await prisma.templateVersion.create({
    data: {
      templateId: template.id,
      version: 1,
      filePath,
      fileCount: 1,
      fileSize,
    },
  });

  // Update template with filePath, version, and ACTIVE status
  const updated = await prisma.template.update({
    where: { id: template.id },
    data: { filePath, version: 1, status: 'ACTIVE' },
  });

  return updated;
}

export async function cloneMarketplaceTemplate(id: string) {
  const mt = await prisma.marketplaceTemplate.findUnique({ where: { id } });
  if (!mt) throw new Error('Marketplace template not found');

  const slug = `${mt.slug}-${Date.now()}`;

  const template = await prisma.template.create({
    data: {
      name: mt.name,
      slug,
      category: mt.category,
      description: mt.description,
      techStack: ['HTML'],
      plugins: [],
      status: 'DRAFT',
      previewUrl: mt.previewUrl,
    },
  });

  await prisma.marketplaceTemplate.update({
    where: { id },
    data: { clonedToId: template.id },
  });

  return template;
}
