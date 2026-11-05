import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Each project is one Markdown file in src/content/projects/.
 * The file name becomes the URL slug: guess-the-character.md -> /projects/guess-the-character/
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Shown on the save slot. Leave out for empty / coming-soon slots. */
    date: z.coerce.date().optional(),
    tech: z.array(z.string()).default([]),
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),
    /** live = released, wip = in progress, empty = "Empty Slot — Coming Soon" */
    status: z.enum(['live', 'wip', 'empty']).default('live'),
    /** Lower numbers show first (slot 1, slot 2, ...). */
    order: z.number().default(99),
  }),
});

export const collections = { projects };
