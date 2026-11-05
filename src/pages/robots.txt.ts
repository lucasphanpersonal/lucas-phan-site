import type { APIContext } from 'astro';

// robots.txt is only read from the origin root. On a project site (BASE_PATH such
// as /repo) this file is not at the root, so the Sitemap line is omitted there and
// the sitemap should be submitted in Search Console instead.
export function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL;
  const lines = ['User-agent: *', 'Allow: /'];
  if (base === '/') {
    lines.push('', `Sitemap: ${new URL('sitemap-index.xml', context.site).href}`);
  }
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
