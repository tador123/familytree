# AddMemberForm Component

A beautiful, multi-step wizard form for adding family members to the Family Tree application.

## Features

### 🎨 Design
- **Clean UI**: Soft shadows, rounded corners, and smooth transitions
- **Responsive**: Works perfectly on desktop and mobile devices
- **Tailwind CSS**: Fully styled with Tailwind utility classes
- **Framer Motion**: Smooth animations and transitions throughout

### 📝 Multi-Step Wizard

#### Step 1: Basic Information
- **Required Fields**:
  - First Name (validated)
  - Last Name (validated)
- **Optional Fields**:
  - Middle Name
  - Gender (dropdown: Male, Female, Other)
  - Birth Date (date picker)
  - Birth Place
  - Biography (textarea)

#### Step 2: Family Connections
- **Parent Selection**:
  - Father (dropdown from existing members)
  - Mother (dropdown from existing members)
- **Spouse Selection**:
  - Spouse (dropdown from existing members)
- **Smart Loading**: Automatically fetches existing family members from API
- **Helpful Tips**: Info boxes to guide users

#### Step 3: Photos & Memories
- **Profile Photo**:
  - Drag & drop or click to upload
  - Image preview with circular crop
  - 5MB size limit
  - Accepts: JPEG, JPG, PNG, GIF, WEBP
- **Memory Gallery**:
  - Multiple file upload (max 10 photos)
  - Grid preview of selected photos
  - Remove individual photos
  - 10MB total size limit

### ✨ Animations

#### Step Transitions
- Smooth slide animations between steps
- Step indicator with color transitions
- Scale animations on step circles

#### Success Animation
- Full-screen overlay with backdrop blur
- Bounce-in checkmark animation
- Friendly success message
- Auto-dismisses after 2 seconds

#### Interactive Elements
- Hover scale effects on buttons
- Tap scale feedback
- Drag state indicators on upload zones
- Loading spinner during submission

### 🔄 Form Validation
- React Hook Form for robust form handling
- Field-level validation
- Step-by-step validation before proceeding
- Clear error messages in red below fields

### 📡 API Integration

#### Endpoints Used
1. **GET** `/api/v1/members` - Fetch existing members for dropdowns
2. **POST** `/api/v1/members` - Create new family member
3. **POST** `/api/v1/upload/profile-photo` - Upload profile photo
4. **POST** `/api/v1/upload/gallery-photos` - Upload gallery photos

#### Error Handling
- Try-catch blocks for all API calls
- User-friendly error alerts
- Console logging for debugging

## Usage

### Basic Implementation
```tsx
import AddMemberForm from '@/components/AddMemberForm';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 py-12">
      <AddMemberForm />
    </div>
  );
}
```

### With Success Callback
```tsx
import AddMemberForm from '@/components/AddMemberForm';

export default function Page() {
  const handleSuccess = () => {
    console.log('Member added successfully!');
    // Navigate to another page or refresh data
    window.location.href = '/members';
  };

  return (
    <AddMemberForm onSuccess={handleSuccess} />
  );
}
```

## Component Structure

```
AddMemberForm/
├── StepIndicator          # Shows current progress (1/2/3)
├── ProfilePhotoUploader   # Handles single profile photo upload
├── GalleryPhotosUploader  # Handles multiple gallery photos
└── Form Steps
    ├── Step 1: Basic Info
    ├── Step 2: Connections
    └── Step 3: Photos
```

## Styling Details

### Colors
- **Primary**: Emerald (emerald-500, emerald-600)
- **Secondary**: Teal (teal-500)
- **Success**: Green (emerald-500)
- **Error**: Red (red-500)
- **Info**: Blue (blue-500)
- **Warning**: Amber (amber-500)

### Typography
- **Headings**: font-bold, text-2xl/3xl
- **Labels**: font-medium, text-sm
- **Body**: text-gray-600
- **Placeholders**: text-gray-400

### Shadows
- **Cards**: shadow-xl (main form)
- **Buttons**: shadow-md
- **Images**: shadow-lg
- **Success Modal**: shadow-2xl

### Rounded Corners
- **Main Card**: rounded-2xl (16px)
- **Inputs**: rounded-lg (8px)
- **Buttons**: rounded-lg (8px)
- **Images**: rounded-xl (12px)
- **Profile Preview**: rounded-full

## Dependencies

```json
{
  "react": "^18.2.0",
  "react-hook-form": "^7.49.2",
  "framer-motion": "^10.16.16",
  "react-dropzone": "^14.2.3",
  "axios": "^1.6.2"
}
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_MEDIA_URL=http://localhost:3002/api/v1
```

## Responsive Design

### Mobile (< 768px)
- Single column layout
- Full-width inputs
- Stacked buttons
- 3-column gallery grid

### Desktop (≥ 768px)
- Two-column layout for related fields
- Side-by-side buttons
- Larger form container
- Better spacing

## Accessibility

- ✅ Semantic HTML
- ✅ Proper label associations
- ✅ Required field indicators
- ✅ Error messages linked to inputs
- ✅ Keyboard navigation support
- ✅ Focus states on all interactive elements

## Animation Performance

All animations use:
- CSS transforms (translateX, scale)
- Opacity transitions
- GPU-accelerated properties
- Optimized re-renders with AnimatePresence

## State Management

### Local State
- `currentStep`: Current wizard step (1-3)
- `familyMembers`: List of existing members
- `profilePhotoFile`: Selected profile photo
- `profilePhotoPreview`: Preview URL
- `galleryPhotos`: Array of selected gallery photos
- `isSubmitting`: Loading state during submission
- `showSuccess`: Success animation visibility

### Form State (React Hook Form)
- Field values
- Validation errors
- Form submission handling

## File Upload Flow

1. User selects files via drag-drop or click
2. Files are stored in component state
3. Preview URLs generated with `URL.createObjectURL()`
4. On submit:
   - Create member first (get memberId)
   - Upload profile photo with memberId
   - Upload gallery photos with memberId
5. Show success animation
6. Call onSuccess callback

## Customization

### Change Colors
```tsx
// In AddMemberForm.tsx, find and replace:
'emerald-500' → 'blue-500'    // Primary color
'teal-500' → 'indigo-500'      // Secondary color
```

### Adjust Animation Speed
```tsx
// Modify transition durations in motion components:
transition={{ duration: 0.3 }}  // Faster
transition={{ duration: 0.8 }}  // Slower
```

### Change Max Upload Limits
```tsx
// In ProfilePhotoUploader:
maxFiles: 1 → maxFiles: 3

// In GalleryPhotosUploader:
maxFiles: 10 → maxFiles: 20
.slice(0, 10) → .slice(0, 20)
```

## Error Scenarios

### Validation Errors
- Missing required fields → Red text below input
- Invalid email format → Red text with specific message

### API Errors
- Network failure → Alert with error message
- Server error (500) → Alert with fallback message
- Missing member → "Father with id X does not exist"

### Upload Errors
- File too large → Rejected by dropzone
- Invalid file type → Rejected by dropzone
- Upload failure → Caught and alerted to user

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance Tips

1. **Lazy Load**: Wrap in `next/dynamic` for code splitting
2. **Memoization**: Use `React.memo()` for child components
3. **Debounce**: Add debouncing to API calls if needed
4. **Image Optimization**: Consider compressing images before upload

## Testing Recommendations

### Unit Tests
```tsx
- Test form validation
- Test step navigation
- Test file upload handling
```

### Integration Tests
```tsx
- Test full form submission flow
- Test API error handling
- Test success callback execution
```

### E2E Tests
```tsx
- Complete wizard flow
- Photo upload and preview
- Form submission and success animation
```

## Future Enhancements

- [ ] Image cropping tool for profile photos
- [ ] Drag-to-reorder gallery photos
- [ ] Bulk edit relationships
- [ ] Import from CSV
- [ ] Save as draft functionality
- [ ] Photo metadata (date, location)
- [ ] Advanced search in member dropdowns
- [ ] Validation for duplicate members
- [ ] Undo/redo support
- [ ] Dark mode support
