/**
 * Utility for formatting product image URLs with automatic cache-busting
 * Prevents stale browser / CDN / Service Worker caching on desktop and mobile.
 */
export function getProductImageUrl(
  photoUrl?: string | null,
  updatedAt?: number | string | null
): string {
  if (!photoUrl || typeof photoUrl !== 'string') return '';
  const clean = photoUrl.trim();
  if (!clean) return '';

  // Data URLs and blob URLs do not require cache busting
  if (clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }

  // Append or replace cache-busting timestamp query parameter
  try {
    const v = updatedAt && Number(updatedAt) > 0 ? String(updatedAt) : 'v2';
    const separator = clean.includes('?') ? '&' : '?';
    // If it already has a v= parameter, replace it
    if (/[?&]v=[^&#]*/.test(clean)) {
      return clean.replace(/([?&]v=)[^&#]*/, `$1${v}`);
    }
    return `${clean}${separator}v=${v}`;
  } catch {
    return clean;
  }
}

/**
 * Actively purge any stale image and menu caches from window.caches (Service Worker CacheStorage)
 */
export async function clearProductImageCaches(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if ('caches' in window) {
      const keys = await window.caches.keys();
      for (const key of keys) {
        if (
          key.includes('product-images') ||
          key.includes('api-menu') ||
          key.includes('menu') ||
          key.includes('images')
        ) {
          await window.caches.delete(key);
        }
      }
    }
  } catch (err) {
    console.warn('CacheStorage cleanup notice:', err);
  }
}
