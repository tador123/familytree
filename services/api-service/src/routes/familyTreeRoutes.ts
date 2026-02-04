import { Router, Request, Response } from 'express';
import { getFamilyTree } from '../services/familyTreeService';

const router = Router();

// GET family tree
// Optional query param: rootPersonId to specify starting point
router.get('/', async (req: Request, res: Response) => {
  try {
    const rootPersonId = req.query.rootPersonId as string | undefined;
    const tree = await getFamilyTree(rootPersonId);
    
    res.json({
      success: true,
      data: tree
    });
  } catch (error) {
    console.error('Error fetching family tree:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch family tree',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
