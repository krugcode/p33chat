import { z } from 'zod';

export const LoginFormSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6, 'Requires at least 6 characters')
});

export const LogoutSchema = z.object({
	id: z.string()
});

export const RegisterFormSchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(6, 'Requires at least 6 characters'),
		passwordConfirm: z.string().min(6, 'Requires at least 6 characters')
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "Passwords don't match",
		path: ['passwordConfirm']
	});

export const ForgotPasswordFormSchema = z.object({
	email: z.string().email()
});

export type LoginFormSchema = typeof LoginFormSchema;
export type LoginFormData = z.infer<typeof LoginFormSchema>;

export type RegisterFormSchema = typeof LoginFormSchema;
export type RegisterFormData = z.infer<typeof LoginFormSchema>;

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordFormSchema>;
