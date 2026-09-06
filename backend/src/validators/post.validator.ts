import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    imageUrl: z.string().url().optional().nullable(),
    imagePublicId: z.string().optional().nullable(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    imageUrl: z.string().url().optional().nullable(),
    imagePublicId: z.string().optional().nullable(),
  }),
});
