/**
 * Handheld runtime: boot splash, menu navigation, controls, sound.
 * All menu content is static HTML rendered by Console.astro; this file only
 * shows/hides `[data-view]` sections and moves the `.sel` cursor between
 * `[data-item]` elements.
 */

type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select' | 'l' | 'r';

const consoleEl = document.querySelector<HTMLElement>('.console')!;
const screen = document.getElementById('screen')!;
const bootEl = document.getElementById('boot')!;
const announceEl = document.getElementById('announce')!;
const views = new Map<string, HTMLElement>(
  [...screen.querySelectorAll<HTMLElement>('[data-view]')].map((v) => [v.dataset.view!, v]),
);

const store = {
  get(k: string, s: Storage = localStorage) {
    try { return s.getItem(k); } catch { return null; }
  },
  set(k: string, v: string, s: Storage = localStorage) {
    try { s.setItem(k, v); } catch { /* private mode etc. */ }
  },
};

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* ------------------------------------------------------------------ */
/* Sound (off by default; WebAudio, no audio files)                   */
/* ------------------------------------------------------------------ */
let soundOn = store.get('lp-sound') === 'on';
let ctx: AudioContext | null = null;

function audio() {
  if (!soundOn) return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'square', vol = 0.05) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const sfx = {
  move: () => tone(1320, 0, 0.04, 'square', 0.025),
  ok: () => { tone(988, 0, 0.05, 'square', 0.03); tone(1480, 0.05, 0.08, 'square', 0.03); },
  back: () => tone(520, 0, 0.08, 'square', 0.03),
  /** Original two-note power-on chime: a rising fifth, D5 -> A5, soft triangle. */
  chime: () => {
    tone(587.33, 0, 0.16, 'triangle', 0.12);
    tone(880, 0.14, 0.9, 'triangle', 0.12);
    tone(1760, 0.14, 0.5, 'sine', 0.02);
  },
};

function setSound(on: boolean, silent = false) {
  soundOn = on;
  store.set('lp-sound', on ? 'on' : 'off');
  document.querySelectorAll<HTMLElement>('[data-sound-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(on));
    b.textContent = `Sound: ${on ? 'On' : 'Off'}`;
  });
  screen.querySelectorAll<HTMLElement>('[data-opt]').forEach((o) => {
    o.classList.toggle('on', (o.dataset.opt === 'on') === on);
  });
  if (on && !silent) sfx.ok();
}

/* ------------------------------------------------------------------ */
/* Views + cursor                                                      */
/* ------------------------------------------------------------------ */
const stack: string[] = [];
const cursor = new Map<string, number>();
let booting = false;

const current = () => views.get(stack[stack.length - 1] ?? 'main')!;
const itemsOf = (v: HTMLElement) => [...v.querySelectorAll<HTMLElement>('[data-item]')];

function announce(text: string) {
  announceEl.textContent = '';
  // next frame so screen readers notice the change
  requestAnimationFrame(() => { announceEl.textContent = text; });
}

function render(speak = true) {
  const name = stack[stack.length - 1];
  views.forEach((v, k) => { v.hidden = k !== name; });
  const view = current();
  const items = itemsOf(view);
  const idx = Math.min(cursor.get(name) ?? 0, Math.max(items.length - 1, 0));
  items.forEach((it, i) => {
    it.classList.toggle('sel', i === idx);
    if (i === idx) it.setAttribute('aria-current', 'true');
    else it.removeAttribute('aria-current');
  });
  const sel = items[idx];
  sel?.scrollIntoView({ block: 'nearest' });
  const help = sel?.dataset.help ?? '';
  view.querySelectorAll<HTMLElement>('[data-help-out]').forEach((h) => { h.textContent = help; });
  if (speak) {
    const label = view.getAttribute('aria-label') ?? '';
    const itemText = sel?.textContent?.replace(/\s+/g, ' ').trim();
    announce([label, itemText, help].filter(Boolean).join('. '));
  }
}

function open(name: string) {
  if (!views.has(name)) return;
  stack.push(name);
  render();
}

function back() {
  if (stack.length <= 1) return false;
  stack.pop();
  render();
  return true;
}

function home() {
  stack.length = 0;
  stack.push('main');
  render();
}

function move(dir: 'up' | 'down' | 'left' | 'right') {
  const view = current();
  const name = stack[stack.length - 1];
  const items = itemsOf(view);
  const idx = cursor.get(name) ?? 0;
  const sel = items[idx];

  // Left/right on a toggle flips it instead of moving.
  if ((dir === 'left' || dir === 'right') && sel?.dataset.toggle === 'sound') {
    const want = dir === 'left';
    if (want !== soundOn) setSound(want);
    return;
  }

  if (!items.length) {
    // Text-only screens: up/down scroll the long window.
    const scroller = view.querySelector<HTMLElement>('[data-scroll]');
    if (scroller && (dir === 'up' || dir === 'down')) {
      scroller.scrollBy({ top: (dir === 'down' ? 1 : -1) * scroller.clientHeight * 0.5 });
    }
    return;
  }

  const cols = Number(view.querySelector<HTMLElement>('[data-cols]')?.dataset.cols ?? 1);
  const step = dir === 'up' ? -cols : dir === 'down' ? cols : dir === 'left' ? -1 : 1;
  const next = (idx + step + items.length) % items.length;
  if (next !== idx) {
    cursor.set(name, next);
    sfx.move();
    render();
  }
}

function activate(item?: HTMLElement) {
  const view = current();
  const items = itemsOf(view);
  const sel = item ?? items[cursor.get(stack[stack.length - 1]) ?? 0];
  const action = sel?.dataset.action;
  if (!action) return;
  sfx.ok();
  if (action.startsWith('open:')) open(action.slice(5));
  else if (action === 'back') back();
  else if (action === 'toggle-sound') setSound(!soundOn);
  else if (action === 'replay') boot(true);
  else if (action.startsWith('link:')) followLink(action.slice(5));
}

function followLink(href: string) {
  if (href === '#' || !href) {
    announce('This link is a placeholder.');
    return;
  }
  if (/^mailto:/.test(href)) location.href = href;
  else if (/^https?:/.test(href)) window.open(href, '_blank', 'noopener');
  else location.href = href;
}

function press(btn: Btn) {
  if (booting) { endBoot(); return; }
  // ignore the click that follows the tap which skipped the intro
  if (Date.now() - skippedAt < 400) return;
  switch (btn) {
    case 'up': case 'down': case 'left': case 'right': move(btn); break;
    case 'l': move('left'); break;
    case 'r': move('right'); break;
    case 'a': activate(); break;
    case 'b': if (back()) sfx.back(); break;
    case 'start': if (stack.length > 1 || stack[0] !== 'main') { sfx.back(); home(); } break;
    case 'select': if (stack[stack.length - 1] !== 'config') { sfx.ok(); open('config'); } break;
  }
}

/* ------------------------------------------------------------------ */
/* Boot splash                                                         */
/* ------------------------------------------------------------------ */
let bootTimers: number[] = [];
let skippedAt = 0;

function boot(force = false) {
  const seen = store.get('lp-booted', sessionStorage) === '1';
  if ((seen && !force) || reducedMotion.matches) {
    consoleEl.classList.add('on');
    home();
    return;
  }
  store.set('lp-booted', '1', sessionStorage);
  booting = true;
  consoleEl.classList.add('on');
  views.forEach((v) => { v.hidden = true; });
  bootEl.hidden = false;
  bootEl.classList.remove('run', 'done');
  void bootEl.offsetWidth; // restart CSS animation
  bootEl.classList.add('run');
  announce('Powering on. Press any key to skip.');
  bootTimers = [
    window.setTimeout(() => sfx.chime(), 1600),
    window.setTimeout(endBoot, 4200),
  ];
}

function endBoot() {
  if (!booting) return;
  booting = false;
  skippedAt = Date.now();
  bootTimers.forEach(clearTimeout);
  bootEl.hidden = true;
  bootEl.classList.remove('run');
  home();
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */
const keyMap: Record<string, Btn> = {
  arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down',
  arrowleft: 'left', a: 'left',
  arrowright: 'right', d: 'right',
  enter: 'a', p: 'a',
  backspace: 'b', l: 'b', escape: 'b',
  ' ': 'start',
};

function flash(btn: Btn) {
  const el = consoleEl.querySelector<HTMLElement>(`[data-btn="${btn}"]`);
  if (!el) return;
  el.classList.add('pressed');
  window.setTimeout(() => el.classList.remove('pressed'), 110);
}

let shiftAlone = false;

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Shift') { shiftAlone = !e.repeat; return; }
  shiftAlone = false;

  const target = e.target as HTMLElement;
  const inConsole = consoleEl.contains(target);
  const isControl = target.closest('a, button, input, textarea, select');
  // Leave links/buttons outside the device alone.
  if (isControl && !inConsole) return;

  // Any key skips the boot splash (except Tab, so keyboard users can move on).
  if (booting && e.key !== 'Tab') { e.preventDefault(); endBoot(); return; }

  const btn = keyMap[e.key.toLowerCase()];
  if (!btn) return;
  // Enter/Space on a focused on-screen button already fire its click.
  if (isControl && (e.key === 'Enter' || e.key === ' ')) return;
  if (e.repeat && !['up', 'down', 'left', 'right'].includes(btn)) { e.preventDefault(); return; }
  e.preventDefault();
  flash(btn);
  press(btn);
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Shift' && shiftAlone) {
    shiftAlone = false;
    const target = e.target as HTMLElement;
    if (target.closest('a, button, input, textarea, select') && !consoleEl.contains(target)) return;
    flash('select');
    press('select');
  }
});

// On-screen buttons
// Fire on pointerdown like real hardware (snappier on touch, and the 3D tilt
// can move a button between press and release). Keyboard activation of a
// focused button arrives as a click with detail 0.
consoleEl.querySelectorAll<HTMLButtonElement>('[data-btn]').forEach((b) => {
  b.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (booting) return; // the document-level handler skips the intro
    press(b.dataset.btn as Btn);
  });
  b.addEventListener('click', (e) => {
    if (e.detail === 0) press(b.dataset.btn as Btn);
  });
});

// Click / tap directly on a menu item
screen.addEventListener('click', (e) => {
  if (booting) { endBoot(); return; }
  if (Date.now() - skippedAt < 400) return;
  const item = (e.target as HTMLElement).closest<HTMLElement>('[data-item]');
  if (!item) return;
  const items = itemsOf(current());
  const i = items.indexOf(item);
  if (i < 0) return;
  cursor.set(stack[stack.length - 1], i);
  render(false);
  activate(item);
});

// Tap anywhere on the device (or page) skips the intro
document.addEventListener('pointerdown', () => { if (booting) endBoot(); });

document.querySelectorAll<HTMLElement>('[data-sound-toggle]').forEach((b) => {
  b.addEventListener('click', () => setSound(!soundOn));
});

/* ------------------------------------------------------------------ */
/* Play time clock on the main menu                                    */
/* ------------------------------------------------------------------ */
const startedAt = Number(store.get('lp-start', sessionStorage)) || Date.now();
store.set('lp-start', String(startedAt), sessionStorage);
const clock = screen.querySelector<HTMLElement>('[data-playtime]');
function tick() {
  if (!clock) return;
  const s = Math.floor((Date.now() - startedAt) / 1000);
  const mm = String(Math.floor(s / 60) % 100).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  clock.textContent = `${mm}:${ss}`;
}
tick();
window.setInterval(tick, 1000);

/* ------------------------------------------------------------------ */
/* Screen light button                                                 */
/* ------------------------------------------------------------------ */
const lightBtn = consoleEl.querySelector<HTMLButtonElement>('[data-light]');
function toggleLight() {
  const lit = consoleEl.classList.toggle('dim') === false;
  lightBtn?.setAttribute('aria-pressed', String(lit));
  sfx.move();
}
lightBtn?.addEventListener('pointerdown', (e) => { if (e.button === 0 && !booting) toggleLight(); });
lightBtn?.addEventListener('click', (e) => { if (e.detail === 0) toggleLight(); });

/* ------------------------------------------------------------------ */
/* 3D tilt: follows the mouse; horizontal drag or device tilt on touch */
/* ------------------------------------------------------------------ */
// Phones rest flat so the small pixel text stays crisp; desktop rests at a slight angle.
const coarse = matchMedia('(pointer: coarse)').matches;
const REST = coarse ? { rx: 0, ry: 0 } : { rx: 4, ry: -6 };
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function setTilt(rx: number, ry: number) {
  const st = consoleEl.style;
  st.setProperty('--rx', `${rx.toFixed(2)}deg`);
  st.setProperty('--ry', `${ry.toFixed(2)}deg`);
  // move the specular highlight opposite to the tilt
  st.setProperty('--mx', `${(50 - ry * 3).toFixed(1)}%`);
  st.setProperty('--my', `${(20 + rx * 3).toFixed(1)}%`);
}
const rest = () => setTilt(REST.rx, REST.ry);

function initTilt() {
  rest();
  if (reducedMotion.matches) return;

  // Mouse / pen: tilt toward the pointer anywhere on the page
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = consoleEl.getBoundingClientRect();
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), -1, 1);
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2), -1, 1);
    setTilt(-ny * 10, nx * 16);
  });
  document.documentElement.addEventListener('pointerleave', rest);

  // Touch: horizontal drag on the device turns it (vertical drag still scrolls)
  let startX = 0;
  let dragging = false;
  consoleEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    startX = e.clientX;
    dragging = true;
    consoleEl.classList.add('dragging');
  });
  consoleEl.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerType !== 'touch') return;
    const dx = (e.clientX - startX) / consoleEl.clientWidth;
    setTilt(REST.rx, clamp(REST.ry + dx * 40, -18, 18));
  });
  const end = () => { dragging = false; consoleEl.classList.remove('dragging'); rest(); };
  consoleEl.addEventListener('pointerup', end);
  consoleEl.addEventListener('pointercancel', end);

  // Phones that expose orientation without a permission prompt
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: unknown } | undefined;
  if (DOE && typeof DOE.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', (e) => {
      if (dragging || e.beta == null || e.gamma == null) return;
      setTilt(clamp((e.beta - 45) / 4, -8, 10), clamp(e.gamma / 3, -14, 14));
    });
  }
}

/* ------------------------------------------------------------------ */
initTilt();
setSound(soundOn, true);
boot();
