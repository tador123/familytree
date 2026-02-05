# Media Service API Documentation

## Base URL
```
http://localhost:3002/api/v1
```

## Overview
The Media Service handles image uploads for the Family Tree application with two dedicated storage paths:
- `/profile-photos` - Main avatar/profile photos
- `/galleries` - Memory gallery images

All media files are linked to family members via `memberId` and stored in PostgreSQL.

---

## Upload Endpoints

### 1. Upload Profile Photo
**POST** `/upload/profile-photo`

Uploads a profile photo to `/profile-photos` directory and links it to a member.

#### Request
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `photo` (file, required) - Image file
  - `memberId` (string, required) - UUID of the family member
  - `title` (string, optional) - Photo title
  - `description` (string, optional) - Photo description

#### Example (cURL)
```bash
curl -X POST http://localhost:3002/api/v1/upload/profile-photo \
  -F "photo=@/path/to/image.jpg" \
  -F "memberId=abc-123-uuid" \
  -F "title=John's Profile Photo"
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "data": {
    "id": "media-uuid",
    "filename": "profile_abc123.jpg",
    "originalName": "image.jpg",
    "mimetype": "image/jpeg",
    "size": 245678,
    "path": "/uploads/profile-photos/profile_abc123.jpg",
    "thumbnailPath": "/uploads/profile-photos/thumb_profile_abc123.jpg",
    "memberId": "abc-123-uuid"
  }
}
```

---

### 2. Upload Gallery Photo
**POST** `/upload/gallery-photo`

Uploads a photo to `/galleries` directory for memory gallery display.

#### Request
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `photo` (file, required) - Image file
  - `memberId` (string, required) - UUID of the family member
  - `title` (string, optional) - Photo title
  - `description` (string, optional) - Photo description
  - `caption` (string, optional) - Photo caption
  - `tags` (string, optional) - Comma-separated tags
  - `dateTaken` (string, optional) - ISO date when photo was taken
  - `location` (string, optional) - Location where photo was taken
  - `isFeatured` (boolean, optional) - Mark as featured image

#### Example (cURL)
```bash
curl -X POST http://localhost:3002/api/v1/upload/gallery-photo \
  -F "photo=@/path/to/memory.jpg" \
  -F "memberId=abc-123-uuid" \
  -F "title=Summer Vacation 2020" \
  -F "description=Beach trip with family" \
  -F "tags=vacation,beach,summer" \
  -F "dateTaken=2020-07-15" \
  -F "location=Miami Beach, FL" \
  -F "isFeatured=true"
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Gallery photo uploaded successfully",
  "data": {
    "id": "media-uuid",
    "filename": "gallery_xyz789.jpg",
    "originalName": "memory.jpg",
    "mimetype": "image/jpeg",
    "size": 1245678,
    "path": "/uploads/galleries/gallery_xyz789.jpg",
    "thumbnailPath": "/uploads/galleries/thumb_gallery_xyz789.jpg",
    "memberId": "abc-123-uuid",
    "title": "Summer Vacation 2020",
    "description": "Beach trip with family",
    "isFeatured": true
  }
}
```

---

### 3. Upload Multiple Gallery Photos
**POST** `/upload/gallery-photos`

Uploads multiple photos to `/galleries` directory in a single request.

#### Request
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `photos` (files, required) - Multiple image files (max 10)
  - `memberId` (string, required) - UUID of the family member

#### Example (cURL)
```bash
curl -X POST http://localhost:3002/api/v1/upload/gallery-photos \
  -F "photos=@/path/to/photo1.jpg" \
  -F "photos=@/path/to/photo2.jpg" \
  -F "photos=@/path/to/photo3.jpg" \
  -F "memberId=abc-123-uuid"
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "3 photos uploaded successfully",
  "data": [
    {
      "id": "media-uuid-1",
      "filename": "gallery_abc1.jpg",
      "path": "/uploads/galleries/gallery_abc1.jpg",
      "thumbnailPath": "/uploads/galleries/thumb_gallery_abc1.jpg"
    },
    {
      "id": "media-uuid-2",
      "filename": "gallery_abc2.jpg",
      "path": "/uploads/galleries/gallery_abc2.jpg",
      "thumbnailPath": "/uploads/galleries/thumb_gallery_abc2.jpg"
    },
    {
      "id": "media-uuid-3",
      "filename": "gallery_abc3.jpg",
      "path": "/uploads/galleries/gallery_abc3.jpg",
      "thumbnailPath": "/uploads/galleries/thumb_gallery_abc3.jpg"
    }
  ]
}
```

---

## Media Retrieval Endpoints

### 4. Get Memory Gallery for Member
**GET** `/media/member/:memberId/gallery`

**⭐ Utility Function**: Fetches all 'Memory Gallery' images for a specific member.

#### Query Parameters
- `featured` (boolean, optional) - If `true`, returns only featured images

#### Example
```bash
# Get all gallery images
curl http://localhost:3002/api/v1/media/member/abc-123-uuid/gallery

# Get only featured images
curl http://localhost:3002/api/v1/media/member/abc-123-uuid/gallery?featured=true
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Memory gallery for member abc-123-uuid",
  "count": 15,
  "data": [
    {
      "id": "media-uuid-1",
      "filename": "gallery_xyz.jpg",
      "originalFilename": "vacation.jpg",
      "filePath": "/uploads/galleries/gallery_xyz.jpg",
      "thumbnailPath": "/uploads/galleries/thumb_gallery_xyz.jpg",
      "fileType": "image",
      "mimeType": "image/jpeg",
      "fileSize": 1245678,
      "title": "Summer Vacation 2020",
      "description": "Beach trip with family",
      "personId": "abc-123-uuid",
      "isFeatured": true,
      "createdAt": "2026-01-15T10:30:00.000Z",
      "dateTaken": "2020-07-15T00:00:00.000Z",
      "location": "Miami Beach, FL",
      "caption": "Beautiful sunset",
      "tags": ["vacation", "beach", "summer"]
    }
  ]
}
```

---

### 5. Get Profile Photo for Member
**GET** `/media/member/:memberId/profile-photo`

Fetches the profile photo for a specific member.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Profile photo for member abc-123-uuid",
  "data": {
    "id": "media-uuid",
    "filename": "profile_abc.jpg",
    "filePath": "/uploads/profile-photos/profile_abc.jpg",
    "thumbnailPath": "/uploads/profile-photos/thumb_profile_abc.jpg",
    "fileType": "image",
    "personId": "abc-123-uuid"
  }
}
```

---

### 6. Get All Media for Member
**GET** `/media/member/:memberId`

Fetches all media (profile + gallery) for a specific member.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Get media for member abc-123-uuid",
  "count": 20,
  "data": [
    {
      "id": "media-uuid",
      "filename": "profile_abc.jpg",
      "fileType": "image",
      "isFeatured": true,
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 7. Get Single Media Item
**GET** `/media/:id`

Fetches details of a single media item by ID.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Get media item media-uuid",
  "data": {
    "id": "media-uuid",
    "filename": "gallery_xyz.jpg",
    "filePath": "/uploads/galleries/gallery_xyz.jpg",
    "title": "Summer Vacation",
    "person": {
      "id": "abc-123-uuid",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### 8. Update Media Metadata
**PUT** `/media/:id`

Updates metadata for a media item.

#### Request Body
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "caption": "New caption",
  "isFeatured": true,
  "tags": ["tag1", "tag2"],
  "dateTaken": "2020-07-15",
  "location": "New Location"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Media item media-uuid updated successfully",
  "data": {
    "id": "media-uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "isFeatured": true
  }
}
```

---

### 9. Delete Media Item
**DELETE** `/media/:id`

Deletes a media item (both file and database record).

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Media item media-uuid deleted successfully"
}
```

---

## Storage Paths

### Directory Structure
```
/uploads/
├── profile-photos/           # Profile/avatar photos
│   ├── profile_uuid1.jpg
│   ├── thumb_profile_uuid1.jpg
│   └── ...
├── galleries/                # Memory gallery images
│   ├── gallery_uuid1.jpg
│   ├── thumb_gallery_uuid1.jpg
│   └── ...
```

### File Naming Convention
- **Profile Photos**: `profile_{uuid}.{ext}`
- **Gallery Photos**: `gallery_{uuid}.{ext}`
- **Thumbnails**: `thumb_{original_filename}`

### Thumbnail Sizes
- **Profile Photos**: 200x200px
- **Gallery Photos**: 300x300px

---

## File Size Limits
- **Profile Photos**: 5MB maximum
- **Gallery Photos**: 10MB maximum
- **Multiple Upload**: Max 10 files per request

---

## Supported Image Formats
- JPEG/JPG
- PNG
- GIF
- WEBP

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

```json
{
  "success": false,
  "error": "memberId is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Media item not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "File upload failed",
  "message": "Invalid file type. Only image files are allowed."
}
```

---

## Implementation Details

### Database Schema (Media Table)
```prisma
model Media {
  id                String   @id @default(uuid())
  filename          String
  originalFilename  String
  filePath          String
  thumbnailPath     String?
  fileType          String   // 'image'
  mimeType          String
  fileSize          Int
  title             String?
  description       String?
  caption           String?
  dateTaken         DateTime?
  location          String?
  tags              String[]
  personId          String?
  person            Person?  @relation(fields: [personId], references: [id])
  isFeatured        Boolean  @default(false)
  isPublic          Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Utility Function: `getMemoryGalleryForMember`
Located in: `src/utils/mediaUtils.ts`

```typescript
async function getMemoryGalleryForMember(
  memberId: string,
  featuredOnly: boolean = false
): Promise<MediaRecord[]>
```

**Features**:
- Filters by `personId` and `fileType: 'image'`
- Optional filtering for featured images only
- Orders by: featured status → date taken → created date
- Returns comprehensive metadata for gallery display
