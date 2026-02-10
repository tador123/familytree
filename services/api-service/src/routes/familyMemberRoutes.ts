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
      include: {
        profilePhoto: true,
        relationshipsTo: {
          include: {
            personFrom: {
              select: {
                id: true,
                gender: true
              }
            }
          }
        }
      }
    });
    
    // Transform to include fatherId, motherId, spouseId
    const transformedMembers = members.map(member => {
      // Find father: parent relationship where personFrom is Male
      const fatherRel = member.relationshipsTo.find(rel => 
        rel.relationshipType === 'parent' && rel.personFrom.gender === 'Male'
      );
      
      // Find mother: parent relationship where personFrom is Female
      const motherRel = member.relationshipsTo.find(rel => 
        rel.relationshipType === 'parent' && rel.personFrom.gender === 'Female'
      );
      
      // Find spouse: spouse relationship
      const spouseRel = member.relationshipsTo.find(rel => 
        rel.relationshipType === 'spouse'
      );
      
      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        middleName: member.middleName,
        birthDate: member.birthDate,
        deathDate: member.deathDate,
        isLiving: member.isLiving,
        profilePhotoId: member.profilePhotoId,
        profilePhoto: member.profilePhoto,
        fatherId: fatherRel?.personFromId || null,
        motherId: motherRel?.personFromId || null,
        spouseId: spouseRel?.personFromId || null
      };
    });
    
    res.json({
      success: true,
      message: 'Get all family members',
      data: transformedMembers
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
                lastName: true,
                gender: true
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
                lastName: true,
                gender: true
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

    // Find derived relationship IDs
    const fatherRel = member.relationshipsTo.find(rel => 
      rel.relationshipType === 'parent' && rel.personFrom.gender === 'Male'
    );
    
    const motherRel = member.relationshipsTo.find(rel => 
      rel.relationshipType === 'parent' && rel.personFrom.gender === 'Female'
    );
    
    const spouseRel = member.relationshipsTo.find(rel => 
      rel.relationshipType === 'spouse'
    );
    
    // Transform data to include fatherId, motherId, spouseId
    const transformedMember = {
      ...member,
      fatherId: fatherRel?.personFromId || null,
      motherId: motherRel?.personFromId || null,
      spouseId: spouseRel?.personFromId || null
    };
    
    res.json({
      success: true,
      message: `Get family member ${id}`,
      data: transformedMember
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
      gender,
      maidenName,
      preferredName,
      occupation,
      education,
      email,
      phone,
      currentLocation,
      favoriteQuote
    } = req.body;

    // Check if member exists
    const existingMember = await prisma.person.findUnique({
      where: { id },
      include: {
        relationshipsTo: {
          include: {
            personFrom: true
          }
        }
      }
    });

    if (!existingMember) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }

    // Validate parent/spouse IDs if provided
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

    // Update the person record
    const updatedPerson = await prisma.person.update({
      where: { id },
      data: {
        firstName: firstName || existingMember.firstName,
        lastName: lastName || existingMember.lastName,
        middleName: middleName !== undefined ? middleName : existingMember.middleName,
        maidenName: maidenName !== undefined ? maidenName : existingMember.maidenName,
        preferredName: preferredName !== undefined ? preferredName : existingMember.preferredName,
        gender: gender !== undefined ? gender : existingMember.gender,
        birthDate: birthDate ? new Date(birthDate) : existingMember.birthDate,
        birthPlace: birthPlace !== undefined ? birthPlace : existingMember.birthPlace,
        deathDate: deathDate ? new Date(deathDate) : existingMember.deathDate,
        deathPlace: deathPlace !== undefined ? deathPlace : existingMember.deathPlace,
        isLiving: isLiving !== undefined ? isLiving : existingMember.isLiving,
        biography: bio !== undefined ? bio : existingMember.biography,
        occupation: occupation !== undefined ? occupation : existingMember.occupation,
        education: education !== undefined ? education : existingMember.education,
        email: email !== undefined ? email : existingMember.email,
        phone: phone !== undefined ? phone : existingMember.phone,
        currentLocation: currentLocation !== undefined ? currentLocation : existingMember.currentLocation,
        favoriteQuote: favoriteQuote !== undefined ? favoriteQuote : existingMember.favoriteQuote
      }
    });

    // Handle relationship updates
    // Find existing parent relationships (where this person is the child)
    const existingFatherRel = await prisma.relationship.findFirst({
      where: {
        personToId: id,
        relationshipType: 'parent',
        personFrom: {
          gender: 'Male'
        }
      }
    });

    const existingMotherRel = await prisma.relationship.findFirst({
      where: {
        personToId: id,
        relationshipType: 'parent',
        personFrom: {
          gender: 'Female'
        }
      }
    });

    const existingSpouseRel = await prisma.relationship.findFirst({
      where: {
        OR: [
          { personFromId: id, relationshipType: 'spouse' },
          { personToId: id, relationshipType: 'spouse' }
        ]
      }
    });

    // Update father relationship
    if (fatherId !== undefined) {
      // Remove old father relationship if exists and different
      if (existingFatherRel && existingFatherRel.personFromId !== fatherId) {
        await prisma.relationship.deleteMany({
          where: {
            OR: [
              { id: existingFatherRel.id },
              { 
                personFromId: id, 
                personToId: existingFatherRel.personFromId, 
                relationshipType: 'child' 
              }
            ]
          }
        });
      }

      // Add new father relationship if provided
      if (fatherId && (!existingFatherRel || existingFatherRel.personFromId !== fatherId)) {
        await prisma.relationship.create({
          data: {
            personFromId: fatherId,
            personToId: id,
            relationshipType: 'parent'
          }
        });
        
        // Create reverse child relationship
        await prisma.relationship.create({
          data: {
            personFromId: id,
            personToId: fatherId,
            relationshipType: 'child'
          }
        });
      }
    }

    // Update mother relationship
    if (motherId !== undefined) {
      // Remove old mother relationship if exists and different
      if (existingMotherRel && existingMotherRel.personFromId !== motherId) {
        await prisma.relationship.deleteMany({
          where: {
            OR: [
              { id: existingMotherRel.id },
              { 
                personFromId: id, 
                personToId: existingMotherRel.personFromId, 
                relationshipType: 'child' 
              }
            ]
          }
        });
      }

      // Add new mother relationship if provided
      if (motherId && (!existingMotherRel || existingMotherRel.personFromId !== motherId)) {
        await prisma.relationship.create({
          data: {
            personFromId: motherId,
            personToId: id,
            relationshipType: 'parent'
          }
        });
        
        // Create reverse child relationship
        await prisma.relationship.create({
          data: {
            personFromId: id,
            personToId: motherId,
            relationshipType: 'child'
          }
        });
      }
    }

    // Update spouse relationship
    if (spouseId !== undefined) {
      // Remove old spouse relationship if exists and different
      if (existingSpouseRel) {
        const oldSpouseId = existingSpouseRel.personFromId === id 
          ? existingSpouseRel.personToId 
          : existingSpouseRel.personFromId;
        
        if (oldSpouseId !== spouseId) {
          await prisma.relationship.deleteMany({
            where: {
              OR: [
                { personFromId: id, personToId: oldSpouseId, relationshipType: 'spouse' },
                { personFromId: oldSpouseId, personToId: id, relationshipType: 'spouse' }
              ]
            }
          });
        }
      }

      // Add new spouse relationship if provided
      if (spouseId && (!existingSpouseRel || 
          (existingSpouseRel.personFromId !== spouseId && existingSpouseRel.personToId !== spouseId))) {
        await prisma.relationship.create({
          data: {
            personFromId: id,
            personToId: spouseId,
            relationshipType: 'spouse'
          }
        });
        
        // Create reverse spouse relationship
        await prisma.relationship.create({
          data: {
            personFromId: spouseId,
            personToId: id,
            relationshipType: 'spouse'
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Family member updated successfully',
      data: updatedPerson
    });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PATCH update family member (alias for PUT to support both methods)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      gender,
      maidenName,
      preferredName,
      occupation,
      education,
      email,
      phone,
      currentLocation,
      favoriteQuote
    } = req.body;

    // Check if member exists
    const existingMember = await prisma.person.findUnique({
      where: { id },
      include: {
        relationshipsTo: {
          include: {
            personFrom: true
          }
        }
      }
    });

    if (!existingMember) {
      return res.status(404).json({
        success: false,
        error: 'Family member not found'
      });
    }

    // Validate parent/spouse IDs if provided
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

    // Update the person record
    const updatedPerson = await prisma.person.update({
      where: { id },
      data: {
        firstName: firstName || existingMember.firstName,
        lastName: lastName || existingMember.lastName,
        middleName: middleName !== undefined ? middleName : existingMember.middleName,
        maidenName: maidenName !== undefined ? maidenName : existingMember.maidenName,
        preferredName: preferredName !== undefined ? preferredName : existingMember.preferredName,
        gender: gender !== undefined ? gender : existingMember.gender,
        birthDate: birthDate ? new Date(birthDate) : existingMember.birthDate,
        birthPlace: birthPlace !== undefined ? birthPlace : existingMember.birthPlace,
        deathDate: deathDate ? new Date(deathDate) : existingMember.deathDate,
        deathPlace: deathPlace !== undefined ? deathPlace : existingMember.deathPlace,
        isLiving: isLiving !== undefined ? isLiving : existingMember.isLiving,
        biography: bio !== undefined ? bio : existingMember.biography,
        occupation: occupation !== undefined ? occupation : existingMember.occupation,
        education: education !== undefined ? education : existingMember.education,
        email: email !== undefined ? email : existingMember.email,
        phone: phone !== undefined ? phone : existingMember.phone,
        currentLocation: currentLocation !== undefined ? currentLocation : existingMember.currentLocation,
        favoriteQuote: favoriteQuote !== undefined ? favoriteQuote : existingMember.favoriteQuote
      }
    });

    // Handle relationship updates
    // Find existing parent relationships (where this person is the child)
    const existingFatherRel = await prisma.relationship.findFirst({
      where: {
        personToId: id,
        relationshipType: 'parent',
        personFrom: {
          gender: 'Male'
        }
      }
    });

    const existingMotherRel = await prisma.relationship.findFirst({
      where: {
        personToId: id,
        relationshipType: 'parent',
        personFrom: {
          gender: 'Female'
        }
      }
    });

    const existingSpouseRel = await prisma.relationship.findFirst({
      where: {
        OR: [
          { personFromId: id, relationshipType: 'spouse' },
          { personToId: id, relationshipType: 'spouse' }
        ]
      }
    });

    // Update father relationship
    if (fatherId !== undefined) {
      // Remove old father relationship if exists and different
      if (existingFatherRel && existingFatherRel.personFromId !== fatherId) {
        await prisma.relationship.deleteMany({
          where: {
            OR: [
              { id: existingFatherRel.id },
              { 
                personFromId: id, 
                personToId: existingFatherRel.personFromId, 
                relationshipType: 'child' 
              }
            ]
          }
        });
      }

      // Add new father relationship if provided
      if (fatherId && (!existingFatherRel || existingFatherRel.personFromId !== fatherId)) {
        await prisma.relationship.create({
          data: {
            personFromId: fatherId,
            personToId: id,
            relationshipType: 'parent'
          }
        });
        
        // Create reverse child relationship
        await prisma.relationship.create({
          data: {
            personFromId: id,
            personToId: fatherId,
            relationshipType: 'child'
          }
        });
      }
    }

    // Update mother relationship
    if (motherId !== undefined) {
      // Remove old mother relationship if exists and different
      if (existingMotherRel && existingMotherRel.personFromId !== motherId) {
        await prisma.relationship.deleteMany({
          where: {
            OR: [
              { id: existingMotherRel.id },
              { 
                personFromId: id, 
                personToId: existingMotherRel.personFromId, 
                relationshipType: 'child' 
              }
            ]
          }
        });
      }

      // Add new mother relationship if provided
      if (motherId && (!existingMotherRel || existingMotherRel.personFromId !== motherId)) {
        await prisma.relationship.create({
          data: {
            personFromId: motherId,
            personToId: id,
            relationshipType: 'parent'
          }
        });
        
        // Create reverse child relationship
        await prisma.relationship.create({
          data: {
            personFromId: id,
            personToId: motherId,
            relationshipType: 'child'
          }
        });
      }
    }

    // Update spouse relationship
    if (spouseId !== undefined) {
      // Remove old spouse relationship if exists and different
      if (existingSpouseRel) {
        const oldSpouseId = existingSpouseRel.personFromId === id 
          ? existingSpouseRel.personToId 
          : existingSpouseRel.personFromId;
        
        if (oldSpouseId !== spouseId) {
          await prisma.relationship.deleteMany({
            where: {
              OR: [
                { personFromId: id, personToId: oldSpouseId, relationshipType: 'spouse' },
                { personFromId: oldSpouseId, personToId: id, relationshipType: 'spouse' }
              ]
            }
          });
        }
      }

      // Add new spouse relationship if provided
      if (spouseId && (!existingSpouseRel || 
          (existingSpouseRel.personFromId !== spouseId && existingSpouseRel.personToId !== spouseId))) {
        await prisma.relationship.create({
          data: {
            personFromId: id,
            personToId: spouseId,
            relationshipType: 'spouse'
          }
        });
        
        // Create reverse spouse relationship
        await prisma.relationship.create({
          data: {
            personFromId: spouseId,
            personToId: id,
            relationshipType: 'spouse'
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Family member updated successfully',
      data: updatedPerson
    });
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
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
