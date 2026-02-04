/**
 * Sample Bio-Card Component Props
 * React component example using PersonNode and BioCardData
 */

import { PersonNode, BioCardData, ClosestMemory, LifeHighlight } from './person.types';

/**
 * Bio-Card Component Props
 * For rendering an interactive, creative person bio card
 */
export interface BioCardProps {
  personNode: PersonNode;
  variant?: 'compact' | 'standard' | 'expanded';
  showMemories?: boolean;
  showTimeline?: boolean;
  showFamily?: boolean;
  onMemoryClick?: (memory: ClosestMemory) => void;
  onPersonClick?: (personId: string) => void;
  className?: string;
}

/**
 * Memory Card Props
 * For displaying individual memories in the bio-card
 */
export interface MemoryCardProps {
  memory: ClosestMemory;
  compact?: boolean;
  onClick?: () => void;
}

/**
 * Timeline Props
 * For displaying life highlights chronologically
 */
export interface TimelineProps {
  highlights: LifeHighlight[];
  orientation?: 'vertical' | 'horizontal';
  interactive?: boolean;
  onHighlightClick?: (highlight: LifeHighlight) => void;
}

/**
 * Personality Tag Cloud Props
 */
export interface PersonalityTagsProps {
  tags: string[];
  maxDisplay?: number;
  interactive?: boolean;
  onTagClick?: (tag: string) => void;
  colorScheme?: 'warm' | 'cool' | 'neutral' | 'vibrant';
}

/**
 * Example: Formatted Bio-Card Data for UI
 * This shows how to transform database data into UI-ready format
 */
export interface FormattedBioCard {
  header: {
    name: string;
    subtitle: string; // e.g., "1950 - 2020 • Storyteller • Gardener"
    profileImage: string;
    coverImage?: string;
  };
  
  overview: {
    biography: string;
    personalityTags: Array<{
      label: string;
      icon: string;
      color: string;
    }>;
    quickFacts: Array<{
      label: string;
      value: string;
      icon?: string;
    }>;
  };
  
  memoriesSection: {
    title: string; // "Closest Memories"
    featuredMemory: {
      title: string;
      excerpt: string;
      fullContent: string;
      emotionalTone: string;
      sharedBy?: string;
      mediaPreview?: string;
    };
    moreMemories: Array<{
      id: string;
      title: string;
      snippet: string;
      icon: string;
    }>;
  };
  
  timelineSection: {
    title: string; // "Life Journey"
    highlights: Array<{
      year: number;
      age: number;
      title: string;
      description: string;
      icon: string;
      color: string;
    }>;
  };
  
  familySection: {
    title: string; // "Family Connections"
    immediate: Array<{
      id: string;
      name: string;
      relation: string;
      photo: string;
      strength: number;
    }>;
    extended: Array<{
      id: string;
      name: string;
      relation: string;
      photo?: string;
    }>;
  };
  
  gallerySection: {
    title: string; // "Memories in Photos"
    featured: Array<{
      id: string;
      url: string;
      thumbnail: string;
      caption: string;
      date?: string;
    }>;
    totalCount: number;
  };
}

/**
 * Bio-Card Theme Configuration
 */
export interface BioCardTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    subtle: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  spacing: {
    compact: number;
    standard: number;
    expanded: number;
  };
  borderRadius: number;
  shadows: {
    card: string;
    hover: string;
  };
}

/**
 * Interactive Bio-Card Actions
 */
export interface BioCardActions {
  onEdit?: () => void;
  onShare?: () => void;
  onAddMemory?: () => void;
  onViewFullProfile?: () => void;
  onViewFamilyTree?: () => void;
  onDownloadCard?: () => void;
}

/**
 * Bio-Card Animation Configuration
 */
export interface BioCardAnimations {
  entrance?: {
    type: 'fade' | 'slide' | 'scale' | 'none';
    duration: number;
    delay?: number;
  };
  hover?: {
    type: 'lift' | 'glow' | 'scale' | 'none';
    intensity: number;
  };
  memoryReveal?: {
    type: 'fade' | 'slide' | 'flip';
    duration: number;
    stagger?: number;
  };
}
