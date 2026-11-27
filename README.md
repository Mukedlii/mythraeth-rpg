# MYTHRAETH — Rise of the Runeborn

A clean-slate dark-fantasy hero-collection RPG prototype.

## Included in this first playable foundation

- Responsive fantasy game shell with desktop sidebar and mobile bottom navigation.
- Arena lobby with champion panel, league badge, opponent cards and rewards.
- Turn-based Rune Arena combat with strike, rune burst and guard actions.
- Hero collection with rarity filters, active champion selection and stat panels.
- Astral Altar summon flow (300 crystals) with randomized hero rarity.
- Home, Dungeon, Quests, Guild and Rankings screens.
- Local browser save for collection, currency and selected champion.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build checks

```bash
npm run typecheck
npm run build
```

## Current scope

This is a playable front-end foundation. Save data is stored in the browser only; authentication, cloud saves, server-authoritative PvP, matchmaking, economy validation, persistent dungeon progression and production anti-cheat are not implemented yet.

## Stack

- Next.js 14 / React 18 / TypeScript
- Tailwind CSS foundation plus custom responsive game UI
- Lucide icons
