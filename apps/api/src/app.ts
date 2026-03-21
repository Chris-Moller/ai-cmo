import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { healthRoutes } from './routes/health';
import { projectRoutes } from './routes/projects';
import { opportunityRoutes } from './routes/opportunities';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';

const app = new Hono();

app.use('*', cors());
app.use('/api/*', authMiddleware);
app.onError(errorHandler);

app.route('/health', healthRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/projects', opportunityRoutes);

export { app };
