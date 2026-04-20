import z from 'zod';

export const OfferBaseSchema = z.object({
	confirmationCode: z.string().nullable().optional(),
	id: z.string(),
	isSpecial: z.boolean().nullable().optional(),
	name: z.string(),
	term: z.number(),
	vendor_id: z.string().optional(),
});

export type OfferBase = z.infer<typeof OfferBaseSchema>;
