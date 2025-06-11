import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Requires at least 6 characters')
});

export type LoginFormSchema = typeof LoginFormSchema;
export type LoginFormData = z.infer<typeof LoginFormSchema>;
