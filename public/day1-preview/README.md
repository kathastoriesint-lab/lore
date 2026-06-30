# Lore — Creator House · Day 1 (Chat Story)

A working, self-contained prototype of Lore's Day 1 loop, delivered in the **Chat Story**
format (Wrtn / Kavana-style: dialogue streams in, you tap through and pick your reply).

## Run it
Open **`Day 1 Chat Story.dc.html`** in any modern browser. No build step, no server —
everything it needs is in this folder. (Fonts load from Google Fonts, so first open is
best online; it degrades gracefully offline.)

## The loop
A live Day 1 in the Creator House villa, three chained beats:
1. **Pehla Kadam** — your entry (Loud vs Quiet)
2. **The Reunion** — Ananya, the same face 3 years later (Lean in vs Play it cool) — opens the Bond
3. **Chhat ya Chai** — first private moment (Ananya's terrace vs Zoya's chai)

Each choice → a stat **receipt** (followers + bond + supporting house-read) → jump into the
**live feed** to see the house react → a **DM** opens.

Player is male (@nabh); crush = Ananya. Two hero metrics: **Followers** (fame) and
**Bond · Ananya** (romance). Heat & Image are a small supporting "house read."

## Files
- `Day 1 Chat Story.dc.html` — the prototype (template + logic). A Design Component.
- `day1-content.js` — all Day 1 content: beats, choices, outcomes, reactions, DMs (`window.LORE_DAY1`).
- `support.js` — the Design Component runtime (renders the `<x-dc>`).
- `_ds/…/tokens/*.css` — Lore design-system tokens (colors, type, spacing).
- `assets/` — character avatars + scene art (placeholders; swap for final imagery).

## To edit
Almost all story changes live in **`day1-content.js`** — copy text, choices, stat deltas,
reactions, and DM threads are all data there. The screens/flow live in the `.dc.html`.
