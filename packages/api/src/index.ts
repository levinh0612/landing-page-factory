import express from 'express';
import cors from 'cors';
import { config } from './lib/config.js';
import { errorHandler } from './middleware/error.js';
import { authRoutes } from './routes/auth/auth.route.js';
import { templateRoutes } from './routes/templates/template.route.js';
import { clientRoutes } from './routes/clients/client.route.js';
import { projectRoutes } from './routes/projects/project.route.js';
import { dashboardRoutes } from './routes/dashboard/dashboard.route.js';
import { userRoutes } from './routes/users/user.route.js';
import { activityLogRoutes } from './routes/activity-logs/activity-log.route.js';
import { portalRoutes } from './routes/portal/portal.route.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/portal', portalRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(config.API_PORT, () => {
  console.info(`API running on http://localhost:${config.API_PORT}`);
});

export default app;
