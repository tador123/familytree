// @ts-ignore - Dependencies are in Docker container
import { Router, Request, Response } from 'express';
// @ts-ignore
import path from 'path';
import prisma from '../lib/prisma';
import { 
  getMemoryGalleryForMember,
  getProfilePhotoForMember,
  getAllMediaForMember,
  deleteMedia,
  updateMediaMetadata
} from '../utils/mediaUtils';

const router = Router();

// GET all media items
router.get('/', async (_req: Request, res: Response) => {
  try {
    const media = await prisma.media.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to 100 most recent
    });

    res.json({
      success: true,
      message: 'Get all media items',
      data: media
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET memory gallery for a specific member
router.get('/member/:memberId/gallery', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const featuredOnly = req.query.featured === 'true';
    
    const gallery = await getMemoryGalleryForMember(memberId, featuredOnly);
    
    res.json({
      success: true,
      message: `Memory gallery for member ${memberId}`,
      count: gallery.length,
      data: gallery
    });
  } catch (error) {
    console.error('Error fetching memory gallery:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET profile photo for a member
router.get('/member/:memberId/profile-photo', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    
    const profilePhoto = await getProfilePhotoForMember(memberId);
    
    if (!profilePhoto) {
      return res.status(404).json({
        success: false,
        error: 'Profile photo not found'
      });
    }
    
    res.json({
      success: true,
      message: `Profile photo for member ${memberId}`,
      data: profilePhoto
    });
  } catch (error) {
    console.error('Error fetching profile photo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET all media for a specific member
router.get('/member/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    
    const media = await getAllMediaForMember(memberId);
    
    res.json({
      success: true,
      message: `Get media for member ${memberId}`,
      count: media.length,
      data: media
    });
  } catch (error) {
    console.error('Error fetching member media:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET single media item by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (!media) {
      return res.status(404).json({
        success: false,
        error: 'Media item not found'
      });
    }
    
    res.json({
      success: true,
      message: `Get media item ${id}`,
      data: media
    });
  } catch (error) {
    console.error('Error fetching media item:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE media item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await deleteMedia(id);
    
    res.json({
      success: true,
      message: `Media item ${id} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    
    if (error instanceof Error && error.message === 'Media not found') {
      return res.status(404).json({
        success: false,
        error: 'Media item not found'
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT update media metadata
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, caption, isFeatured, tags, dateTaken, location } = req.body;
    
    const updatedMedia = await updateMediaMetadata(id, {
      title,
      description,
      caption,
      isFeatured,
      tags,
      dateTaken: dateTaken ? new Date(dateTaken) : undefined,
      location
    });
    
    res.json({
      success: true,
      message: `Media item ${id} updated successfully`,
      data: updatedMedia
    });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as mediaRoutes };
