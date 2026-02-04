# Family Member Bio Card Component

Beautiful, animated React component for displaying family member bio cards with a friendly, hand-drawn aesthetic.

## Features

✨ **Smooth Animations**
- Gentle scale-up on hover
- Framer Motion powered transitions
- Animated button reveal
- Wiggle effect on profile photo

🎨 **Friendly Design**
- Extra large rounded corners (2.5rem)
- Soft pastel backgrounds (8 color options)
- Circular profile photo with hand-drawn border effect
- White decorative accents

📸 **Memory Gallery**
- 3 thumbnail slots for cherished photos
- Hover zoom on thumbnails
- Graceful fallback images

🎯 **Interactive**
- "View Full Story" button reveals on hover
- Smooth scale and shadow transitions
- Customizable click handlers

## Usage

```tsx
import FamilyMemberBioCard from '@/components/FamilyMemberBioCard'

<FamilyMemberBioCard
  id="1"
  name="John Smith"
  bioSnippet="A passionate storyteller and gardener..."
  profilePhoto="/photos/john.jpg"
  memoryGallery={[
    '/memories/garden.jpg',
    '/memories/family.jpg',
    '/memories/wedding.jpg'
  ]}
  backgroundColor="mint"
  onViewFullStory={(id) => console.log('View story:', id)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | Required | Unique identifier |
| `name` | `string` | Required | Person's display name |
| `bioSnippet` | `string` | Required | Short bio (2-3 sentences) |
| `profilePhoto` | `string` | Placeholder | Profile image URL |
| `memoryGallery` | `string[]` | `[]` | Array of 0-3 image URLs |
| `backgroundColor` | `'pink' \| 'peach' \| 'lavender' \| 'mint' \| 'sky' \| 'cream' \| 'rose' \| 'sage'` | `'peach'` | Card background color |
| `onViewFullStory` | `(id: string) => void` | undefined | Click handler for button |
| `className` | `string` | undefined | Additional CSS classes |

## Color Palette

- **pink**: `#FFE5EC` - Soft pink
- **peach**: `#FFECD1` - Warm peach
- **lavender**: `#E5DEFF` - Gentle purple
- **mint**: `#D5F3E5` - Fresh mint
- **sky**: `#D5E8F7` - Light blue
- **cream**: `#FFF8E7` - Vanilla cream
- **rose**: `#FFD5E5` - Dusty rose
- **sage**: `#E8F3E8` - Soft sage

## Demo

Visit `/bio-cards` to see the component in action with 6 sample family members.

## Technologies

- **React** - Component framework
- **Next.js 14** - App router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **clsx** - Conditional classes

## Animation Details

### Card Hover
```typescript
whileHover={{ 
  scale: 1.03,
  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)...'
}}
```

### Profile Photo Wiggle
```typescript
animate={{ 
  rotate: isHovered ? [0, -1, 1, -1, 0] : 0 
}}
```

### Button Reveal
```typescript
animate={{ 
  opacity: isHovered ? 1 : 0,
  y: isHovered ? 0 : 10
}}
```

## Customization

### Hand-Drawn Border
The profile photo has a unique hand-drawn border effect using layered divs with slight rotations:

```tsx
<div className="absolute inset-0 rounded-full border-2 border-black/10 transform rotate-1"></div>
<div className="absolute inset-0 rounded-full border-2 border-black/10 transform -rotate-1"></div>
```

### Decorative Accents
Small circular accents in corners add a playful touch:

```tsx
<motion.div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50" />
<motion.div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-white/30" />
```

## Accessibility

- Semantic HTML structure
- Alt text for images
- Keyboard navigation support (button)
- ARIA-friendly animations
- Error handling for missing images

## Performance

- Lazy loading ready
- Optimized re-renders with state management
- Smooth 60fps animations
- Minimal bundle size impact

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)
