import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { auth } from './middleware/auth.js';
import { health } from './routes/health.js';
import { projectRoutes } from './routes/projects.js';

export const app = new Hono();

// Middleware
app.use('*', cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use('*', requestLogger);
app.use('/api/*', auth);

// Routes
app.route('/health', health);
app.route('/api/projects', projectRoutes);

// Error handler
app.onError(errorHandler);
