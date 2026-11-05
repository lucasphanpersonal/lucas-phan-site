// @ts-check
import { defineConfig } from 'astro/config';

// PLACEHOLDER: set `site` to your real URL once you know it (used for the
// social preview image and canonical links).
// For a GitHub Pages *project* site (https://USER.github.io/REPO/), also set
// `base: '/REPO'`. Leave `base` unset for a custom domain, Netlify,
// Cloudflare Pages, or a USER.github.io repo.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://lucasphan.example.com',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'ignore',
});
