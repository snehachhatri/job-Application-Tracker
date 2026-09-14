import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache({
  max: 500,
  ttl: 60 * 1000, // 1 minute window
});

export function checkRateLimit(identifier, maxAttempts = 5) {
  const attempts = rateLimitCache.get(identifier) || 0;

  if (attempts >= maxAttempts) {
    return false; // blocked
  }

  rateLimitCache.set(identifier, attempts + 1);
  return true; // allowed
}