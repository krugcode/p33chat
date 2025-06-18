import z from 'zod';

export const ChatFormSchema = z.object({
	message: z.string(),
	attachments: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				content: z.string(), // Base64 for images, text content for others
				size: z.number(),
				type: z.enum(['text', 'code', 'json', 'html', 'url', 'image']),
				lines: z.number().optional(),
				preview: z.string().optional(),
				mimeType: z.string().optional()
			})
		)
		.optional(),
	provider: z.string(), // primarily for select box shenanigans
	model: z.string(),
	chatGroups: z.string().array(),
	chat: z.string(),
	timeSent: z.string().datetime(),
	shouldStream: z.boolean().optional(), // TODO: hack fix
	userProviderID: z.string().optional(), // same here. Figure out a cleaner way mebe
	providerKey: z.string().optional()
});

export type ChatFormData = z.infer<typeof ChatFormSchema>;
