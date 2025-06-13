import z from 'zod';

export const ChatFormSchema = z.object({
	message: z.string(),
	hasAttached: z.boolean(),
	attachments: z.string().array(),
	model: z.string(),
	featureFlags: z.string().array(),
	chatGroups: z.string().array(),
	chat: z.string(),
	timeSent: z.string().datetime()
});

export type ChatFormData = z.infer<typeof ChatFormSchema>;
