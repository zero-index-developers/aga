/**
 * Validation Utilities
 * 
 * Reusable validation functions to ensure data integrity
 * and reduce code duplication across the application.
 */

/**
 * Ensures the input is an array. If not, returns an empty array.
 * 
 * @param data - Data to validate
 * @returns Array of type T, or empty array if invalid
 * 
 * @example
 * const repos = ensureArray(apiResponse); // Always returns array
 */
export function ensureArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? data : [];
}

/**
 * Checks if data is a non-empty array
 * 
 * @param data - Data to check
 * @returns True if data is array with length > 0
 * 
 * @example
 * if (isNonEmptyArray(repos)) {
 *   // Safe to use repos
 * }
 */
export function isNonEmptyArray<T>(data: unknown): data is T[] {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Validates if a value is a valid string
 * 
 * @param value - Value to check
 * @returns True if value is non-empty string
 */
export function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a value is a valid number
 * 
 * @param value - Value to check
 * @returns True if value is a finite number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value);
}

/**
 * Validates if a value is a valid object (not null, not array)
 * 
 * @param value - Value to check
 * @returns True if value is a plain object
 */
export function isValidObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Safely gets a nested property from an object
 * 
 * @param obj - Object to get property from
 * @param path - Dot-separated path to property
 * @param defaultValue - Default value if property doesn't exist
 * @returns Property value or default
 * 
 * @example
 * const nodes = safeGet(repo, 'analytics.nodes', 0);
 */
export function safeGet<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue as T;
    }
    result = result[key];
  }

  return result !== undefined ? result : (defaultValue as T);
}

/**
 * Validates email format
 * 
 * @param email - Email to validate
 * @returns True if email is valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 * 
 * @param url - URL to validate
 * @returns True if URL is valid format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates GitHub repository URL
 * 
 * @param url - URL to validate
 * @returns True if URL is valid GitHub repo URL
 */
export function isValidGitHubUrl(url: string): boolean {
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
  return githubRegex.test(url);
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 * 
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>\"']/g, '');
}

/**
 * Validates if a value exists (not null, undefined, or empty string)
 * 
 * @param value - Value to check
 * @returns True if value exists
 */
export function exists(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Type guard for checking if error is an Error instance
 * 
 * @param error - Error to check
 * @returns True if error is Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Validates repository name format
 * 
 * @param name - Repository name to validate
 * @returns True if name is valid format
 */
export function isValidRepoName(name: string): boolean {
  // Allow alphanumeric, hyphens, underscores, dots
  const repoNameRegex = /^[\w.-]+$/;
  return repoNameRegex.test(name) && name.length > 0 && name.length <= 100;
}

/**
 * Validates if a number is within a range
 * 
 * @param value - Number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates health score (0-100)
 * 
 * @param score - Health score to validate
 * @returns True if score is valid (0-100)
 */
export function isValidHealthScore(score: number): boolean {
  return isValidNumber(score) && isInRange(score, 0, 100);
}

// Made with Bob
