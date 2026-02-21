import express from 'express';
import cors from 'cors';
import path from 'path';
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
import { bookingRoutes } from './routes/bookings/booking.route.js';
import { contactRoutes } from './routes/contacts/contact.route.js';
import { paymentRoutes } from './routes/payments/payment.route.js';
import { mediaRoutes } from './routes/media/media.route.js';
import { postRoutes } from './routes/posts/post.route.js';
import { sitePageRoutes } from './routes/site-pages/site-page.route.js';
import { siteCommentRoutes } from './routes/site-comments/site-comment.route.js';
import { settingsRoutes } from './routes/settings/settings.route.js';
import { monitorRoutes } from './routes/monitor/monitor.route.js';
import aiRoutes from './routes/ai/ai.route.js';
import { ensureUploadDir } from './services/media.service.js';

// Ensure upload directory exists
ensureUploadDir().catch(console.error);

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded media files
app.use('/api/media/files', express.static(path.join(process.cwd(), 'uploads', 'media')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/clients', clientRoutes);

// Client-facing public routes — must be registered BEFORE projectRoutes
// to avoid being caught by projectRoutes.use(authenticate)
app.use('/api/projects/:slug/bookings', bookingRoutes);
app.use('/api/projects/:slug/contacts', contactRoutes);
app.use('/api/projects/:slug/payments', paymentRoutes);

app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/site-pages', sitePageRoutes);
app.use('/api/site-comments', siteCommentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/ai', aiRoutes);

// Error handler (must be last)
app.use(errorHandler);

const port = config.PORT ?? config.API_PORT;
app.listen(port, '0.0.0.0', () => {
  console.info(`API running on port ${port}`);
});

export default app;
