/**
 * Returns the absolute URL for a given API path segment.
 * Keeps calls consistent with the generated API client which uses /api/... paths.
 */
export function getApiUrl(path: string): string {
  return `/api/${path.replace(/^\//, "")}`;
}
