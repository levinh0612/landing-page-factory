import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { AppError } from '../../middleware/error.js';

interface DeployResult {
  url: string;
  deploymentId: string;
}

/**
 * Upload a single file to Vercel's file store.
 * Vercel deduplicates by SHA1 — 200 = newly uploaded, 409 = already exists (both OK).
 */
async function uploadFileToVercel(token: string, content: Buffer): Promise<{ sha: string; size: number }> {
  const sha = createHash('sha1').update(content).digest('hex');
  const size = content.length;

  // Slice the exact bytes for this file.
  // content.buffer may be a shared pool buffer; slicing by offset+length
  // gives a standalone ArrayBuffer containing only the file data.
  const body = content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength) as ArrayBuffer;

  const res = await fetch('https://api.vercel.com/v2/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size),
      'x-now-digest': sha,
      'x-now-size': String(size),
    },
    body,
  });

  // 200 = uploaded, 409 = already exists in Vercel's store — both are fine
  if (res.status !== 200 && res.status !== 409) {
    const err = await res.text();
    throw new AppError(502, `Vercel file upload failed (${res.status}): ${err}`);
  }

  return { sha, size };
}

/**
 * Poll until deployment reaches READY (or ERROR) state, up to maxWaitMs.
 */
async function waitForReady(token: string, deploymentId: string, maxWaitMs = 60_000): Promise<void> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) continue;
    const d = await res.json() as any;
    const state: string = d.readyState ?? d.status ?? '';
    if (state === 'READY') return;
    if (state === 'ERROR') throw new AppError(502, `Vercel deployment errored: ${JSON.stringify(d.errorMessage ?? '')}`);
  }
  // Timed out but proceed — alias may still succeed
}

export async function deploy(params: {
  projectName: string;
  buildDir: string;
}): Promise<DeployResult> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new AppError(400, 'VERCEL_TOKEN is not configured');
  }

  // Step 1: Collect file buffers (skip config.schema.json — internal only)
  const localFiles = collectFileBuffers(params.buildDir, params.buildDir)
    .filter(({ file }) => file !== 'config.schema.json');

  // Step 2: Upload each file to Vercel file store (gets SHA1 digest back)
  const deployFiles = await Promise.all(
    localFiles.map(async ({ file, content }) => {
      const { sha, size } = await uploadFileToVercel(token, content);
      return { file, sha, size };
    }),
  );

  // Step 3: Create deployment referencing files by SHA
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: params.projectName,
      files: deployFiles,
      projectSettings: { framework: null },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new AppError(502, `Vercel deployment failed: ${error}`);
  }

  const data = await response.json() as any;
  const deploymentId: string = data.id;

  // Step 4: Wait for deployment to reach READY state
  await waitForReady(token, deploymentId);

  // Step 5: Set alias {projectName}.vercel.app → clean URL
  const aliasUrl = `${params.projectName}.vercel.app`;
  const aliasRes = await fetch(`https://api.vercel.com/v2/deployments/${deploymentId}/aliases`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ alias: aliasUrl }),
  });

  if (!aliasRes.ok) {
    // Alias failed — fall back to raw Vercel URL
    const rawUrl = `https://${data.url}`;
    return { url: rawUrl, deploymentId };
  }

  return {
    url: `https://${aliasUrl}`,
    deploymentId,
  };
}

// ── Vercel Domain Management ──────────────────────────────────────────────────

export async function listDomains(projectName: string): Promise<Array<{ name: string; verified: boolean; createdAt: number }>> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new AppError(400, 'VERCEL_TOKEN is not configured');

  const res = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectName)}/domains`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new AppError(502, `Vercel list domains failed: ${err}`);
  }
  const data = await res.json() as any;
  return (data.domains ?? []).map((d: any) => ({
    name: d.name,
    verified: d.verified ?? false,
    createdAt: d.createdAt ?? 0,
  }));
}

export async function addDomain(projectName: string, domain: string): Promise<{ name: string; verified: boolean }> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new AppError(400, 'VERCEL_TOKEN is not configured');

  const res = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(projectName)}/domains`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: domain }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new AppError(502, `Vercel add domain failed: ${err}`);
  }
  const d = await res.json() as any;
  return { name: d.name, verified: d.verified ?? false };
}

export async function removeDomain(projectName: string, domain: string): Promise<void> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new AppError(400, 'VERCEL_TOKEN is not configured');

  const res = await fetch(
    `https://api.vercel.com/v9/projects/${encodeURIComponent(projectName)}/domains/${encodeURIComponent(domain)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new AppError(502, `Vercel remove domain failed: ${err}`);
  }
}

// ── File collection ───────────────────────────────────────────────────────────

function collectFileBuffers(dir: string, baseDir: string): Array<{ file: string; content: Buffer }> {
  const results: Array<{ file: string; content: Buffer }> = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFileBuffers(fullPath, baseDir));
    } else {
      results.push({
        file: path.relative(baseDir, fullPath),
        content: fs.readFileSync(fullPath),
      });
    }
  }

  return results;
}
