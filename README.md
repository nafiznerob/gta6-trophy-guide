# Vice City Trophy Ledger

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/nafiznerob/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/nafiznerob/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

The best guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI — an offline web app with a Vice City sunset look, 3D trophy cards that tilt under your pointer, and a checklist that remembers you.

## What it is

- **Tracker** — all 55 trophies with official name, description and grade, plus Xbox Gamerscore (1,000G in total). Search, filters by Story / Missable / Collectibles / Activities / Online, grade filter, a spoiler setting that masks the 28 hidden trophies until you earn them, and progress saved in the browser with export / import / reset.
- **Roadmap to Platinum** — ~200 hours, difficulty 4/10, in three stages (story 60–80h, 100% checklist ~100h, Strangers & Freaks clean-up ~10h), plus a save plan: 15 manual slots, a save at the start and end of each chapter, no mission replay, and cheats off — they disable trophies.
- **Missables** — only one trophy is possibly missable, Positive Mental Attitude, and this guide gets it exactly right: 18 meditation spots across 10 locations, +2 per spot with Jason and Lucia together, and the separate Chapter 1 balcony meditation that is gone after Chapter 1 and unconfirmed as a requirement — do it anyway, keep a Chapter 1 save.
- **100% Checklist** — the full 35-requirement A Long Road checklist, with per-item progress.
- **Sources & Honesty** — every guide is written in our own words and cites its sources (PowerPyx and GTABase, whose lists agree on all 55). The six trophies whose exact steps are still unconfirmed are labelled unconfirmed instead of guessed.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>. Any static file server works too: serve `app/` and open `index.html`. Everything runs offline in a desktop browser — no network requests, no external fonts or images. The sunset, skyline and palms are original CSS/SVG art drawn for this guide; no Rockstar logo or artwork is used.

## How it is built

`app/` holds the guide as plain static files (`index.html`, `style.css`, `app.js`, `data/trophies.json` with all 55 trophies and their guides, `data/checklist.json` with the 35-item 100% checklist). `main.ts` (Node 22) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library.
