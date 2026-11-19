# Vice City Trophy Ledger

[![Build the best GTA 6 trophy guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/nafiznerob/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/nafiznerob/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, open-source guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — built for the [make.fun bounty “Build the best GTA 6 trophy guide”](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

A static web app that opens in desktop Chrome and works with the network off. No Rockstar logo or artwork: the Vice City sunset, skyline and palms are original art drawn for this guide.

- **Tracker** — every trophy with its official name, description and grade, saved progress in localStorage, search, filters by kind (story, missable, collectibles, activities, online) and by grade, a spoiler setting that hides story trophies until earned, export and import of progress, and a reset.
- **Full guides** — each of the 55 trophies gets a guide of 99–119 words in our own words, naming its source (PowerPyx, GTABase), with its chapter, a difficulty and time hint, and its hidden, missable and unconfirmed flags. Click any card for the full guide.
- **Roadmap to the platinum** — three stages, about 200 hours at difficulty 4/10: the story (60–80h), the 100% checklist (~100h), then Strangers &amp; Freaks and cleanup (~10h).
- **Missables** — only one trophy is possibly missable: Positive Mental Attitude, with the corrected facts (18 spots in 10 locations, +2 with Jason and Lucia together, 100% needs 15 of 18, and the separate Chapter 1 balcony meditation).
- **100% Checklist** — the full 35-requirement A Long Road checklist, with the partial counts the game actually asks for.

## Facts

- 55 trophies: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden. Same 55 on Xbox, 1,000 Gamerscore.
- No online trophies, no DLC trophies, one playthrough. Cheats disable trophies and saving.
- 15 manual save slots; keep a save at the start and end of each chapter (no mission replay).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or serve `app/` with any static file server.

## Build the dossier

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

## License

MIT — see LICENSE.
