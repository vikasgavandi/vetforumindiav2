import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Ensures that the directory exists
 * @param {string} dirPath 
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Process a base64 image string, compress it, and save it to disk.
 * @param {string} base64String 
 * @param {string} subDirectory - e.g., 'blogs', 'doctors'
 * @returns {Promise<string|null>} - Filename of the saved image
 */
export const saveBase64Image = async (base64String, subDirectory = 'general') => {
  try {
    if (!base64String || !base64String.startsWith('data:image/')) {
      return null;
    }

    // Extract the mime type and actual base64 data
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const uploadDir = path.join(process.cwd(), 'uploads', subDirectory);
    ensureDirectoryExists(uploadDir);

    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Compress using sharp
    await sharp(imageBuffer)
      .resize(1200, null, { // Max width 1200px, preserve aspect ratio
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toFile(filepath);

    return filename;
  } catch (error) {
    console.error('Error in saveBase64Image:', error);
    return null;
  }
};

/**
 * Deletes an old image if it exists
 * @param {string} filename 
 * @param {string} subDirectory 
 */
export const deleteImage = (filename, subDirectory) => {
  if (!filename) return;
  
  try {
    // Don't delete if it's a URL or base64
    if (filename.startsWith('http') || filename.startsWith('data:')) return;

    const filepath = path.join(process.cwd(), 'uploads', subDirectory, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

/**
 * Process an uploaded file from multer, compress it, and save it to disk.
 * @param {Object} file - Multer file object
 * @param {string} subDirectory - e.g., 'users', 'experts', 'blogs'
 * @returns {Promise<string|null>} - Filename of the saved image
 */
export const saveUploadedFile = async (file, subDirectory = 'general') => {
  try {
    if (!file) {
      return null;
    }

    const uploadDir = path.join(process.cwd(), 'uploads', subDirectory);
    ensureDirectoryExists(uploadDir);

    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Compress using sharp
    await sharp(file.buffer || file.path)
      .resize(1200, null, { // Max width 1200px, preserve aspect ratio
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toFile(filepath);

    // Delete temp file if it exists (when using diskStorage)
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return filename;
  } catch (error) {
    console.error('Error in saveUploadedFile:', error);
    return null;
  }
};
