/**
 * Media Service Utilities
 * Helper functions for media operations
 */

import prisma from '../lib/prisma';
// @ts-ignore
import path from 'path';
// @ts-ignore
import sharp from 'sharp';
// @ts-ignore
import fs from 'fs';

export interface MediaRecord {
  id: string;
  filename: string;
  originalFilename: string;
  filePath: string;
  thumbnailPath: string | null;
  fileType: string;
  mimeType: string;
  fileSize: number;
  title: string | null;
  description: string | null;
  personId: string | null;
  isFeatured: boolean;
  createdAt: Date;
}

/**
 * Create a thumbnail for an image
 * @param imagePath - Full path to the original image
 * @param outputPath - Full path for the thumbnail
 * @param size - Thumbnail size (default: 200x200)
 */
export async function createThumbnail(
  imagePath: string, 
  outputPath: string, 
  size: number = 200
): Promise<void> {
  try {
    await sharp(imagePath)
      .resize(size, size, { fit: 'cover' })
      .toFile(outputPath);
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw new Error('Failed to create thumbnail');
  }
}

/**
 * Save media record to database
 * @param data - Media record data
 * @returns Created media record
 */
export async function saveMediaRecord(data: {
  filename: string;
  originalFilename: string;
  filePath: string;
  thumbnailPath?: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  personId?: string;
  title?: string;
  description?: string;
  isFeatured?: boolean;
  tags?: string[];
}) {
  return await prisma.media.create({
    data: {
      filename: data.filename,
      originalFilename: data.originalFilename,
      filePath: data.filePath,
      thumbnailPath: data.thumbnailPath || null,
      fileType: data.fileType,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      personId: data.personId || null,
      title: data.title || null,
      description: data.description || null,
      isFeatured: data.isFeatured || false,
      tags: data.tags || []
    }
  });
}

/**
 * Fetch all 'Memory Gallery' images for a specific member
 * Returns all media records linked to a person, suitable for gallery display
 * @param memberId - The ID of the family member
 * @param featuredOnly - If true, only returns featured images
 * @returns Array of media records
 */
export async function getMemoryGalleryForMember(
  memberId: string,
  featuredOnly: boolean = false
): Promise<MediaRecord[]> {
  const whereClause: any = {
    personId: memberId,
    fileType: 'image'
  };

  if (featuredOnly) {
    whereClause.isFeatured = true;
  }

  const media = await prisma.media.findMany({
    where: whereClause,
    orderBy: [
      { isFeatured: 'desc' },
      { dateTaken: 'desc' },
      { createdAt: 'desc' }
    ],
    select: {
      id: true,
      filename: true,
      originalFilename: true,
      filePath: true,
      thumbnailPath: true,
      fileType: true,
      mimeType: true,
      fileSize: true,
      title: true,
      description: true,
      personId: true,
      isFeatured: true,
      createdAt: true,
      dateTaken: true,
      location: true,
      caption: true,
      tags: true
    }
  });

  return media;
}

/**
 * Get profile photo for a member
 * @param memberId - The ID of the family member
 * @returns Media record or null
 */
export async function getProfilePhotoForMember(memberId: string) {
  // First, check if there's a profilePhotoId set on the person
  const person = await prisma.person.findUnique({
    where: { id: memberId },
    include: {
      profilePhoto: true
    }
  });

  if (person?.profilePhoto) {
    return person.profilePhoto;
  }

  // If no profile photo is set, return the most recent featured image
  const media = await prisma.media.findFirst({
    where: {
      personId: memberId,
      fileType: 'image',
      isFeatured: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return media;
}

/**
 * Delete media file and database record
 * @param mediaId - The ID of the media record
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  const media = await prisma.media.findUnique({
    where: { id: mediaId }
  });

  if (!media) {
    throw new Error('Media not found');
  }

  // Delete physical files
  try {
    if (fs.existsSync(media.filePath)) {
      fs.unlinkSync(media.filePath);
    }
    if (media.thumbnailPath && fs.existsSync(media.thumbnailPath)) {
      fs.unlinkSync(media.thumbnailPath);
    }
  } catch (error) {
    console.error('Error deleting physical files:', error);
  }

  // Delete database record
  await prisma.media.delete({
    where: { id: mediaId }
  });
}

/**
 * Update media metadata
 * @param mediaId - The ID of the media record
 * @param data - Updated metadata
 */
export async function updateMediaMetadata(mediaId: string, data: {
  title?: string;
  description?: string;
  caption?: string;
  isFeatured?: boolean;
  tags?: string[];
  dateTaken?: Date;
  location?: string;
}) {
  return await prisma.media.update({
    where: { id: mediaId },
    data: {
      title: data.title,
      description: data.description,
      caption: data.caption,
      isFeatured: data.isFeatured,
      tags: data.tags,
      dateTaken: data.dateTaken,
      location: data.location
    }
  });
}

/**
 * Get all media for a member (profile and gallery)
 * @param memberId - The ID of the family member
 */
export async function getAllMediaForMember(memberId: string) {
  return await prisma.media.findMany({
    where: {
      personId: memberId
    },
    orderBy: [
      { isFeatured: 'desc' },
      { createdAt: 'desc' }
    ]
  });
}
