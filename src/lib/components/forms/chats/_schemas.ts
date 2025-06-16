import z from 'zod';

export const ChatFormSchema = z.object({
	message: z.string(),
	attachments: z.string().array(),
	provider: z.string(), // primarily for select box shenanigans
	model: z.string(),
	chatGroups: z.string().array(),
	chat: z.string(),
	timeSent: z.string().datetime()
});

export type ChatFormData = z.infer<typeof ChatFormSchema>;
