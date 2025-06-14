import z from 'zod';

export const SetContextFormSchema = z.object({
	active: z.string(),
	original: z.string()
});

export const CreateContextFormSchema = z.object({
	name: z.string(),
	logo: z
		.instanceof(File, { message: 'Select an image.' })
		.refine((f) => f.size < 5_000_000, 'Max 5 MB upload size.')
});
