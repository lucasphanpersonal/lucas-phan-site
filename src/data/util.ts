import { getCollection, type CollectionEntry } from 'astro:content';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix an internal path with the configured base (for GitHub Pages project sites). */
export const url = (path: string) => `${base}${path.startsWith('/') ? path : `/${path}`}`;

export async function getProjects() {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export type Project = CollectionEntry<'projects'>;

export const formatDate = (d?: Date) =>
  d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' }) : '';

export const isExternal = (href: string) => /^(https?:|mailto:)/.test(href);
