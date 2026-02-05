// @ts-ignore - Dependencies are in Docker container
import express, { Application, Request, Response } from 'express';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import helmet from 'helmet';
// @ts-ignore
import morgan from 'morgan';
// @ts-ignore
import dotenv from 'dotenv';
import { familyMemberRoutes } from './routes/familyMemberRoutes';
import { relationshipRoutes } from './routes/relationshipRoutes';
import familyTreeRoutes from './routes/familyTreeRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
// @ts-ignore
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'api-service', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/family-members', familyMemberRoutes);
app.use('/api/v1/members', familyMemberRoutes); // Alias for convenience
app.use('/api/v1/relationships', relationshipRoutes);
app.use('/api/v1/family-tree', familyTreeRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  // @ts-ignore
  console.log(`🚀 API Service running on port ${PORT}`);
  // @ts-ignore
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  // @ts-ignore
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

export default app;
