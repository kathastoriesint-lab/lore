/**
 * Indian Dressing Room — Mumbai Prodigy Season 1
 * World bible: docs/cricket-dressing-room-world-bible-v1.md
 * Content:     docs/cricket-dressing-room-content-v1.md
 *
 * Meter mapping (stored in fame/heat/image slots):
 *   fame  = Form  🏏
 *   heat  = Fame  ⭐
 *   image = Team Trust 🤝  (pooled dressing-room standing; shown as "TEAM TRUST")
 *
 * Per-senior trust (Rohit, Hardik) is separate — built in DMs, surfaced on the Live
 * goal card, and used to gate the story (Win the Room, the Call-Up).
 *
 * Starting meters: Form 40 · Fame 25 · Team Trust 20
 * Delta notation in source: Fo = Form, Fa = Fame, TT = Team Trust
 */

import type { Character, Situation, CharId } from './types'

export const CRICKET_CHARS: Record<string, Character> = {
  hardik: { id:'hardik', name:'Hardik Pandya', handle:'hardikpandya93',  cls:'c-hardik',  init:'H', fame:90, role:'Captain · Role clarity · Confidence under scrutiny' },
  rohit:  { id:'rohit',  name:'Rohit Sharma',  handle:'rohitsharma45',   cls:'c-rohit',   init:'R', fame:95, role:'Calm senior · Batting tempo · Long-game intelligence' },
  surya:  { id:'surya',  name:'Suryakumar Yadav', handle:'surya_14kumar',cls:'c-surya',   init:'S', fame:88, role:'Fun senior · Creative T20 guide · Emotional ease' },
  bumrah: { id:'bumrah', name:'Jasprit Bumrah', handle:'jaspritb99',     cls:'c-bumrah',  init:'J', fame:92, role:'Elite standard · Discipline · Quiet technical truth' },
  tilak:  { id:'tilak',  name:'Tilak Varma',    handle:'tilakvarma12',   cls:'c-tilak',   init:'T', fame:72, role:'Mirror · Young Indian benchmark · Friendly pressure' },
  coach:  { id:'coach',  name:'Coach Sir',      handle:'coachsir',       cls:'c-coach',   init:'C', fame:30, role:'Childhood coach · Personal anchor · Cricket conscience' },
  friend: { id:'friend', name:'Maddy',          handle:'maddy_bro',      cls:'c-friend',  init:'M', fame:10, role:'Best friend · Normal life · Emotional cost of fame' },
  naman:  { id:'naman',  name:'Naman Dhir',     handle:'namandhir',      cls:'c-naman',   init:'N', fame:55, role:'Young Table · Competition / friendship' },
  robin:  { id:'robin',  name:'Robin Minz',     handle:'robinminz1',     cls:'c-robin',   init:'Rb', fame:48, role:'Young Table warmth · Keeper-batter' },
  mahela: { id:'mahela', name:'Mahela Jayawardene', handle:'mahela2006', cls:'c-mahela',  init:'Mj', fame:85, role:'Head Coach · Selection logic · Role clarity' },
}

export const CRICKET_DM_TRUST_START: Partial<Record<CharId, number>> = {
  hardik: 30,
  rohit: 30,
  surya: 35,
  bumrah: 25,
  tilak: 45,
  coach: 70,
  friend: 75,
  naman: 40,
  robin: 40,
  mahela: 25,
}

// Gate-senior trust goals. When the player is in Rohit's or Hardik's DM, the chat
// shows WHY this conversation matters (what their trust unlocks) and HOW to win it
// (concrete tips). The numeric target comes from the season gate (season.ts); this
// only authors the narrative around it.
export const CRICKET_TRUST_GOALS: Partial<Record<CharId, { unlocks: string; tips: string[] }>> = {
  rohit: {
    unlocks: 'Away leg mein seniors ka backing ("Win the Room")',
    tips: [
      'Result se zyada apne process pe baat karo — Rohit soch dekhta hai, score nahi.',
      'Pressure mein tu kaise sochta hai, woh seedha aur honestly batao.',
      'Shortcut ya excuse mat do — usse uska bharosa girta hai.',
    ],
  },
  hardik: {
    unlocks: 'Har team sheet pe tumhara naam — aur season ke end pe India verdict',
    tips: [
      'Captain ko role clarity chahiye — apna role samjho aur usko apnao.',
      'Seedhe jawab do; headline ya drama mat banao.',
      'Team pehle, ego baad mein — yeh sochna dikhao.',
    ],
  },
}

export const CRICKET_LOW_TRUST_FEED: Partial<Record<CharId, string>> = {
  hardik: 'Body language watch from MI training: the captain looked colder than usual around the new kid today. Talent hai, but role discipline ka sawaal abhi open hai.',
  rohit: 'Quiet Rohit moment caught at nets. No public drama, but the senior did not look fully convinced by the youngster today.',
  surya: 'Usually Surya keeps every session light. Today the vibe around the new kid looked a little off. Paltan noticed.',
  bumrah: 'Bumrah rarely reacts, which is exactly why today stood out. The technical conversation with the youngster looked short and serious.',
  tilak: 'Young table update: the friendly energy around the new MI kid looks slightly complicated now. Competition is normal. Distance is new.',
  mahela: 'Selection watch: MI staff still rate the talent, but role trust around the youngster looks like a work in progress.',
  coach: 'Old coach, new pressure. People close to the youngster feel the IPL noise is starting to change the way he listens.',
  friend: 'Off-field watch: childhood friends do not always fit easily into a sudden IPL life. Something feels a little distant around the new kid.',
}

// Reusable non-player accounts for authored choice.post objects.
// Example:
// post: {
//   source: 'account',
//   ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
//   surface: 'story',
//   caption: 'Training visuals from Wankhede. Young guns putting in the work.',
//   reactions: []
// }
export const CRICKET_SOCIAL_ACCOUNTS = {
  miPaltan:       { name: 'MI Paltan',          handle: 'mipaltan',          avatarText: 'MI', label: 'MI Paltan · just now' },
  mumbaiIndians: { name: 'Mumbai Indians',     handle: 'mumbaiindians',     avatarText: 'MI', label: 'Mumbai Indians · official' },
  paltanPulse:   { name: 'Paltan Pulse',       handle: 'paltanpulse',       avatarText: 'P',  label: 'Paltan Pulse · fan page' },
  cricketroom:   { name: 'Cricketroom India',  handle: 'cricketroom_india', avatarText: 'C',  label: 'Cricketroom India · analysis' },
  futurexi:      { name: 'Future XI',          handle: 'futurexi',          avatarText: 'F',  label: 'Future XI · prospects' },
  memeovers:     { name: 'Meme Overs',         handle: 'memeovers',         avatarText: 'M',  label: 'Meme Overs · cricket memes' },
} as const

// CSS color tokens for cricket characters
// Add to globals.css if not already: .c-hardik{--cc:#1a3a6e} .c-rohit{--cc:#003087} etc.

export const CRICKET_NARR_LINES = [
  { text: 'Mumbai Indians.', cls:'narr-h' },
  { text: 'Wankhede. Blue kit. Your name on the squad list.', cls:'narr-p' },
  { text: 'The dressing room hasn\'t accepted the story yet.', cls:'narr-p dim' },
]

export const CRICKET_NARR_CHARS: [CharId, string][] = [
  ['hardik',  'Captain. Role clarity before ego.\nHe decides if your confidence is useful to the team or only to your image.'],
  ['rohit',   'The quiet one. One line that changes everything.\n"Shot tha. Ball nahi tha."'],
  ['surya',   'Freedom. But earned, not random.\n"Field dekh, phir pagal ban."'],
  ['bumrah',  'Six balls. No sledging. No smile.\nThe hardest mirror in the room.'],
  ['tilak',   'Already trusted. Watching you earn it.\n"Hype sabko milta hai. Trust repeat performances se."'],
]

export const CRICKET_SITUATIONS: Situation[] = [
  {
    "id": "CR2-S1",
    "day": 0,
    "slot": "Night",
    "tag": "⚡ AUCTION NIGHT · NIGHT",
    "title": "Sold. Mumbai.",
    "body": [
      "Auction night. TV pe tumhara naam, MI ka paddle, hammer — SOLD. Ghar ro raha hai, phone phat raha hai.",
      "Yeh raat ek hi baar aati hai. Kisko doge — ghar ko, ya duniya ko?"
    ],
    "q": "Auction ke turant baad kya karte ho?",
    "reader": [
      {
        "t": "nar",
        "text": "Auction Night. Poora ghar TV ke saamne, aur screen pe — tumhara naam: {name}. Base price — ₹30 lakh. MI, tumhari dream franchise, ka paddle uthta hai. Phir RCB. MI phirse. Hammer — aur SOLD."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s1-auction.png",
        "h": 210
      },
      {
        "t": "nar",
        "text": "Mumbai Indians. 16 saal ki umar mein. Mummy ro rahi hai khushi se, Papa ka haath kaanp raha hai — aur tumhara phone pagal ho chuka hai. 200 notifications. Maddy, tumhare bestie, ke 11 missed calls."
      },
      {
        "t": "cue",
        "who": "Coach Sir",
        "avatar": "/avatars/coach.png",
        "text": "Beta, khushi mana — poori mana. Par yaad rakh: MI ne tujhe khareeda hai. Cricket ne abhi accept nahi kiya. Tujhe use karwana hoga — still day 1."
      },
      {
        "t": "nar",
        "big": true,
        "text": "Yeh raat zindagi mein ek hi baar aati hai. Kisko doge — ghar ko, ya duniya ko?"
      }
    ],
    "choices": [
      {
        "t": "Phone band. Family pehle.",
        "s": "Internet kal bhi hoga. Yeh drawing room dobara aisa nahi hoga.",
        "deltas": {
          "fame": -1
        },
        "relationshipDeltas": {
          "friend": 2
        },
        "flagDeltas": {
          "homeGrounding": 1
        },
        "dm": [
          {
            "char": "friend",
            "text": "11 baar call kiya aur tu family ke saath tha. Correct hai bro. Main khush bhi hoon, jealous bhi hoon, thoda emotional bhi 😭"
          },
          {
            "char": "friend",
            "text": "Mummy ro rahi thi na? Video call pe mujhe bhi rulayega ab."
          },
          {
            "char": "friend",
            "text": "Kal poori story chahiye. Ball-by-ball. Paddle uthne se hammer tak."
          }
        ]
      },
      {
        "t": "Jersey story post karo — abhi",
        "s": "Naam abhi trend kar raha hai. Moment garam hai, duniya ko batao tum aa gaye ho.",
        "deltas": {
          "fame": 3
        },
        "relationshipDeltas": {
          "coach": -2,
          "friend": -2
        },
        "flagDeltas": {
          "hypeRisk": 1
        },
        "postTag": "AUCTION NIGHT",
        "postWhy": "Abhi is second, tumhara naam India ke trends mein hai — ek ghante baad koi aur hoga. Jersey post abhi jaata hai toh poora country dekhega. Yeh window dobara nahi khulegi.",
        "post": {
          "source": "player",
          "caption": "First time MI jersey haath mein aayi toh samajh nahi aaya smile karun ya ro doon. Academy nets se is blue tak. Dream begins tonight. 💙 #SoldToMumbai",
          "reactions": [
            {
              "char": "__fan",
              "name": "paltanpulse",
              "text": "OUR KID IS HERE. Emotional jersey post on auction night — Paltan has officially adopted him 💙"
            },
            {
              "char": "friend",
              "text": "CAPTION READY THA KYA?? Bro sold hua 9:41 pe, post aaya 9:45 pe 😭"
            },
            {
              "char": "coach",
              "text": "Photo theek hai. Ab comments mat padhna. Kal subah shadow practice."
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s1-mipaltan.png"
        },
        "dm": [
          {
            "char": "friend",
            "text": "Bhai??? 11 missed calls ka reply nahi… aur yeh aa gaya? 😑"
          },
          {
            "char": "friend",
            "text": "Tu instagram pe duniya se baat kar raha hai aur apne bestie se nahi. Noted. 📝"
          },
          {
            "char": "friend",
            "text": "Chal theek hai, superstar. Kal poori story chahiye — WARNA main ghar aa raha hoon."
          }
        ]
      }
    ],
    "feedReaction": {
      "A": {
        "char": "coach",
        "caption": "Aaj ek ghar mein TV band hua aur khana garam hua. Sahi shuruaat. Wankhede abhi door hai — pair zameen pe."
      },
      "B": {
        "char": "friend",
        "caption": "Bro SOLD hua aur 4 minute mein caption ready?? Superstar era officially scary hai 😭"
      }
    }
  },
  {
    "id": "CR2-S2",
    "day": 1,
    "slot": "Afternoon",
    "tag": "⚡ NETS · AFTERNOON",
    "title": "Bumrah Ka Over",
    "body": [
      "Wankhede nets, pehla din — Mahela ki ek line: \"Kid, next net. Jasprit, one over.\" 3 balls, 3 baar beat. Poora room dekh raha hai.",
      "3 balls bachi hain. Student ya show-off?"
    ],
    "q": "Bumrah ki agli ball kaise khelte ho?",
    "reader": [
      {
        "t": "nar",
        "text": "Wankhede nets, pehla din. Pads baandh rahe ho jab Mahela, bina nazar uthaye, bolta hai — \"Kid, next net. Jasprit, one over.\" Poora room dekhne aa gaya hai."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s2-nets.png",
        "h": 210
      },
      {
        "t": "cue",
        "who": "Surya",
        "avatar": "/avatars/surya.png",
        "when": {
          "flag": {
            "key": "hypeRisk",
            "gte": 1
          }
        },
        "text": "Raat ko emotional post, subah seedha Bumrah. Scheduling ka sense of humour savage hai 😄"
      },
      {
        "t": "nar",
        "text": "3 balls, 3 baar beat. Length dikhti kuch hai, guzarti kuch aur. Teesri — slower ball: shot pehle khatam, ball baad mein aati hai. Hardik arms folded. Rohit bilkul still."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/seed-bumrah.png",
        "h": 210
      },
      {
        "t": "cue",
        "who": "Bumrah",
        "avatar": "/avatars/bumrah.png",
        "text": "Tum length guess kar rahe ho. Wrist pehle pick karo."
      },
      {
        "t": "nar",
        "big": true,
        "text": "3 balls bachi hain. Poora room dekh raha hai — student ya show-off?"
      }
    ],
    "choices": [
      {
        "t": "Defend karo — aur poochho kya miss hua",
        "s": "Publicly beaten hona embarrassing hai. Par information yahin hai.",
        "deltas": {
          "form": 3,
          "fame": -1
        },
        "relationshipDeltas": {
          "bumrah": 4,
          "rohit": 1
        },
        "flagDeltas": {
          "mentorTrust": 1
        },
        "dm": [
          {
            "char": "bumrah",
            "text": "Good that you asked. Most don't."
          },
          {
            "char": "bumrah",
            "text": "Slower one pe tum ball track kar rahe ho. Galat cheez. Release point track karo — wrist ek beat late girti hai, ungliyan ball ke side pe. Woh half-second pehle milta hai. Wahi half-second tumhara hai."
          },
          {
            "char": "bumrah",
            "text": "Kal nets, 7 baje. Sirf slower ones. Aa jaana."
          }
        ]
      },
      {
        "t": "Charge karo — statement shot",
        "s": "Poora room dekh raha hai. Toh dekhne layak kuch do.",
        "deltas": {
          "form": -2,
          "fame": 2
        },
        "relationshipDeltas": {
          "bumrah": -2,
          "surya": 1
        },
        "flagDeltas": {
          "hypeRisk": 1
        },
        "post": {
          "source": "account",
          "name": "Meme Overs",
          "handle": "memeovers",
          "avatarText": "M",
          "label": "Meme Overs · cricket memes",
          "caption": "16-year-old walks into MI nets and CHARGES Jasprit Bumrah on ball four. Missed it by a postcode but bhai the AUDACITY 💀🔥 (clip via nets cam)",
          "reactions": [
            {
              "char": "surya",
              "text": "Shot ka intent A+ tha champion. Ball tera plan padh ke aayi thi bas 😄"
            },
            {
              "char": "hardik",
              "text": "Intent hai. Control kab aayega?"
            },
            {
              "char": "__fan",
              "name": "paltanpulse",
              "text": "Charging Bumrah in your FIRST net session. This kid fears nothing and possibly should 😭"
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s8-mipaltan.png"
        }
      }
    ],
    "feedReaction": {
      "A": {
        "account": {
          "name": "Paltan Pulse",
          "handle": "paltanpulse",
          "avatarText": "P"
        },
        "caption": "Nets update: naya kid Boom se 3 baar beat hua — aur phir POOCHHA kya miss hua. Seniors sab dekh rahe the. Yeh cheez scorecard pe nahi dikhti 💙",
        "imageUrl": "/generated/cricket-posts/cr2-s2-fan.png"
      },
      "B": {
        "char": "friend",
        "caption": "Bro charged BUMRAH on day one. Legend ya clown — kal pata chalega 😭"
      }
    }
  },
  {
    "id": "CR2-S3",
    "day": 2,
    "slot": "Evening",
    "tag": "⚡ MEDIA ROOM · EVENING",
    "title": "Pehli Press Conference",
    "body": [
      "Pehli official press conference — 11 mics, sponsor board, bagal mein Naman Dhir: same age, same lane, XI mein ek hi jagah.",
      "Pehla sawaal seedha chest pe: \"Kya tum is season MI ki XI deserve karte ho?\" Jo bologe, woh clip banega."
    ],
    "q": "Camera on hai. Kya bolte ho?",
    "reader": [
      {
        "t": "nar",
        "text": "MI media room. Ring lights, sponsor boards, 11 mics — beech mein tumhare naam ka placard. Zindagi ki pehli press conference."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s3-presser.png",
        "h": 210
      },
      {
        "t": "nar",
        "text": "Bagal mein Naman Dhir. Same age, same middle-order lane. 2 naam, XI mein 1 jagah."
      },
      {
        "t": "cue",
        "who": "Naman",
        "avatar": "/avatars/naman.png",
        "text": "Nervous? Main bhi tha. Free advice — headline mat ban na."
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "hypeRisk",
            "gte": 1
          }
        },
        "text": "Front row mein reporter ke phone pe tumhara clip chal raha hai. Sawaal kal raat se ready hai."
      },
      {
        "t": "nar",
        "text": "Pehla sawaal seedha chest pe: \"16 saal. Crores mein bike ho. Kya tum MI ki XI deserve karte ho?\""
      },
      {
        "t": "nar",
        "big": true,
        "text": "Agle 30 second clip banenge. Headline tum likhoge — ya headline tumhe?"
      }
    ],
    "choices": [
      {
        "t": "Team-first seedha jawaab",
        "s": "\"Main seekhne aaya hoon. Team jo role degi, wahi karunga.\" Boring, par bulletproof.",
        "deltas": {
          "form": 1,
          "fame": 1
        },
        "relationshipDeltas": {
          "hardik": 3,
          "mahela": 2
        },
        "dm": [
          {
            "char": "hardik",
            "text": "Presser dekha. Good. No headline."
          },
          {
            "char": "hardik",
            "text": "Bat se shor, mic pe seedha — aise hi khelte hain. Role pe baat jaldi hogi. Tayyar rehna."
          }
        ]
      },
      {
        "t": "Headline do",
        "s": "\"Main XI ke liye aaya hoon, wait karne nahi.\" Confidence hi product hai — toh becho.",
        "deltas": {
          "fame": 4
        },
        "relationshipDeltas": {
          "hardik": -3,
          "rohit": -1,
          "naman": -2
        },
        "flagDeltas": {
          "pressCocky": 1,
          "hypeRisk": 1
        },
        "post": [
          {
            "source": "account",
            "name": "Paltan Pulse",
            "handle": "paltanpulse",
            "avatarText": "P",
            "label": "Paltan Pulse · fan page",
            "caption": "\"MAIN XI KE LIYE AAYA HOON, WAIT KARNE NAHI.\" — 16 saal ka confidence ya 16 saal ki galti? Clip: 2 lakh views in 40 minutes aur counting 🔥",
            "reactions": [
              {
                "char": "__fan",
                "name": "memeovers",
                "text": "kid really said that sitting NEXT to the guy fighting for the same spot 💀"
              },
              {
                "char": "naman",
                "text": "Bold. Dressing room mein milte hain. 🙂"
              },
              {
                "char": "__fan",
                "name": "cricketroom_india",
                "text": "Confidence sells, but the middle order slot is decided on a whiteboard, not a soundbite."
              }
            ],
            "imageUrl": "/generated/cricket-posts/cr-s24-mipaltan.png"
          },
          {
            "source": "character",
            "char": "naman",
            "caption": "Slot 1 hai. Kaam bolega. 🏏",
            "reactions": [
              {
                "char": "__fan",
                "name": "futurexi",
                "text": "Naman Dhir with the quiet response to today's presser. Two kids, one spot — this subplot is the season."
              }
            ],
            "comments": [
              {
                "text": "Sahi baat. Jo bhi khele, MI jeete. 🤝",
                "deltas": {},
                "relationshipDeltas": {
                  "naman": 3
                },
                "toast": "Naman ne screenshot save kiya. Bond +3"
              },
              {
                "text": "Fair. Nets mein milte hain bhai. 🏏",
                "deltas": {
                  "fame": 1
                },
                "relationshipDeltas": {
                  "naman": 1
                },
                "toast": "Respect noted. Naman +1, Fame +1"
              },
              {
                "text": "Kaam toh bolega. Mera. 😏",
                "deltas": {
                  "fame": 2
                },
                "relationshipDeltas": {
                  "naman": -3
                },
                "toast": "Screenshot already circulate ho raha hai. Naman −3, Fame +2"
              }
            ],
            "imageUrl": "/generated/cricket-posts/cr-s4-player.png"
          }
        ]
      }
    ],
    "feedReaction": {
      "A": {
        "char": "naman",
        "caption": "Press room mein 2 naye naam the aaj. Slot 1 hai. Kaam bolega. 🤝",
        "imageUrl": "/generated/cricket-posts/cr2-s3-feed.png"
      },
      "B": {
        "char": "friend",
        "caption": "Bro ek presser mein poora WWE promo maar diya 😭 Mummy ne clip dekha toh kya bolegi socha hai?"
      }
    }
  },
  {
    "id": "CR2-S4",
    "day": 3,
    "slot": "Night",
    "tag": "⚡ TEAM MEETING · NIGHT",
    "title": "Hardik Ka Sawaal",
    "body": [
      "Meeting ke baad Hardik ka ishara: ruk. Mahela table pe, sheet saamne. \"Pehla chance opening nahi. No.5, shayad No.6. Shayad sirf 28 off 15. Tu ready hai?\"",
      "Zindagi bhar top order khela hai. Captain jawaab nahi — jawaab dene ka tareeka sun raha hai."
    ],
    "q": "Hardik ko kya jawaab dete ho?",
    "reader": [
      {
        "t": "nar",
        "text": "Team hotel, raat 9:30. Whiteboard pe XI nahi — sirf matchups: left-arm spin, death overs, powerplay, impact sub. Yahan naam baad mein aate hain, kaam pehle."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s4-role.png",
        "h": 210
      },
      {
        "t": "nar",
        "text": "Meeting khatam. Hardik ka ishara: {name}, ruk. Mahela table pe tumhare saamne sheet kholte hain. Yeh casual nahi hai."
      },
      {
        "t": "cue",
        "who": "Hardik",
        "avatar": "/avatars/hardik.png",
        "when": {
          "flag": {
            "key": "pressCocky",
            "gte": 1
          }
        },
        "text": "Presser mein headline tune de di. Ab main poochta hoon — headline ke peeche player kaun hai?"
      },
      {
        "t": "cue",
        "who": "Hardik",
        "avatar": "/avatars/hardik.png",
        "text": "Pehla chance opening nahi milega — jaise tumne humesha ki hai. No.5, shayad No.6. Shayad sirf 28 off 15 — na fifty, na highlight. Tu ready hai?"
      },
      {
        "t": "nar",
        "big": true,
        "text": "Zindagi bhar top order khela hai. Captain jawaab nahi — tumhara mindset jaanna chahta hai."
      }
    ],
    "choices": [
      {
        "t": "Role accept karo — \"Jahan bologe, wahan\"",
        "s": "MI ko role chahiye toh role do. Captain ka trust yahin banta hai.",
        "deltas": {
          "form": 1
        },
        "relationshipDeltas": {
          "hardik": 5,
          "mahela": 2,
          "tilak": 1
        },
        "flagDeltas": {
          "roleAcceptance": 1
        },
        "dm": [
          {
            "char": "hardik",
            "text": "Good answer. Vague nahi tha."
          },
          {
            "char": "hardik",
            "text": "Jab chance aayega, mujhe flexibility chahiye — explanation nahi. Role clear rakh, sar thanda rakh."
          }
        ]
      },
      {
        "t": "Opening maango — apni strength pitch karo",
        "s": "Apni game tum jaante ho. Tum nahi bologe toh kaun bolega?",
        "deltas": {
          "fame": 2
        },
        "relationshipDeltas": {
          "hardik": -4,
          "rohit": -1,
          "naman": -1
        },
        "post": {
          "source": "account",
          "name": "Future XI",
          "handle": "futurexi",
          "avatarText": "F",
          "label": "Future XI · prospects",
          "caption": "Inside scoop: MI's teenage buy wants the top order — told the leadership his best use is the powerplay. Bold ask from a kid who hasn't faced ball one in the IPL. 👀",
          "reactions": [
            {
              "char": "rohit",
              "text": "Opener banna hai toh wait kar. Player banna hai toh adapt kar."
            },
            {
              "char": "__fan",
              "name": "paltanpulse",
              "text": "Honestly?? Let the kid open. Why buy a prodigy and hide him at 6?"
            },
            {
              "char": "__fan",
              "name": "memeovers",
              "text": "day 3: asks captain for the opening slot. day 4 prediction: asks for the captaincy 💀"
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s14-mipaltan.png"
        }
      }
    ],
    "feedReaction": {
      "A": {
        "char": "mahela",
        "caption": "Young players who understand roles travel faster. Wrote that in a notebook in 2006. Still true."
      },
      "B": {
        "char": "friend",
        "caption": "Bro tune HARDIK PANDYA se opening maangi. Built different. Terrifyingly different 😭"
      }
    }
  },
  {
    "id": "CR2-S5",
    "day": 4,
    "slot": "Morning",
    "tag": "⚡ TEAM SHEET · MORNING",
    "title": "Team Sheet",
    "body": [
      "Subah 9:04 — door pe team sheet. Tumhara naam No.5 pe. Kal raat Wankhede. IPL debut, 16 saal ki umar.",
      "Neeche: 12th man — Naman Dhir. Woh corridor mein hai, aur usne sheet abhi tak nahi dekhi."
    ],
    "q": "Naman ko kaun batayega — tum, ya sheet?",
    "reader": [
      {
        "t": "nar",
        "text": "Subah 9:04. Door pe team sheet. Tumhe naam dhoondhna nahi padta — wahan hai. No.5: {name}. 16 saal. Kal raat. Wankhede. IPL debut."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s5-sheet.png",
        "h": 210
      },
      {
        "t": "cue",
        "who": "Surya",
        "avatar": "/avatars/surya.png",
        "text": "Sheet pe naam aa gaya, ab neend gayi 😄 Welcome to the best insomnia in the world, champion."
      },
      {
        "t": "nar",
        "text": "Neeche: 12th man — Naman Dhir. Corridor mein hai, phone pe — sheet abhi nahi dekhi. Tumhare phone mein draft ready hai, uske mein kuch nahi."
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "pressCocky",
            "gte": 1
          }
        },
        "text": "\"Slot 1 hai. Kaam bolega.\" — uska post yaad hai? Slot tumhe mila. Ab 12 kadam ka corridor bacha hai."
      },
      {
        "t": "nar",
        "big": true,
        "text": "24 ghante mein debut, aur pehla decision bat se nahi — us ladke se hai jo tumhari jagah khelna chahta tha. Kaun batayega — tum, ya sheet?"
      }
    ],
    "choices": [
      {
        "t": "Khud jaake batao — seedha, aankhon mein",
        "s": "Woh tumse sunna deserve karta hai, notification se nahi.",
        "deltas": {
          "form": 1
        },
        "relationshipDeltas": {
          "naman": 3,
          "hardik": 1
        },
        "dm": [
          {
            "char": "naman",
            "text": "Tu khud bataane aaya. Sheet lagne se pehle."
          },
          {
            "char": "naman",
            "text": "Jealous hoon, obviously. Par yeh yaad rakhunga. Kal raat jitne over bhi ho, drinks main hi laaunga — match jeet ke aa. 🏏"
          }
        ]
      },
      {
        "t": "\"DEBUT LOADING\" story post karo",
        "s": "Yeh moment tumhara hai. Duniya ko abhi pata chalna chahiye.",
        "deltas": {
          "fame": 3
        },
        "relationshipDeltas": {
          "hardik": -2,
          "naman": -2
        },
        "flagDeltas": {
          "hypeRisk": 1
        },
        "postTag": "TEAM SHEET",
        "postWhy": "Team sheet abhi door pe lagi hai — duniya ko abhi nahi pata. Pehla post tumhara hoga ya kisi leak ka? Yeh debut announcement zindagi mein ek baar aata hai.",
        "post": {
          "source": "player",
          "caption": "DEBUT LOADING. 🔒🏏 Kal raat. Wankhede. Blue jersey, mera number. Sapna ab schedule pe hai. 💙",
          "reactions": [
            {
              "char": "__fan",
              "name": "paltanpulse",
              "text": "IT'S HAPPENING. THE KID DEBUTS TOMORROW AT WANKHEDE. Ticket walon, tum lucky ho 🔥"
            },
            {
              "char": "naman",
              "text": "Congrats. 🙂"
            },
            {
              "char": "hardik",
              "text": "Sheet andar ki baat hoti hai jab tak media manager na bole. Yaad rakhna."
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s7-player.png"
        }
      }
    ],
    "variants": [
      {
        "when": {
          "lifeline": true
        },
        "title": "Mera Call. Khelega.",
        "tag": "⚡ SELECTION ROOM · MORNING",
        "q": "Captain ke bet ka jawaab kaise dete ho?",
        "reader": [
          {
            "t": "nar",
            "text": "Subah 9:04. Sheet abhi nahi lagi — tumhe selection table pe bulaya gaya hai. Mahela ke saamne printout: tumhare hafte ke nets numbers."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s5-selection.png",
            "h": 210
          },
          {
            "t": "cue",
            "who": "Mahela",
            "avatar": "/avatars/mahela.png",
            "text": "The numbers are honest — borderline. Is week sheet pe naam maybe nahi banta. That is what the paper says."
          },
          {
            "t": "cue",
            "who": "Hardik",
            "avatar": "/avatars/hardik.png",
            "text": "Numbers maine bhi padhe hain. Phir bhi khelega. Mera call, meri responsibility."
          },
          {
            "t": "nar",
            "text": "Khamoshi. Mahela lambi nazar dekhta hai — phir pen chalti hai. No.5 — {name}. Ink abhi geeli hai."
          },
          {
            "t": "nar",
            "big": true,
            "text": "Captain ne apna naam tumhare aage rakh diya — kal tumhare debut ke saath uska judgment bhi bat karega. Jawaab kaise doge?"
          }
        ],
        "choices": [
          {
            "t": "Private promise — akele mein Hardik se milo",
            "s": "Yeh baat room ki hai, internet ki nahi.",
            "deltas": {
              "form": 1
            },
            "relationshipDeltas": {
              "hardik": 3
            },
            "flagDeltas": {
              "lifelineOwed": 1
            },
            "dm": [
              {
                "char": "hardik",
                "text": "Aaya tu. Good."
              },
              {
                "char": "hardik",
                "text": "Sun — yeh charity nahi hai. Maine woh dekha hai jo sheet nahi dikhati. Kal woh dikha de. Aur yeh baat humare beech rahegi."
              }
            ]
          },
          {
            "t": "Public thank-you post",
            "s": "Captain ne bharosa dikhaya — duniya ko dikhna chahiye.",
            "deltas": {
              "fame": 2
            },
            "relationshipDeltas": {
              "hardik": -1
            },
            "postTag": "CAPTAIN'S CALL",
            "postWhy": "Captain ne numbers ke against tumpe daav lagaya hai. Thank-you post abhi jaayega toh poori Paltan dekhegi — par selection room ki baat selection room se bahar bhi jayegi.",
            "post": {
              "source": "player",
              "caption": "Jab numbers ne nahi bola, captain ne bola. @hardikpandya93 — kal raat is bharose ke naam. 🙏💙 #Debut",
              "reactions": [
                {
                  "char": "__fan",
                  "name": "cricketroom_india",
                  "text": "Interesting admission — the captain overruled the sheet for the debutant. Bold. But now every dot ball gets audited."
                },
                {
                  "char": "__fan",
                  "name": "memeovers",
                  "text": "bro thanked the captain for selection BEFORE playing 💀 speedrun any% pressure"
                },
                {
                  "char": "hardik",
                  "text": "Thanks match ke baad bolna."
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s2-mumbaiindians.png"
            }
          }
        ]
      },
      {
        "when": {
          "benched": true
        },
        "title": "Orange Bib",
        "tag": "⚡ ORANGE BIB · MORNING",
        "q": "Bench ka pehla din — kaise jeetoge?",
        "reader": [
          {
            "t": "nar",
            "text": "Subah 9:04. Door pe sheet. 3 baar padhte ho — naam nahi hai. No.5: Naman Dhir. Tumhe 12th man bhi nahi — orange bib, drinks duty."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s5-benched.png",
            "h": 210
          },
          {
            "t": "cue",
            "who": "Tilak",
            "avatar": "/avatars/tilak.png",
            "text": "Kal Wankhede ki lights rope ke bahar se dekhega — pehli sheet bina naam ke sabse zor se lagti hai. Main 2 saal bib mein tha. Path wapas maidan se jaata hai, timeline se nahi."
          },
          {
            "t": "nar",
            "text": "Phone buzz. Paltan Pulse ka post: \"WHERE IS THE KID?? MI buys a prodigy and BENCHES him?? #JusticeFor{name}\" — 8k likes, badh rahe hain."
          },
          {
            "t": "nar",
            "when": {
              "flag": {
                "key": "pressCocky",
                "gte": 1
              }
            },
            "text": "\"XI ke liye aaya hoon, wait karne nahi\" — clip aaj phir ghoom raha hai. Naya caption: \"XI dekh li. Bench se.\""
          },
          {
            "t": "nar",
            "big": true,
            "text": "Bench se 2 raaste hain — 1 maidan se, 1 timeline se. Sirf 1 XI tak wapas jaata hai: kaunsa lete ho?"
          }
        ],
        "choices": [
          {
            "t": "Orange bib, full involvement",
            "s": "Drinks, throwdowns, boundary drills — room dekhta hai kaun rukta hai aur kaun rootha rehta hai.",
            "deltas": {
              "form": 2
            },
            "relationshipDeltas": {
              "hardik": 3,
              "tilak": 1
            },
            "dm": [
              {
                "char": "tilak",
                "text": "Aaj tujhe drills mein dekha. Bib pehen ke bhi switched on. Naman ko throwdowns tak de raha tha."
              },
              {
                "char": "tilak",
                "text": "Ek cheez bata doon — Hardik bench ko sabse zyada tab dekhta hai jab use lagta hai koi nahi dekh raha. Aaj usne dekha. Path wapas yahin se shuru hota hai. 🤝"
              }
            ]
          },
          {
            "t": "Outrage posts like karo",
            "s": "Fans galat toh nahi bol rahe. Double tap koi crime nahi hai... hai kya?",
            "deltas": {
              "fame": 3
            },
            "relationshipDeltas": {
              "hardik": -4
            },
            "flagDeltas": {
              "likedOutrage": 1
            },
            "post": {
              "source": "account",
              "name": "Paltan Pulse",
              "handle": "paltanpulse",
              "avatarText": "P",
              "label": "Paltan Pulse · fan page",
              "caption": "🚨 CONFIRMED: the kid himself has LIKED our benching post. He KNOWS he should be playing. MI management, care to explain?? #JusticeFor{name}",
              "reactions": [
                {
                  "char": "__fan",
                  "name": "memeovers",
                  "text": "liked at 9:17am, sheet went up at 9:04. caught in 4k within 13 minutes 💀"
                },
                {
                  "char": "hardik",
                  "text": "Liked posts bhi sheet tak pahunchte hain. FYI."
                },
                {
                  "char": "__fan",
                  "name": "cricketroom_india",
                  "text": "A 16-year-old endorsing fan outrage against his own team's selection. The talent was never the question. This is."
                }
              ]
            }
          }
        ]
      }
    ],
    "feedReaction": {
      "A": {
        "char": "tilak",
        "caption": "Sheet ka din sabse zyada batata hai — naam se nahi, reaction se. Aaj kuch reactions note kiye maine. 🤝"
      },
      "B": {
        "char": "friend",
        "caption": "Bro sheet ka screenshot mujhe WhatsApp pe bhejna tha, INSTAGRAM PE NAHI 😭 call me RIGHT NOW"
      }
    }
  },
  {
    "id": "CR2-S6",
    "day": 5,
    "slot": "Morning",
    "tag": "⚡ MATCHDAY · MORNING",
    "title": "Debut Morning",
    "body": [
      "Debut ka din. Alarm se 2 minute pehle aankh khuli, kit bag raat se ready, phone pe 61 unread — sab 'aaj ka din' bol rahe hain.",
      "Team bus 9 baje. Coach Sir ka raat wala message: 'Shadow practice. 20 minute. Phone mat le aana.'"
    ],
    "q": "Debut ke 3 ghante kahan jaate hain?",
    "reader": [
      {
        "t": "nar",
        "text": "Subah 6:58, alarm se 2 minute pehle aankh khuli. Marine Drive adha soya hai — aur aaj raat team sheet pe tumhara naam."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s6-hotel.png",
        "h": 210
      },
      {
        "t": "cue",
        "who": "Rohit Sharma",
        "avatar": "/avatars/rohit.png",
        "text": "Nervous? Good. Matlab samajh aa raha hai aaj kya hai."
      },
      {
        "t": "cue",
        "who": "Rohit Sharma",
        "avatar": "/avatars/rohit.png",
        "when": {
          "flag": {
            "key": "pressCocky",
            "gte": 1
          }
        },
        "text": "Presser wali headline? Aaj raat ball usse padhegi. Jawaab bat se dena."
      },
      {
        "t": "nar",
        "text": "Phone pe 61 unread — poora Mumbai tumhara naam bol raha hai. Coach ka message: 'Shadow practice. 20 minute. Phone mat le aana.'"
      },
      {
        "t": "nar",
        "big": true,
        "text": "Debut se pehle 3 ghante sirf tumhare hain. Kise doge — game ko, ya naam ko?"
      }
    ],
    "choices": [
      {
        "t": "Routine pakdo — phone off, shadow practice",
        "s": "Coach ka 20-minute ritual. Game pehle, shor baad mein.",
        "deltas": {
          "form": 2
        },
        "relationshipDeltas": {
          "coach": 2
        },
        "flagDeltas": {
          "homeGrounding": 1
        },
        "dm": [
          {
            "char": "coach",
            "text": "Video mat bhej beta. Mujhe pata hai tune kiya. Aawaz se pata chal jaata hai."
          },
          {
            "char": "coach",
            "text": "Aaj sirf teen kaam: pehli ball dekh. Doosri ball dekh. Teesri ball dekh. Baaki Wankhede sambhal lega."
          },
          {
            "char": "coach",
            "text": "Aur jab naam announce ho — ek second ruk ke sun lena. Woh second dobara nahi aata."
          }
        ]
      },
      {
        "t": "Timeline kholo — hype absorb karo",
        "s": "Poora Mumbai tumhara naam bol raha hai. Ek baar sun toh lo.",
        "deltas": {
          "fame": 2,
          "form": -2
        },
        "flagDeltas": {
          "hypeRisk": 1
        },
        "post": {
          "source": "account",
          "name": "Paltan Pulse",
          "handle": "paltanpulse",
          "label": "Paltan Pulse · fan page",
          "caption": "DEBUT DAY 🚨 {name} tonight at Wankhede. 16 saal. Auction se team sheet tak — 3 hafte. Paltan, aaj raat history dekh lena. 💙",
          "reactions": [
            {
              "char": "__fan",
              "name": "futurexi",
              "text": "Youngest MI debutant watchlist officially activated. Tonight matters."
            },
            {
              "char": "__fan",
              "name": "memeovers",
              "text": "kid is reposting fan edits at 8am on debut day. confidence or chaos, we find out tonight 😭"
            },
            {
              "char": "friend",
              "text": "BRO STOP LIKING EDITS AND GO PRACTICE. love you. GO."
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s13-friend.png"
        }
      }
    ],
    "feedReaction": {
      "A": {
        "char": "coach",
        "caption": "Matchday pe sabse loud cheez tumhara routine honi chahiye. Baaki sab volume hai."
      },
      "B": {
        "char": "friend",
        "caption": "Bro trending hai aur mujhe chemistry ka test dena hai. Duniya unfair hai 😭 #DebutDay"
      }
    },
    "variants": [
      {
        "when": {
          "benched": true
        },
        "title": "12th Man",
        "tag": "⚡ 12TH MAN · MORNING",
        "q": "Naman ke debut wale din tum kya ho?",
        "reader": [
          {
            "t": "nar",
            "text": "Subah 7 baje. Team sheet pinned — 11 naam, tumhara nahi. 12th man: drinks, towels, throw-downs."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s6-benched.png",
            "h": 210
          },
          {
            "t": "nar",
            "text": "Tumhari jagah pe naam: Naman Dhir. Debut cap aaj raat usko milegi — wahi cap jiska sapna tumhara tha."
          },
          {
            "t": "cue",
            "who": "Naman Dhir",
            "avatar": "/avatars/naman.png",
            "text": "Bhai… pata nahi kya bolun. Sapna mera bhi yahi tha. Bas socha nahi tha tere saamne poora hoga."
          },
          {
            "t": "cue",
            "who": "Tilak Varma",
            "avatar": "/avatars/tilak.png",
            "text": "Bench pe player kaise dikhta hai — XI se pehle wahi dikhta hai. Sab dekh rahe hain. Har waqt."
          },
          {
            "t": "nar",
            "big": true,
            "text": "Naman ki aawaz mein guilt, tumhare pet mein kuch aur. Aaj ka din uska hai — tum us din ka kya karte ho?"
          }
        ],
        "choices": [
          {
            "t": "Naman ke liye throw-downs do",
            "s": "Uska debut, tumhara haath. Room yeh yaad rakhta hai.",
            "deltas": {
              "form": 1
            },
            "relationshipDeltas": {
              "naman": 4,
              "hardik": 2,
              "tilak": 1
            },
            "dm": [
              {
                "char": "naman",
                "text": "Bhai. Tune chalis minute throw-downs diye. Mere debut ke liye. Apne debut ki jagah."
              },
              {
                "char": "naman",
                "text": "Yeh main kabhi nahi bhoolunga. Kabhi bhi."
              },
              {
                "char": "naman",
                "text": "Aaj raat jo bhi ho — yeh cap thodi si teri bhi hai. 💙"
              }
            ]
          },
          {
            "t": "Apna edit post karo — mid-match",
            "s": "Sheet pe naam nahi toh kya. Timeline pe toh hai.",
            "deltas": {
              "fame": 3
            },
            "relationshipDeltas": {
              "hardik": -3,
              "naman": -2
            },
            "post": {
              "source": "player",
              "caption": "Sheet pe naam nahi hai. Story mein hai. Yeh chapter bhi likha jayega. 🔒💙 #Patience",
              "reactions": [
                {
                  "char": "__fan",
                  "name": "cricketroom_india",
                  "text": "Naman Dhir's debut night, and the benched kid posts a self-edit mid-match. Optics is also a skill. Developing."
                },
                {
                  "char": "__fan",
                  "name": "memeovers",
                  "text": "bro really said 'main character energy' during someone else's debut 💀"
                },
                {
                  "char": "__fan",
                  "name": "paltanpulse",
                  "text": "we love the kid but… not tonight yaar. not tonight."
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s15-player.png"
            },
            "postTag": "APNI STORY",
            "postWhy": "Kisi aur ka debut chal raha hai aur tum apna edit post kar rahe ho. Sab dekhenge — aur sab yaad rakhenge kab post kiya tha."
          }
        ]
      }
    ]
  },
  {
    "id": "CR2-S7",
    "day": 5,
    "slot": "Night",
    "tag": "⚡ WANKHEDE LIGHTS · NIGHT",
    "title": "Pehli Gend",
    "body": [
      "Wankhede full. 178 ke chase mein MI 39/2 — Mahela ki ek line ke saath tum seedhiyaan utar rahe ho: 'No.5. Apna game.'",
      "Saamne Noor Ahmad ki wrist spin, death mein Pathirana intezaar mein. Pehli IPL gend haath se nikalne wali hai."
    ],
    "q": "Yeh knock kaise banate ho?",
    "reader": [
      {
        "t": "nar",
        "text": "Wankhede full. CSK ke 178, MI 39/2 — Rohit gaya, Tilak gaya. Mahela ki 1 hi line: 'No.5. Apna game.' 139 chahiye, 84 gend."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s7-debut.png",
        "h": 210
      },
      {
        "t": "nar",
        "when": {
          "lifeline": true
        },
        "text": "Sirf tum jaante ho: is XI mein tum captain ki zid se ho. Aaj uska naam bhi daav pe hai."
      },
      {
        "t": "cue",
        "who": "Hardik Pandya",
        "avatar": "/avatars/hardik.png",
        "text": "Scoreboard bhool ja. Over-by-over khel. Main doosre end pe milta hoon."
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "roleAcceptance",
            "gte": 1
          }
        },
        "text": "No.5 — wahi role jo captain ne diya, tumne haan bola. Yahan kya karna hai — tum jaante ho."
      },
      {
        "t": "nar",
        "big": true,
        "text": "Saamne Noor Ahmad ki googly, death mein Pathirana, long-on–deep midwicket peeche. Pehli IPL gend nikalne wali hai — kaise khelte ho?"
      }
    ],
    "choices": [
      {
        "t": "Chase banao — gap, do-lo, phir boundary",
        "s": "Moment bada hai. Ball utni badi nahi. Ek-ek karke.",
        "deltas": {
          "form": 3,
          "fame": 1
        },
        "relationshipDeltas": {
          "hardik": 4,
          "rohit": 2
        },
        "runWrite": "debut",
        "outcomeGate": {
          "metric": "form",
          "threshold": 44,
          "assists": [
            {
              "charId": "bumrah",
              "min": 34,
              "thresholdDelta": -4
            }
          ],
          "pass": {
            "title": "47 OFF 29",
            "note": "Form ne nerves ko jeet liya. Noor ki googly ko do-lo mein khela, aur Pathirana ka slower ball haath se pick kiya — release point, bilkul waise jaise sikhaaya gaya tha. Uske aakhri 2 over mein 19. MI jeet gayi, aur Wankhede ne naam yaad kar liya.",
            "post": {
              "source": "account",
              "name": "MI Paltan",
              "handle": "mipaltan",
              "label": "MI Paltan · just now",
              "surface": "scorecard",
              "caption": "DEBUT: {name} 47 (29). 39/2 se jeet tak — 16 saal ke bacche ne chase ko haath se pakda aur ghar le gaya. Pathirana ke aakhri 2 over mein 19. MI win by 5 wickets. 💙",
              "reactions": [
                {
                  "char": "hardik",
                  "text": "Role poocha tha maine ek baar. Aaj jawaab mila."
                },
                {
                  "char": "rohit",
                  "text": "Tempo. Yehi word hai. Panic zero."
                },
                {
                  "char": "__fan",
                  "name": "cricketroom_india",
                  "text": "Picked the slower ball from the hand on debut. Someone in that dressing room taught this kid something specific."
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s18-shared.png"
            }
          },
          "fail": {
            "title": "9 OFF 11",
            "note": "Pathirana ka slower ball haath se nahi pada — bas hava mein gaya. Deep midwicket ne hilna bhi nahi tha. 9 (11). Wankhede 1 second chup — phir agla naam announce.",
            "dm": [
              {
                "char": "rohit",
                "text": "Happens. Seekh jaldi."
              },
              {
                "char": "rohit",
                "text": "Slower ball pitch se nahi, haath se padhte hain. Kal nets, 7 baje. Main rahunga."
              }
            ]
          }
        }
      },
      {
        "t": "Counter-attack — pehle over se announce karo",
        "s": "Wankhede ko yaad rehna chahiye ki tum aaye the.",
        "deltas": {
          "form": 1,
          "fame": 3
        },
        "relationshipDeltas": {
          "surya": 2,
          "hardik": 1
        },
        "flagDeltas": {
          "hypeRisk": 1
        },
        "runWrite": "debut",
        "outcomeGate": {
          "metric": "form",
          "threshold": 44,
          "assists": [
            {
              "charId": "bumrah",
              "min": 34,
              "thresholdDelta": -4
            }
          ],
          "pass": {
            "title": "38 OFF 16",
            "note": "Timing thi, isliye pagalpan plan ban gaya. Noor ki googly inside-out loft — pura SKY wala shot. 38 (16), stadium khada, commentary box ko naam ka spelling poochna pada.",
            "post": {
              "source": "account",
              "name": "MI Paltan",
              "handle": "mipaltan",
              "label": "MI Paltan · just now",
              "surface": "scorecard",
              "caption": "38 off 16. ON DEBUT. {name} ne Wankhede ko pehli hi raat apna ghar bana liya. Noor Ahmad ki googly inside-out — yeh shot hafton chalega. 💙🔥",
              "reactions": [
                {
                  "char": "surya",
                  "text": "Field padha, phir pagal bana. Sahi order hai 😄"
                },
                {
                  "char": "hardik",
                  "text": "Crowd ko shot pasand aaya. Mujhe timing."
                },
                {
                  "char": "__fan",
                  "name": "paltanpulse",
                  "text": "THE KID IS A CHEAT CODE. WANKHEDE HAS A NEW SOUND."
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s8-player.png"
            }
          },
          "fail": {
            "title": "2 OFF 3",
            "note": "Teesri hi gend pe wahi shot — bina base ke. Long-on ne 1 kadam bhi nahi liya. 2 (3). Aaj raat ka highlight sirf 1 hai, aur woh tumhara wicket hai.",
            "dm": [
              {
                "char": "surya",
                "text": "Intent tha. Base nahi tha."
              },
              {
                "char": "surya",
                "text": "Sun champion — fearless aur careless mein sirf ek gend ka farak hota hai. Kal nets pe dono ka fark sikhata hoon."
              }
            ]
          }
        }
      }
    ],
    "feedReaction": {
      "A": {
        "char": "rohit",
        "caption": "Pehli raat sab kuch nahi hoti. Par pehli raat pe jo dikhta hai, woh jhooth nahi hota."
      },
      "B": {
        "char": "friend",
        "caption": "Bro ka pehla MI matchday tha aaj. Main abhi tak normal nahi hua. Shayad kabhi nahi hounga."
      }
    },
    "variants": [
      {
        "when": {
          "benched": true
        },
        "title": "Dugout Se",
        "tag": "⚡ DUGOUT · NIGHT",
        "q": "Jab captain dugout scan kare — tum kya kar rahe ho?",
        "reader": [
          {
            "t": "nar",
            "text": "Wankhede full. Tum orange bib mein, drinks tray haath mein. Naman No.6 pe pad-up — uski pehli raat."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s7-benched.png",
            "h": 210
          },
          {
            "t": "nar",
            "text": "CSK ke 178. MI 71/3 se 98/6 — chase phisal raha hai, Pathirana ke 2 over baaki. Hardik dugout scan karta hai: 1 impact slot bacha hai."
          },
          {
            "t": "cue",
            "who": "Mahela Jayawardene",
            "avatar": "/avatars/mahela.png",
            "text": "Impact call captain ka hota hai. Us second woh form nahi dekhta — dekhta hai kaun ready hai."
          },
          {
            "t": "nar",
            "text": "Nazar tum pe rukti hai — sirf 1 second. Tilak bagal mein, chup. Tumhare haath mein tray — aur 1 decision."
          },
          {
            "t": "nar",
            "big": true,
            "text": "5 minute mein faisla hoga — tum abhi jo kar rahe ho, wahi uska data hai. Kya kar rahe ho?"
          }
        ],
        "choices": [
          {
            "t": "Pad up karo — switched on raho",
            "s": "Bulaye ya na bulaye — ready woh dikhta hai jo pehle se ready hai.",
            "deltas": {
              "form": 2
            },
            "relationshipDeltas": {
              "hardik": 2,
              "tilak": 1
            },
            "runWrite": "debut",
            "outcomeGate": {
              "metric": "charTrust",
              "charId": "hardik",
              "threshold": 46,
              "pass": {
                "title": "IMPACT SUB — 14* (8)",
                "note": "Captain ka haath utha: 'Kid. Pads.' 2 over ka cameo — Pathirana ko 2 boundary, aakhri over mein 11 ki jagah 6 gaye. 14* off 8. Chhota number, bada statement: jab usne dekha, tum ready the.",
                "post": {
                  "source": "account",
                  "name": "MI Paltan",
                  "handle": "mipaltan",
                  "label": "MI Paltan · just now",
                  "surface": "scorecard",
                  "caption": "IMPACT: {name} 14* (8) as sub. Haari hui position se almost kheench laaye. 16 saal ka baccha Pathirana ke death overs mein aise utara jaise slot pehle se book tha. 💙",
                  "reactions": [
                    {
                      "char": "hardik",
                      "text": "Ready tha. Isliye bheja. Simple."
                    },
                    {
                      "char": "tilak",
                      "text": "Maine dugout se dekha. Call se pehle hi taiyaar tha. Yehi cheez hai."
                    },
                    {
                      "char": "__fan",
                      "name": "paltanpulse",
                      "text": "BENCH SE AAKE PATHIRANA KO MARA. protect this kid at all costs."
                    }
                  ],
                  "imageUrl": "/generated/cricket-posts/cr-s29-mipaltan.png"
                }
              },
              "fail": {
                "title": "CALL NAHI AAYA",
                "note": "Hardik ki nazar tumse guzri — ruki nahi. Impact slot doosre naam ko gaya. Captain ka bharosa abhi tumhare naam tak nahi pahuncha. Pads pehne, poori raat.",
                "dm": [
                  {
                    "char": "tilak",
                    "text": "Dekha maine. Pads pehen ke baitha tha, poora match."
                  },
                  {
                    "char": "tilak",
                    "text": "Bura mat maan. Captain ke saath aisa hi hai — ready dikhna padta hai, mauka milne se pehle."
                  },
                  {
                    "char": "tilak",
                    "text": "Usko DM kar. Match ke baare mein nahi — role ke baare mein."
                  }
                ]
              }
            }
          },
          {
            "t": "Phone nikaalo — dugout content banao",
            "s": "Match haath mein nahi hai. Timeline toh hai.",
            "deltas": {
              "fame": 2
            },
            "relationshipDeltas": {
              "hardik": -3
            },
            "runWrite": "debut",
            "outcomeGate": {
              "metric": "charTrust",
              "charId": "hardik",
              "threshold": 46,
              "pass": {
                "title": "BULAYA — PHONE SAMET KE",
                "note": "'Kid! Pads!' — awaaz aayi tab phone haath mein tha. Tilak ne tray pakdi, tumne helmet. Cameo achha gaya: 14* (8). Par captain ne dekh liya tha ki call ke waqt tumhara dhyaan kahan tha.",
                "post": {
                  "source": "account",
                  "name": "MI Paltan",
                  "handle": "mipaltan",
                  "label": "MI Paltan · just now",
                  "surface": "scorecard",
                  "caption": "IMPACT: {name} 14* (8) as sub. Late call, quick hands — Pathirana ke death overs mein 2 boundary. Chase phir bhi door reh gayi. 💙",
                  "reactions": [
                    {
                      "char": "hardik",
                      "text": "Cameo theek tha. Focus ka sawaal khula hai."
                    },
                    {
                      "char": "__fan",
                      "name": "memeovers",
                      "text": "bro went from filming the dugout to batting in it within 90 seconds. cinema."
                    }
                  ],
                  "imageUrl": "/generated/cricket-posts/cr-s12-player.png"
                }
              },
              "fail": {
                "title": "CAMERA MEIN SAB AAYA",
                "note": "Impact slot doosre naam ko gaya. Aur broadcast camera ne pakad liya: haarte hue match mein, 12th aadmi, phone pe. Woh clip raat khatam hone se pehle timeline pe thi.",
                "dm": [
                  {
                    "char": "tilak",
                    "text": "Bhai. Broadcast ne tujhe phone ke saath pakda. Haarte match mein."
                  },
                  {
                    "char": "tilak",
                    "text": "Ready dikhna padta hai — aaj tu content dikha. Farak samajh."
                  }
                ]
              }
            }
          }
        ]
      }
    ]
  },
  {
    "id": "CR2-S8",
    "day": 6,
    "slot": "Morning",
    "tag": "⚡ TIMELINE · MORNING",
    "title": "Toofan",
    "body": [
      "Debut ke agle din phone ulta pada hai, phir bhi jal raha hai — 348 notifications, 23 missed calls, raat bhar mein 40,000 naye followers.",
      "Toofan tumhare naam ka hai. Sawaal: tum uske andar rehte ho, ya upar."
    ],
    "q": "Hero-storm ka kya karte ho?",
    "reader": [
      {
        "t": "nar",
        "text": "6:12. Phone ulta, phir bhi jal raha hai. 348 notifications. 4 interview requests, 1 brand ka DM. Coach ka sirf: 'Recovery kiya?'"
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s8-phone.png",
        "h": 210
      },
      {
        "t": "nar",
        "when": {
          "started": true
        },
        "text": "Har 3rd post wahi frame: Pathirana ka slower ball, tumhara wait, gap. Score ab caption nahi — hashtag hai."
      },
      {
        "t": "nar",
        "when": {
          "benched": true
        },
        "text": "Har edit wahi 8 gend — orange bib se Pathirana tak. '14 not out' chhota hai, clip bada. 'SUPER SUB' trending."
      },
      {
        "t": "nar",
        "when": {
          "charTrust": {
            "charId": "surya",
            "gte": 44
          }
        },
        "text": "Scroll ke beech 1 post sab shaant kar deta hai — SKY ka."
      },
      {
        "t": "cue",
        "who": "Suryakumar Yadav",
        "avatar": "/avatars/surya.png",
        "when": {
          "charTrust": {
            "charId": "surya",
            "gte": 44
          }
        },
        "text": "Timeline chill. Kid ko main dekh raha hoon. Tum log match dekho. 💙"
      },
      {
        "t": "cue",
        "who": "Maddy",
        "avatar": "/avatars/friend.png",
        "text": "Bro, 23 missed calls mein se aadhe mere the 😭 Insta khol mat. Ya khol. Tu famous ho gaya hai aur main comments mein tere liye ladh raha hoon."
      },
      {
        "t": "nar",
        "big": true,
        "text": "Toofan tumhare naam ka hai — andar rehte ho, ya upar?"
      }
    ],
    "choices": [
      {
        "t": "Ride karo — reel, interviews, sab",
        "s": "Momentum currency hai. Aaj tumhare paas hai.",
        "deltas": {
          "fame": 4,
          "form": -1
        },
        "relationshipDeltas": {
          "hardik": -2
        },
        "flagDeltas": {
          "hypeRisk": 1
        },
        "postTag": "TOOFAN KA CENTER",
        "postWhy": "Raat bhar mein 40,000 naye log tumhe dekhne aaye hain. Yeh window kal band ho jayegi. {followers} followers ke saamne yeh moment tumhara hai — abhi, tumhare shabdon mein.",
        "post": {
          "source": "player",
          "caption": "Kal raat: Wankhede. Aaj: pura din replay. Sapna tha, ab schedule hai. Yeh toh shuruaat hai. 💙🔥",
          "reactions": [
            {
              "char": "surya",
              "text": "Reel fire hai champion. Kal nets 8 baje — bowling machine reels nahi dekhti 😄"
            },
            {
              "char": "__fan",
              "name": "paltanpulse",
              "text": "THE EDIT. THE MUSIC. THE KID. we are so seated for this era."
            },
            {
              "char": "__fan",
              "name": "memeovers",
              "text": "one good night and bro dropped a whole documentary 😭 respect honestly"
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s22-mipaltan.png"
        }
      },
      {
        "t": "Mute karo — recovery aur review",
        "s": "Shor kal bhi hoga. Agla match nahi rukega.",
        "deltas": {
          "form": 2
        },
        "relationshipDeltas": {
          "hardik": 3,
          "coach": 2
        },
        "dm": [
          {
            "char": "hardik",
            "text": "Recovery first. Review 10 baje."
          },
          {
            "char": "hardik",
            "text": "Kal raat achhi thi. Aaj se usko repeat karne ka kaam shuru hota hai. Yehi farak hai player aur clip mein."
          }
        ]
      }
    ],
    "feedReaction": {
      "A": {
        "char": "friend",
        "caption": "Timeline ka mood kuch bhi ho — mera banda mera banda hai. 💙"
      },
      "B": {
        "char": "coach",
        "caption": "Shor ke agle din jo nets pe hota hai, wahi career hota hai. Baaki sab mausam hai."
      }
    },
    "variants": [
      {
        "when": {
          "gate": {
            "sitId": "CR2-S7",
            "is": "fail"
          }
        },
        "title": "Ulta Toofan",
        "tag": "⚡ PILE-ON · MORNING",
        "q": "Pile-on ka jawaab kya hai?",
        "reader": [
          {
            "t": "nar",
            "text": "6:12. Phone ulta. 212 notifications, 1 bhi mubarak nahi. Analyst thread — 'MI ne jaldi kar di?' — 4,000 retweets. Memeovers: template ready."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s8-phone.png",
            "h": 210
          },
          {
            "t": "nar",
            "when": {
              "started": true
            },
            "text": "Wahi gendein har angle se: Pathirana ka slower ball, hava mein shot, deep midwicket. Caption: 'Overhyped?' Question mark bas formality hai."
          },
          {
            "t": "nar",
            "when": {
              "benched": true
            },
            "text": "Khele bhi nahi, phir bhi thread tumhare naam ka: 'The invisible man of MI.' 2 sheet, 0 match — timeline ke liye yahi crime kaafi hai."
          },
          {
            "t": "nar",
            "when": {
              "charTrust": {
                "charId": "surya",
                "gte": 44
              }
            },
            "text": "Phir 9:40 pe 1 post — jo poore pile-on ke upar baith jaata hai."
          },
          {
            "t": "cue",
            "who": "Suryakumar Yadav",
            "avatar": "/avatars/surya.png",
            "when": {
              "charTrust": {
                "charId": "surya",
                "gte": 44
              }
            },
            "text": "1 match. 16 saal. Thoda saans le lo timeline. Kid ko main dekh raha hoon. 💙"
          },
          {
            "t": "cue",
            "who": "Maddy",
            "avatar": "/avatars/friend.png",
            "text": "Bro. Comments mat padh. MAT padh. Main padh raha hoon aur mera BP dono handle nahi ho rahe."
          },
          {
            "t": "nar",
            "big": true,
            "text": "Duniya ne raat bhar mein tumhara faisla likh diya. Ab tumhari baari — jawaab, ya kaam?"
          }
        ],
        "choices": [
          {
            "t": "Clap-back post karo",
            "s": "Chup rehna guilt jaisa lagta hai. 1 line se band karo sab.",
            "deltas": {
              "fame": 3
            },
            "relationshipDeltas": {
              "hardik": -4
            },
            "flagDeltas": {
              "clapback": 1
            },
            "post": {
              "source": "player",
              "caption": "1 raat mein expert ban gaye sab? Meri jersey bhi pehen lo phir. Season lamba hai. Yaad rakhna. 🙂",
              "reactions": [
                {
                  "char": "__fan",
                  "name": "memeovers",
                  "text": "screenshot le liya. template ban gaya. thanks for the content kid 😭"
                },
                {
                  "char": "__fan",
                  "name": "cricketroom_india",
                  "text": "Feisty. But the last young player who fought the timeline lost to it. They always do."
                },
                {
                  "char": "__fan",
                  "name": "paltanpulse",
                  "text": "kid… humein pata hai dil dukha hai. par yeh post kal subah delete hoga. hum jaante hain."
                }
              ]
            },
            "postTag": "TOOFAN KA JAWAAB",
            "postWhy": "Timeline tumhare baare mein bol rahi hai. Ab tum bologe. Jo likhoge, wahi kal ka headline hai."
          },
          {
            "t": "Chup raho — Bumrah se time maango",
            "s": "Timeline ko jawaab mat do. Technique ko do.",
            "deltas": {
              "form": 3
            },
            "relationshipDeltas": {
              "bumrah": 3,
              "hardik": 2
            },
            "dm": [
              {
                "char": "bumrah",
                "text": "Kal subah 7 baje. Nets. Sirf hum do."
              },
              {
                "char": "bumrah",
                "text": "Jo timeline keh rahi hai woh data nahi hai. Jo nets mein hoga, woh data hai."
              },
              {
                "char": "bumrah",
                "text": "Phone hotel pe chhod ke aana."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CR2-S9",
    "day": 6,
    "slot": "Night",
    "tag": "⚡ LEAK · NIGHT",
    "title": "The Fall",
    "body": [
      "Raat 11:47, burner account se thread drop — 9 posts, teen clips, sab tumhare naam. Context se kata hua sab kuch: ek kahani jo tumne nahi likhi.",
      "Team group chat: 340 log online, zero messages. Phir Mahela ka ek: 'Meeting. 9am.'"
    ],
    "q": "9am se pehle kya karte ho?",
    "reader": [
      {
        "t": "nar",
        "when": {
          "charTrust": {
            "charId": "friend",
            "gte": 76
          }
        },
        "text": "Shaam 5:20. Maddy: 'Bro, aaj raat tere baare mein kuch drop hoga.' 6 ghante ka head start — isliye haath nahi kaanpta."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s9-fall.png",
        "h": 210
      },
      {
        "t": "nar",
        "text": "Raat 11:47. Burner thread live: 9 posts, 3 clips — 1 kahani jo tumne nahi likhi. Har refresh pe naya screenshot."
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "clapback",
            "gte": 1
          }
        },
        "text": "Thread ka centre-piece: tumhara kal ka clap-back, ab screenshot. Caption: 'Attitude ya insecurity?' Quote-tweets mein aag."
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "likedOutrage",
            "gte": 1
          }
        },
        "text": "Tumhare likes bhi khode gaye — bench wale din ke saare outrage posts, ek hi compilation mein. Caption: 'Team se pehle main.'"
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "pressCocky",
            "gte": 1
          }
        },
        "text": "Pehli presser ka clip scorecard se stitch: 'Main XI ke liye aaya hoon' — cut — number. Dramatic music. 2.1 million views."
      },
      {
        "t": "nar",
        "text": "Team chat: 340 online, 0 messages. Phir Mahela ka 1 message: 'Meeting. 9am.'"
      },
      {
        "t": "nar",
        "big": true,
        "text": "9am se pehle tay hoga tum kaun ho: galti ke saamne khade — ya PR ke peeche?"
      }
    ],
    "choices": [
      {
        "t": "Own karo — pehle room, phir duniya",
        "s": "Bina excuse. Bina PR. Jo sach hai, seedha.",
        "deltas": {
          "form": 1,
          "fame": -2
        },
        "relationshipDeltas": {
          "hardik": 4,
          "rohit": 3
        },
        "flagDeltas": {
          "ownedIt": 1
        },
        "dm": [
          {
            "char": "rohit",
            "text": "Suna maine. Aur yeh bhi suna ki tu khud bolna chahta hai. Achha hai."
          },
          {
            "char": "rohit",
            "text": "Galti sab karte hain. Jawaab kaun deta hai — woh dekha jaata hai."
          },
          {
            "char": "rohit",
            "text": "Kal 9 baje se pehle mujhe khud likh. Jo bolna hai, pehle mujhe bol."
          }
        ]
      },
      {
        "t": "PR-fix karo — statement post, clips delete",
        "s": "Naam bachao. Kahani ko manage karo.",
        "deltas": {
          "fame": 2
        },
        "relationshipDeltas": {
          "hardik": -5,
          "rohit": -2,
          "mahela": -2
        },
        "flagDeltas": {
          "deflected": 1
        },
        "post": {
          "source": "player",
          "caption": "Kal raat se kuch clips circulate ho rahi hain jo bina context ke hain. Meri team is par kaam kar rahi hai. Main apne cricket pe focused hoon. Dhanyavaad. 🙏",
          "reactions": [
            {
              "char": "__fan",
              "name": "cricketroom_india",
              "text": "'Meri team is par kaam kar rahi hai' — the sixteen-year-old has a team for this now. Noted, and filed."
            },
            {
              "char": "naman",
              "text": "Statement kisne likha? Font achha hai."
            },
            {
              "char": "__fan",
              "name": "memeovers",
              "text": "'context' just entered the group chat 💀 PR speedrun any% record"
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s16-mipaltan.png"
        },
        "postTag": "DAMAGE CONTROL",
        "postWhy": "Leak viral hai aur team chup hai. Yeh post ya aag bujhayega ya petrol dalega — publish se pehle soch lo."
      }
    ],
    "feedReaction": {
      "A": {
        "char": "hardik",
        "caption": "Aaj room ke andar jo hua, woh bahar nahi aayega. Itna bata doon — room handled it. That matters."
      },
      "B": {
        "char": "friend",
        "caption": "Bro ka statement dekha. PR wala. Mujhe actual bro se baat karni hai. Actual wale se."
      }
    }
  },
  {
    "id": "CR2-S10",
    "day": 7,
    "slot": "Evening",
    "tag": "⚡ SELECTION MEETING · EVENING",
    "title": "Selection Meeting",
    "body": [
      "Shaam 6 baje, team room. Whiteboard pe agle match ke matchups — Mahela ke haath mein woh sheet jisse har hafta shuru aur khatam hota hai.",
      "Is baar naam ke saath ek verdict bhi hai — aur uske baad tumhara agla move."
    ],
    "q": "Retained. Ab kya?",
    "reader": [
      {
        "t": "nar",
        "when": {
          "gate": {
            "sitId": "CR2-S7",
            "is": "pass"
          }
        },
        "text": "Team room, shaam 6. Mahela tumhara debut number padhta hai — ab hashtag hai. Phir Hardik ko dekhta hai. Hardik pehle se tumhe dekh raha hai."
      },
      {
        "t": "nar",
        "when": {
          "gate": {
            "sitId": "CR2-S7",
            "is": "fail"
          }
        },
        "text": "Team room, shaam 6. Mahela woh number padhta hai jo tum bhoolna chahte ho. Khamoshi. 'Numbers argue nahi karte. Tape kabhi kabhi karta hai.'"
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s10-selection.png",
        "h": 210
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "ownedIt",
            "gte": 1
          }
        },
        "text": "Meeting se pehle Mahela alag se: 'Kal raat jaise handle hui — woh sheet pe nahi likhi jaati. Par ginti hoti hai.'"
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "deflected",
            "gte": 1
          }
        },
        "text": "Tumhara kal ka PR statement table pe hai — Mahela ne print karwaya. Woh kuch nahi bolta. Yehi sabse loud hai."
      },
      {
        "t": "cue",
        "who": "Hardik Pandya",
        "avatar": "/avatars/hardik.png",
        "text": "Retained. Agla match khelega. No.5, wahi role."
      },
      {
        "t": "nar",
        "big": true,
        "text": "Naam sheet pe — bina drama. Chupchaap agla match kamao, ya duniya ko batao ki tum sahi the?"
      }
    ],
    "choices": [
      {
        "t": "Chup raho — agla match kamao",
        "s": "Naam sheet pe rehna chahiye, headline mein nahi.",
        "deltas": {
          "form": 2
        },
        "relationshipDeltas": {
          "hardik": 2
        },
        "dm": [
          {
            "char": "hardik",
            "text": "Meeting mein jo bola, wahi role hai. No.5. Death tak rukna pade toh rukna."
          },
          {
            "char": "hardik",
            "text": "Aur ek baat. Is hafte tune kuch cheezein sahi ki. Main note karta hoon. Bolta kam hoon."
          }
        ]
      },
      {
        "t": "Vindication post karo",
        "s": "Jo doubt karte the — unko receipt do.",
        "deltas": {
          "fame": 3
        },
        "relationshipDeltas": {
          "hardik": -3
        },
        "postTag": "RECEIPTS",
        "postWhy": "Ek hafte pehle timeline ne tumhara faisla likh diya tha. Aaj team sheet ne unko jawaab de diya hai. {followers} followers ko yeh receipt tumhare haath se chahiye.",
        "post": {
          "source": "player",
          "caption": "Retained. Jo log 'overhyped' likh rahe the — phir se padh lo. Kaam bolta hai. Hamesha bolega. 💙",
          "reactions": [
            {
              "char": "rohit",
              "text": "Hmm."
            },
            {
              "char": "__fan",
              "name": "cricketroom_india",
              "text": "Retention is a Tuesday, not a trophy. Curious energy from the kid."
            },
            {
              "char": "__fan",
              "name": "paltanpulse",
              "text": "HE STAYS. AS HE SHOULD. haters ka schedule bhi busy hai aaj 😌"
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s12-mipaltan.png"
        }
      }
    ],
    "feedReaction": {
      "A": {
        "char": "rohit",
        "caption": "Team sheet har hafte ek sawaal poochti hai. Jawaab har hafte dena padta hai."
      },
      "B": {
        "char": "friend",
        "caption": "Bro ka selection saga mera favourite show ban gaya hai. Agla episode Wednesday. 🍿"
      }
    },
    "variants": [
      {
        "when": {
          "benched": true
        },
        "title": "Sheet Ke Bahar",
        "tag": "⚡ SELECTION MEETING · EVENING",
        "q": "Sheet ke bahar se raasta kya hai?",
        "reader": [
          {
            "t": "nar",
            "text": "Shaam 6 baje. Sheet board pe lagti hai. 2 baar padhte ho — naam nahi. Naman No.6 confirm. 2 hafte, 2 sheet — 1 baar bhi 12 ke andar nahi."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s10-benched.png",
            "h": 210
          },
          {
            "t": "nar",
            "when": {
              "flag": {
                "key": "deflected",
                "gte": 1
              }
            },
            "text": "Sab jaante hain kyun. Kal ka PR statement Mahela ke table pe print tha. PR se selection nahi hoti."
          },
          {
            "t": "nar",
            "when": {
              "flag": {
                "key": "ownedIt",
                "gte": 1
              }
            },
            "text": "Nikalte waqt kandhe pe haath — Rohit. Kuch bola nahi, zaroorat nahi. Kal raat room ne dekha. Par sheet numbers se banti hai."
          },
          {
            "t": "cue",
            "who": "Mahela Jayawardene",
            "avatar": "/avatars/mahela.png",
            "text": "Ruk. 2 minute."
          },
          {
            "t": "nar",
            "text": "Room khali. Mahela ka ishara sheet pe — form column, tumhara number, aage khali box."
          },
          {
            "t": "nar",
            "big": true,
            "text": "Yeh raat sabse asaan bahana ban sakti hai — ya sabse zaroori number. Kya chunte ho?"
          }
        ],
        "choices": [
          {
            "t": "Naman ke saath kaam karo — number banao",
            "s": "Jo khel raha hai usko tez karo. Khud us se tez ho jao.",
            "deltas": {
              "form": 3
            },
            "relationshipDeltas": {
              "naman": 3,
              "mahela": 2,
              "hardik": 2
            },
            "dm": [
              {
                "char": "mahela",
                "text": "Tumne poocha raasta kya hai. Main seedha bolta hoon."
              },
              {
                "char": "mahela",
                "text": "Form 64 chahiye. Us number pe main selection room mein khud ladta hoon — woh sheet mujhe khud likhni hai."
              },
              {
                "char": "mahela",
                "text": "Nets. Throw-downs. Naman ke saath prep. Sab ginta hai. Hype nahi ginta. Number ginta hai — 64."
              }
            ]
          },
          {
            "t": "Agent ko haan bolo — trade rumor float karo",
            "s": "MI value nahi karta? Market karega.",
            "deltas": {
              "fame": 4
            },
            "relationshipDeltas": {
              "hardik": -6,
              "mahela": -3
            },
            "flagDeltas": {
              "tradeNoise": 1
            },
            "post": {
              "source": "account",
              "name": "Cricketroom India",
              "handle": "cricketroom_india",
              "label": "Cricketroom India · analysis",
              "caption": "EXCLUSIVE: Sources close to the young MI batter say the camp is 'evaluating options' ahead of the trade window. Two benchings in two weeks. Wants out? Developing story.",
              "reactions": [
                {
                  "char": "__fan",
                  "name": "paltanpulse",
                  "text": "NAHI. yeh wala nahi. delete karo. humne edit banaye the 😭"
                },
                {
                  "char": "__fan",
                  "name": "futurexi",
                  "text": "Three franchises would take that call today. Just saying."
                },
                {
                  "char": "hardik",
                  "text": "Jisko baat karni hai, meeting room mera khula hai. Timeline nahi."
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s20-mipaltan.png"
            }
          }
        ]
      },
      {
        "when": {
          "lifeline": true
        },
        "title": "Captain Ka Naam",
        "tag": "⚡ SELECTION MEETING · EVENING",
        "q": "Captain ne apna naam laga diya. Tum kya karte ho?",
        "reader": [
          {
            "t": "nar",
            "text": "Shaam 6, team room. Mahela sheet padhta hai — numbers tumhari taraf nahi. Form column pe pen rukta hai. 'Doosre options hain.' Room chup."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s5-selection.png",
            "h": 210
          },
          {
            "t": "cue",
            "who": "Hardik",
            "avatar": "/avatars/hardik.png",
            "when": {
              "flag": {
                "key": "lifelineOwed",
                "gte": 1
              }
            },
            "text": "2nd baar naam laga raha hoon tere liye. 1st ka hisaab abhi khula hai. 3rd baar nahi hogi."
          },
          {
            "t": "cue",
            "who": "Hardik Pandya",
            "avatar": "/avatars/hardik.png",
            "text": "Agla match yeh khelega. Meri call. Mere naam pe likh lo."
          },
          {
            "t": "cue",
            "who": "Tilak Varma",
            "avatar": "/avatars/tilak.png",
            "text": "Bhai, samajh raha hai na yeh kya hai? Captain ka blank cheque nahi hota. Yeh loan hota hai."
          },
          {
            "t": "nar",
            "big": true,
            "text": "Captain ka naam ab sabke saamne tumhare number ke aage — udega ya girega tumhare score ke saath. Jawaab kaise doge?"
          }
        ],
        "choices": [
          {
            "t": "Private promise — 'is baar numbers'",
            "s": "Jo usne room mein kiya, uska jawaab room mein.",
            "deltas": {
              "form": 1
            },
            "relationshipDeltas": {
              "hardik": 3
            },
            "flagDeltas": {
              "lifelineOwed": 1
            },
            "dm": [
              {
                "char": "hardik",
                "text": "Tune message kiya. Good. Zyada log thank-you post karte hain."
              },
              {
                "char": "hardik",
                "text": "Sun. Yeh last explain hai. Ab bat bolega."
              },
              {
                "char": "hardik",
                "text": "Wednesday. No.5. Mujhe innings chahiye, promise nahi."
              }
            ]
          },
          {
            "t": "Prove-it post karo — publicly",
            "s": "Duniya ko batao captain ne kya kiya — aur tum kya karoge.",
            "deltas": {
              "fame": 2
            },
            "relationshipDeltas": {
              "hardik": -2
            },
            "post": {
              "source": "player",
              "caption": "Aaj captain ne mere liye apna naam rakha. Wednesday ko main uska jawaab apne bat se dunga. Likh ke rakh lo. 💙",
              "reactions": [
                {
                  "char": "__fan",
                  "name": "paltanpulse",
                  "text": "CAPTAIN'S PICK. this is cinema and we are front row 🎬"
                },
                {
                  "char": "surya",
                  "text": "Energy achhi hai. Ab bas yeh energy Wednesday tak fridge mein rakh 😄"
                },
                {
                  "char": "__fan",
                  "name": "cricketroom_india",
                  "text": "Public promises are heavy things at sixteen. Wednesday will weigh this one."
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s22-hardik.png"
            },
            "postTag": "PROVE-IT SEASON",
            "postWhy": "Selection meeting ke baad ki raat. Jo bhi post karoge, dressing room subah wahi padhega."
          }
        ]
      }
    ]
  },
  {
    "id": "CR2-S11",
    "day": 8,
    "slot": "Morning",
    "tag": "⚡ THANDA CORRIDOR · MORNING",
    "title": "Akela Hotel Gym",
    "body": [
      "Day 8, subah 5:52. Khaali hotel gym, trigger movement gayab. Rohit ka darwaza isi floor pe — knock kisi ne nahi kiya. Bas Coach Sir ka video call, aur ek slump jo akele nahi tootta."
    ],
    "q": "Slump akele nahi tootta. Kaise todte ho?",
    "reader": [
      {
        "t": "nar",
        "when": {
          "benched": true
        },
        "text": "Day 8, subah 5:52. Khaali gym, Eliminator 2 din door. Orange bib ab aadat hai. Timeline ab naam nahi leti — trolling se zyada dukhta hai."
      },
      {
        "t": "nar",
        "when": {
          "started": true
        },
        "text": "Day 8, subah 5:52. Khaali gym, Eliminator 2 din door. Naam sheet pe hai — par 3 innings ka total? 1 over jitna. Yeh khamoshi sabse loud hai."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s11-gym.png",
        "h": 210
      },
      {
        "t": "cue",
        "who": "Coach Sir",
        "avatar": "/avatars/coach.png",
        "when": {
          "flag": {
            "key": "deflected",
            "gte": 1
          }
        },
        "text": "Beta, statement PR ne likha — par 3 din se video nahi aaya, woh tu hai. Bhaag mat. Slump soch ka hota hai, technique ka nahi. Cement wicket yaad hai? Grip se shuru karte hain."
      },
      {
        "t": "cue",
        "who": "Coach Sir",
        "avatar": "/avatars/coach.png",
        "when": {
          "flag": {
            "key": "ownedIt",
            "gte": 1
          }
        },
        "text": "Beta, suna maine — galti tune khud maani. Nazrein milti rahengi, par form izzat se wapas nahi aati. 3 din se video nahi aaya. Cement wicket yaad hai? Grip se shuru karte hain."
      },
      {
        "t": "nar",
        "big": true,
        "text": "Mirror mein trigger movement gayab; Rohit isi floor pe — knock kisi ne nahi kiya. 2 crore ka Mumbai, bas 1 video call: slump kaise todte ho?"
      }
    ],
    "choices": [
      {
        "t": "Coach ke saath wapas basics",
        "s": "Ego side pe. Grip se shuru — jaise gyaarah saal ki umar mein.",
        "deltas": {
          "form": 3
        },
        "relationshipDeltas": {
          "coach": 3
        },
        "flagDeltas": {
          "homeGrounding": 1
        },
        "dm": [
          {
            "char": "coach",
            "text": "Video mila. Wahi dikha jo mujhe lag raha tha — backlift theek hai, base hil gaya hai. Tu ball ke paas jaldi pahunch raha hai."
          },
          {
            "char": "coach",
            "text": "Kal subah 6 baje video call pe drill karenge. 200 gendein. Sirf defence. Ek bhi shot nahi. Jaise cement wicket pe karte the."
          },
          {
            "char": "coach",
            "text": "Aur beta — is hafte scorecard mat dekh. Ball dekh. Baaki duniya main dekh lunga."
          }
        ]
      },
      {
        "t": "Lone-wolf grind — aur post karo",
        "s": "Kisi ka wait nahi. Apna kaam, apni story, apna proof.",
        "deltas": {
          "form": 1,
          "fame": 2
        },
        "flagDeltas": {
          "hypeRisk": 1
        },
        "postTag": "LONE WOLF",
        "postWhy": "Koi dekh nahi raha — isliye post karna aur zaroori lagta hai. Duniya ko batao grind ruki nahi hai. {followers} followers ko proof chahiye.",
        "post": {
          "source": "player",
          "caption": "5 AM. Khaali gym. Koi shortcut nahi, koi excuse nahi. 🔒 #TrustTheProcess",
          "reactions": [
            {
              "char": "tilak",
              "text": "Work good hai. Par isolation ko process mat samajh. Young table kal nets pe hai — aa ja."
            },
            {
              "char": "__fan",
              "name": "futurexi",
              "text": "the kid is grinding in silence. respect. form is temporary."
            },
            {
              "char": "__fan",
              "name": "memeovers",
              "text": "bro posted 'silent grind' with a ring light 💀"
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s25-player.png"
        }
      }
    ],
    "feedReaction": {
      "A": {
        "char": "coach",
        "caption": "Slump technique se kam, sochne ke tareeke se zyada tootta hai. Mere har student ko ek hi baat — grip pehle, glory baad mein."
      },
      "B": {
        "char": "friend",
        "caption": "Bhai 5 baje gym story daal raha hai. Main 5 baje so raha hoon. We are not the same. (Proud though. Thoda sa.)"
      }
    },
    "variants": [
      {
        "when": {
          "charTrust": {
            "charId": "rohit",
            "gte": 44
          }
        },
        "title": "Rohit Ka 6 AM",
        "tag": "⚡ THANDA CORRIDOR · 6 AM",
        "q": "Rohit ne apni subah tumpe kharch ki. Kaise use karte ho?",
        "reader": [
          {
            "t": "nar",
            "text": "Subah 5:47 — knock. Peephole mein Rohit Sharma, training kit, coffee: \"Neeche gaadi. 5 minute.\" Khaali Wankhede — 33,000 seatein, 2 log."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s11-rohit.png",
            "h": 210
          },
          {
            "t": "nar",
            "when": {
              "flag": {
                "key": "ownedIt",
                "gte": 1
              }
            },
            "text": "Clip wali raat tumne sabke saamne galti maani thi. Rohit tab chup tha. Yeh subah — yehi uska jawab hai."
          },
          {
            "t": "nar",
            "when": {
              "flag": {
                "key": "deflected",
                "gte": 1
              }
            },
            "text": "PR statement usse pasand nahi aaya — sabko pata hai. Phir bhi aaya. Rohit player nahi, problem dekhta hai."
          },
          {
            "t": "cue",
            "who": "Rohit",
            "avatar": "/avatars/rohit.png",
            "text": "Teri problem shot nahi, tempo hai — tu ball pe jaldi pahunchta hai. 15 minute sirf leave, har gend ko naam — \"boring\", \"good\", \"meri\". Ya apna tareeka mujhe dikha. Dono chalega — decide abhi."
          },
          {
            "t": "nar",
            "big": true,
            "text": "India ka sabse calm batsman sirf tumhare liye 6 baje utha. Full surrender — ya apna tareeka?"
          }
        ],
        "choices": [
          {
            "t": "Full surrender — jo bolo, wahi",
            "s": "Ego bag mein. Tempo usse seekho jisne is ground ko jeeta hai.",
            "deltas": {
              "form": 4
            },
            "relationshipDeltas": {
              "rohit": 3
            },
            "dm": [
              {
                "char": "rohit",
                "text": "Shot tha. Ball nahi thi. Ab dono milenge. Kal same time."
              }
            ]
          },
          {
            "t": "Apna tareeka defend karo",
            "s": "Uski baat suno — par trigger tumhara hai. Wahi tumhe yahan laaya.",
            "deltas": {
              "form": 2
            },
            "relationshipDeltas": {
              "rohit": -2
            },
            "flagDeltas": {
              "ownMethod": 1
            },
            "post": {
              "source": "account",
              "name": "Paltan Pulse",
              "handle": "paltanpulse",
              "avatarText": "P",
              "label": "Paltan Pulse · fan page",
              "caption": "LONG LENS, 6:14 AM, Wankhede: Rohit Sharma aur woh 16-saal ka ladka. Khaali stadium. Aur sun'ne mein aaya — bachcha ROHIT ke saamne apne hi tareeke se khel raha tha. Dimaag hai ya himmat? 👀💙",
              "reactions": [
                {
                  "char": "__fan",
                  "name": "futurexi",
                  "text": "own method in front of Rohit Sharma at sixteen. either a future great or a future headline."
                },
                {
                  "char": "surya",
                  "text": "Chill karo sab. Session tha, summit nahi. 😄"
                },
                {
                  "char": "__fan",
                  "name": "memeovers",
                  "text": "'apna tareeka' bhai woh ROHIT SHARMA hai 💀"
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s19-rohit.png"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "CR2-S12",
    "day": 9,
    "slot": "Evening",
    "tag": "⚡ DO NAAM, EK JAGAH · EVENING",
    "title": "Do Naam, Ek Jagah",
    "body": [
      "Eliminator se ek raat pehle whiteboard pe middle order mein 2 naam: tumhara aur Naman ka. Poll 51-49 pe jhool raha hai, journalist 'inside story' maang raha hai, aur Mahela ka pen ruka hua hai."
    ],
    "q": "Slot 1 hai. Naman ke saath — ya against?",
    "reader": [
      {
        "t": "nar",
        "text": "Team room, 7 baje. Whiteboard pe kal ka Eliminator plan — 2 naam, 1 jagah: {name} / Naman. Phone ulta hai, phir bhi buzz: poll 51-49."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s12-rivalry.png",
        "h": 210
      },
      {
        "t": "nar",
        "text": "Journalist ka DM: \"Bola tha na — XI ke liye aaye ho, wait karne nahi. Story doge?\"",
        "when": {
          "flag": {
            "key": "pressCocky",
            "gte": 1
          }
        }
      },
      {
        "t": "cue",
        "who": "Naman",
        "avatar": "/avatars/naman.png",
        "text": "Bro. Jo bhi ho kal — pehle chai, phir cricket. Aaja, unke death overs ka plan saath dekhte hain.",
        "when": {
          "charTrust": {
            "charId": "naman",
            "gte": 50
          }
        }
      },
      {
        "t": "cue",
        "who": "Naman",
        "avatar": "/avatars/naman.png",
        "text": "Hey. Ajeeb hai na — same room, same sapna, 1 jagah. Anyway. Nets 8 baje hain.",
        "when": {
          "charTrust": {
            "charId": "naman",
            "gte": 35,
            "lt": 50
          }
        }
      },
      {
        "t": "cue",
        "who": "Naman",
        "avatar": "/avatars/naman.png",
        "text": "{name}. May the best kid win. Seriously. Baaki sab noise hai.",
        "when": {
          "charTrust": {
            "charId": "naman",
            "lt": 35
          }
        }
      },
      {
        "t": "nar",
        "big": true,
        "text": "Mahela ka pen dono naamon pe ruka hai — 16 saal ke 2 sapne, kal 1 mitega. Aaj raat kaunsa khel khelte ho?"
      }
    ],
    "choices": [
      {
        "t": "Naman ke saath prep karo",
        "s": "Jo bhi khele, MI jeete. Dosti pehle, selection baad.",
        "deltas": {
          "form": 1
        },
        "relationshipDeltas": {
          "naman": 4,
          "hardik": 3,
          "tilak": 2
        },
        "dm": [
          {
            "char": "naman",
            "text": "Bro tu aa gaya. Sach bolun? Mujhe laga nahi tha tu aayega. 😅"
          },
          {
            "char": "naman",
            "text": "Ok sun — maine unke death bowler ka poora season dekha hai. 19th over: pehli 3 gendein WIDE yorker, third man upar. Charge karne waalon ko woh wahi khilaata hai."
          },
          {
            "char": "naman",
            "text": "Aur slower ball tabhi aati hai jab batsman crease chhodta hai. Ruk ke khel — deep point khula rehta hai. Jo bhi khele kal, yeh dono ke kaam ki baat hai. 🤝"
          }
        ]
      },
      {
        "t": "Politics khelo — numbers press ko do",
        "s": "Slot war hai. Aur war mein narrative bhi weapon hai.",
        "deltas": {
          "form": 1,
          "fame": 3
        },
        "relationshipDeltas": {
          "naman": -4,
          "hardik": -3
        },
        "flagDeltas": {
          "briefedPress": 1
        },
        "post": [
          {
            "source": "account",
            "name": "Cricketroom India",
            "handle": "cricketroom_india",
            "avatarText": "C",
            "label": "Cricketroom India · analysis",
            "caption": "SOURCES: MI camp mein Eliminator slot ke liye ek 'numbers war' chal raha hai. Humein ek detailed stats sheet mili hai jo young batter {name} ka case banati hai — death-overs intent, matchup data, poora package. Sheet 'camp ke andar se' aayi hai. Kal ki XI batayegi — data jeeta ya dressing room.",
            "reactions": [
              {
                "char": "naman",
                "text": "Interesting sheet. Mera bhi ek number hai — jo ground pe banta hai. 🙂"
              },
              {
                "char": "__fan",
                "name": "paltanpulse",
                "text": "yeh sheet 'andar se' kaise nikli bhai... 🤨"
              },
              {
                "char": "__fan",
                "name": "memeovers",
                "text": "leak season > IPL season"
              }
            ],
            "imageUrl": "/generated/cricket-posts/cr-s13-paltanpulse.png"
          },
          {
            "source": "account",
            "name": "Future XI",
            "handle": "futurexi",
            "avatarText": "F",
            "label": "Future XI · prospects",
            "caption": "POLL 🗳️ WHO STARTS THE ELIMINATOR? {name} vs Naman Dhir — 1 slot, 2 future stars. 24,318 votes aur counting. Comments open. Selectors bhi scroll karte hain. 👀",
            "comments": [
              {
                "text": "Naman bhi deserve karta hai. Jo bhi khele — MI jeete. 💙",
                "deltas": {},
                "relationshipDeltas": {
                  "naman": 3,
                  "hardik": 2
                },
                "toast": "Team-first comment. Naman ne screenshot save kiya. Room ne notice kiya."
              },
              {
                "text": "Dono ready hain. Kal XI batayegi.",
                "deltas": {},
                "toast": "Neutral. Safe. Kisi ne notice nahi kiya."
              },
              {
                "text": "Numbers dekh lo pehle — phir poll karna. 📊",
                "deltas": {
                  "fame": 2
                },
                "relationshipDeltas": {
                  "naman": -2,
                  "hardik": -1
                },
                "toast": "Self-promo. Fans ne pump kiya. Dressing room ne bhi dekha."
              }
            ]
          }
        ]
      }
    ],
    "feedReaction": {
      "A": {
        "char": "tilak",
        "caption": "2 naam, 1 jagah — aur dono aaj saath nets pe the. Yeh hota hai dressing room culture. 💙"
      },
      "B": {
        "char": "friend",
        "caption": "Bro yeh 'sources' kaun hai? 🤔 Mujhe kyu lag raha hai main sources ko personally jaanta hoon 💀"
      }
    },
    "variants": [
      {
        "when": {
          "benched": true
        },
        "title": "Prove-It Nets",
        "tag": "⚡ DO NAAM, EK JAGAH · PROVE-IT NETS",
        "q": "Whiteboard pe 64 likha hai. Kaise pahunchte ho?",
        "reader": [
          {
            "t": "nar",
            "text": "Shaam, side nets. Board pe sirf: 64. Doosri net pe Naman — kal tumhari jagah. Poll: 'SHOULD MI RECALL THE KID?' 19,000 votes."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s12-net64.png",
            "h": 210
          },
          {
            "t": "nar",
            "text": "Trade rumor ke baad Mahela ne baat band kar di thi. Number phir bhi board pe hai — professionals personal nahi karte.",
            "when": {
              "flag": {
                "key": "tradeNoise",
                "gte": 1
              }
            }
          },
          {
            "t": "cue",
            "who": "Mahela",
            "avatar": "/avatars/mahela.png",
            "text": "64. Not a punishment — the line. Trial sim: 10 overs, match fielders, real umpire. Show me an innings, not intent."
          },
          {
            "t": "cue",
            "who": "Naman",
            "avatar": "/avatars/naman.png",
            "text": "Oye. Tu 64 cross karega, pata hai mujhe. Kal main khela toh tere liye bhi khelunga. Chai baad mein. 🤝",
            "when": {
              "charTrust": {
                "charId": "naman",
                "gte": 50
              }
            }
          },
          {
            "t": "cue",
            "who": "Naman",
            "avatar": "/avatars/naman.png",
            "text": "Board dekha? Tough number. Well… may the best kid win.",
            "when": {
              "charTrust": {
                "charId": "naman",
                "lt": 35
              }
            }
          },
          {
            "t": "nar",
            "big": true,
            "text": "64 score nahi, wapsi ka darwaza hai — stand tumhe jaanta hai, sheet abhi nahi. Aaj raat kaunsa khel khelte ho?"
          }
        ],
        "choices": [
          {
            "t": "Naman ke saath prep — usko kal jitao",
            "s": "Tumhara sim, uska match. Plan 1, sapne 2.",
            "deltas": {
              "form": 2
            },
            "relationshipDeltas": {
              "naman": 4,
              "hardik": 3,
              "tilak": 2
            },
            "dm": [
              {
                "char": "naman",
                "text": "Bro. Tu bench pe hai aur mere liye throw-downs kara raha hai. Yeh main kabhi nahi bhoolunga."
              },
              {
                "char": "naman",
                "text": "Le, return gift — unka death bowler: 19th over pehli 3 gendein wide yorker, third man upar. Charge mat karna uspe. Kabhi."
              },
              {
                "char": "naman",
                "text": "Aur slower ball tabhi aati hai jab tu crease chhodta hai. Tere sim mein bhi yahi plan aayega — Mahela wahi feed karta hai machine mein. 64 tera hai. 🤝"
              }
            ]
          },
          {
            "t": "Politics — bahar se pressure banao",
            "s": "Sheet nahi sunti? Public sunti hai. Apne numbers press ko do.",
            "deltas": {
              "fame": 3
            },
            "relationshipDeltas": {
              "naman": -4,
              "hardik": -3,
              "mahela": -2
            },
            "flagDeltas": {
              "briefedPress": 1
            },
            "post": [
              {
                "source": "account",
                "name": "Cricketroom India",
                "handle": "cricketroom_india",
                "avatarText": "C",
                "label": "Cricketroom India · analysis",
                "caption": "SOURCES: MI ke bench pe baitha young batter {name} 'internal numbers' mein squad ke kai naamon se aage hai — humein woh sheet mili hai. Sawaal jo camp ke andar se aa raha hai: Eliminator jaise match mein form sheet kab tak sentiment se haarti rahegi?",
                "reactions": [
                  {
                    "char": "naman",
                    "text": "Kal ka match hai. Aaj ki headline nahi. 🙂"
                  },
                  {
                    "char": "__fan",
                    "name": "paltanpulse",
                    "text": "eliminator se ek raat pehle yeh story? timing bahut loud hai 🤨"
                  },
                  {
                    "char": "__fan",
                    "name": "memeovers",
                    "text": "bench se press briefing — multitasking king 💀"
                  }
                ],
                "imageUrl": "/generated/cricket-posts/cr-s2-cricketroom.png"
              },
              {
                "source": "account",
                "name": "Future XI",
                "handle": "futurexi",
                "avatarText": "F",
                "label": "Future XI · prospects",
                "caption": "POLL 🗳️ SHOULD MI RECALL THE KID FOR THE ELIMINATOR? {name} vs current XI — 19,204 votes. Comments open. Selectors bhi scroll karte hain. 👀",
                "comments": [
                  {
                    "text": "Naman ko khelne do — aur jo bhi khele, MI jeete. 💙",
                    "deltas": {},
                    "relationshipDeltas": {
                      "naman": 3,
                      "hardik": 2
                    },
                    "toast": "Team-first comment. Naman ne screenshot save kiya. Room ne notice kiya."
                  },
                  {
                    "text": "Yeh call coaches ka hai. Kal dekhte hain.",
                    "deltas": {},
                    "toast": "Neutral. Safe. Kisi ne notice nahi kiya."
                  },
                  {
                    "text": "Recall karo, numbers jhooth nahi bolte. 📊",
                    "deltas": {
                      "fame": 2
                    },
                    "relationshipDeltas": {
                      "naman": -2,
                      "hardik": -1
                    },
                    "toast": "Apne hi recall ki campaign. Fans ne pump kiya. Dressing room ne bhi dekha."
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CR2-S13",
    "day": 10,
    "slot": "Night",
    "tag": "⚡ ELIMINATOR · NIGHT",
    "title": "Aakhri Gend Tak",
    "body": [
      "Eliminator. Chase 168 — 11th over mein wicket girta hai aur dugout ka ishara tumhara hai. 2 over baad board simple: 52 chahiye, 30 gendein. Aur stand mein selectors baithe hain."
    ],
    "q": "52 off 30. Kaise le jaate ho?",
    "reader": [
      {
        "t": "nar",
        "text": "Eliminator. Wankhede full — 33,000 khade. Chase 168, MI 89/4 — ishara tumhara. Unka wide-yorker specialist 2 over bachaye baitha hai."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s13-eliminator.png",
        "h": 210
      },
      {
        "t": "nar",
        "text": "2 hafte bench, ek whiteboard ka number — ab yeh walk. Recall 22 gaz pe hota hai. Crowd ko yaad hai tum kaun ho.",
        "when": {
          "flag": {
            "key": "recalled",
            "gte": 1
          }
        }
      },
      {
        "t": "nar",
        "text": "Toss pe Hardik ne camera pe bola tha: \"Kid khelega. Mera call.\" Uska word ab tumhare bat mein hai.",
        "when": {
          "lifeline": true
        }
      },
      {
        "t": "cue",
        "who": "Naman",
        "avatar": "/avatars/naman.png",
        "text": "(rope se, drinks leke) WIDE YORKER! Pehli 3! Ruk ke khel — deep point khula hai!",
        "when": {
          "charTrust": {
            "charId": "naman",
            "gte": 50
          }
        }
      },
      {
        "t": "nar",
        "text": "Rohit ne bola tha: \"dono chalega, par decide kar.\" Tumne apna tareeka chuna — aaj uska exam 33,000 ke saamne hai.",
        "when": {
          "flag": {
            "key": "ownMethod",
            "gte": 1
          }
        }
      },
      {
        "t": "nar",
        "big": true,
        "text": "52 off 30 — poora season, selectors stand mein, India ki list 3 din mein. Hardik ki aankh: hum yahan se jeet rahe hain, sawaal ek — kaise?"
      }
    ],
    "choices": [
      {
        "t": "Deep le jao — calculated",
        "s": "Matchups khelo. Boring gend ko izzat, buri gend ko saza. Aakhri gend tak.",
        "deltas": {
          "form": 3
        },
        "relationshipDeltas": {
          "hardik": 4,
          "rohit": 2
        },
        "runWrite": "clutch",
        "outcomeGate": {
          "metric": "form",
          "threshold": 58,
          "assists": [
            {
              "charId": "naman",
              "min": 50,
              "thresholdDelta": -4
            },
            {
              "charId": "bumrah",
              "min": 36,
              "thresholdDelta": -2
            }
          ],
          "pass": {
            "title": "ELIMINATOR JEET LIYA",
            "note": "Aakhri over, 8 chahiye. Wide yorker aayi — wahi jo plan mein likhi thi. Third man upar tha, deep point khula. Tum ruke, khela, 2nd gend pe boundary. 61 not out. Wankhede ka shor abhi tak kaano mein hai.",
            "post": {
              "source": "account",
              "name": "MI Paltan",
              "handle": "mipaltan",
              "avatarText": "MI",
              "label": "MI Paltan · just now",
              "surface": "scorecard",
              "caption": "ELIMINATOR ✅ MI 169/5 (19.4). {name} 61* — 16 saal ka ladka aakhri gend tak khada raha. Season zinda hai. 💙 #OneFamily",
              "reactions": [
                {
                  "char": "hardik",
                  "text": "Maine bola tha hum yahan se jeet rahe hain. Kid ne 'kaise' ka answer de diya."
                },
                {
                  "char": "rohit",
                  "text": "Tempo. Wahi jo hum dhoondh rahe the."
                },
                {
                  "char": "__fan",
                  "name": "paltanpulse",
                  "text": "16 SAAL. ELIMINATOR. 61 NOT OUT. main ro raha hoon 😭💙"
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s25-pass.png"
            }
          },
          "fail": {
            "title": "Ladai Sahi Thi",
            "note": "Tum lade — sahi tareeke se. Phir ek slower ball ne dhoka diya, long-on pe catch. MI 9 run se haar gayi. Dressing room mein koi tumhari taraf nahi dekhta. Sirf Hardik dekhta hai.",
            "dm": [
              {
                "char": "hardik",
                "text": "Out hona galti nahi thi. Jis tareeke se khela, woh sahi tha. Main yaad rakhunga — aur selectors bhi."
              },
              {
                "char": "hardik",
                "text": "Sar upar. Season khatam hua hai. Story nahi."
              }
            ]
          }
        }
      },
      {
        "t": "Counter-attack — abhi maaro",
        "s": "Pressure ulta karo. 2 over mein match unke haath se cheen lo.",
        "deltas": {
          "form": 2,
          "fame": 3
        },
        "relationshipDeltas": {
          "surya": 3,
          "hardik": 2
        },
        "runWrite": "clutch",
        "outcomeGate": {
          "metric": "form",
          "threshold": 58,
          "assists": [
            {
              "charId": "naman",
              "min": 50,
              "thresholdDelta": -4
            },
            {
              "charId": "bumrah",
              "min": 36,
              "thresholdDelta": -2
            }
          ],
          "pass": {
            "title": "WANKHEDE PAGAL HO GAYA",
            "note": "Tumne 17th over ko 19 runs ka bana diya. 54 off 26 — chase 12 gendein pehle khatam. SKY dugout ki railing pe khada tha, hans raha tha, sar hila raha tha. Selectors ke pen chal rahe the.",
            "post": {
              "source": "account",
              "name": "MI Paltan",
              "handle": "mipaltan",
              "avatarText": "MI",
              "label": "MI Paltan · just now",
              "surface": "scorecard",
              "caption": "ELIMINATOR ✅ 12 balls to spare! {name} 54 (26) — fearless, ruthless, SIXTEEN. Wankhede has a new heartbeat. 💙",
              "reactions": [
                {
                  "char": "surya",
                  "text": "Field dekha, phir pagal bana. Ab yeh officially mera student hai. 😄"
                },
                {
                  "char": "hardik",
                  "text": "Fearless with a plan. Yehi chahiye tha."
                },
                {
                  "char": "__fan",
                  "name": "futurexi",
                  "text": "that counter-attack just walked into every India selection meeting."
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s26-pass-mipaltan.png"
            }
          },
          "fail": {
            "title": "Ek Shot Zyada",
            "note": "3rd gend pe hi wide yorker ko charge kar diya. Third man upar tha — sab jaante the. Top edge, keeper ke haath. Chase wahin toot gaya. Walk back mein 33,000 log chup the.",
            "dm": [
              {
                "char": "hardik",
                "text": "Plan tha. Tune apna plan khela."
              },
              {
                "char": "hardik",
                "text": "Talent pe kabhi shak nahi tha. Decision pe aaj bhi hai. Yeh gap band kar — warna koi aur karega."
              }
            ]
          }
        }
      }
    ],
    "feedReaction": {
      "A": {
        "char": "rohit",
        "caption": "Pressure mein soch dikhti hai, score nahi. Aaj Wankhede ne dono dekhe."
      },
      "B": {
        "char": "surya",
        "caption": "Wankhede nights >>> everything. Aaj ka match bahut time tak yaad rahega. 😄💙"
      }
    },
    "variants": [
      {
        "when": {
          "benched": true
        },
        "title": "Last Chance Dugout",
        "tag": "⚡ ELIMINATOR · DUGOUT",
        "q": "Captain ne bench se plan maanga hai. Kya dete ho?",
        "reader": [
          {
            "t": "nar",
            "text": "Eliminator. Tum khel nahi rahe — bib pehne, rope pe paani leke bhaagte hue. Crowd XI ke naam chilla raha hai. Tumhara nahi."
          },
          {
            "t": "img",
            "src": "/generated/cricket-posts/cr2-s13-benched.png",
            "h": 210
          },
          {
            "t": "nar",
            "text": "Defense: unhe 24 chahiye, 17 gendein, 5 wicket baaki. Time-out — Hardik huddle se nikalta hai, seedha bench ki taraf. Tumhari taraf."
          },
          {
            "t": "cue",
            "who": "Hardik",
            "avatar": "/avatars/hardik.png",
            "text": "Data walon ka ho gaya. Ab tu bol — tune inke batters ko poora season net se dekha hai. Death overs kaise rokein? Jaldi."
          },
          {
            "t": "nar",
            "text": "Trade rumor ke baad captain ne tumse shayad 10 shabd bole hain. Yeh 11th sawaal ek darwaza hai.",
            "when": {
              "flag": {
                "key": "tradeNoise",
                "gte": 1
              }
            }
          },
          {
            "t": "nar",
            "big": true,
            "text": "Aaj bat nahi bolega. Mahela likhne ko taiyaar, broadcast camera bench pe — cricket dimaag 30 second mein bolega, ya hamesha ke liye chup?"
          }
        ],
        "choices": [
          {
            "t": "Plan do — data aur guts",
            "s": "Unka set batter slower ball nahi khelta, square boundary chhota hai — sab bol do. Bina hichkichaye.",
            "deltas": {
              "form": 1
            },
            "relationshipDeltas": {
              "hardik": 4,
              "mahela": 3
            },
            "flagDeltas": {
              "benchImpact": 1
            },
            "dm": [
              {
                "char": "hardik",
                "text": "Scenes!! Jeet gaye. Aur woh 19th over ka field change — deep point andar, third man upar — woh tera call tha."
              },
              {
                "char": "hardik",
                "text": "Tune aaj bench se match jitaya. Main aisi cheezein nahi bhoolta. Selectors ko bhi maine yehi bola."
              },
              {
                "char": "hardik",
                "text": "Kal recovery. Parso baat karte hain. Good night, match-winner."
              }
            ]
          },
          {
            "t": "Camera dekh ke sulk",
            "s": "Jab zaroorat thi tab bench diya. Ab plan chahiye? Chup raho — chehra bol dega.",
            "deltas": {
              "fame": 1
            },
            "relationshipDeltas": {
              "hardik": -4
            },
            "post": {
              "source": "account",
              "name": "Meme Overs",
              "handle": "memeovers",
              "avatarText": "M",
              "label": "Meme Overs · cricket memes",
              "caption": "BROADCAST ne LIVE Eliminator mein MI ke young kid ka face pakad liya jab captain bench se plan maang raha tha 💀 bhai ne poora 'not my problem' expression de diya. Meme material for YEARS.",
              "reactions": [
                {
                  "char": "__fan",
                  "name": "paltanpulse",
                  "text": "yeh attitude? bench pe? eliminator mein?? bhai 😬"
                },
                {
                  "char": "tilak",
                  "text": "Context: bench tough hota hai. Par yeh… yeh tough se zyada tha."
                },
                {
                  "char": "__fan",
                  "name": "futurexi",
                  "text": "selectors watch body language too. just saying."
                }
              ],
              "imageUrl": "/generated/cricket-posts/cr-s13-surya.png"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "CR2-S14",
    "day": 11,
    "slot": "Evening",
    "tag": "⚡ THE VERDICT · EVENING",
    "title": "The Verdict",
    "body": [
      "Squad announcement — India A aur T20I list, 6 baje. Abhi 3:47 hai, phone pe 89 notifications, aur Hardik us kamre mein hai jahan list banti hai. 2 ghante. Kahan bitaoge?"
    ],
    "q": "6 baje list aati hai. Tab tak kahan ho?",
    "reader": [
      {
        "t": "nar",
        "text": "Day 11. India A aur T20I list — 6 baje. Abhi 3:47, phone pe 89 notifications. Hardik us kamre mein hai jahan list banti hai."
      },
      {
        "t": "img",
        "src": "/generated/cricket-posts/cr2-s14-verdict.png",
        "h": 210
      },
      {
        "t": "nar",
        "text": "Kal ka knock har highlight package mein hai. 'ELIMINATOR' ab tumhare naam se chipak gaya hai.",
        "when": {
          "gate": {
            "sitId": "CR2-S13",
            "is": "pass"
          }
        }
      },
      {
        "t": "nar",
        "text": "Kal ki haar abhi seene mein hai. Par selectors haar mein bhi ladai dekhte hain. Shayad.",
        "when": {
          "gate": {
            "sitId": "CR2-S13",
            "is": "fail"
          }
        }
      },
      {
        "t": "cue",
        "who": "Coach Sir",
        "avatar": "/avatars/coach.png",
        "text": "Beta. 11 saal ka tha tu jab bola tha — yeh din aayega. Din aa gaya. Baaki formality hai.",
        "when": {
          "charTrust": {
            "charId": "coach",
            "gte": 80
          }
        }
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "benchImpact",
            "gte": 1
          }
        },
        "text": "Kal bat se nahi, dimaag se match jitaya. Aaj pata chalega selectors ne broadcast pe kya dekha — bib, ya brain."
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "briefedPress",
            "gte": 1
          }
        },
        "text": "Aur woh 'sources' wali story? Dressing room shayad bhool jaye. Selection room kabhi nahi bhoolta."
      },
      {
        "t": "nar",
        "when": {
          "flag": {
            "key": "tradeNoise",
            "gte": 1
          }
        },
        "text": "1 purani cheez list ke saath travel karti hai — woh trade rumor. Selectors ne woh bhi padha tha."
      },
      {
        "t": "cue",
        "who": "Maddy",
        "avatar": "/avatars/friend.png",
        "when": {
          "charTrust": {
            "charId": "friend",
            "gte": 60
          }
        },
        "text": "BRO. 6 BAJE. 3 YouTube channels khole hain aur 1 astrology stream. MAIN nervous hoon aur main list mein bhi nahi 😭"
      },
      {
        "t": "cue",
        "who": "Rohit",
        "avatar": "/avatars/rohit.png",
        "when": {
          "charTrust": {
            "charId": "rohit",
            "gte": 48
          }
        },
        "text": "List se pehle 1 baat. Jo is season seekha, woh kisi list mein nahi aata. Woh tere paas reh gaya."
      },
      {
        "t": "nar",
        "big": true,
        "text": "2 ghante, 1 list — 16 saal ka sabse lamba intezaar. Kahan bitaoge?"
      }
    ],
    "choices": [
      {
        "t": "Phone off — Coach ke academy jao",
        "s": "Jahan se shuru hua tha, wahin khatam suno. Cement wicket, purana net.",
        "deltas": {},
        "relationshipDeltas": {
          "coach": 3,
          "hardik": 1
        },
        "flagDeltas": {
          "homeGrounding": 1
        },
        "dm": [
          {
            "char": "coach",
            "text": "Aa gaya? Pad pehen. Phone mere pocket mein rahega — 6 baje tak sirf throwdowns. Jaise gyaarah saal ki umar mein."
          },
          {
            "char": "coach",
            "text": "Yaad hai pehli season ball? Ro raha tha tu. Maine bola tha — dard bhool jaana, darr kabhi nahi. Tune nahi bhoolne diya. Jo bhi aaj ho, yeh baat kisi list se badi hai."
          },
          {
            "char": "coach",
            "text": "…Ruk. Tera phone mere pocket mein baj raha hai. 5:58. Unknown number — Mumbai code. …Beta. Utha le."
          }
        ]
      },
      {
        "t": "Live tracker + statement ready",
        "s": "History live dekho. Aur pehla shabd tumhara ho — jo bhi ho.",
        "deltas": {
          "fame": 2
        },
        "relationshipDeltas": {
          "hardik": -1
        },
        "flagDeltas": {
          "hypeRisk": 1
        },
        "postTag": "THE VERDICT",
        "postWhy": "6 baje list aati hai. Jo bhi ho — pehla shabd tumhara hona chahiye, kisi headline ka nahi. {followers} followers refresh maar rahe hain. Statement likho.",
        "post": {
          "source": "player",
          "caption": "Jo bhi 6 baje ho — yeh season maine kamaaya hai, maanga nahi. Mumbai ne mujhe khareeda tha. Ab cricket decide karega usne kya paaya. 💙 #TheVerdict",
          "reactions": [
            {
              "char": "__fan",
              "name": "paltanpulse",
              "text": "6:00:01 pe hum sab yahin milenge. WHATEVER HAPPENS 💙"
            },
            {
              "char": "__fan",
              "name": "futurexi",
              "text": "list loading… is kid ka naam har shortlist mein tha. ab dekhte hain committee ne kya dekha."
            },
            {
              "char": "rohit",
              "text": "Statement se pehle career hota hai. Dono abhi lambe hain."
            }
          ],
          "imageUrl": "/generated/cricket-posts/cr-s11-player.png"
        }
      }
    ],
    "feedReaction": {
      "A": {
        "char": "friend",
        "caption": "Bro ne verdict day pe phone OFF karke academy chala gaya. Main uski jagah stress le raha hoon. Update: astrology stream keh raha hai 'strong Jupiter'. 🙏"
      },
      "B": {
        "char": "coach",
        "caption": "Aaj ke din bhi post pehle aayi, call baad mein. Zamana badal gaya. Number wahi hai beta — jab list aa jaaye."
      }
    }
  }
]

// Ending resolver for cricket world
// resolveCricketEnding moved to lib/cricket-rules.ts (pure rule, kept out of the
// content module so this file stays out of the client bundle).

export const CRICKET_ENDING_DATA = {
  indiaCall:    { arc: 'The Call-Up',              sub: 'Unknown number. Phir Hardik ka on-record line: "Maine naam diya. Baaki tune khud likha." T20I squad — runs BHI the, room BHI tumhara tha.', color: '#3DD6C8' },
  captainsBet:  { arc: 'Captain\'s Bet',           sub: 'India A tour — captain ki staked pick. "Numbers abhi aadhe hain. Par main poora hoon." Ab yeh bharosa kamana nahi, nibhaana hai.',          color: '#FFB020' },
  statsMachine: { arc: 'Stats Machine, Cold Room', sub: 'India A — numbers ne darwaza khola jo kisi ne tumhare liye nahi khola. Corridor khaali tha. Sirf Bumrah ne nod kiya. Scorecard ne argue kiya, kyunki koi aur nahi karta tha.', color: '#FF5C3A' },
  notYet:       { arc: 'Not Yet',                  sub: 'List aayi. Naam nahi aaya. Koi call nahi. Par 16 saal mein "not yet" ka matlab "never" nahi hota — yeh story khatam nahi hui, bas abhi nahi hui.', color: '#8a4ab0' },
}

// DM hooks for cricket characters
export const CRICKET_DM_HOOKS: Partial<Record<import('./types').CharId, string>> = {
  naman:  'Ek slot, do log. Weird hai na? Anyway — nets kal saath karein?',
  mahela: 'Selection is a sheet of numbers and one question: can I trust the role? Keep both in order.',
  hardik: 'Role ke baare mein baat karni thi. Practice ke baad milte hain.',
  rohit:  'Dekh raha hoon tujhe. Kuch poochh agar kuch samajh nahi aa raha.',
  surya:  'Aye champion! Settle ho gaya thoda? First week tough hota hai.',
  bumrah: 'One technical note from today.',
  tilak:  'Good session. Ek cheez poochhni thi.',
  coach:  'Beta call kar jab free ho. Urgent nahi, important hai.',
  friend: 'BRO PICK UP THE PHONE. I have 47 things to tell you.',
}

// Seed DM mock replies for cricket characters
export const CRICKET_DM_MOCK: Partial<Record<import('./types').CharId, string[]>> = {
  hardik: ['Role pe focus rakh.', 'Execution pe dhyaan.', 'Team first. Always.'],
  rohit:  ['Sahi ja raha hai.', 'Kal baat karte hain.', 'Dekh raha hoon.'],
  surya:  ['Aye, kya scene hai? 😄', 'Kal nets mein aa, kuch dikhata hoon.', 'Energy mast hai bhai.'],
  bumrah: ['Still late on the slower one.', 'Better.', 'Watch the wrist.'],
  tilak:  ['Good session.', 'Trust build karo. Time lagega.', 'Process pe raho.'],
  coach:  ['Video bhej.', 'Kal subah 6 baje. Throwdowns.', 'Sahi chal raha hai. Chalo.'],
  friend: ['BROOOO 😭', 'I showed everyone. You\'re famous now. Terrifying.', 'Reply karta reh please.'],
}
