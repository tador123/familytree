# Family Tree Schema Documentation

## Overview

This document describes the PostgreSQL schema designed for a comprehensive Family Tree application using **Prisma ORM** and **TypeScript**.

## Database Tables

### 1. People Table
Stores comprehensive biographical information about family members.

**Key Features:**
- Rich biographical data (birth/death dates, places, biography, occupation)
- **Personality Tags Array** - Flexible tags like 'storyteller', 'gardener', 'musician'
- **Closest Memories** (JSONB) - Structured data for featured memories
- **Life Highlights** (JSONB) - Timeline of significant life events
- Privacy controls and living status tracking

**Personality Tags Examples:**
```typescript
personalityTags: ['storyteller', 'gardener', 'mentor', 'traveler']
```

### 2. Relationships Table
Flexible relationship system supporting various connection types.

**Supported Relationship Types:**
- `parent` / `child`
- `spouse`
- `sibling`
- `cousin`
- `guardian`
- `custom` (with customType field)

**Features:**
- Bidirectional relationships
- Relationship strength (1-10 scale)
- Timeline tracking (start/end dates)
- Current status flag

### 3. Media Table
Photos, videos, and documents linked to people or family events.

**Link Options:**
- **Person-specific media** - Photos of individuals
- **Family event media** - Wedding photos, reunion videos
- Featured/public flags for curation

**Metadata:**
- Date taken, location, photographer
- Searchable tags array
- View count tracking

### 4. Family Events Table
Significant family gatherings and occasions.

**Event Types:**
- Wedding
- Reunion
- Birthday
- Anniversary
- Funeral
- Holiday
- Custom

**Features:**
- Multiple attendees through event_attendance table
- Event highlights (JSONB)
- Organizer tracking

### 5. Memories Table
Individual stories and memories about people.

**Memory Types:**
- `story` - Personal anecdotes
- `quote` - Memorable sayings
- `achievement` - Accomplishments
- `tradition` - Family traditions
- `humor` - Funny moments

**Features:**
- Emotional tone classification
- Featured flag for bio-cards
- Shareable by family members

## TypeScript Interface: PersonNode

The **PersonNode** interface represents a complete person for bio-card rendering:

```typescript
interface PersonNode {
  // Identity
  id: string;
  fullName: string;
  displayName: string;
  
  // Biography
  biography?: string;
  occupation?: string;
  age?: number;
  
  // Creative Fields for Bio-Card
  personalityTags: string[];
  closestMemories: ClosestMemory[];
  favoriteQuote?: string;
  lifeHighlights: LifeHighlight[];
  
  // Visual
  profilePhotoUrl?: string;
  featuredMedia: MediaPreview[];
  
  // Relationships
  immediateFamily: RelationshipInfo[];
  extendedFamily: RelationshipInfo[];
  
  // Stats
  stats: {
    totalMemories: number;
    totalMedia: number;
    totalRelationships: number;
    eventsAttended: number;
  };
}
```

## Creative Bio-Card Features

### Closest Memories
Each person can have featured memories that tell their story:

```typescript
interface ClosestMemory {
  title: string;
  content: string;
  memoryType: 'story' | 'quote' | 'achievement' | 'tradition' | 'humor';
  emotionalTone?: 'joyful' | 'nostalgic' | 'inspiring' | 'humorous';
  dateOfMemory?: Date;
  sharedBy?: string;
}
```

### Life Highlights Timeline
Visual timeline of significant moments:

```typescript
interface LifeHighlight {
  year: number;
  age?: number;
  title: string;
  description: string;
  category: 'birth' | 'education' | 'career' | 'family' | 'achievement' | 'travel';
  location?: string;
}
```

## Example Usage

### Creating a Person with Personality
```typescript
const person = await personService.createPerson({
  firstName: 'John',
  lastName: 'Smith',
  personalityTags: ['storyteller', 'gardener', 'mentor'],
  favoriteQuote: 'The best time to plant a tree was 20 years ago.',
  lifeHighlights: [
    {
      year: 1974,
      age: 24,
      title: 'Married',
      description: 'Wedding at St. Mary Church',
      category: 'family'
    }
  ]
});
```

### Adding a Memory
```typescript
await personService.addMemory(personId, {
  title: 'The Great Garden Project',
  content: 'In summer of 1985, John transformed the backyard...',
  memoryType: 'story',
  emotionalTone: 'nostalgic',
  isFeatured: true
});
```

### Fetching Bio-Card Data
```typescript
const bioCard = await personService.getBioCardData(personId);
// Returns optimized data structure for UI rendering
```

## Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio

# Push schema to database
npm run prisma:push
```

## Schema Files

- **Prisma Schema**: `/services/api-service/prisma/schema.prisma`
- **SQL Migration**: `/database/init/01-schema.sql` & `02-enhanced-schema.sql`
- **TypeScript Types**: `/services/api-service/src/types/person.types.ts`
- **Service Layer**: `/services/api-service/src/services/personService.ts`

## Key Design Decisions

1. **Personality Tags as Array** - Flexible, searchable tags without predefined constraints
2. **JSONB for Memories** - Structured but flexible data for closest memories
3. **Bidirectional Relationships** - Separate from/to fields for clarity
4. **Media Dual-Linking** - Link to both people AND events
5. **Memory Emotional Tone** - Categorize memories for better UI presentation
6. **Relationship Strength** - 1-10 scale for closeness visualization

## Future Enhancements

- [ ] Family tree position calculation (generation depth)
- [ ] Branch name assignment logic
- [ ] Photo face recognition linking
- [ ] Memory collaboration (multiple authors)
- [ ] Event RSVP system
- [ ] Privacy granularity per field
