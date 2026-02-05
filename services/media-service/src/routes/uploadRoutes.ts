// @ts-ignore - Dependencies are in Docker container
import { Router, Request, Response } from 'express';
// @ts-ignore
import path from 'path';
// import prisma from '../lib/prisma'; // Temporarily disabled due to Prisma issues
import { uploadProfilePhoto, uploadGalleryPhoto, uploadGeneral } from '../config/multer';
// import { 
//   saveMediaRecord, 
//   createThumbnail,
//   getMemoryGalleryForMember 
// } from '../utils/mediaUtils'; // Temporarily disabled

const router = Router();

/**
 * POST upload profile photo
 * Uploads a profile photo to /profile-photos directory
 * Links to memberId
 */
router.post('/profile-photo', uploadProfilePhoto.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    const { memberId, title, description } = req.body;

    if (!memberId) {
      return res.status(400).json({ 
        success: false,
        error: 'memberId is required' 
      });
    }

    // For now, skip database and thumbnail - just save the file
    console.log('Profile photo uploaded:', req.file.filename, 'for member:', memberId);

    res.status(201).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        id: req.file.filename,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/profile-photos/${req.file.filename}`,
        memberId: memberId
      }
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'File upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST upload gallery/memory photo
 * Uploads a gallery photo to /galleries directory
 * Links to memberId
 */
router.post('/gallery-photo', uploadGalleryPhoto.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    const { memberId, title, description, caption, tags, dateTaken, location, isFeatured } = req.body;

    if (!memberId) {
      return res.status(400).json({ 
        success: false,
        error: 'memberId is required' 
      });
    }

    // Create thumbnail
    const thumbnailFilename = `thumb_${req.file.filename}`;
    const thumbnailPath = path.join(path.dirname(req.file.path), thumbnailFilename);
    
    await createThumbnail(req.file.path, thumbnailPath, 300);

    // Parse tags if provided as string
    let parsedTags: string[] = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags;
    }

    // Save to database
    const media = await saveMediaRecord({
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      filePath: req.file.path,
      thumbnailPath: thumbnailPath,
      fileType: 'image',
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      personId: memberId,
      title: title || req.file.originalname,
      description: description,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      tags: parsedTags
    });

    // Update additional fields if provided
    if (caption || dateTaken || location) {
      await prisma.media.update({
        where: { id: media.id },
        data: {
          caption: caption || null,
          dateTaken: dateTaken ? new Date(dateTaken) : null,
          location: location || null
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Gallery photo uploaded successfully',
      data: {
        id: media.id,
        filename: media.filename,
        originalName: media.originalFilename,
        mimetype: media.mimeType,
        size: media.fileSize,
        path: `/uploads/galleries/${media.filename}`,
        thumbnailPath: `/uploads/galleries/${thumbnailFilename}`,
        memberId: media.personId,
        title: media.title,
        description: media.description,
        isFeatured: media.isFeatured
      }
    });
  } catch (error) {
    console.error('Gallery photo upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'File upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST upload multiple gallery photos
 * Uploads multiple photos to /galleries directory
 */
router.post('/gallery-photos', uploadGalleryPhoto.array('photos', 10), async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No files uploaded' 
      });
    }

    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ 
        success: false,
        error: 'memberId is required' 
      });
    }

    const uploadedMedia = [];

    for (const file of files) {
      console.log('Gallery photo uploaded:', file.filename, 'for member:', memberId);
      
      uploadedMedia.push({
        id: file.filename,
        filename: file.filename,
        path: `/uploads/galleries/${file.filename}`
      });
    }

    res.status(201).json({
      success: true,
      message: `${uploadedMedia.length} photos uploaded successfully`,
      data: uploadedMedia
    });
  } catch (error) {
    console.error('Multiple gallery photos upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'File upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST upload single file (backward compatibility)
router.post('/single', uploadGeneral.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create thumbnail if it's an image
    let thumbnailPath = null;
    if (req.file.mimetype.startsWith('image/')) {
      const thumbnailFilename = `thumb_${req.file.filename}`;
      thumbnailPath = path.join(path.dirname(req.file.path), thumbnailFilename);
      await createThumbnail(req.file.path, thumbnailPath, 200);
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        thumbnailPath: thumbnailPath ? `/uploads/${path.basename(thumbnailPath)}` : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
});

// POST upload multiple files
router.post('/multiple', uploadGeneral.array('files', 10), async (req: Request, res: Response) => {
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

    res.status(201).json({
      message: `${files.length} files uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
});

export { router as uploadRoutes };

export { router as uploadRoutes };
