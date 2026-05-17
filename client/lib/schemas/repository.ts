/**
 * Repository Validation Schemas
 * 
 * Zod schemas for validating repository-related data
 * to prevent injection attacks and ensure data integrity.
 */

import { z } from 'zod';

/**
 * Repository name validation
 * - Alphanumeric, hyphens, underscores, dots only
 * - 1-100 characters
 */
export const RepoNameSchema = z
  .string()
  .min(1, 'Repository name is required')
  .max(100, 'Repository name must be less than 100 characters')
  .regex(
    /^[\w.-]+$/,
    'Repository name can only contain letters, numbers, hyphens, underscores, and dots'
  );

/**
 * GitHub URL validation
 */
export const GitHubUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .regex(
    /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/,
    'Must be a valid GitHub repository URL'
  );

/**
 * Generic URL validation
 */
export const UrlSchema = z
  .string()
  .url('Must be a valid URL')
  .max(500, 'URL must be less than 500 characters');

/**
 * Connect Repository Request Schema
 */
export const ConnectRepoSchema = z.object({
  url: GitHubUrlSchema,
  repoName: RepoNameSchema.optional(),
});

export type ConnectRepoInput = z.infer<typeof ConnectRepoSchema>;

/**
 * Scan Repository Request Schema
 */
export const ScanRepoSchema = z.object({
  name: RepoNameSchema,
  force: z.boolean().optional(),
});

export type ScanRepoInput = z.infer<typeof ScanRepoSchema>;

/**
 * Delete Repository Request Schema
 */
export const DeleteRepoSchema = z.object({
  repoName: RepoNameSchema,
});

export type DeleteRepoInput = z.infer<typeof DeleteRepoSchema>;

/**
 * Repository ID Schema (for URL params)
 */
export const RepoIdSchema = z
  .string()
  .uuid('Invalid repository ID format')
  .or(z.string().regex(/^\d+$/, 'Repository ID must be a number'));

/**
 * Repository Query Parameters Schema
 */
export const RepoQuerySchema = z.object({
  name: RepoNameSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.enum(['name', 'created_at', 'updated_at', 'health']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type RepoQueryParams = z.infer<typeof RepoQuerySchema>;

/**
 * Repository Analytics Schema
 */
export const AnalyticsSchema = z.object({
  nodes: z.number().int().nonnegative(),
  edges: z.number().int().nonnegative(),
  health: z.number().int().min(0).max(100),
  lastScanned: z.string().datetime().optional(),
});

/**
 * Repository Response Schema
 */
export const RepositorySchema = z.object({
  id: z.string().or(z.number()),
  name: RepoNameSchema,
  url: UrlSchema,
  full_name: z.string().optional(),
  owner: z.string().optional(),
  description: z.string().max(500).optional(),
  language: z.string().optional(),
  status: z.enum(['pending', 'scanning', 'completed', 'failed']).optional(),
  analytics: AnalyticsSchema.optional(),
  last_scanned_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Repository = z.infer<typeof RepositorySchema>;

/**
 * Validate and sanitize repository data
 */
export function validateRepository(data: unknown): Repository {
  return RepositorySchema.parse(data);
}

/**
 * Validate array of repositories
 */
export function validateRepositories(data: unknown): Repository[] {
  return z.array(RepositorySchema).parse(data);
}

/**
 * Safe parse with error handling
 */
export function safeValidateRepository(data: unknown): {
  success: boolean;
  data?: Repository;
  error?: string;
} {
  const result = RepositorySchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}

// Made with Bob
