# Lore — TODOs

## After User Testing

### T1 — Restore day gate to 6 hours
**What:** Change `gateMs = 0` back to `6 * 60 * 60 * 1000` in `app/page.tsx:103`.
**Why:** Gate is currently disabled so testers can play the full arc unblocked. Real launch needs the pacing back.
**File:** `app/page.tsx` line ~103
**One-liner:** `const gateMs = 6 * 60 * 60 * 1000`
