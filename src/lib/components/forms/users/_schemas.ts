import z from 'zod';

export const UpdateSettingsFormSchema = z.object({
	key: z.string(),
	value: z.any()
});

export type UpdateSettingsFormData = z.infer<typeof UpdateSettingsFormSchema>;
