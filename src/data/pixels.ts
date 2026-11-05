/**
 * Tiny pixel-art helper: turn a text grid into an SVG.
 * Each character is one pixel; "." is transparent. Colors come from the palette.
 */
export function pixelSvg(rows: string[], palette: Record<string, string>, label?: string) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  let rects = '';
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = palette[ch];
      if (fill) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`;
    });
  });
  const a11y = label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges"${a11y}>${rects}</svg>`;
}

export const svgDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** Pointing-hand cursor (original sprite). */
export const handSprite = pixelSvg(
  [
    '...kkkkk........',
    '..kwwwwwkkkkkkk.',
    '.kwwwwwwwwwwwwwk',
    '.kwwwwwwkkkkkkk.',
    'kgwwwwwwwwk.....',
    'kgwwwwwkkk......',
    'kggwwwwwwk......',
    '.kgggwkkk.......',
    '..kkkkk.........',
  ],
  { k: '#10132e', w: '#ffffff', g: '#b9bfe0' },
);

/** PLACEHOLDER portrait: swap this grid for your own 16x16 self-portrait. */
export const portraitSprite = pixelSvg(
  [
    '................',
    '.....kkkkkk.....',
    '....khhhhhhk....',
    '...khhhhhhhhk...',
    '...khhhhhhhhhk..',
    '...khhsssshhhk..',
    '...kssssssssk...',
    '...kskkssskksk..',
    '...kssssssssk...',
    '...ksssskssk....',
    '....kssssssk....',
    '.....kkkkkk.....',
    '....kccccccck...',
    '...kcccwwcccck..',
    '..kcccccccccccck',
    '..kcccccccccccck',
  ],
  { k: '#14112a', h: '#3a2a26', s: '#f1c9a5', c: '#e8735a', w: '#ffffff' },
  'Placeholder pixel portrait of Lucas',
);
