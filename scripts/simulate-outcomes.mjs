import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CONTENT_PATH = path.join(ROOT, 'docs', 'creator-house-content-v2.md');
const REPORT_PATH = path.join(ROOT, 'docs', 'creator-house-v2-outcome-report.md');

const START = { fame: 20, heat: 50, image: 30 };
const LOYALTY_IDS = new Set(['D3-3', 'D4-3', 'D5-4']);

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

function parseChoiceSteps(markdown) {
  const headingRe = /^## (D\d+-\d+)\b[^\n]*$/gm;
  const headings = [];
  let match;
  while ((match = headingRe.exec(markdown)) !== null) {
    headings.push({ id: match[1], idx: match.index });
  }

  const steps = [];
  for (let i = 0; i < headings.length; i += 1) {
    const start = headings[i].idx;
    const end = i + 1 < headings.length ? headings[i + 1].idx : markdown.length;
    const seg = markdown.slice(start, end);

    const deltas = [...seg.matchAll(/`F([+-]\d+)\s+H([+-]\d+)\s+I([+-]\d+)`/g)].map((d) => ({
      fame: Number(d[1]),
      heat: Number(d[2]),
      image: Number(d[3]),
    }));

    if (deltas.length >= 2) {
      steps.push({
        type: 'choice',
        id: headings[i].id,
        A: deltas[0],
        B: deltas[1],
      });
    }
  }

  return steps;
}

function buildSequence(steps, includeVotes) {
  const seq = [];
  for (const step of steps) {
    seq.push(step);
    if (includeVotes) {
      if (step.id === 'D3-3') seq.push({ type: 'vote', id: 'VOTE-D3' });
      if (step.id === 'D7-2') seq.push({ type: 'vote', id: 'VOTE-D7' });
      if (step.id === 'D9-2') seq.push({ type: 'vote', id: 'VOTE-D9' });
    }
  }
  return seq;
}

function endingForMeters(fame, heat, image) {
  if (heat >= 65) return 'The Heart';
  if (fame >= 70) return 'The Main Character';
  if (image >= 60) return 'The Brand';
  return 'The Dark Horse';
}

function percent(part, total) {
  return `${((Number(part) / Number(total)) * 100).toFixed(2)}%`;
}

function simulate(steps, includeVotes) {
  const seq = buildSequence(steps, includeVotes);

  let frontier = new Map();
  frontier.set(`${START.fame}|${START.heat}|${START.image}|0`, 1n);

  for (const step of seq) {
    const next = new Map();

    if (step.type === 'choice') {
      for (const [key, count] of frontier.entries()) {
        const [fame, heat, image, loyalty] = key.split('|').map(Number);
        const options = [step.A, step.B];

        for (let i = 0; i < 2; i += 1) {
          const d = options[i];
          const nf = clamp(fame + d.fame);
          const nh = clamp(heat + d.heat);
          const ni = clamp(image + d.image);
          const nl = loyalty + (i === 0 && LOYALTY_IDS.has(step.id) ? 1 : 0);
          const nk = `${nf}|${nh}|${ni}|${nl}`;
          next.set(nk, (next.get(nk) || 0n) + count);
        }
      }
    } else {
      for (const [key, count] of frontier.entries()) {
        const [fame, heat, image, loyalty] = key.split('|').map(Number);
        const noMatch = `${fame}|${heat}|${image}|${loyalty}`;
        const match = `${fame}|${clamp(heat + 3)}|${image}|${loyalty}`;
        next.set(noMatch, (next.get(noMatch) || 0n) + count);
        next.set(match, (next.get(match) || 0n) + count);
      }
    }

    frontier = next;
  }

  const endingCounts = new Map([
    ['The Heart', 0n],
    ['The Main Character', 0n],
    ['The Brand', 0n],
    ['The Dark Horse', 0n],
  ]);

  const meterTriples = new Map();
  let total = 0n;
  let minF = 101;
  let maxF = -1;
  let minH = 101;
  let maxH = -1;
  let minI = 101;
  let maxI = -1;

  for (const [key, count] of frontier.entries()) {
    const [fame, heat, image] = key.split('|').map(Number);
    total += count;

    minF = Math.min(minF, fame);
    maxF = Math.max(maxF, fame);
    minH = Math.min(minH, heat);
    maxH = Math.max(maxH, heat);
    minI = Math.min(minI, image);
    maxI = Math.max(maxI, image);

    const triple = `${fame}|${heat}|${image}`;
    meterTriples.set(triple, (meterTriples.get(triple) || 0n) + count);

    const ending = endingForMeters(fame, heat, image);
    endingCounts.set(ending, endingCounts.get(ending) + count);
  }

  const topMeterTriples = [...meterTriples.entries()]
    .sort((a, b) => (a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1))
    .slice(0, 12)
    .map(([meters, count]) => ({ meters, count }));

  return {
    includeVotes,
    binaryDecisions: seq.length,
    totalPaths: total,
    uniqueEndStates: frontier.size,
    uniqueMeterTriples: meterTriples.size,
    meterRanges: {
      fame: [minF, maxF],
      heat: [minH, maxH],
      image: [minI, maxI],
    },
    endingCounts,
    topMeterTriples,
  };
}

function formatBlock(title, result) {
  const lines = [];
  lines.push(`## ${title}`);
  lines.push('');
  lines.push(`- Binary decisions: \`${result.binaryDecisions}\``);
  lines.push(`- Total paths: \`${result.totalPaths.toString()}\``);
  lines.push(`- Unique end states (fame, heat, image, loyalty): \`${result.uniqueEndStates}\``);
  lines.push(`- Unique final meter triples (fame, heat, image): \`${result.uniqueMeterTriples}\``);
  lines.push(`- Meter ranges: fame \`${result.meterRanges.fame[0]}..${result.meterRanges.fame[1]}\`, heat \`${result.meterRanges.heat[0]}..${result.meterRanges.heat[1]}\`, image \`${result.meterRanges.image[0]}..${result.meterRanges.image[1]}\``);
  lines.push('');
  lines.push('### Endings');
  lines.push('');

  for (const [ending, count] of result.endingCounts.entries()) {
    lines.push(`- ${ending}: \`${count.toString()}\` (${percent(count, result.totalPaths)})`);
  }

  lines.push('');
  lines.push('### Most Frequent Final Meter Triples');
  lines.push('');
  lines.push('| Fame | Heat | Image | Count | % |');
  lines.push('| ---: | ---: | ----: | ----: | --: |');
  for (const row of result.topMeterTriples) {
    const [f, h, i] = row.meters.split('|').map(Number);
    lines.push(`| ${f} | ${h} | ${i} | ${row.count.toString()} | ${percent(row.count, result.totalPaths)} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function printSummary(label, result) {
  console.log(`\n=== ${label} ===`);
  console.log(`binaryDecisions: ${result.binaryDecisions}`);
  console.log(`totalPaths: ${result.totalPaths.toString()}`);
  console.log(`meterRanges: fame ${result.meterRanges.fame[0]}..${result.meterRanges.fame[1]}, heat ${result.meterRanges.heat[0]}..${result.meterRanges.heat[1]}, image ${result.meterRanges.image[0]}..${result.meterRanges.image[1]}`);
  for (const [ending, count] of result.endingCounts.entries()) {
    console.log(`${ending}: ${count.toString()} (${percent(count, result.totalPaths)})`);
  }
}

function main() {
  const markdown = fs.readFileSync(CONTENT_PATH, 'utf8');
  const steps = parseChoiceSteps(markdown);

  const coreOnly = simulate(steps, false);
  const withVotes = simulate(steps, true);

  printSummary('CORE CHOICE STEPS ONLY (no vote +3 bonuses)', coreOnly);
  printSummary('INCLUDING 3 VOTE MATCH/NO-MATCH BRANCHES', withVotes);

  if (process.argv.includes('--write')) {
    const report = [
      '# Creator House v2 Outcome Simulation',
      '',
      `Generated from: \`docs/creator-house-content-v2.md\``,
      '',
      '- Assumptions:',
      '- Meters are clamped per decision to `0..100`.',
      '- Endings follow resolution order: `Heat >= 65`, then `Fame >= 70`, then `Image >= 60`, else Dark Horse.',
      '- Loyalty beats are counted from `D3-3`, `D4-3`, `D5-4` when Choice A is selected.',
      '- Vote screens add optional `Heat +3` branches for match/no-match analysis.',
      '',
      formatBlock('Core Choice Steps Only (No Vote Bonuses)', coreOnly),
      formatBlock('Including Vote Match/No-Match Branches', withVotes),
    ].join('\n');

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`\nWrote report: ${REPORT_PATH}`);
  }
}

main();
