// @ts-ignore - Dependencies are in Docker container
import { Router, Request, Response } from 'express';
// @ts-ignore
import path from 'path';

const router = Router();

// GET all media items
router.get('/', async (_req: Request, res: Response) => {
  try {
    // TODO: Fetch from database
    res.json({
      message: 'Get all media items',
      data: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET media by family member ID
router.get('/member/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    // TODO: Fetch from database
    res.json({
      message: `Get media for member ${memberId}`,
      data: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single media item by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Fetch from database
    res.json({
      message: `Get media item ${id}`,
      data: null
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE media item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Get file path from database
    // TODO: Delete physical file
    // TODO: Delete database record
    
    res.json({
      message: `Media item ${id} deleted`
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update media metadata
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const metadata = req.body;
    
    // TODO: Update database
    res.json({
      message: `Media item ${id} updated`,
      data: metadata
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as mediaRoutes };
