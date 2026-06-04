# Creator House v2 Outcome Simulation

Generated from: `docs/creator-house-content-v2.md`

- Assumptions:
- Meters are clamped per decision to `0..100`.
- Endings follow resolution order: `Heat >= 65`, then `Fame >= 70`, then `Image >= 60`, else Dark Horse.
- Loyalty beats are counted from `D3-3`, `D4-3`, `D5-4` when Choice A is selected.
- Vote screens add optional `Heat +3` branches for match/no-match analysis.

## Core Choice Steps Only (No Vote Bonuses)

- Binary decisions: `29`
- Total paths: `536870912`
- Unique end states (fame, heat, image, loyalty): `13893`
- Unique final meter triples (fame, heat, image): `4348`
- Meter ranges: fame `50..100`, heat `0..100`, image `16..100`

### Endings

- The Heart: `507903170` (94.60%)
- The Main Character: `28967742` (5.40%)
- The Brand: `0` (0.00%)
- The Dark Horse: `0` (0.00%)

### Most Frequent Final Meter Triples

| Fame | Heat | Image | Count | % |
| ---: | ---: | ----: | ----: | --: |
| 100 | 100 | 92 | 173674684 | 32.35% |
| 100 | 90 | 100 | 62915676 | 11.72% |
| 100 | 88 | 100 | 60628684 | 11.29% |
| 100 | 72 | 100 | 26439189 | 4.92% |
| 100 | 86 | 100 | 25803320 | 4.81% |
| 100 | 96 | 92 | 25254042 | 4.70% |
| 100 | 68 | 100 | 21754912 | 4.05% |
| 100 | 82 | 100 | 21348509 | 3.98% |
| 100 | 92 | 92 | 20795701 | 3.87% |
| 100 | 64 | 100 | 3146978 | 0.59% |
| 100 | 88 | 92 | 3128515 | 0.58% |
| 100 | 70 | 100 | 3071826 | 0.57% |

## Including Vote Match/No-Match Branches

- Binary decisions: `32`
- Total paths: `4294967296`
- Unique end states (fame, heat, image, loyalty): `15339`
- Unique final meter triples (fame, heat, image): `4726`
- Meter ranges: fame `50..100`, heat `0..100`, image `16..100`

### Endings

- The Heart: `4114468666` (95.80%)
- The Main Character: `180498630` (4.20%)
- The Brand: `0` (0.00%)
- The Dark Horse: `0` (0.00%)

### Most Frequent Final Meter Triples

| Fame | Heat | Image | Count | % |
| ---: | ---: | ----: | ----: | --: |
| 100 | 100 | 92 | 1415922422 | 32.97% |
| 100 | 90 | 100 | 507948078 | 11.83% |
| 100 | 88 | 100 | 493250713 | 11.48% |
| 100 | 75 | 100 | 110936871 | 2.58% |
| 100 | 72 | 100 | 110586403 | 2.57% |
| 100 | 86 | 100 | 108700567 | 2.53% |
| 100 | 99 | 92 | 106079248 | 2.47% |
| 100 | 89 | 100 | 106011058 | 2.47% |
| 100 | 96 | 92 | 105729714 | 2.46% |
| 100 | 68 | 100 | 91116476 | 2.12% |
| 100 | 71 | 100 | 90418538 | 2.11% |
| 100 | 82 | 100 | 89338129 | 2.08% |
