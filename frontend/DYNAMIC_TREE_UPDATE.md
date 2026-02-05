# Dynamic Family Tree - Implementation Documentation

## Overview
The family tree component has been updated to dynamically render nodes from the API with relationship lines, profile photos, and an interactive scrapbook overlay.

## New Features

### 1. Dynamic Data Loading
- **API Integration**: Fetches all family members from `/api/v1/members`
- **Profile Photos**: Automatically loads profile photos from media service
- **Real-time Updates**: Tree updates when new members are added
- **Error Handling**: Graceful fallbacks for missing data

### 2. Relationship Lines
The tree now automatically draws colored relationship lines based on database relationships:

#### Line Types:
- **Father → Child**: Blue line with arrow (`#3b82f6`)
  - Created from `fatherId` field
  - Label: "Father"
  - Smooth step connection
  
- **Mother → Child**: Pink line with arrow (`#ec4899`)
  - Created from `motherId` field
  - Label: "Mother"
  - Smooth step connection
  
- **Spouse ↔ Spouse**: Red straight line (`#f43f5e`)
  - Created from `spouseId` field
  - Label: 💕 emoji
  - No directional arrows (bidirectional)

### 3. Node Content
Each tree node displays:
- **Profile Photo**: From media service or placeholder
- **Name**: First and last name
- **Life Years**: Birth year - Death year (or "Present" if living)
- **Bio Snippet**: First 100 characters of biography
- **Living Status**: Green pulsing dot for living members
- **Interactive Hint**: "Click to view scrapbook" text

### 4. Scrapbook Overlay
Clicking any node opens a beautiful scrapbook modal with:

#### Profile Section:
- Large profile photo (200x200px)
- Full name with middle name
- Complete life dates with locations
- Birth and death place information
- Gender icon
- Living status badge
- Full biography text (formatted with line breaks)

#### Memory Gallery:
- Grid layout (2-4 columns responsive)
- Thumbnail images with hover effects
- Featured photo indicator (⭐ badge)
- Click to open lightbox view
- Full-size image viewer with captions
- Title and description display

## Component Architecture

### Files Modified/Created:

#### 1. `ScrapbookOverlay.tsx` (NEW)
```
Location: frontend/src/components/ScrapbookOverlay.tsx
Size: ~400 lines
Purpose: Modal overlay for viewing full member details
```

**Key Features:**
- Framer Motion animations
- Image lightbox functionality
- Responsive layout
- Loading states
- Error handling
- Memory cleanup (URL.revokeObjectURL)

**Props:**
```typescript
interface ScrapbookOverlayProps {
  memberId: string;
  isOpen: boolean;
  onClose: () => void;
}
```

**API Calls:**
- GET `/api/v1/members/:id` - Member details
- GET `/api/v1/media/member/:id/profile-photo` - Profile photo
- GET `/api/v1/media/member/:id/gallery` - Memory gallery

#### 2. `FamilyTreeFlow.tsx` (UPDATED)
```
Location: frontend/src/components/FamilyTreeFlow.tsx
Changes: Complete data loading refactor
```

**Key Changes:**
- Removed hardcoded tree structure
- Added dynamic member fetching
- Implemented relationship-based edge creation
- Integrated ScrapbookOverlay
- Added profile photo loading
- Improved error states

**New Interfaces:**
```typescript
interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  isLiving: boolean;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  profilePhotoId?: string;
}

interface MemberWithPhoto extends FamilyMember {
  profilePhotoUrl?: string;
}
```

**Flow:**
1. Fetch all members from API
2. For each member with profilePhotoId:
   - Fetch photo from media service
   - Create Blob URL for display
3. Build nodes and edges from relationships
4. Apply Dagre layout algorithm
5. Render React Flow diagram

#### 3. `BioCardNode.tsx` (UPDATED)
```
Location: frontend/src/components/BioCardNode.tsx
Changes: Enhanced styling and interactivity
```

**Improvements:**
- Better hover effects (scale + translate)
- Tap feedback animation
- Error handling for missing images
- Pulsing animation for living status
- Click hint text
- Improved border styling when selected
- Fallback avatar URL

## Layout Algorithm

### Dagre Configuration:
```javascript
{
  rankdir: 'TB',      // Top to Bottom
  nodesep: 80,        // Horizontal spacing
  ranksep: 120,       // Vertical spacing
  marginx: 50,        // Margin X
  marginy: 50         // Margin Y
}
```

### Node Dimensions:
- Width: 280px (16rem)
- Height: 200px (variable based on content)

## Styling & Colors

### Pastel Backgrounds (Rotating):
```javascript
const bgColors = [
  'pink',     // #FFE5EC
  'peach',    // #FFECD1
  'lavender', // #E5DEFF
  'mint',     // #D5F3E5
  'sky',      // #D5E8F7
  'cream',    // #FFF8E7
  'rose',     // #FFD5E5
  'sage'      // #E8F3E8
]
```

### Relationship Line Colors:
- Father: `#3b82f6` (Blue 500)
- Mother: `#ec4899` (Pink 500)
- Spouse: `#f43f5e` (Rose 500)

### Status Indicators:
- Living: Green pulsing dot (`bg-green-400`)
- Featured Photo: Yellow star badge (`bg-yellow-400`)

## User Interface Panels

### Top Left Panel:
- Title: "Family Tree"
- Instructions: Drag, zoom, click guide

### Top Right Panel:
- Legend with color codes
- Living indicator
- Spouse symbol
- Parent relationship arrows

### Bottom Right Panel:
- Total member count
- Dynamic updates as tree changes

## API Endpoints Used

### API Service (Port 3001):
```
GET  /api/v1/members           - List all members
GET  /api/v1/members/:id       - Get member details
POST /api/v1/members           - Create new member
```

### Media Service (Port 3002):
```
GET  /api/v1/media/member/:id/profile-photo   - Get profile photo
GET  /api/v1/media/member/:id/gallery         - Get memory gallery
POST /api/v1/upload/profile-photo             - Upload profile photo
POST /api/v1/upload/gallery-photos            - Upload gallery photos
```

## Interactive Features

### Tree Interactions:
- **Drag**: Pan the canvas
- **Scroll**: Zoom in/out
- **Click Node**: Open scrapbook overlay
- **Controls**: Built-in zoom/fit controls

### Scrapbook Interactions:
- **Click Backdrop**: Close overlay
- **Close Button**: Exit scrapbook
- **Click Gallery Image**: Open lightbox
- **Click Lightbox Backdrop**: Close lightbox
- **Scroll**: View full bio and gallery

## Responsive Design

### Mobile (< 768px):
- Single column scrapbook layout
- 2-column gallery grid
- Smaller profile photo (128px)
- Touch-friendly controls

### Tablet (768px - 1024px):
- Two-column scrapbook layout
- 3-column gallery grid
- Medium profile photo (160px)

### Desktop (> 1024px):
- Full layout with side-by-side content
- 4-column gallery grid
- Large profile photo (200px)

## Performance Optimizations

### Image Loading:
- Blob URLs for efficient memory usage
- Lazy loading of profile photos
- Thumbnail generation on server
- Error fallbacks to prevent broken images

### React Optimization:
- `useMemo` for node types
- `useCallback` for event handlers
- Memoized BioCardNode component
- AnimatePresence for smooth unmounting

### Memory Management:
- URL.createObjectURL for image display
- Proper cleanup on component unmount
- Efficient Blob handling

## Testing the Implementation

### 1. View Empty Tree:
```bash
# Navigate to tree page
http://localhost:3000/tree
```
Expected: Message "No family members found"

### 2. View Tree with Members:
```bash
# Ensure members exist in database
# Navigate to tree page
http://localhost:3000/tree
```
Expected: Interactive tree with nodes and relationship lines

### 3. Test Scrapbook:
```bash
# Click any node in the tree
```
Expected: Modal overlay with profile and gallery

### 4. Test Relationships:
```bash
# Create members with father/mother/spouse relationships
# View tree to see colored lines
```
Expected: Blue (father), Pink (mother), Red (spouse) lines

## Troubleshooting

### Issue: Nodes not appearing
**Solution**: Check API service is running on port 3001
```bash
docker ps | grep api-service
curl http://localhost:3001/api/v1/members
```

### Issue: Profile photos not loading
**Solution**: Check media service is running on port 3002
```bash
docker ps | grep media-service
curl http://localhost:3002/api/v1/media/member/{id}/profile-photo
```

### Issue: Memory errors in Docker
**Solution**: Increase Docker memory allocation
```bash
# Docker Desktop → Settings → Resources → Memory
# Increase to at least 4GB
```

### Issue: Relationship lines not showing
**Solution**: Verify fatherId/motherId/spouseId fields in database
```bash
# Check database records
docker exec -it familytree-postgres psql -U postgres -d familytree
SELECT id, first_name, father_id, mother_id, spouse_id FROM person;
```

## Future Enhancements

### Planned Features:
- [ ] Edit member from scrapbook
- [ ] Add child/spouse from tree view
- [ ] Export tree as PDF/PNG
- [ ] Timeline view by birth year
- [ ] Search/filter members in tree
- [ ] Multiple tree roots (different families)
- [ ] Collapsible branches
- [ ] Tree statistics panel
- [ ] Photo comparison slider
- [ ] Audio/video memories
- [ ] Story annotations on photos
- [ ] Relationship strength indicators
- [ ] DNA/ancestry integration

### Potential Improvements:
- Cache profile photos in localStorage
- Virtual scrolling for large trees
- WebGL rendering for performance
- Undo/redo for tree edits
- Collaborative editing
- Version history
- Print-optimized view
- Mobile app companion

## Code Examples

### Adding a New Relationship Type:
```typescript
// In buildFlowData function:
if (member.adoptiveFatherId && addedNodes.has(member.adoptiveFatherId)) {
  flowEdges.push({
    id: `${member.adoptiveFatherId}-${member.id}`,
    source: member.adoptiveFatherId,
    target: member.id,
    type: ConnectionLineType.SmoothStep,
    style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5,5' },
    label: 'Adoptive Father',
    labelStyle: { fontSize: 10, fill: '#8b5cf6' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
  });
}
```

### Customizing Node Appearance:
```typescript
// In BioCardNode.tsx:
const customColors = {
  generation1: 'bg-blue-100',
  generation2: 'bg-green-100',
  generation3: 'bg-yellow-100',
};
```

### Adding Custom Overlay Sections:
```tsx
{/* Education Section */}
{member.education && (
  <div className="mb-6">
    <h4 className="text-xl font-bold mb-3">🎓 Education</h4>
    <p className="text-gray-700">{member.education}</p>
  </div>
)}
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 10+)

## Dependencies

### Required Packages:
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "reactflow": "^11.11.4",
  "dagre": "^0.8.5",
  "framer-motion": "^10.18.0",
  "axios": "^1.6.2",
  "clsx": "^2.1.1"
}
```

### Dev Dependencies:
```json
{
  "@types/react": "^18.2.0",
  "@types/dagre": "^0.7.52",
  "typescript": "^5.0.0"
}
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │              FamilyTreeFlow Component              │ │
│  │  • Fetches members from API                        │ │
│  │  • Loads profile photos                            │ │
│  │  • Builds nodes & edges                            │ │
│  │  • Applies Dagre layout                            │ │
│  │  • Renders React Flow                              │ │
│  └─────────────────┬──────────────────────────────────┘ │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────────┐ │
│  │                 BioCardNode                        │ │
│  │  • Displays member info                            │ │
│  │  • Shows profile photo                             │ │
│  │  • Handles click events                            │ │
│  └─────────────────┬──────────────────────────────────┘ │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────────┐ │
│  │            ScrapbookOverlay                        │ │
│  │  • Shows full biography                            │ │
│  │  • Displays memory gallery                         │ │
│  │  • Image lightbox viewer                           │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│   API   │   │  Media  │   │   DB    │
│ Service │   │ Service │   │ Postgres│
│ :3001   │   │ :3002   │   │ :5432   │
└─────────┘   └─────────┘   └─────────┘
```

## Conclusion

The dynamic tree update provides a complete solution for:
- ✅ Fetching data from API
- ✅ Drawing relationship lines
- ✅ Displaying profile photos
- ✅ Interactive scrapbook overlay
- ✅ Memory gallery viewing
- ✅ Responsive design
- ✅ Error handling
- ✅ Performance optimization

The tree now seamlessly integrates with the backend services to provide a rich, interactive family history experience.
