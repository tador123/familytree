// @ts-ignore - Dependencies are in Docker container
import express, { Application, Request, Response, NextFunction } from 'express';
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
const PORT: number = Number(process.env.PORT) || 3002;
// @ts-ignore
const UPLOAD_PATH: string = process.env.UPLOAD_PATH || '/uploads';

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static files for serving uploaded media with CORS headers
app.use('/uploads', (_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(UPLOAD_PATH));

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
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  // @ts-ignore
  console.log(`📁 Upload path: ${UPLOAD_PATH}`);
  // @ts-ignore
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

export default app;
