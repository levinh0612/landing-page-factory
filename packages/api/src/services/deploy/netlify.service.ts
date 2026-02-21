import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AppError } from '../../middleware/error.js';

interface DeployResult {
  url: string;
  deploymentId: string;
}

export async function deploy(params: {
  siteName: string;
  buildDir: string;
}): Promise<DeployResult> {
  const token = process.env.NETLIFY_TOKEN;
  if (!token) {
    throw new AppError(400, 'NETLIFY_TOKEN is not configured');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Find or create site
  let siteId: string;
  const sitesRes = await fetch(
    `https://api.netlify.com/api/v1/sites?name=${params.siteName}`,
    { headers },
  );
  const sites = await sitesRes.json() as any[];

  if (sites.length > 0) {
    siteId = sites[0].id;
  } else {
    const createRes = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: params.siteName }),
    });
    if (!createRes.ok) {
      throw new AppError(502, 'Failed to create Netlify site');
    }
    const site = await createRes.json() as any;
    siteId = site.id;
  }

  // Collect file hashes for deploy
  const fileHashes = collectFileHashes(params.buildDir, params.buildDir);

  // Create deploy with file digest
  const deployRes = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        files: fileHashes,
      }),
    },
  );

  if (!deployRes.ok) {
    const error = await deployRes.text();
    throw new AppError(502, `Netlify deploy failed: ${error}`);
  }

  const deployData = await deployRes.json() as any;

  // Upload required files
  if (deployData.required?.length > 0) {
    const allFiles = collectFilePaths(params.buildDir, params.buildDir);
    for (const sha of deployData.required) {
      const filePath = allFiles.find(
        (f) => sha1Hash(fs.readFileSync(path.join(params.buildDir, f))) === sha,
      );
      if (filePath) {
        const fileContent = fs.readFileSync(path.join(params.buildDir, filePath));
        await fetch(
          `https://api.netlify.com/api/v1/deploys/${deployData.id}/files/${encodeURIComponent('/' + filePath)}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/octet-stream',
            },
            body: fileContent,
          },
        );
      }
    }
  }

  return {
    url: deployData.ssl_url || deployData.url || `https://${params.siteName}.netlify.app`,
    deploymentId: deployData.id,
  };
}

function sha1Hash(content: Buffer): string {
  return crypto.createHash('sha1').update(content).digest('hex');
}

function collectFileHashes(dir: string, baseDir: string): Record<string, string> {
  const hashes: Record<string, string> = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(hashes, collectFileHashes(fullPath, baseDir));
    } else {
      const relativePath = '/' + path.relative(baseDir, fullPath);
      const content = fs.readFileSync(fullPath);
      hashes[relativePath] = sha1Hash(content);
    }
  }
  return hashes;
}

function collectFilePaths(dir: string, baseDir: string): string[] {
  const paths: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...collectFilePaths(fullPath, baseDir));
    } else {
      paths.push(path.relative(baseDir, fullPath));
    }
  }
  return paths;
}
