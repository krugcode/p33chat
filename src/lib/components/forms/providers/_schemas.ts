import z from 'zod';

export const AddKeyFormSchema = z.object({
	apiKey: z.string(),
	provider: z.string()
});

export type AddKeyFormData = z.infer<typeof AddKeyFormSchema>;
