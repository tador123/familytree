// @ts-ignore - Dependencies are in Docker container
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET all family members
router.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await prisma.person.findMany({
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        birthDate: true,
        deathDate: true,
        isLiving: true,
        profilePhotoId: true
      }
    });
    
    res.json({
      success: true,
      message: 'Get all family members',
      data: members
    });
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET single family member by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const member = await prisma.person.findUnique({
      where: { id },
      include: {
        profilePhoto: true,
        relationshipsFrom: {
          include: {
            personTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        relationshipsTo: {
          include: {
            personFrom: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }
    
    res.json({
      success: true,
      message: `Get family member ${id}`,
      data: member
    });
  } catch (error) {
    console.error('Error fetching family member:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST create new family member with validation
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      firstName, 
      lastName, 
      bio, 
      birthDate,
      birthPlace,
      deathDate,
      deathPlace,
      isLiving,
      fatherId, 
      motherId, 
      spouseId,
      middleName,
      gender
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'firstName and lastName are required'
      });
    }

    // Validate fatherId exists if provided
    if (fatherId) {
      const father = await prisma.person.findUnique({
        where: { id: fatherId }
      });
      
      if (!father) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: `Father with id ${fatherId} does not exist`
        });
      }
    }

    // Validate motherId exists if provided
    if (motherId) {
      const mother = await prisma.person.findUnique({
        where: { id: motherId }
      });
      
      if (!mother) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: `Mother with id ${motherId} does not exist`
        });
      }
    }

    // Validate spouseId exists if provided
    if (spouseId) {
      const spouse = await prisma.person.findUnique({
        where: { id: spouseId }
      });
      
      if (!spouse) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: `Spouse with id ${spouseId} does not exist`
        });
      }
    }

    // Create the person
    const newPerson = await prisma.person.create({
      data: {
        firstName,
        lastName,
        middleName,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthPlace,
        deathDate: deathDate ? new Date(deathDate) : null,
        deathPlace,
        isLiving: isLiving !== undefined ? isLiving : true,
        biography: bio,
        personalityTags: []
      }
    });

    // Create relationships if parent IDs are provided
    const relationships = [];

    if (fatherId) {
      const fatherRelationship = await prisma.relationship.create({
        data: {
          personFromId: fatherId,
          personToId: newPerson.id,
          relationshipType: 'parent'
        }
      });
      relationships.push(fatherRelationship);

      // Create reverse child relationship
      await prisma.relationship.create({
        data: {
          personFromId: newPerson.id,
          personToId: fatherId,
          relationshipType: 'child'
        }
      });
    }

    if (motherId) {
      const motherRelationship = await prisma.relationship.create({
        data: {
          personFromId: motherId,
          personToId: newPerson.id,
          relationshipType: 'parent'
        }
      });
      relationships.push(motherRelationship);

      // Create reverse child relationship
      await prisma.relationship.create({
        data: {
          personFromId: newPerson.id,
          personToId: motherId,
          relationshipType: 'child'
        }
      });
    }

    if (spouseId) {
      const spouseRelationship = await prisma.relationship.create({
        data: {
          personFromId: newPerson.id,
          personToId: spouseId,
          relationshipType: 'spouse'
        }
      });
      relationships.push(spouseRelationship);

      // Create reverse spouse relationship
      await prisma.relationship.create({
        data: {
          personFromId: spouseId,
          personToId: newPerson.id,
          relationshipType: 'spouse'
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Family member created successfully',
      data: {
        person: newPerson,
        relationships
      }
    });
  } catch (error) {
    console.error('Error creating family member:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT update family member
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const memberData = req.body;
    // TODO: Update database
    res.json({
      message: `Family member ${id} updated`,
      data: memberData
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE family member
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Delete from database
    res.json({
      message: `Family member ${id} deleted`
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET recursive family tree from a root member
router.get('/:id/tree', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if the root person exists
    const rootPerson = await prisma.person.findUnique({
      where: { id }
    });
    
    if (!rootPerson) {
      return res.status(404).json({
        success: false,
        error: 'Root person not found'
      });
    }
    
    // Build the recursive tree
    const tree = await getRecursiveFamilyTree(id);
    
    res.json({
      success: true,
      message: `Family tree for ${rootPerson.firstName} ${rootPerson.lastName}`,
      data: tree
    });
  } catch (error) {
    console.error('Error fetching family tree:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Recursive helper function to build family tree hierarchy
 * Returns a nested JSON object representing the family structure
 * @param personId - The ID of the person to start from
 * @param visited - Set of visited IDs to prevent infinite loops
 * @returns Nested family tree object
 */
async function getRecursiveFamilyTree(
  personId: string, 
  visited: Set<string> = new Set()
): Promise<any> {
  // Prevent infinite loops in case of circular relationships
  if (visited.has(personId)) {
    return null;
  }
  
  visited.add(personId);
  
  // Get person with relationships
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      profilePhoto: true,
      relationshipsFrom: {
        where: {
          relationshipType: {
            in: ['parent', 'spouse']
          }
        },
        include: {
          personTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              birthDate: true,
              deathDate: true,
              isLiving: true,
              profilePhotoId: true
            }
          }
        }
      },
      relationshipsTo: {
        where: {
          relationshipType: 'child'
        },
        include: {
          personFrom: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              birthDate: true,
              deathDate: true,
              isLiving: true,
              profilePhotoId: true
            }
          }
        }
      }
    }
  });
  
  if (!person) {
    return null;
  }
  
  // Find children (people where this person is the parent)
  const childrenRelationships = person.relationshipsFrom.filter(
    rel => rel.relationshipType === 'parent'
  );
  
  // Recursively build children trees
  const children = [];
  for (const rel of childrenRelationships) {
    const childTree = await getRecursiveFamilyTree(rel.personTo.id, new Set(visited));
    if (childTree) {
      children.push(childTree);
    }
  }
  
  // Find spouse(s)
  const spouseRelationships = person.relationshipsFrom.filter(
    rel => rel.relationshipType === 'spouse'
  );
  
  const spouses = spouseRelationships.map(rel => ({
    id: rel.personTo.id,
    firstName: rel.personTo.firstName,
    lastName: rel.personTo.lastName,
    birthDate: rel.personTo.birthDate,
    deathDate: rel.personTo.deathDate,
    isLiving: rel.personTo.isLiving,
    profilePhotoId: rel.personTo.profilePhotoId
  }));
  
  // Find parents (people who are parents of this person)
  const parentRelationships = person.relationshipsTo.filter(
    rel => rel.relationshipType === 'child'
  );
  
  const parents = parentRelationships.map(rel => ({
    id: rel.personFrom.id,
    firstName: rel.personFrom.firstName,
    lastName: rel.personFrom.lastName,
    birthDate: rel.personFrom.birthDate,
    deathDate: rel.personFrom.deathDate,
    isLiving: rel.personFrom.isLiving,
    profilePhotoId: rel.personFrom.profilePhotoId
  }));
  
  // Build the tree node
  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    middleName: person.middleName,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    isLiving: person.isLiving,
    biography: person.biography,
    occupation: person.occupation,
    profilePhotoId: person.profilePhotoId,
    personalityTags: person.personalityTags,
    parents,
    spouses,
    children
  };
}

export { router as familyMemberRoutes };
