import { API_BASE_URL } from '../src/config';

// Extract base URL without the API prefix for static file serving
// API_BASE_URL is like "http://localhost:4000/api/vetforumindia/v1"
// We need "http://localhost:4000" for static files
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/.*$/, '');

/**
 * Construct image URL from file path
 * @param path - File path from database (e.g., "abc123.webp")
 * @param section - Section/subfolder (e.g., "users", "experts", "blogs")
 * @param fallback - Fallback image URL if path is null/undefined
 * @returns Full image URL
 */
export const getImageUrl = (
  path: string | null | undefined,
  section: string = 'users',
  fallback: string | null = null
): string | null => {
  // If no path, return fallback
  if (!path) return fallback;
  
  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If base64 data, return as-is
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Construct URL from backend base (without API prefix) and path
  return `${BACKEND_BASE_URL}/uploads/${section}/${path}`;
};

/**
 * Get user avatar URL
 */
export const getUserAvatarUrl = (user: { profilePhoto?: string; avatar?: string } | null): string | null => {
  if (!user) return null;
  return getImageUrl(user.profilePhoto || user.avatar, 'users', null);
};

/**
 * Get expert photo URL
 */
export const getExpertPhotoUrl = (expert: { professionalPhoto?: string } | null): string | null => {
  if (!expert) return null;
  return getImageUrl(expert.professionalPhoto, 'experts', null);
};

/**
 * Get blog featured image URL
 */
export const getBlogImageUrl = (blog: { featuredImage?: string } | null): string | null => {
  if (!blog) return null;
  // Keep unsplash fallback for blogs ONLY if specifically requested, but for now returning null as per "no dummy picture" rule
  // Or provide a safe default placeholder if needed.
  return getImageUrl(blog.featuredImage, 'blogs', null);
};
