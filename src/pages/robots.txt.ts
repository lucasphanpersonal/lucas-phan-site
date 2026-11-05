import type { APIContext } from 'astro';

// Generated so the Sitemap line uses the configured site URL and base path
// (set through SITE_URL and BASE_PATH at build time).
export function GET(context: APIContext) {
  const sitemapUrl = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, "")}/sitemap-index.xml`, context.site);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.href}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
