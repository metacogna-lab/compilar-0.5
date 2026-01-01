import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').min(30, 'Title should be at least 30 characters').max(100, 'Title should not exceed 100 characters'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must not exceed 100 characters'),
  pillar: z.string().optional(),
  excerpt: z.string()
    .min(1, 'Excerpt is required')
    .min(120, 'Excerpt should be at least 120 characters for SEO')
    .max(160, 'Excerpt should not exceed 160 characters for SEO'),
  content: z.string().min(1, 'Content is required').min(100, 'Content should be at least 100 characters'),
  force_vector: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  socialImageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']),
  publishedDate: z.string().optional(),
  author: z.string().optional()
});

export const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.string().min(1, 'Content is required'),
  seoDescription: z.string().optional(),
  socialImageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']),
  publishedDate: z.string().optional()
});

export const fragmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required')
});

export function validateContent(type, data) {
  // Validation disabled per user request
  return { success: true };
}