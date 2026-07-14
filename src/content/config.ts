import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		date: z.string().or(z.date()),
		author: z.string().default('Admin'),
		featured_image: z.string().optional().nullable(),
		tags: z.array(z.string()).default([]),
		description: z.string().optional(),
	}),
});

export const collections = { blog };
