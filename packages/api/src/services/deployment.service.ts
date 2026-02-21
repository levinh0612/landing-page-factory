import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { buildProject } from './build.service.js';
import * as activityLog from './activity-log.service.js';

export async function triggerDeploy(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { template: true },
  });
  if (!project) throw new AppError(404, 'Project not found');
  if (!project.deployTarget) {
    throw new AppError(400, 'No deploy target configured for this project');
  }

  // Create pending deployment record
  const deployment = await prisma.deployment.create({
    data: {
      projectId,
      version: `v${Date.now()}`,
      status: 'BUILDING',
      platform: project.deployTarget,
      deployedBy: userId,
    },
  });

  const startTime = Date.now();

  try {
    // Build project
    const buildDir = await buildProject(projectId);

    // Deploy to target platform
    let result: { url: string; deploymentId: string };

    if (project.deployTarget === 'VERCEL') {
      const vercelService = await import('./deploy/vercel.service.js');
      result = await vercelService.deploy({
        projectName: project.slug,
        buildDir,
      });
    } else if (project.deployTarget === 'NETLIFY') {
      const netlifyService = await import('./deploy/netlify.service.js');
      result = await netlifyService.deploy({
        siteName: project.slug,
        buildDir,
      });
    } else {
      throw new AppError(400, `Unsupported deploy target: ${project.deployTarget}`);
    }

    const buildTime = Date.now() - startTime;

    // Update deployment record
    const updated = await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'SUCCESS',
        deployUrl: result.url,
        buildTime,
        metadata: { deploymentId: result.deploymentId } as any,
        logs: `Build completed in ${buildTime}ms. Deployed to ${result.url}`,
      },
    });

    // Update project deploy URL
    await prisma.project.update({
      where: { id: projectId },
      data: { deployUrl: result.url, status: 'DEPLOYED' },
    });

    await activityLog.log({
      userId,
      action: 'project.deployed',
      entityType: 'project',
      entityId: projectId,
      projectId,
      details: `Deployed to ${project.deployTarget}: ${result.url}`,
    });

    return updated;
  } catch (err: any) {
    const buildTime = Date.now() - startTime;

    // Update deployment as failed
    await prisma.deployment.update({
      where: { id: deployment.id },
      data: {
        status: 'FAILED',
        buildTime,
        logs: `Deployment failed after ${buildTime}ms: ${err.message}`,
      },
    });

    throw err;
  }
}
