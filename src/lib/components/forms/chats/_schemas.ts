import z from 'zod';

export const ChatFormSchema = z.object({
	text: z.string(),
	hasAttached: z.boolean(),
	model: z.string()
});

export type ChatFormData = z.infer<typeof ChatFormSchema>;
