import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    bio: z.string().refine((val) => {
      if (!val) return true;
      return val.trim().split(/\s+/).length <= 50;
    }, { message: 'Bio cannot exceed 50 words' }).optional(),
  }),
});
