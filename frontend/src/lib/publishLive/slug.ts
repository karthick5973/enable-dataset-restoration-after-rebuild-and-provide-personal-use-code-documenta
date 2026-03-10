/**
 * Domain slug validation and utilities for Publish Live functionality.
 * Enforces 5-50 character length with only letters, numbers, and hyphens.
 */

export interface SlugValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a domain slug according to the rules:
 * - Length between 5 and 50 characters
 * - Only letters (a-z, A-Z), numbers (0-9), and hyphens (-)
 */
export function validateSlug(slug: string): SlugValidationResult {
  if (!slug || slug.trim().length === 0) {
    return {
      isValid: false,
      error: 'Slug cannot be empty',
    };
  }

  const trimmedSlug = slug.trim();

  if (trimmedSlug.length < 5) {
    return {
      isValid: false,
      error: 'Slug must be at least 5 characters long',
    };
  }

  if (trimmedSlug.length > 50) {
    return {
      isValid: false,
      error: 'Slug must be 50 characters or less',
    };
  }

  // Only letters, numbers, and hyphens allowed
  const validPattern = /^[a-zA-Z0-9-]+$/;
  if (!validPattern.test(trimmedSlug)) {
    return {
      isValid: false,
      error: 'Slug can only contain letters, numbers, and hyphens',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Normalizes a slug by trimming whitespace and converting to lowercase
 */
export function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

/**
 * Suggests a valid slug based on input by removing invalid characters
 * and replacing spaces with hyphens
 */
export function suggestSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 50); // Enforce max length
}

/**
 * Generates a Live URL from a valid slug
 */
export function generateLiveUrl(slug: string): string {
  const normalizedSlug = normalizeSlug(slug);
  return `https://${normalizedSlug}.caffeine.xyz`;
}
