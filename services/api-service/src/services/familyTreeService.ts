// @ts-ignore - @prisma/client is installed in Docker container
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TreeNode {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  profilePhoto?: string | null;
  bioSnippet?: string | null;
  personalityTags: string[];
  birthDate?: Date | null;
  deathDate?: Date | null;
  isLiving: boolean;
  children: TreeNode[];
  spouses: SpouseNode[];
  relationshipType?: string;
}

export interface SpouseNode {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  profilePhoto?: string | null;
  bioSnippet?: string | null;
  personalityTags: string[];
  birthDate?: Date | null;
  deathDate?: Date | null;
  isLiving: boolean;
}

export interface FlatPerson {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  biography?: string | null;
  personalityTags: string[];
  profilePhotoId?: string | null;
  birthDate?: Date | null;
  deathDate?: Date | null;
  isLiving: boolean;
  parentRelationships: Array<{
    relationshipType: string;
    parentId: string;
  }>;
  spouseRelationships: Array<{
    spouseId: string;
  }>;
}

/**
 * Fetch all people and their relationships from the database
 */
export async function getAllPeopleWithRelationships(): Promise<FlatPerson[]> {
  const people = await prisma.person.findMany({
    include: {
      relationshipsFrom: {
        where: {
          relationshipType: {
            in: ['child', 'spouse', 'partner']
          }
        },
        select: {
          relationshipType: true,
          personToId: true,
        }
      },
      relationshipsTo: {
        where: {
          relationshipType: {
            in: ['parent', 'spouse', 'partner']
          }
        },
        select: {
          relationshipType: true,
          personFromId: true,
        }
      },
      profilePhoto: {
        select: {
          filePath: true
        }
      }
    }
  });

  // @ts-ignore - Prisma types are in Docker container
  return people.map((person: any) => ({
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    preferredName: person.preferredName,
    biography: person.biography,
    personalityTags: person.personalityTags,
    profilePhotoId: person.profilePhoto?.filePath || null,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    isLiving: person.isLiving,
    parentRelationships: person.relationshipsFrom
      // @ts-ignore - Prisma types are in Docker container
      .filter((rel: any) => rel.relationshipType === 'child')
      // @ts-ignore - Prisma types are in Docker container
      .map((rel: any) => ({
        relationshipType: 'child',
        parentId: rel.personToId
      })),
    spouseRelationships: [
      ...person.relationshipsFrom
        // @ts-ignore - Prisma types are in Docker container
        .filter((rel: any) => ['spouse', 'partner'].includes(rel.relationshipType))
        // @ts-ignore - Prisma types are in Docker container
        .map((rel: any) => ({ spouseId: rel.personToId })),
      ...person.relationshipsTo
        // @ts-ignore - Prisma types are in Docker container
        .filter((rel: any) => ['spouse', 'partner'].includes(rel.relationshipType))
        // @ts-ignore - Prisma types are in Docker container
        .map((rel: any) => ({ spouseId: rel.personFromId }))
    ]
  }));
}

/**
 * Build a hierarchical tree structure from flat relationships
 * @param people - Array of all people with relationships
 * @param rootPersonId - Optional root person ID (if not provided, finds oldest generation)
 * @returns Tree structure starting from root
 */
export function buildFamilyTree(people: FlatPerson[], rootPersonId?: string): TreeNode[] {
  const personMap = new Map(people.map(p => [p.id, p]));
  const processed = new Set<string>();

  // Find root nodes (people with no parents, or the specified root)
  const roots = rootPersonId 
    ? [people.find(p => p.id === rootPersonId)].filter(Boolean) as FlatPerson[]
    : people.filter(p => p.parentRelationships.length === 0);

  function buildNode(person: FlatPerson): TreeNode {
    if (processed.has(person.id)) {
      // Prevent infinite loops - return basic node without children
      return createTreeNode(person, [], []);
    }

    processed.add(person.id);

    // Get spouses
    const spouses: SpouseNode[] = person.spouseRelationships
      // @ts-ignore - Prisma types are in Docker container
      .map((rel: any) => personMap.get(rel.spouseId))
      .filter(Boolean)
      .map(spouse => createSpouseNode(spouse as FlatPerson));

    // Get all children (from all spouse relationships)
    const childIds = new Set<string>();
    people.forEach(p => {
      // @ts-ignore - Prisma types are in Docker container
      p.parentRelationships.forEach((rel: any) => {
        if (rel.parentId === person.id) {
          childIds.add(p.id);
        }
      });
    });

    const children: TreeNode[] = Array.from(childIds)
      .map(id => personMap.get(id))
      .filter(Boolean)
      .map(child => buildNode(child as FlatPerson));

    return createTreeNode(person, children, spouses);
  }

  function createTreeNode(person: FlatPerson, children: TreeNode[], spouses: SpouseNode[]): TreeNode {
    return {
      id: person.id,
      personId: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      preferredName: person.preferredName,
      profilePhoto: person.profilePhotoId,
      bioSnippet: person.biography ? person.biography.substring(0, 150) : null,
      personalityTags: person.personalityTags,
      birthDate: person.birthDate,
      deathDate: person.deathDate,
      isLiving: person.isLiving,
      children,
      spouses
    };
  }

  function createSpouseNode(person: FlatPerson): SpouseNode {
    return {
      id: person.id,
      personId: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      preferredName: person.preferredName,
      profilePhoto: person.profilePhotoId,
      bioSnippet: person.biography ? person.biography.substring(0, 150) : null,
      personalityTags: person.personalityTags,
      birthDate: person.birthDate,
      deathDate: person.deathDate,
      isLiving: person.isLiving
    };
  }

  return roots.map(root => buildNode(root));
}

/**
 * Get complete family tree data
 */
export async function getFamilyTree(rootPersonId?: string) {
  const people = await getAllPeopleWithRelationships();
  const tree = buildFamilyTree(people, rootPersonId);
  return tree;
}
