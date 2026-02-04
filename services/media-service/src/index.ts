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
import { uploadRoutes } from './routes/uploadRoutes';
import { mediaRoutes } from './routes/mediaRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
// @ts-ignore
const PORT = process.env.PORT || 3002;
// @ts-ignore
const UPLOAD_PATH = process.env.UPLOAD_PATH || '/uploads';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for serving uploaded media
app.use('/uploads', express.static(UPLOAD_PATH));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'media-service', 
    timestamp: new Date().toISOString(),
    uploadPath: UPLOAD_PATH
  });
});

// API Routes
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/media', mediaRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  // @ts-ignore
  console.log(`🚀 Media Service running on port ${PORT}`);
  // @ts-ignore
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  // @ts-ignore
  console.log(`📁 Upload path: ${UPLOAD_PATH}`);
  // @ts-ignore
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

export default app;
