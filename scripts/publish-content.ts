/**
 * Publish story content as versioned JSON.
 *
 * The TS modules in lib/ are the AUTHORING SOURCE. This script serializes the
 * pure-data exports to public/content/<world>-v<N>.json (committed — the bundled
 * fallback AND the same-origin fetch fallback) plus a manifest. Run via
 * `npm run publish:content`; also runs on `prebuild` so the JSON can't drift
 * from the TS (eng-review finding 3). Storage/CDN upload is a separate deploy step.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import {
  CRICKET_CHARS, CRICKET_SITUATIONS, CRICKET_NARR_LINES, CRICKET_NARR_CHARS,
  CRICKET_DM_TRUST_START, CRICKET_TRUST_GOALS, CRICKET_LOW_TRUST_FEED,
  CRICKET_SOCIAL_ACCOUNTS, CRICKET_ENDING_DATA, CRICKET_DM_HOOKS, CRICKET_DM_MOCK,
} from '../lib/cricket-data'
import {
  CHARS, SITUATIONS, NARR_LINES, NARR_CHARS,
  DM_HOOKS, DM_MOCK, DM_ORDER, DM_TRUST, POST_COMMENTS,
} from '../lib/data'
import { DOSSIERS } from '../lib/dossier'

// Bump a world's version when its content shape or data changes meaningfully.
const CRICKET_VERSION = 1
const CH_VERSION = 1

const cricket = {
  version: CRICKET_VERSION,
  chars: CRICKET_CHARS,
  situations: CRICKET_SITUATIONS,
  narrLines: CRICKET_NARR_LINES,
  narrChars: CRICKET_NARR_CHARS,
  dmTrustStart: CRICKET_DM_TRUST_START,
  trustGoals: CRICKET_TRUST_GOALS,
  lowTrustFeed: CRICKET_LOW_TRUST_FEED,
  socialAccounts: CRICKET_SOCIAL_ACCOUNTS,
  endingData: CRICKET_ENDING_DATA,
  dmHooks: CRICKET_DM_HOOKS,
  dmMock: CRICKET_DM_MOCK,
}

const creatorHouse = {
  version: CH_VERSION,
  chars: CHARS,
  situations: SITUATIONS,
  narrLines: NARR_LINES,
  narrChars: NARR_CHARS,
  dmHooks: DM_HOOKS,
  dmMock: DM_MOCK,
  dmOrder: DM_ORDER,
  dmTrust: DM_TRUST,
  postComments: POST_COMMENTS,
  dossiers: DOSSIERS,
}

const dir = join(process.cwd(), 'public', 'content')
mkdirSync(dir, { recursive: true })

writeFileSync(join(dir, `cricket-v${CRICKET_VERSION}.json`), JSON.stringify(cricket) + '\n')
writeFileSync(join(dir, `creator-house-v${CH_VERSION}.json`), JSON.stringify(creatorHouse) + '\n')
writeFileSync(
  join(dir, 'manifest.json'),
  JSON.stringify({
    cricket: { version: CRICKET_VERSION, file: `cricket-v${CRICKET_VERSION}.json` },
    'creator-house': { version: CH_VERSION, file: `creator-house-v${CH_VERSION}.json` },
  }, null, 2) + '\n',
)

console.log(`Published cricket-v${CRICKET_VERSION} (${CRICKET_SITUATIONS.length} situations) + creator-house-v${CH_VERSION} (${SITUATIONS.length} situations)`)
