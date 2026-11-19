# Vice Panels — GTA-Style Cover Art Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/guytas39-sudo/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/guytas39-sudo/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Panels turns your own photos into GTA-style cover art: a multi-panel poster collage with a
Vice City colour grade and bold caption lettering, exported as a PNG ready to post. It is a
static web app — no build step, no uploads, no network. Your photos are read on your own
machine and never leave it.

## What it does

- **Any photo**: add photos by file picker or drag-and-drop, or start from the two bundled
  samples. One photo can fill every panel, or each panel can hold a different one.
- **Multi-panel layouts**: Poster Grid, Strips and Slash templates, each adapting its panel
  arrangement to the post size — a hero panel, split rows and angled dividers in the poster
  style.
- **Per-panel framing**: click a panel to select it, drag to pan its photo, scroll or use the
  slider to zoom, swap its photo, or reset its view.
- **Colour grades**: Vice Sunset, Neon Night, Gold Hour and Midnight Mono — each re-grades the
  photos, the backdrop and the finished cover.
- **Caption lettering**: an editable title and subtitle (shown in an accent pill), four
  lettering colours, top or bottom placement, and a panel-gap control.
- **Export**: one click renders the cover as a PNG at 1080 × 1080, 1080 × 1350 or 1920 × 1080.
  The preview and the export are the same drawing, so what you see is the file you get.

The design, lettering and artwork are original to this app: no Rockstar Games logos, artwork
or fonts are used, and the app ships no font files — lettering uses your system's own fonts.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 — or serve the `app/` folder with any static file server and
open `index.html`. Everything runs offline in a desktop browser.

## Handing it in

`main.ts` (Node, standard library only) copies `app/` and `screenshots/` to the output
directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Entered in [make.fun's GTA 6 cover art bounty](https://make.fun/bounty/gta6-cover-art-01).

---

<sub>Entered on [make.fun](https://make.fun/?ref=g2zdh0s8&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
