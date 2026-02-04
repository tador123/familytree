// @ts-ignore - Dependencies are in Docker container
import { Router, Request, Response } from 'express';
// @ts-ignore
import multer, { FileFilterCallback } from 'multer';
// @ts-ignore
import path from 'path';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import sharp from 'sharp';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  // @ts-ignore - Express types are in Docker container
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // @ts-ignore
    cb(null, process.env.UPLOAD_PATH || '/uploads');
  },
  // @ts-ignore
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  // @ts-ignore - Express types are in Docker container
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// POST upload single file
router.post('/single', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // If it's an image, create a thumbnail
    if (req.file.mimetype.startsWith('image/')) {
      const thumbnailPath = path.join(
        // @ts-ignore
        process.env.UPLOAD_PATH || '/uploads',
        `thumb_${req.file.filename}`
      );
      
      await sharp(req.file.path)
        .resize(200, 200, { fit: 'cover' })
        .toFile(thumbnailPath);
    }

    // TODO: Save file metadata to database
    res.status(201).json({
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
});

// POST upload multiple files
router.post('/multiple', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    // @ts-ignore - Express types are in Docker container
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`
    }));

    // TODO: Save files metadata to database
    res.status(201).json({
      message: `${files.length} files uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
});

export { router as uploadRoutes };
