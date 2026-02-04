/**
 * Person Service
 * Business logic for managing people and their bio-card data
 */

import prisma from '../lib/prisma';
import { PersonNode, BioCardData, ClosestMemory, LifeHighlight } from '../types/person.types';
// @ts-ignore - @prisma/client is installed in Docker container
import { Prisma } from '@prisma/client';

export class PersonService {
  /**
   * Get a person with all data needed for bio-card rendering
   */
  async getPersonNode(personId: string): Promise<PersonNode | null> {
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        profilePhoto: true,
        memories: {
          where: { isFeatured: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        media: {
          where: { isFeatured: true },
          orderBy: { dateTaken: 'desc' },
          take: 6,
        },
        relationshipsFrom: {
          include: {
            personTo: {
              include: {
                profilePhoto: true,
              },
            },
          },
        },
        relationshipsTo: {
          include: {
            personFrom: {
              include: {
                profilePhoto: true,
              },
            },
          },
        },
        attendedEvents: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!person) return null;

    // Transform to PersonNode
    return this.transformToPersonNode(person);
  }

  /**
   * Create a new person with personality tags and memories
   */
  async createPerson(data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    gender?: string;
    birthDate?: Date;
    birthPlace?: string;
    biography?: string;
    occupation?: string;
    personalityTags?: string[];
    favoriteQuote?: string;
    closestMemories?: any;
    lifeHighlights?: any;
  }) {
    return await prisma.person.create({
      data: {
        ...data,
        personalityTags: data.personalityTags || [],
        closestMemories: data.closestMemories || Prisma.JsonNull,
        lifeHighlights: data.lifeHighlights || Prisma.JsonNull,
      },
    });
  }

  /**
   * Add a memory to a person
   */
  async addMemory(personId: string, memoryData: {
    title: string;
    content: string;
    memoryType: string;
    dateOfMemory?: Date;
    location?: string;
    sharedBy?: string;
    emotionalTone?: string;
    isFeatured?: boolean;
  }) {
    return await prisma.memory.create({
      data: {
        ...memoryData,
        personId,
      },
    });
  }

  /**
   * Get bio-card data (optimized for UI rendering)
   */
  async getBioCardData(personId: string): Promise<BioCardData | null> {
    const person = await this.getPersonNode(personId);
    if (!person) return null;

    // Transform to optimized BioCardData
    const featuredMemory = person.closestMemories[0];
    const memorySnippets = person.closestMemories.slice(1, 4).map(m => 
      m.content.substring(0, 100) + '...'
    );

    return {
      person: {
        id: person.id,
        displayName: person.displayName,
        profilePhotoUrl: person.profilePhotoUrl,
        birthYear: person.birthDate?.getFullYear(),
        deathYear: person.deathDate?.getFullYear(),
        isLiving: person.isLiving,
        occupation: person.occupation,
        location: person.currentLocation,
      },
      personality: {
        tags: person.personalityTags.slice(0, 5),
        topQuote: person.favoriteQuote,
        essenceDescription: this.generateEssenceDescription(person),
      },
      memories: {
        featured: featuredMemory,
        count: person.stats.totalMemories,
        previewSnippets: memorySnippets,
      },
      visualPreview: {
        profilePhoto: person.profilePhotoUrl,
        featuredImages: person.featuredMedia.slice(0, 3).map(m => m.thumbnailUrl),
        coverImage: person.featuredMedia[0]?.thumbnailUrl,
      },
      connections: {
        immediateFamily: person.immediateFamily.map(r => ({
          name: r.relatedPerson.fullName,
          relation: r.relationshipType,
          photoUrl: r.relatedPerson.profilePhotoUrl,
        })),
        totalConnections: person.stats.totalRelationships,
      },
      highlights: {
        timeline: person.lifeHighlights,
        milestoneCount: person.lifeHighlights.length,
      },
    };
  }

  /**
   * Search people by various criteria
   */
  async searchPeople(filters: {
    nameQuery?: string;
    personalityTags?: string[];
    isLiving?: boolean;
    birthYearRange?: { start: number; end: number };
  }) {
    const where: Prisma.PersonWhereInput = {};

    if (filters.nameQuery) {
      where.OR = [
        { firstName: { contains: filters.nameQuery, mode: 'insensitive' } },
        { lastName: { contains: filters.nameQuery, mode: 'insensitive' } },
      ];
    }

    if (filters.personalityTags && filters.personalityTags.length > 0) {
      where.personalityTags = {
        hasSome: filters.personalityTags,
      };
    }

    if (filters.isLiving !== undefined) {
      where.isLiving = filters.isLiving;
    }

    if (filters.birthYearRange) {
      where.birthDate = {
        gte: new Date(filters.birthYearRange.start, 0, 1),
        lte: new Date(filters.birthYearRange.end, 11, 31),
      };
    }

    return await prisma.person.findMany({
      where,
      include: {
        profilePhoto: true,
      },
      take: 50,
    });
  }

  /**
   * Helper: Transform database person to PersonNode
   */
  private transformToPersonNode(person: any): PersonNode {
    const fullName = `${person.firstName} ${person.middleName || ''} ${person.lastName}`.replace(/\s+/g, ' ').trim();
    const displayName = person.preferredName || `${person.firstName} ${person.lastName}`;
    
    const age = person.birthDate 
      ? Math.floor((new Date().getTime() - person.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : undefined;

    return {
      id: person.id,
      firstName: person.firstName,
      middleName: person.middleName,
      lastName: person.lastName,
      maidenName: person.maidenName,
      preferredName: person.preferredName,
      fullName,
      displayName,
      gender: person.gender,
      birthDate: person.birthDate,
      birthPlace: person.birthPlace,
      deathDate: person.deathDate,
      deathPlace: person.deathPlace,
      age,
      isLiving: person.isLiving,
      biography: person.biography,
      occupation: person.occupation,
      education: person.education,
      currentLocation: person.currentLocation,
      personalityTags: person.personalityTags || [],
      closestMemories: person.memories?.map((m: any) => this.transformMemory(m)) || [],
      favoriteQuote: person.favoriteQuote,
      lifeHighlights: (person.lifeHighlights as LifeHighlight[]) || [],
      profilePhotoUrl: person.profilePhoto?.filePath,
      featuredMedia: person.media?.map((m: any) => ({
        id: m.id,
        thumbnailUrl: m.thumbnailPath || m.filePath,
        title: m.title,
        caption: m.caption,
        dateTaken: m.dateTaken,
        fileType: m.fileType,
        isFeatured: m.isFeatured,
      })) || [],
      immediateFamily: this.extractImmediateFamily(person),
      extendedFamily: this.extractExtendedFamily(person),
      familyTreePosition: {
        generation: 0, // TODO: Calculate based on tree structure
        branchName: undefined,
      },
      stats: {
        totalMemories: person.memories?.length || 0,
        totalMedia: person.media?.length || 0,
        totalRelationships: (person.relationshipsFrom?.length || 0) + (person.relationshipsTo?.length || 0),
        eventsAttended: person.attendedEvents?.length || 0,
      },
      privacyLevel: person.privacyLevel as any,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    };
  }

  private transformMemory(memory: any): ClosestMemory {
    return {
      id: memory.id,
      title: memory.title,
      content: memory.content,
      memoryType: memory.memoryType as any,
      dateOfMemory: memory.dateOfMemory,
      location: memory.location,
      sharedBy: memory.sharedBy,
      emotionalTone: memory.emotionalTone as any,
      isFeatured: memory.isFeatured,
    };
  }

  private extractImmediateFamily(person: any) {
    const immediate = ['parent', 'child', 'spouse'];
    const relationships = [
      ...(person.relationshipsFrom || []),
      ...(person.relationshipsTo || []),
    ];

    return relationships
      .filter((r: any) => immediate.includes(r.relationshipType))
      .map((r: any) => ({
        id: r.id,
        relatedPerson: {
          id: r.personTo?.id || r.personFrom?.id,
          fullName: `${r.personTo?.firstName || r.personFrom?.firstName} ${r.personTo?.lastName || r.personFrom?.lastName}`,
          profilePhotoUrl: r.personTo?.profilePhoto?.filePath || r.personFrom?.profilePhoto?.filePath,
        },
        relationshipType: r.relationshipType,
        customType: r.customType,
        strength: r.strength,
        startDate: r.startDate,
        isCurrent: r.isCurrent,
      }));
  }

  private extractExtendedFamily(person: any) {
    const extended = ['sibling', 'cousin', 'guardian', 'custom'];
    const relationships = [
      ...(person.relationshipsFrom || []),
      ...(person.relationshipsTo || []),
    ];

    return relationships
      .filter((r: any) => extended.includes(r.relationshipType))
      .map((r: any) => ({
        id: r.id,
        relatedPerson: {
          id: r.personTo?.id || r.personFrom?.id,
          fullName: `${r.personTo?.firstName || r.personFrom?.firstName} ${r.personTo?.lastName || r.personFrom?.lastName}`,
          profilePhotoUrl: r.personTo?.profilePhoto?.filePath || r.personFrom?.profilePhoto?.filePath,
        },
        relationshipType: r.relationshipType,
        customType: r.customType,
        strength: r.strength,
        startDate: r.startDate,
        isCurrent: r.isCurrent,
      }));
  }

  private generateEssenceDescription(person: PersonNode): string {
    const tags = person.personalityTags.slice(0, 3).join(', ');
    const occupation = person.occupation || 'beloved family member';
    return `A ${tags} and ${occupation} who touched many lives.`;
  }
}

export default new PersonService();
