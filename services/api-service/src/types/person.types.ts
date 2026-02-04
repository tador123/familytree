/**
 * Family Tree Application - Type Definitions
 * Creative interfaces for bio-card UI and person nodes
 */

// ==================== CORE PERSON NODE ====================

/**
 * Represents a single memory associated with a person
 * Used for displaying "closest memories" in bio-card UI
 */
export interface ClosestMemory {
  id: string;
  title: string;
  content: string;
  memoryType: 'story' | 'quote' | 'achievement' | 'tradition' | 'humor';
  dateOfMemory?: Date;
  location?: string;
  sharedBy?: string;
  emotionalTone?: 'joyful' | 'nostalgic' | 'inspiring' | 'humorous' | 'profound';
  isFeatured: boolean;
  mediaPreview?: {
    thumbnailUrl: string;
    caption: string;
  };
}

/**
 * Life highlight for timeline visualization
 */
export interface LifeHighlight {
  year: number;
  age?: number;
  title: string;
  description: string;
  category: 'birth' | 'education' | 'career' | 'family' | 'achievement' | 'travel' | 'milestone';
  icon?: string;
  location?: string;
}

/**
 * Relationship information for person node
 */
export interface RelationshipInfo {
  id: string;
  relatedPerson: {
    id: string;
    fullName: string;
    profilePhotoUrl?: string;
  };
  relationshipType: 'parent' | 'child' | 'spouse' | 'sibling' | 'cousin' | 'guardian' | 'custom';
  customType?: string;
  strength?: number; // 1-10 scale
  startDate?: Date;
  isCurrent: boolean;
}

/**
 * Media preview for person's gallery
 */
export interface MediaPreview {
  id: string;
  thumbnailUrl: string;
  title?: string;
  caption?: string;
  dateTaken?: Date;
  fileType: 'image' | 'video' | 'document' | 'audio';
  isFeatured: boolean;
}

/**
 * Complete Person Node for Bio-Card UI
 * This interface represents everything needed to render a rich, creative bio card
 */
export interface PersonNode {
  // Identity
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  preferredName?: string;
  fullName: string; // Computed: "First Middle Last"
  displayName: string; // Computed: preferredName || "First Last"
  
  // Demographics
  gender?: string;
  birthDate?: Date;
  birthPlace?: string;
  deathDate?: Date;
  deathPlace?: string;
  age?: number; // Computed
  isLiving: boolean;
  
  // Biography
  biography?: string;
  occupation?: string;
  education?: string;
  currentLocation?: string;
  
  // Creative Fields for Bio-Card
  personalityTags: string[]; // ['storyteller', 'gardener', 'musician', 'traveler', 'chef', 'artist']
  closestMemories: ClosestMemory[]; // Top 3-5 most meaningful memories
  favoriteQuote?: string;
  lifeHighlights: LifeHighlight[]; // Timeline of significant moments
  
  // Visual Profile
  profilePhotoUrl?: string;
  featuredMedia: MediaPreview[]; // Top featured photos/videos
  
  // Relationships for Bio-Card
  immediateFamily: RelationshipInfo[]; // Parents, spouse, children
  extendedFamily: RelationshipInfo[]; // Siblings, cousins, etc.
  familyTreePosition: {
    generation: number; // 0 = root, 1 = children, -1 = parents
    branchName?: string; // "Smith Branch", "Johnson Line"
  };
  
  // Stats for UI
  stats: {
    totalMemories: number;
    totalMedia: number;
    totalRelationships: number;
    eventsAttended: number;
  };
  
  // Metadata
  privacyLevel: 'public' | 'family' | 'private';
  createdAt: Date;
  updatedAt: Date;
}

// ==================== BIO-CARD UI SPECIFIC ====================

/**
 * Optimized data structure for rendering a bio-card component
 * Contains only essential fields for initial card render
 */
export interface BioCardData {
  person: {
    id: string;
    displayName: string;
    profilePhotoUrl?: string;
    birthYear?: number;
    deathYear?: number;
    isLiving: boolean;
    occupation?: string;
    location?: string;
  };
  
  personality: {
    tags: string[]; // Up to 5 tags
    topQuote?: string;
    essenceDescription: string; // 1-2 sentence summary
  };
  
  memories: {
    featured: ClosestMemory; // Single featured memory
    count: number;
    previewSnippets: string[]; // 3 short snippets
  };
  
  visualPreview: {
    profilePhoto?: string;
    featuredImages: string[]; // Up to 3 thumbnail URLs
    coverImage?: string;
  };
  
  connections: {
    immediateFamily: Array<{
      name: string;
      relation: string;
      photoUrl?: string;
    }>;
    totalConnections: number;
  };
  
  highlights: {
    timeline: LifeHighlight[];
    milestoneCount: number;
  };
}

// ==================== FAMILY EVENT ====================

export interface FamilyEventNode {
  id: string;
  title: string;
  description?: string;
  eventType: 'wedding' | 'reunion' | 'birthday' | 'anniversary' | 'funeral' | 'holiday' | 'custom';
  eventDate: Date;
  endDate?: Date;
  location?: string;
  venue?: string;
  
  attendees: Array<{
    personId: string;
    personName: string;
    profilePhotoUrl?: string;
    role?: string;
  }>;
  
  media: MediaPreview[];
  highlights?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SEARCH & FILTER ====================

export interface PersonSearchFilters {
  nameQuery?: string;
  personalityTags?: string[];
  birthYearRange?: {
    start: number;
    end: number;
  };
  isLiving?: boolean;
  location?: string;
  hasMedia?: boolean;
  hasMemories?: boolean;
  relationshipTo?: string; // Person ID
  generation?: number;
}

export interface PersonSearchResult {
  person: PersonNode;
  relevanceScore: number;
  matchedFields: string[];
}

// ==================== FAMILY TREE VISUALIZATION ====================

export interface TreeNode {
  person: PersonNode;
  children: TreeNode[];
  depth: number;
  position: {
    x: number;
    y: number;
  };
}

export interface FamilyTreeData {
  rootPerson: PersonNode;
  tree: TreeNode;
  generations: number;
  totalPeople: number;
  branches: Array<{
    name: string;
    rootPersonId: string;
    memberCount: number;
  }>;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    page?: number;
    totalPages?: number;
    totalResults?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
}

// ==================== HELPER TYPES ====================

export type PersonalityTag = 
  | 'storyteller' 
  | 'gardener' 
  | 'musician' 
  | 'traveler' 
  | 'chef' 
  | 'artist' 
  | 'athlete' 
  | 'scholar' 
  | 'entrepreneur' 
  | 'caregiver'
  | 'adventurer'
  | 'historian'
  | 'craftsperson'
  | 'mentor'
  | 'comedian';

export type RelationType = 
  | 'parent' 
  | 'child' 
  | 'spouse' 
  | 'sibling' 
  | 'cousin' 
  | 'grandparent' 
  | 'grandchild'
  | 'aunt'
  | 'uncle'
  | 'niece'
  | 'nephew'
  | 'guardian'
  | 'custom';

export type PrivacyLevel = 'public' | 'family' | 'private';

export type MediaType = 'image' | 'video' | 'document' | 'audio';

export type EventType = 'wedding' | 'reunion' | 'birthday' | 'anniversary' | 'funeral' | 'holiday' | 'graduation' | 'custom';
