/**
 * Utility functions for handling animated media content
 */

/**
 * Check if a file is an animated GIF based on its type
 */
export const isAnimatedGif = (mimeType?: string): boolean => {
  return mimeType === "image/gif";
};

/**
 * Check if a file URL likely contains an animated GIF
 * Checks for .gif file extension specifically, not just 'gif' anywhere in the URL
 */
export const isLikelyAnimatedGif = (url?: string | null): boolean => {
  if (!url || typeof url !== "string") {
    return false;
  }

  const lowerUrl = url.toLowerCase();
  // Check for .gif extension specifically, not just 'gif' anywhere
  return (
    lowerUrl.endsWith(".gif") ||
    lowerUrl.includes(".gif?") ||
    lowerUrl.includes(".gif#")
  );
};

/**
 * Check if a file is considered large (over 2MB)
 */
export const isLargeFile = (sizeInBytes: number): boolean => {
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  return sizeInBytes > MAX_SIZE;
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get optimization settings for Next.js Image component based on file type
 */
export const getImageOptimizationSettings = (mimeType?: string) => {
  const isGif = isAnimatedGif(mimeType);

  return {
    unoptimized: isGif, // Don't optimize GIFs to preserve animation
    priority: false, // Don't prioritize animated content by default
    placeholder: undefined, // No placeholder for animated content
  };
};

/**
 * Generate cache headers for different media types
 */
export const getMediaCacheHeaders = (mimeType: string, sizeInBytes: number) => {
  const isGif = isAnimatedGif(mimeType);
  const isLarge = isLargeFile(sizeInBytes);

  if (isLarge || isGif) {
    return {
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Large-File": isLarge.toString(),
      "X-Animated-GIF": isGif.toString(),
    };
  }

  return {
    "Cache-Control": "public, max-age=3600", // 1 hour for smaller files
  };
};
