import fs from 'node:fs';
import path from 'node:path';
import { AppError } from '../../middleware/error.js';

interface DeployResult {
  url: string;
  deploymentId: string;
}

export async function deploy(params: {
  projectName: string;
  buildDir: string;
}): Promise<DeployResult> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new AppError(400, 'VERCEL_TOKEN is not configured');
  }

  // Collect files from build directory
  const files = collectFiles(params.buildDir, params.buildDir);

  // Create deployment via Vercel API
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: params.projectName,
      files,
      projectSettings: {
        framework: null,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new AppError(502, `Vercel deployment failed: ${error}`);
  }

  const data = await response.json() as any;
  return {
    url: `https://${data.url}`,
    deploymentId: data.id,
  };
}

function collectFiles(dir: string, baseDir: string): Array<{ file: string; data: string }> {
  const results: Array<{ file: string; data: string }> = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      const content = fs.readFileSync(fullPath);
      results.push({
        file: relativePath,
        data: content.toString('base64'),
      });
    }
  }

  return results;
}
