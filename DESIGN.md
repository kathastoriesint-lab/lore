# Lore — Design Language v1

## Palette

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#08080F` | App background |
| `--surf` | `#121214` | Cards, surfaces |
| `--surf2` | `#0f0f12` | Deeper surfaces (pickers, sheets) |
| `--line` | `#1e1e24` | Dividers, borders |
| `--ink` | `#FFFFFF` | Primary text |
| `--ink2` | `#a8a8b3` | Secondary text |
| `--ink3` | `#5e5e6e` | Tertiary / disabled |
| `--accent` | `#FF2D78` | Brand — CTAs, active tabs, tags |
| `--fame` | `#FFB020` | Meter 1 · amber |
| `--heat` | `#FF5C3A` | Meter 2 · orange-red |
| `--trust` | `#3DD6C8` | Meter 3 · teal |

**These 11 tokens are the entire colour system. No other colours exist in this product.**
Any hardcoded hex value in a component file is a violation. Use tokens only.

## World Accent System

Each world gets **one accent colour family**. All characters in that world use tints of it.

| World | Accent family | Tint range | Base reference |
|---|---|---|---|
| Creator House | Pink / rose | `#8a1840` → `#c41060` | `--accent` |
| Indian Dressing Room | MI Navy | `#001a50` → `#2a5a8f` | — |
| _Future world_ | Chosen at creation | ±30% lightness of base | — |

Character `--cc` values must fall within their world's tint range.
Never invent a `--cc` colour from outside the world family.

## Bond Rings

Bond rings on the Profile screen use only the meter trio — no new colours.

| Bond 70–100 | `--trust` `#3DD6C8` |
| Bond 40–69 | `--fame` `#FFB020` |
| Bond 0–39 | `rgba(255,255,255,0.09)` |

## Typography

| Use | Font | Weight |
|---|---|---|
| Display, titles, choice questions, endings | **Fraunces** (`--serif`) | 500, 600 |
| All body, UI labels, buttons | **Poppins** (`--sans`) | 400, 500, 600, 700, 800 |

No other typefaces. `system-ui` is only a fallback, never the intended render.

## Spacing

Base unit: **4px**. All spacing values are multiples of 4.
Common values: 4, 8, 12, 14, 16, 20, 24, 28, 32.

## Component Rules

1. `--heat` (`#FF5C3A`) is for meter display and danger states only. Never decoration.
2. `--accent` (`#FF2D78`) is the one interactive colour — tabs, CTAs, active states.
3. Reaction bubbles use `color-mix(in srgb, var(--cc) 20%, transparent)` — derived, not hardcoded.
4. Card borders use `color-mix(in srgb, var(--cc) 30%, transparent)` — derived, not hardcoded.
5. No `background: #XXXXXX` in component JSX — all colours through CSS variables.

## What Is Not In This System

- Green (reserved for future world accents only, never for bond rings)
- Red (reserved for danger/error states only — `.pulse`, error text)
- Purple (currently used for Mahela `.c-mahela` — **violation**, fix on next pass)
- Yellow gradients in bond rings — replaced by `--fame` amber

## Colour Ceiling Enforcement

When adding a new character: assign a `--cc` value from that world's tint range.
When adding a new world: choose one accent family hex, derive 6-8 tints, document here.
When reviewing a PR: any hex value not in this document is an automatic reject.
