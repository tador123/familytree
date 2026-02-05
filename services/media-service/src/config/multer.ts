/**
 * Multer Configuration for File Uploads
 * Handles profile photos and gallery images separately
 */

// @ts-ignore - Dependencies are in Docker container
import multer, { FileFilterCallback } from 'multer';
// @ts-ignore
import path from 'path';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import fs from 'fs';
// @ts-ignore - express is installed in Docker container
import { Request } from 'express';

// @ts-ignore
const UPLOAD_BASE_PATH = process.env.UPLOAD_PATH || '/uploads';

// Ensure directories exist
const profilePhotosPath = path.join(UPLOAD_BASE_PATH, 'profile-photos');
const galleriesPath = path.join(UPLOAD_BASE_PATH, 'galleries');

// Create directories if they don't exist
[profilePhotosPath, galleriesPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Storage configuration for profile photos
 */
const profilePhotoStorage = multer.diskStorage({
  // @ts-ignore
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, profilePhotosPath);
  },
  // @ts-ignore
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `profile_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

/**
 * Storage configuration for gallery/memory images
 */
const galleryStorage = multer.diskStorage({
  // @ts-ignore
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, galleriesPath);
  },
  // @ts-ignore
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `gallery_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

/**
 * File filter for images only
 */
// @ts-ignore
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed.'));
  }
};

/**
 * Multer instance for profile photo uploads
 */
export const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for profile photos
  },
  fileFilter: imageFileFilter
});

/**
 * Multer instance for gallery/memory photo uploads
 */
export const uploadGalleryPhoto = multer({
  storage: galleryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for gallery images
  },
  fileFilter: imageFileFilter
});

/**
 * General upload instance (for backward compatibility)
 */
export const uploadGeneral = multer({
  storage: multer.diskStorage({
    // @ts-ignore
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      cb(null, UPLOAD_BASE_PATH);
    },
    // @ts-ignore
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: imageFileFilter
});

export { profilePhotosPath, galleriesPath, UPLOAD_BASE_PATH };
