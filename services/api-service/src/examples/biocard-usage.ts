/**
 * Example Usage: Creating a Bio-Card for the UI
 * This demonstrates how to use the PersonService and types
 */

// @ts-ignore - Module is in Docker container
import personService from './services/personService';
// @ts-ignore - Module is in Docker container
import { PersonNode, BioCardData } from './types/person.types';

/**
 * Example 1: Fetch a complete PersonNode for detailed profile
 */
export async function fetchPersonProfile(personId: string): Promise<PersonNode | null> {
  try {
    const personNode = await personService.getPersonNode(personId);
    
    if (!personNode) {
      // @ts-ignore - console is available in Node.js
      console.log('Person not found');
      return null;
    }

    // @ts-ignore - console is available in Node.js
    console.log('Person Profile:', {
      name: personNode.displayName,
      age: personNode.age,
      personalityTags: personNode.personalityTags,
      memoriesCount: personNode.closestMemories.length,
      familyConnections: personNode.stats.totalRelationships,
    });

    return personNode;
  } catch (error) {
    // @ts-ignore - console is available in Node.js
    console.error('Error fetching person profile:', error);
    return null;
  }
}

/**
 * Example 2: Get optimized bio-card data for UI rendering
 */
export async function fetchBioCard(personId: string): Promise<BioCardData | null> {
  try {
    const bioCard = await personService.getBioCardData(personId);
    
    if (!bioCard) {
      // @ts-ignore - console is available in Node.js
      console.log('Bio-card data not found');
      return null;
    }

    // @ts-ignore - console is available in Node.js
    console.log('Bio-Card Ready:', {
      displayName: bioCard.person.displayName,
      personalityTags: bioCard.personality.tags,
      featuredMemory: bioCard.memories.featured?.title,
      connections: bioCard.connections.totalConnections,
    });

    return bioCard;
  } catch (error) {
    // @ts-ignore - console is available in Node.js
    console.error('Error fetching bio-card:', error);
    return null;
  }
}

/**
 * Example 3: Create a new person with personality tags
 */
export async function createNewPerson() {
  try {
    const newPerson = await personService.createPerson({
      firstName: 'Emma',
      lastName: 'Johnson',
      gender: 'Female',
      birthDate: new Date('1992-08-15'),
      birthPlace: 'Portland, Oregon',
      biography: 'Creative writer and avid traveler with a passion for storytelling.',
      occupation: 'Freelance Writer',
      personalityTags: ['storyteller', 'traveler', 'artist', 'adventurer'],
      favoriteQuote: 'Not all those who wander are lost.',
      lifeHighlights: [
        {
          year: 1992,
          age: 0,
          title: 'Born in Portland',
          description: 'Born in Portland, Oregon',
          category: 'birth' as const,
        },
        {
          year: 2014,
          age: 22,
          title: 'Published First Book',
          description: 'Published debut novel "Tales from the Road"',
          category: 'achievement' as const,
        },
        {
          year: 2018,
          age: 26,
          title: 'World Travel',
          description: 'Completed journey through 30 countries',
          category: 'travel' as const,
        },
      ],
    });

    // @ts-ignore - console is available in Node.js
    console.log('New person created:', newPerson.id);
    return newPerson;
  } catch (error) {
    // @ts-ignore - console is available in Node.js
    console.error('Error creating person:', error);
    return null;
  }
}

/**
 * Example 4: Add a memory to a person
 */
export async function addPersonMemory(personId: string) {
  try {
    const memory = await personService.addMemory(personId, {
      title: 'The Coffee Shop Epiphany',
      content: 'It was a rainy Tuesday morning in Seattle when Emma had her breakthrough idea. Sitting in her favorite corner booth at the old coffee shop, watching raindrops race down the window, the entire plot for her second novel came to her in a flash of inspiration.',
      memoryType: 'story',
      dateOfMemory: new Date('2019-03-12'),
      location: 'Seattle, WA',
      sharedBy: 'Emma Johnson',
      emotionalTone: 'inspiring',
      isFeatured: true,
    });

    // @ts-ignore - console is available in Node.js
    console.log('Memory added:', memory.id);
    return memory;
  } catch (error) {
    // @ts-ignore - console is available in Node.js
    console.error('Error adding memory:', error);
    return null;
  }
}

/**
 * Example 5: Search for people by personality tags
 */
export async function searchStorytellersByPersonality() {
  try {
    const storytellers = await personService.searchPeople({
      personalityTags: ['storyteller', 'historian'],
      isLiving: true,
    });

    // @ts-ignore - console is available in Node.js
    console.log(`Found ${storytellers.length} storytellers:`);
    // @ts-ignore - Type is inferred from searchPeople return
    storytellers.forEach((person: any) => {
      // @ts-ignore - console is available in Node.js
      console.log(`- ${person.firstName} ${person.lastName}`);
    });

    return storytellers;
  } catch (error) {
    // @ts-ignore - console is available in Node.js
    console.error('Error searching people:', error);
    return [];
  }
}

/**
 * Example 6: Format bio-card data for frontend display
 */
export function formatBioCardForDisplay(bioCard: BioCardData) {
  return {
    // Header section
    header: {
      name: bioCard.person.displayName,
      subtitle: [
        bioCard.person.birthYear && bioCard.person.isLiving 
          ? `Born ${bioCard.person.birthYear}`
          : bioCard.person.birthYear && bioCard.person.deathYear
          ? `${bioCard.person.birthYear} - ${bioCard.person.deathYear}`
          : '',
        ...bioCard.personality.tags.slice(0, 2),
      ].filter(Boolean).join(' • '),
      profileImage: bioCard.visualPreview.profilePhoto || '/default-avatar.png',
      coverImage: bioCard.visualPreview.coverImage,
    },

    // Personality section
    personality: {
      // @ts-ignore - Type is inferred from bioCard.personality.tags
      tags: bioCard.personality.tags.map((tag: any) => ({
        label: tag,
        icon: getIconForTag(tag),
        color: getColorForTag(tag),
      })),
      quote: bioCard.personality.topQuote,
      essence: bioCard.personality.essenceDescription,
    },

    // Featured memory
    featuredMemory: bioCard.memories.featured ? {
      title: bioCard.memories.featured.title,
      excerpt: bioCard.memories.featured.content.substring(0, 150) + '...',
      fullContent: bioCard.memories.featured.content,
      type: bioCard.memories.featured.memoryType,
      tone: bioCard.memories.featured.emotionalTone,
      sharedBy: bioCard.memories.featured.sharedBy,
    } : null,

    // Memory snippets
    memoryPreviews: bioCard.memories.previewSnippets,
    totalMemories: bioCard.memories.count,

    // Family connections
    family: {
      // @ts-ignore - Type is inferred from bioCard.connections.immediateFamily
      immediate: bioCard.connections.immediateFamily.map((member: any) => ({
        name: member.name,
        relation: formatRelation(member.relation),
        photo: member.photoUrl || '/default-avatar.png',
      })),
      total: bioCard.connections.totalConnections,
    },

    // Timeline highlights
    // @ts-ignore - Type is inferred from bioCard.highlights.timeline
    timeline: bioCard.highlights.timeline.map((highlight: any) => ({
      year: highlight.year,
      age: highlight.age,
      title: highlight.title,
      description: highlight.description,
      icon: getCategoryIcon(highlight.category),
      color: getCategoryColor(highlight.category),
    })),
  };
}

// Helper functions for UI formatting
function getIconForTag(tag: string): string {
  const icons: Record<string, string> = {
    storyteller: '📖',
    gardener: '🌱',
    musician: '🎵',
    traveler: '✈️',
    chef: '👨‍🍳',
    artist: '🎨',
    athlete: '🏃',
    scholar: '🎓',
    entrepreneur: '💼',
    caregiver: '❤️',
  };
  return icons[tag.toLowerCase()] || '⭐';
}

function getColorForTag(tag: string): string {
  const colors: Record<string, string> = {
    storyteller: '#8B4513',
    gardener: '#228B22',
    musician: '#9370DB',
    traveler: '#4682B4',
    chef: '#FF6347',
    artist: '#FF69B4',
  };
  return colors[tag.toLowerCase()] || '#808080';
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    birth: '🎂',
    education: '🎓',
    career: '💼',
    family: '👨‍👩‍👧‍👦',
    achievement: '🏆',
    travel: '✈️',
    milestone: '⭐',
  };
  return icons[category] || '📍';
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    birth: '#FFB6C1',
    education: '#87CEEB',
    career: '#DDA0DD',
    family: '#98FB98',
    achievement: '#FFD700',
    travel: '#87CEFA',
  };
  return colors[category] || '#D3D3D3';
}

function formatRelation(relation: string): string {
  const formatted: Record<string, string> = {
    parent: 'Parent',
    child: 'Child',
    spouse: 'Spouse',
    sibling: 'Sibling',
    cousin: 'Cousin',
  };
  return formatted[relation] || relation;
}

// Export for use in routes
export {
  getIconForTag,
  getColorForTag,
  getCategoryIcon,
  getCategoryColor,
  formatRelation,
};
