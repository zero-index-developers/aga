/**
 * Authentication Validation Schemas
 * 
 * Zod schemas for validating authentication-related data
 * to ensure secure user registration and login.
 */

import { z } from 'zod';

/**
 * Email validation schema
 */
export const EmailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 * Requirements:
 * - Minimum 8 characters
 */
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters');

/**
 * Username validation schema
 */
export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, hyphens, and underscores'
  )
  .trim();

/**
 * Name validation schema
 */
export const NameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

/**
 * Login credentials schema
 */
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Registration credentials schema
 */
export const RegisterSchema = z
  .object({
    name: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    password_confirmation: z.string(),
    terms: z.boolean().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * Forgot password schema
 */
export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

/**
 * Reset password schema
 */
export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    email: EmailSchema,
    password: PasswordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

/**
 * Change password schema
 */
export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: PasswordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
  .refine((data) => data.current_password !== data.password, {
    message: 'New password must be different from current password',
    path: ['password'],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

/**
 * Update profile schema
 */
export const UpdateProfileSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  username: UsernameSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * User response schema
 */
export const UserSchema = z.object({
  id: z.number().or(z.string()),
  name: z.string(),
  email: z.string().email(),
  username: z.string().optional(),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
  email_verified_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Auth response schema
 */
export const AuthResponseSchema = z.object({
  user: UserSchema,
  token: z.string().optional(),
  expires_at: z.string().datetime().optional(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * Validate login credentials
 */
export function validateLogin(data: unknown): LoginInput {
  return LoginSchema.parse(data);
}

/**
 * Validate registration data
 */
export function validateRegister(data: unknown): RegisterInput {
  return RegisterSchema.parse(data);
}

/**
 * Safe validation with error messages
 */
export function safeValidateAuth<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return { success: false, errors };
}

/**
 * Password strength checker
 */
export function checkPasswordStrength(password: string): {
  score: number; // 0-4
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length < 12) {
    feedback.push('Use at least 12 characters');
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  }
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  }
  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Add special characters');
  }

  // Check for common patterns
  if (/^[0-9]+$/.test(password)) {
    feedback.push('Avoid using only numbers');
    score = Math.max(0, score - 1);
  }
  if (/^[a-zA-Z]+$/.test(password)) {
    feedback.push('Avoid using only letters');
    score = Math.max(0, score - 1);
  }
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters');
    score = Math.max(0, score - 1);
  }

  return { score: Math.min(4, score), feedback };
}

// Made with Bob
