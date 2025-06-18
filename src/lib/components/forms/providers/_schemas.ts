import z from 'zod';

export const EncryptedKeyDataSchema = z.object({
	encryptedKey: z.string(),
	iv: z.string(),
	serverSalt: z.string()
});

export const AddKeyFormSchema = z.object({
	generatedKey: EncryptedKeyDataSchema.optional(),
	apiKey: z.string(),
	provider: z.string()
});

export type AddKeyFormData = z.infer<typeof AddKeyFormSchema>;
