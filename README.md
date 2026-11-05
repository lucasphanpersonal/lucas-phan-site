# Lucas Phan · personal site

A personal website presented as an original clamshell handheld console. It
"powers on" with a boot splash, then you browse a menu-driven RPG-style UI:
**Status** (about me), **Projects** (save-file slots), **Abilities** (skills),
**Contact**, and **Config** (sound). A plain, accessible version of all content
lives at `/about/`, `/projects/`, `/skills/` and `/contact/`.

Built with [Astro](https://astro.build). No frameworks, no audio files (sounds
are generated with WebAudio), font is the open-licensed Press Start 2P (OFL)
bundled via `@fontsource`.

## Run it locally

Requires Node 22+.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run preview  # serve dist/ locally
```

## Add a project

Add one Markdown file to `src/content/projects/`. The file name becomes the URL
(`my-thing.md` → `/projects/my-thing/`) and a new save slot appears in the
handheld automatically.

```md
---
title: My Thing
description: One line that shows on the slot and detail window.
date: 2026-03-01
tech: [TypeScript, Astro]
links:
  - label: Play
    url: https://example.com
  - label: Source
    url: https://github.com/you/my-thing
status: live        # live | wip | empty
order: 2            # slot number (lower = higher in the list)
---

Longer write-up. Shown on the plain /projects/my-thing/ page.
```

To replace an "Empty Slot", edit `empty-slot-2.md` (or delete it and add your
own file). Keep titles under ~22 characters so they fit on one slot line.

## Edit everything else

| What | Where |
| --- | --- |
| Name, job, level, HP/MP, stats, bio | `src/data/profile.ts` (`profile`) |
| Skills on the Abilities screen | `src/data/profile.ts` (`abilities`) |
| Contact links | `src/data/profile.ts` (`contacts`) |
| Portrait sprite and cursor | `src/data/pixels.ts` (text-grid pixel art) |
| Console colors | variables at the top of `src/styles/console.css` (`--shell*`, `--btn*`) |
| Device shape / 3D | "Device" section of `src/styles/console.css` (sized in `--u`, 1% of device width) |
| Boot chime / menu sounds | `sfx` in `src/scripts/console.ts` |
| Social preview image | `public/og.png` (1200×630) |
| Site URL | `site` in `astro.config.mjs` or the `SITE_URL` env var |

Search the project for `PLACEHOLDER` to find everything still to fill in.

## Controls

| Action | Keyboard | On screen |
| --- | --- | --- |
| Move | Arrows / WASD | D-pad |
| Select (A) | Enter / P | A |
| Back (B) | Backspace / L / Esc | B |
| Main menu (Start) | Space | START |
| Config (Select) | Shift (tap alone) | SELECT |
| Previous / next | | L / R shoulders |
| Screen light | | ☀ button |

The device tilts in 3D toward the mouse; on phones it rests flat and turns with a horizontal drag (or the phone's tilt, where the browser allows it). You can also click or tap menu items directly. The boot splash plays once per
browser session, can be skipped with any key/click/tap, and is skipped
entirely when the visitor has `prefers-reduced-motion` set. Sound is off by
default and remembered once turned on.

## Deploy

The output is a fully static `dist/` folder, so any static host works.

### GitHub Pages
1. Push this repo to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`. `.github/workflows/deploy.yml` builds and deploys. It sets
   `BASE_PATH` to `/<repo-name>` automatically (or `/` for a
   `<user>.github.io` repo). If you add a custom domain, set `BASE_PATH: /`
   and `SITE_URL` to your domain in the workflow.

### Netlify
New site from Git → build command `npm run build`, publish directory `dist`.
Set the `SITE_URL` environment variable to your Netlify URL or domain.

### Cloudflare Pages
Create a Pages project from the repo → framework preset **Astro**, build
command `npm run build`, output directory `dist`. Set `SITE_URL` (and
`NODE_VERSION=22`) under environment variables.

## Design notes

The device, sprites, logo and sounds are all original. It evokes classic
handhelds and 90s RPG menus without using any company's branding, assets,
fonts or music.
