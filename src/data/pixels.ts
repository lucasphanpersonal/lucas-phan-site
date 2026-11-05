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

/* ------------------------------------------------------------------ */
/* Lid cover art: original pixel art, 24x16 grids (3 mockup options)  */
/* ------------------------------------------------------------------ */
const COVER_W = 24;
const COVER_H = 16;
const COVER_PAL = { k: '#10132e', o: '#e8735a', s: '#b04c37', n: '#2b3ca8', c: '#f6ecd6', y: '#ffd34d', w: '#fff7e6' };

/** 3x5 pixel font for the letters the covers use. */
const FONT3: Record<string, string[]> = {
  L: ['x..', 'x..', 'x..', 'x..', 'xxx'],
  U: ['x.x', 'x.x', 'x.x', 'x.x', 'xxx'],
  C: ['xxx', 'x..', 'x..', 'x..', 'xxx'],
  A: ['.x.', 'x.x', 'xxx', 'x.x', 'x.x'],
  S: ['xxx', 'x..', 'xxx', '..x', 'xxx'],
  P: ['xxx', 'x.x', 'xxx', 'x..', 'x..'],
  H: ['x.x', 'x.x', 'xxx', 'x.x', 'x.x'],
  N: ['x.x', 'xxx', 'xxx', 'x.x', 'x.x'],
  ' ': ['...', '...', '...', '...', '...'],
};

type Stamp = { glyph: string[]; row: number; col: number; ink: string };

/** A navy frame around a coral field, with each glyph stamped at its position. */
function coverGrid(stamps: Stamp[], field = 'o'): string[] {
  const grid: string[][] = Array.from({ length: COVER_H }, (_, y) =>
    Array.from({ length: COVER_W }, (_, x) => {
      if (x === 0 || y === 0 || x === COVER_W - 1 || y === COVER_H - 1) return 'k';
      if (x === 1 || y === 1 || x === COVER_W - 2 || y === COVER_H - 2) return 'n';
      return field;
    }),
  );
  for (const st of stamps) {
    st.glyph.forEach((line, dy) => [...line].forEach((ch, dx) => {
      if (ch === 'x') grid[st.row + dy][st.col + dx] = st.ink;
    }));
  }
  return grid.map((r) => r.join(''));
}

/** Lays a word out in a row of 3x5 glyphs, centred across the cover. */
function word(text: string, row: number, ink: string): Stamp[] {
  const width = text.length * 4 - 1;
  const start = Math.floor((COVER_W - width) / 2);
  return [...text].map((ch, i) => ({ glyph: FONT3[ch] ?? FONT3[' '], row, col: start + i * 4, ink }));
}

/** Option A: a stepped "LP" monogram with a dark drop shadow. */
const monogramL = ['x..', 'x..', 'x..', 'x..', 'xxx'];
const monogramP = ['xxx', 'x.x', 'xxx', 'x..', 'x..'];
const monogramRows = coverGrid([
  { glyph: monogramL, row: 5, col: 8, ink: 's' },
  { glyph: monogramP, row: 5, col: 13, ink: 's' },
  { glyph: monogramL, row: 4, col: 7, ink: 'c' },
  { glyph: monogramP, row: 4, col: 12, ink: 'c' },
]);

/** Option B: the name in two lines of pixel type. */
const nameRows = coverGrid([
  ...word('LUCAS', 2, 'c'),
  ...word('PHAN', 8, 'y'),
]);

/** Option C: a gold heart emblem over a small LP tag. */
const heartGlyph = [
  '.xx...xx.',
  'xxxx.xxxx',
  'xxxxxxxxx',
  'xxxxxxxxx',
  '.xxxxxxx.',
  '..xxxxx..',
  '...xxx...',
  '....x....',
];
const emblemRows = coverGrid([
  { glyph: heartGlyph, row: 2, col: 7, ink: 'y' },
  ...word('LP', 10, 'c'),
], 'n');

const coverSvg = (rows: string[], label: string) => pixelSvg(rows, COVER_PAL, label);

export const coverArt = {
  monogram: coverSvg(monogramRows, 'Pixel monogram LP'),
  name: coverSvg(nameRows, 'Pixel type reading LUCAS PHAN'),
  emblem: coverSvg(emblemRows, 'Pixel heart with LP'),
};
