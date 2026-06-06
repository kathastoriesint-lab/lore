import type { Character, Situation, CharId } from './types'

export const CHARS: Record<string, Character> = {
  ria:    { id:'ria',    name:'Ria',    handle:'riaofficial',   cls:'c-ria',    init:'R', fame:85, role:'Luxury lifestyle · 24 · Archrival' },
  kabir:  { id:'kabir',  name:'Kabir',  handle:'kabirlol',      cls:'c-kabir',  init:'K', fame:55, role:'Comedy · 26 · Your Ally / Crush' },
  ananya: { id:'ananya', name:'Ananya', handle:'ananya.creates', cls:'c-ananya', init:'A', fame:15, role:'Dance · 23 · Your Crush / Ally' },
  dev:    { id:'dev',    name:'Dev',    handle:'devlifts',      cls:'c-dev',    init:'D', fame:30, role:'Fitness · 27 · Wild Card' },
  zoya:   { id:'zoya',   name:'Zoya',   handle:'zoya.creates',  cls:'c-zoya',   init:'Z', fame:50, role:'Beauty · 24 · The Schemer' },
}

export const NARR_LINES = [
  { text:'Creator House.', cls:'narr-h' },
  { text:'6 creators. Ek villa. 10 din.', cls:'narr-p' },
  { text:'Tum sabse naye ho. Koi tumhe nahi jaanta — abhi.', cls:'narr-p dim' },
]

export const NARR_CHARS: [CharId, string][] = [
  ['ria',    'Luxury. Lifestyle. Untouchable.\nSab kuch curated hai. Woh jaanti hai.'],
  ['kabir',  'Sabka dost. Kisi ka nahi.\nDrama woh banata hai. Record bhi wahi karta hai.'],
  ['ananya', 'The viral dancer. 23 saal ki.\nSirf "cute dance girl" nahi banana — par ye log sunenge?'],
  ['dev',    'Fitness. Brand deals. Grindset.\nLoyalty for sale — jo zyada de.'],
  ['zoya',   'On-camera: sweet. Off-camera? Seedha kaat dungi.'],
]

export const SITUATIONS: Situation[] = [
  // ── DAY 1 ──────────────────────────────────────────────────────────────────
  {
    id:'D1-1', day:1, slot:'Morning', tag:'⚡ DAY 1 · MORNING',
    title:'Pehla Kadam',
    body:[
      'Villa ka gate khulta hai. Ek badi, khubsoorat haveli. Andar se music aa raha hai, ring lights jal rahi hain. Tumhare paas ek chance hai — pehla impression.',
      'Kabir aur Ananya pehle se andar hain. Ria sofa pe baithi hai, sunglasses lagaye, phone pe busy. Yeh moment tumhara hai. Kaise karte ho enter?',
      'Sab dekh rahe hain.',
    ],
    react:{ char:'kabir', text:'Aye aye! Grand entry ke saath aana chahiye tha yaar. Abhi bhi time hai. 😭' },
    q:'Kaise enter karte ho Creator House mein?',
    choices:[
      {
        t:'Loud entry — sabka dhyan kheencho',
        s:'Confident, noisy, unforgettable.',
        deltas:{ fame:2, heat:-1, image:1 },
        caption:'Creator House mein aa gaye. Koi quietly nahi aata. 🔥 #Day1',
        reactions:[
          { char:'ria', text:'Interesting. Loud arrivals are either confidence or overcompensation. Filing away.' },
          { char:'kabir', text:'YESSS bhai ye karte hain 😭🔥 welcome to the house!' },
          { char:'__fan', name:'housewatch_india', text:'the energy on day 1 is DIFFERENT this time 👀' },
        ],
      },
      {
        t:'Quiet entry — observe first',
        s:'Let the house come to you.',
        deltas:{ fame:-1, heat:1, image:1 },
        caption:'Pehle observe karo, phir move karo. Is ghar mein sab kuch content hai. 👀 #Day1',
        reactions:[
          { char:'ria', text:'Smart. Woh dekh {p|raha/rahi} hai. Main bhi dekh rahi hoon.' },
          { char:'ananya', text:'Quiet one... interesting. 🥺 Main baat karungi.' },
          { char:'__fan', name:'creator.tea', text:'the strategic silence entry?? are they playing chess already??' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'Some people arrive. Some people enter. Day 1 ki baat hai. 👑' },
      B:{ char:'kabir', caption:'The quiet ones are always watching. Always. 👀 #CreatorHouse' },
    },
  },
  {
    id:'D1-2', day:1, slot:'Afternoon', tag:'⚡ DAY 1 · AFTERNOON',
    title:'Pehli Reel',
    body:[
      '{ally} tumhare paas {p|aata/aati} hai pehle hi afternoon mein. "Yaar, ek reel banaate hain — abhi, is golden light mein. Views guaranteed hain."',
      'Catch yeh hai: reel ka concept Ria ke ek popular format ka parody hai. Funny, viral — aur Ria ko clearly irritate karega.',
      'Tumhara {ally} ke saath yeh pehla real moment hai. Par Ria ka reaction? Unpredictable.',
    ],
    react:{ char:'kabir', text:'Yaar ek collab reel — abhi karte hain. Format simple hai, views pakke hain. Ria ke baare mein thoda fun. 😭' },
    q:'{ally} ke saath pehli reel karte ho?',
    choices:[
      {
        t:'Haan — Ria parody reel banao',
        s:'Viral reach + {ally} bond. Ria ka reaction baad mein dekhenge.',
        deltas:{ fame:2, heat:-2, image:-1 },
        caption:'Day 1, first collab, aur already trending? @kabirlol ke saath 🔥 #CreatorHouse',
        reactions:[
          { char:'ria', text:'I saw the reel. Noted. You made your loyalties clear fast.' },
          { char:'ananya', text:'Bold move Day 1... respect but also 😬' },
          { char:'__fan', name:'housewatch_india', text:'ria parody reel day ONE?? they are brave or stupid' },
        ],
      },
      {
        t:'Collab karo — par Ria angle skip karo',
        s:'Bond without burning bridges.',
        deltas:{ fame:-1, heat:1, image:1 },
        caption:'Day 1 vibes with @kabirlol — good energy only ✨ #CreatorHouse',
        reactions:[
          { char:'ria', text:'They collabed with Kabir but kept it clean. Interesting choice.' },
          { char:'kabir', text:'Fair enough yaar. Alag angle dhundhte hain 😭' },
          { char:'__fan', name:'creator.tea', text:'chose the collab but played it safe... building or scared?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'Imitation is not always flattery. Day 1. Just saying. 🤍' },
      B:{ char:'kabir', caption:'New collab energy 🔥 Day 1 aur already moving. #CreatorHouse' },
    },
  },
  {
    id:'D1-3', day:1, slot:'Evening', tag:'⚡ DAY 1 · EVENING',
    title:'Zoya Ki Chai',
    body:[
      'Shaam ko Zoya tumhare paas aati hai. Do chai ke cup. Muskaan. "Tum interesting lagte ho. Baaki sab so predictable hain."',
      'Woh tumhare baare mein puchhti hai — background, goals, Ria ke baare mein kya sochte ho. Sab kuch smooth hai. Too smooth.',
      'Zoya ki "friendship" — chance hai ya trap?',
    ],
    react:{ char:'zoya', text:'Chai? Main actually genuinely curious hoon tere baare mein. Is ghar mein sab mask lagate hain. 🫶' },
    q:'Zoya ki chai accept karte ho?',
    choices:[
      {
        t:'Khulke baat karo — trust karo usse',
        s:'Open up. Make a real connection.',
        deltas:{ fame:1, heat:1, image:-1 },
        caption:'Chai aur conversation — pehli raat ka sabse real moment. 🫶 #CreatorHouse',
        reactions:[
          { char:'zoya', text:'Perfect. Exactly what I needed to know. 💅' },
          { char:'kabir', text:'Tune Zoya pe trust kiya? Bhai... careful. 😭' },
          { char:'__fan', name:'creator.tea', text:'opened up to zoya on night 1?? this is either sweet or a mistake' },
        ],
      },
      {
        t:'Polite raho — guard up rakho',
        s:'Be warm but share nothing real.',
        deltas:{ fame:1, heat:-1, image:1 },
        caption:'Is ghar mein sabse important lesson: chai bhi PR hai. 👀 #Day1',
        reactions:[
          { char:'zoya', text:'Hmm. Guarded. Interesting. I\'ll find another way. 💅' },
          { char:'ria', text:'Smart. They didn\'t give Zoya anything Day 1. Note to self.' },
          { char:'__fan', name:'housewatch_india', text:'the polite deflection from zoya??  chess not checkers' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'zoya', caption:'Found my person in this house. You know who you are. 🫶 #CreatorHouse' },
      B:null,
    },
  },

  // ── DAY 2 ──────────────────────────────────────────────────────────────────
  {
    id:'D2-1', day:2, slot:'Morning', tag:'⚡ DAY 2 · MORNING',
    title:'Challenge Aa Gaya',
    body:[
      'Subah announcement: 48-hour brand challenge. Sab creators compete karenge — aur winner ko 8 lakh ka solo deal milega.',
      'Ria already planning kar rahi hai. {ally} tumhare paas {p|aata/aati} hai: "Saath karte hain ya solo?"',
      'Solo jaane se tumhara naam banta hai. Par {ally} ke saath jaane se chances better hote hain — aur bond bhi.',
    ],
    react:{ char:'kabir', text:'Yaar 8 lakh hai. Solo bada risk hai. Par tera naam bhi banana hai. Teri call. 😭' },
    q:'Challenge mein kaise jaate ho?',
    choices:[
      {
        t:'Solo — apna naam banao',
        s:'High risk, high reward. Ria ko beat karna hai.',
        deltas:{ fame:2, heat:-2, image:1 },
        caption:'8 lakh. Ek shot. Solo. Koi alliance nahi, koi share nahi. 🔥 #Challenge',
        reactions:[
          { char:'ria', text:'Solo play. Ambitious. Let\'s see if the content backs it up.' },
          { char:'kabir', text:'Bhai solo {p|gaya/gayi}?? Main dekh raha hoon. 😭' },
          { char:'__fan', name:'creator.tea', text:'solo challenge attempt against ria?? brave or bold??' },
        ],
      },
      {
        t:'{ally} ke saath team banao',
        s:'Better odds. Stronger content. {ally} bond deepens.',
        deltas:{ fame:-1, heat:1, image:1 },
        caption:'{ally} ke saath team — double the energy, double the content. 🤝 #Challenge',
        reactions:[
          { char:'ananya', text:'Team mein zyada fun hota hai honestly 🥺' },
          { char:'ria', text:'Playing it safe. Not what I expected from them.' },
          { char:'__fan', name:'housewatch_india', text:'smart teaming or scared of solo?? 👀' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'The challenge is live. May the best creator win. 👑 #Challenge' },
      B:{ char:'kabir', caption:'Team mode activated. Watch this space. 🔥 #CreatorHouse' },
    },
  },
  {
    id:'D2-2', day:2, slot:'Afternoon', tag:'⚡ DAY 2 · AFTERNOON',
    title:'Ria Ka Offer',
    body:[
      'Ria tumhe terrace pe bulati hai. Private. Woh directly bolti hai: "Main chahti hoon tum mere saath ho. Is ghar mein ek hi game hai — baaki sab sochte hain alag hain, par nahi hain."',
      '"Tum saath ho toh challenge mein bhi support karti hoon, aur baad mein bhi. Par tumhare aur {ally} ke beech woh closeness... usse control karna padega. Mujhe woh nahi chahiye."',
      'Ria ki alliance ka matlab hai — {ally} ko side karna. Real cost kya hai?',
    ],
    react:{ char:'ria', text:'Main offers ek baar karti hoon. Socho carefully. 🤍' },
    q:'Ria ka offer accept karte ho?',
    choices:[
      {
        t:'Ria ki alliance accept karo — {ally} ko side karo',
        s:'Power alliance. Maximum reach. Expensive loyalty.',
        deltas:{ fame:2, heat:-3, image:2 },
        caption:'Is ghar mein strategy hoti hai. Aur main apni strategy mein clear hoon. 🤍 #CreatorHouse',
        reactions:[
          { char:'kabir', text:'Tune... Ria ke saath? Theek hai. Main yaad rakhunga. 👀' },
          { char:'ria', text:'Good. This is going to be interesting. 🤍' },
          { char:'__fan', name:'housewatch_india', text:'THEY TOOK RIA\'S DEAL?? {ally} is going to find out 😭' },
        ],
      },
      {
        t:'Decline — {ally} ke saath raho',
        s:'Loyalty over power. Harder path, cleaner conscience.',
        deltas:{ fame:-1, heat:2, image:-1 },
        caption:'Kuch cheezein hain jo paise se nahi kharidi ja sakti. Loyalty unhi mein se ek hai. 🫶',
        reactions:[
          { char:'kabir', text:'Tu ne na bola? {p|Bhai/behen} seriously... 🥺 Main hoon na.' },
          { char:'ria', text:'Interesting. They said no. They\'ll regret it or I will.' },
          { char:'__fan', name:'creator.tea', text:'refused ria\'s alliance for {ally}?? real loyalty or naive??' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'Some people understand the game faster than others. 🤍 #CreatorHouse' },
      B:{ char:'kabir', caption:'Not everyone sells out for power. Real ones stay real. 💪 #CreatorHouse' },
    },
  },
  {
    id:'D2-3', day:2, slot:'Night', tag:'⚡ DAY 2 · NIGHT',
    title:'Dev, Camera Ke Bina',
    body:[
      'Raat ko Dev tumhe kitchen mein milta hai. Camera nahi hai. Woh usually jo confident, grindset persona dikhaata hai — woh nahi hai.',
      '"Main actually yahan hoon," woh kehta hai, "kyunki meri behen ki college fees ke liye paise chahiye. Baaki sab — brand deals, numbers — yeh sab uske liye hai."',
      'Yeh Dev ka original face hai. Kya tum yeh trust karte ho?',
    ],
    react:{ char:'dev', text:'Yaar tumse honestly baat ki. Kisi aur ko mat bolna please. 💪' },
    q:'Dev ki real story sunke kya karte ho?',
    choices:[
      {
        t:'Genuinely connect karo — support karo usse',
        s:'Real moment. Human connection.',
        deltas:{ fame:-1, heat:1, image:1 },
        caption:'Is ghar mein sab ke andar ek real story hai. Sirf dhundhni padti hai. 🫶',
        reactions:[
          { char:'dev', text:'...Main nahi sochta tha koi samjhega. Shukriya. 💪' },
          { char:'kabir', text:'Dev ne tujhse kuch share kiya? Interesting. Woh kisi se nahi karta. 👀' },
          { char:'__fan', name:'creator.tea', text:'the human moment with dev?? not what we expected from him' },
        ],
      },
      {
        t:'Polite raho — information store karo',
        s:'This could be useful later. Or it could be a manipulation.',
        deltas:{ fame:1, heat:-1, image:1 },
        caption:'Is ghar mein log sirf wahi dikhate hain jo dikhana chahte hain. 👀 #CreatorHouse',
        reactions:[
          { char:'dev', text:'Yeah. Smart. Fair enough.' },
          { char:'zoya', text:'Something happened in that kitchen. I can tell. 💅' },
          { char:'__fan', name:'housewatch_india', text:'what happened in the kitchen at 11pm?? 👀' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },
  {
    id:'D2-4', day:2, slot:'Late Night', tag:'⚡ DAY 2 · LATE NIGHT',
    title:'Ananya, Akeli',
    body:[
      '{crush} terrace pe {x|akela/akeli} {x|baitha/baithi} hai. Raat ke 1 baje. Phone neeche rakha hai. Koi performance nahi, koi camera nahi.',
      '"Main actually thak {x|gaya/gayi} hoon is ghar mein sirf ek cheez ki tarah treat hone se," woh {x|kehta/kehti} hai. "Sirf dance. Sirf numbers. Koi real baat nahi karta."',
      'Yeh {crush} ka sabse real moment hai. Sirf tumhare liye.',
    ],
    react:{ char:'ananya', text:'Sach mein sun {p|raha/rahi} ho? Main usually akele baat nahi {x|karta/karti}. 🥺' },
    q:'{crush} ke saath kya karte ho?',
    choices:[
      {
        t:'Ruko — genuinely sunno',
        s:'Be present. This is a real connection.',
        deltas:{ fame:-1, heat:2, image:1 },
        caption:'Kuch conversations hoti hain jo sirf real hoti hain. Yahi tha aaj raat. 🌙',
        reactions:[
          { char:'ananya', text:'Main khush hoon tune suna. Sach mein. 🥺' },
          { char:'ria', text:'Those two were on the terrace for an hour. Noted. 👀' },
          { char:'__fan', name:'creator.tea', text:'the midnight terrace moment with {crush}?? 🥺 okay i\'m rooting for this' },
        ],
      },
      {
        t:'Polite raho — jaldi finish karo',
        s:'Acknowledge but don\'t get attached. This is a game.',
        deltas:{ fame:-1, heat:1, image:1 },
        caption:'Real moments bhi hote hain is ghar mein. Par game bhi chalta hai. #Balance',
        reactions:[
          { char:'ananya', text:'Oh. Okay. Main samajh {x|gaya/gayi}. 🥺' },
          { char:'kabir', text:'Smart. Attachment in this house is a weakness. 👀' },
          { char:'__fan', name:'housewatch_india', text:'they kept it short with {crush}... keeping distance or strategy?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ananya', caption:'Sometimes you just need someone to actually listen. You know who you are. 🌙' },
      B:null,
    },
  },
  {
    id:'D2-5', day:2, slot:'Very Late', tag:'⚡ DAY 2 · 2 AM',
    title:'{ally} Ki Warning',
    body:[
      'Raat ke 2 baje. {ally} tumhare room mein {p|aata/aati} hai. Woh concerned {p|dikha/dikhi} {p|raha/rahi} hai.',
      '"Yaar, Zoya ne aaj teri kuch baatein Ria ko bata di. Main suna. Tu careful reh. Woh sweet nahi hai."',
      '{ally} tumhe protect kar {p|raha/rahi} hai. Par kya yeh genuine hai ya khud ki politics?',
    ],
    react:{ char:'kabir', text:'Main serious hoon. Zoya pe trust mat karna. Main galat bhi ho sakta hoon par... careful reh. 😭' },
    q:'{ally} ki warning ke baare mein kya sochte ho?',
    choices:[
      {
        t:'Trust karo — Zoya se door raho',
        s:'Take the warning seriously.',
        deltas:{ fame:-1, heat:1, image:1 },
        caption:'Is ghar mein kuch log jo dikhte hain woh hote nahi. Lesson learned. 👀',
        reactions:[
          { char:'zoya', text:'They\'ve been avoiding me today. Interesting. 💅' },
          { char:'kabir', text:'Good. I\'m serious about this. 😭' },
          { char:'__fan', name:'creator.tea', text:'shifted away from zoya after the warning?? drama incoming' },
        ],
      },
      {
        t:'Apna judgment use karo — neutral raho',
        s:'Don\'t let others decide your alliances.',
        deltas:{ fame:-1, heat:1, image:1 },
        caption:'Is ghar mein sab ke apne angles hain. Main apna judgment use {p|karunga/karungi}. 🎯',
        reactions:[
          { char:'kabir', text:'Theek hai. Par main ne bataya tha. 😭' },
          { char:'zoya', text:'Still coming to me. Smart. 💅' },
          { char:'__fan', name:'housewatch_india', text:'didn\'t take {ally}\'s warning about zoya?? bold choice' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  // ── DAY 3 ──────────────────────────────────────────────────────────────────
  {
    id:'D3-1', day:3, slot:'Morning', tag:'⚡ DAY 3 · MORNING',
    title:'Result Aa Gaya',
    body:[
      'Challenge results: tum second aaye — Ria se sirf 4% peeche. 8 lakh Ria ke paas gaya.',
      'Ria ka reaction? Ek cold smile. "{ally}" ka reaction? Genuine khushi tere liye.',
      'Tum haare nahi ho — par jeet bhi nahi. Is feeling ke saath kya karte ho?',
    ],
    react:{ char:'ria', text:'Second is first loser. Par honestly? 4% — that\'s interesting. 👀' },
    q:'Result ke baad kya karte ho?',
    choices:[
      {
        t:'Gracefully accept karo — quietly plan karo',
        s:'Don\'t show the sting. Save the fire for later.',
        deltas:{ fame:-1, heat:1, image:3 },
        caption:'Second aaj. First kal. Koi drama nahi, koi excuses nahi. 🎯 #CreatorHouse',
        reactions:[
          { char:'ria', text:'Graceful in loss. That\'s actually harder than winning. Respect.' },
          { char:'kabir', text:'Aye bhai! 4% se zyada important — tu ne dignity rakhi. 😭🔥' },
          { char:'__fan', name:'housewatch_india', text:'the graceful second place era?? actually love this' },
        ],
      },
      {
        t:'Publicly call out — yeh competition fair tha?',
        s:'Fight back. Make noise. Demand recognition.',
        deltas:{ fame:3, heat:-2, image:-1 },
        caption:'4%. Is ghar mein sab kuch transparent hona chahiye. #Questions #CreatorHouse',
        reactions:[
          { char:'ria', text:'They\'re questioning the results. Interesting play. Or desperation.' },
          { char:'zoya', text:'Ooh drama. I love it. 💅' },
          { char:'__fan', name:'creator.tea', text:'calling out the challenge results?? BOLD. or a mistake.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'Second place took it well. I\'ll give them that. 🤍 #CreatorHouse' },
      B:{ char:'kabir', caption:'Arey! When you\'re right, you\'re right. 4% is suspicious. 👀 #Challenge' },
    },
  },
  {
    id:'D3-2', day:3, slot:'Afternoon', tag:'⚡ DAY 3 · AFTERNOON',
    title:'Scramble',
    body:[
      'Pehla eviction vote kal hai. Aur Zoya ka naam sab ke moonh pe hai — par kuch logo ke paas tumhara naam bhi hai.',
      'Pre-vote scramble shuru ho gayi hai. Ria ek taraf conversations kar rahi hai. {ally} doosri taraf.',
      'Tum kaise position karte ho khud ko?',
    ],
    react:{ char:'zoya', text:'Main jaanti hoon mera naam aa raha hai. Tum mere saath ho na? Main teri zaroorat mein thi. 🫶' },
    q:'Pre-eviction mein kya karte ho?',
    choices:[
      {
        t:'Openly {ally} ke saath align karo',
        s:'Clear alliance. Everyone knows where you stand.',
        deltas:{ fame:2, heat:1, image:-2 },
        caption:'{ally} ke saath hoon. Is ghar mein clarity matters. 🤝 #CreatorHouse',
        reactions:[
          { char:'ria', text:'They picked a side publicly. That\'s either brave or naive.' },
          { char:'kabir', text:'Meri taraf {p|aaya/aayi}. Main protect karunga. 😭🔥' },
          { char:'__fan', name:'housewatch_india', text:'publicly aligned with {ally} before eviction?? bold move' },
        ],
      },
      {
        t:'Neutral raho — observe karo',
        s:'Don\'t show your hand. Watch who blinks first.',
        deltas:{ fame:-1, heat:1, image:2 },
        caption:'Is ghar mein sabse dangerous log woh hain jo chup rehte hain. 👀 #CreatorHouse',
        reactions:[
          { char:'zoya', text:'Smart. Staying neutral gives you power. 💅' },
          { char:'kabir', text:'Neutral {p|raha/rahi}? Theek hai... main dekh raha hoon. 👀' },
          { char:'__fan', name:'creator.tea', text:'playing neutral pre-eviction?? power move or fence-sitting?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'kabir', caption:'Real ones show up when it matters. You know who. 🔥 #Day3' },
      B:null,
    },
  },
  {
    id:'D3-3', day:3, slot:'Evening', tag:'⚡ DAY 3 · EVENING',
    title:'{ally} Ki Request',
    loyaltyChoice:'A',
    body:[
      '{ally} tumhare paas private mein {p|aata/aati} hai. "Yaar mujhe ek cheez chahiye. Vote ke time pe — publicly mere saath bol. Sirf ek baat. Ki tu mere saath hai."',
      '"Mujhe pata hai yeh tere liye risky hai. Par is ghar mein ek banda chahiye jo seedha khade rehe mere saath. Kya tu woh hai?"',
      'Yeh {ally} ki direct request hai. Loyalty ka pehla real test.',
    ],
    react:{ char:'kabir', text:'Main bas jaanna chahta hoon — tu mere saath hai? Real mein? 😭' },
    q:'{ally} ki public loyalty request — kya karte ho?',
    choices:[
      {
        t:'Haan — publicly {ally} ke saath khade raho',
        s:'Real loyalty. Real risk. Real friendship.',
        deltas:{ fame:1, heat:2, image:-2 },
        caption:'{ally} ke saath hoon — publicly, clearly. Is ghar mein yahi matters. 🤝 #Day3',
        reactions:[
          { char:'kabir', text:'...Main nahi bhoolega yeh. Sach mein. 😭🔥' },
          { char:'ria', text:'Public loyalty Day 3. They committed. File it.' },
          { char:'__fan', name:'housewatch_india', text:'publicly stood with {ally}?? loyalty era 🔥' },
        ],
      },
      {
        t:'Pyaar se decline karo — private mein support karo',
        s:'Be there, but not publicly. Manage both sides.',
        deltas:{ fame:1, heat:-2, image:2 },
        caption:'Real support nahi dikhti hamesha. Kahin se toh hoti hai. 🎯',
        reactions:[
          { char:'kabir', text:'Theek hai. Main samjha. 😔' },
          { char:'zoya', text:'Interesting choice. Keeping options open. Smart. 💅' },
          { char:'__fan', name:'creator.tea', text:'private support but not public?? calculating or cowardly?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'kabir', caption:'Is ghar mein kuch log hain jo words aur actions match karte hain. Rare. 🔥' },
      B:null,
    },
  },
  // [VOTE: Dev always evicted Day 3]

  // ── DAY 4 ──────────────────────────────────────────────────────────────────
  {
    id:'D4-1', day:4, slot:'Morning', tag:'⚡ DAY 4 · MORNING',
    title:'Khaali Kursi',
    body:[
      'Dev chala gaya. Subah villa mein ek ajeeb silence hai. Power vacuum real hai.',
      'Ria tumhare paas aati hai. "Ab yahan clearly do camp hain. Tum kahan ho?"',
      'Yeh ek test hai aur ek real question bhi. Tumhara jawaab is ghar ka baaki ka game decide karega.',
    ],
    react:{ char:'ria', text:'Simple question hai. Do camp. Tumhara side kaunsa hai? 🤍' },
    q:'Ria ko kya jawab dete ho?',
    choices:[
      {
        t:'Clearly Ria ke saath — openly bol do',
        s:'Declare the alliance. Accept the power dynamics.',
        deltas:{ fame:2, heat:-3, image:1 },
        caption:'Is ghar mein neutrality ek luxury hai jo afford nahi hoti. Main decide kar {p|chuka/chuki} hoon. 🎯',
        reactions:[
          { char:'ria', text:'Good. Now we can actually play. Welcome. 🤍' },
          { char:'kabir', text:'Oh. Oh okay. Noted. 😔👀' },
          { char:'__fan', name:'creator.tea', text:'declared for Ria day 4?? interesting timing post-Dev' },
        ],
      },
      {
        t:'Ambiguous raho — "main khud ke saath hoon"',
        s:'Power through mystery. Keep everyone guessing.',
        deltas:{ fame:1, heat:2, image:-1 },
        caption:'Is ghar mein sab expect karte hain tum choose karo. Main kab choose {p|karta/karti} hoon woh main decide {p|karta/karti} hoon. 👀',
        reactions:[
          { char:'ria', text:'Ambiguous. Either strategy or cowardice. I\'ll find out which.' },
          { char:'kabir', text:'Ha. Playing both sides. Thoda risky par... interesting. 😭' },
          { char:'__fan', name:'housewatch_india', text:'refused to pick a side day 4?? power move or dangerous game?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'Power vacuum after Dev. Time to see who plays chess and who plays checkers. 👑' },
      B:{ char:'kabir', caption:'Arey yaar. Post-Dev ghar mein sab recalibrate kar rahe hain. Watch this. 👀' },
    },
  },
  {
    id:'D4-2', day:4, slot:'Late Afternoon', tag:'⚡ DAY 4 · LATE AFTERNOON',
    title:'Ria, Public Mein',
    body:[
      'Group content shoot ke dauran, camera ke saamne, Ria ek "casual" comment deti hai: "Yahan sab ki apni niche hai. Kuch log — authentically small-town, jo bahut sweet hota hai — unhe apna lane figure out karna padta hai."',
      'Yeh clearly tumhare baare mein tha. Sab ne suna. Ananya ne tumhari taraf dekha. {ally} ki mutthi bandh ho gayi.',
      'Camera on hai. Tumhara response is shot ka hissa banega.',
    ],
    react:{ char:'kabir', text:'Ria ne publicly... yaar. Tum decide karo kya karna hai. Main hoon. 😭' },
    q:'Ria ke public shot ka kaise response dete ho?',
    choices:[
      {
        t:'Camera pe directly, confidently respond karo',
        s:'Own it. Flip it. Make it your moment.',
        deltas:{ fame:4, heat:-2, image:-3 },
        caption:'"Small-town authenticity" ko main compliment {p|leta/leti} hoon. Yahi meri superpower hai. 🔥 #CreatorHouse',
        reactions:[
          { char:'ria', text:'...Okay. Okay that was good. I didn\'t expect that. 🤍' },
          { char:'ananya', text:'YES. That\'s exactly what needed to be said 🔥🥺' },
          { char:'__fan', name:'housewatch_india', text:'THE CLAP BACK TO RIA ON CAMERA 😭🔥 ICONIC' },
        ],
      },
      {
        t:'Smile karo — baad mein address karo',
        s:'Don\'t give her the reaction she wants. Save it.',
        deltas:{ fame:-1, heat:1, image:3 },
        caption:'Silence bhi ek powerful answer hai. Kuch baatein baad bolni chahiye. 🎯',
        reactions:[
          { char:'ria', text:'They smiled. Either unbothered or plotting. Can\'t tell which is worse.' },
          { char:'kabir', text:'Ice cold. Main yahi chahta tha. 😭🔥' },
          { char:'__fan', name:'creator.tea', text:'the unbothered smile at ria\'s dig?? chessmaster mode' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'When someone takes your bait and turns it into something else. Respect. 👑 #CreatorHouse' },
      B:{ char:'kabir', caption:'The most dangerous person in a room is the one who doesn\'t react. 👀 #Day4' },
    },
  },
  {
    id:'D4-3', day:4, slot:'Night', tag:'⚡ DAY 4 · NIGHT',
    title:'{ally} Ki Video',
    loyaltyChoice:'A',
    body:[
      '{ally} ne ek mimicry video post ki hai — tumhari. Funny, accurate, aur 800k views already. Comments mein sab has rahe hain.',
      '{ally} tumhe text {p|karta/karti} hai: "Yaar sorry — thoda zyada ho gaya. Par content toh ban gaya na? 😭"',
      'Yeh ek real test hai. Kya {ally} ne limits cross ki?',
    ],
    react:{ char:'kabir', text:'Yaar actually funny tha na? Main seriously apologize karta hoon agar bura laga. 😭' },
    q:'{ally} ki mimicry video ke baad kya karte ho?',
    choices:[
      {
        t:'Let it go — publicly laugh karo',
        s:'Be secure enough to take the joke. Strengthen the bond.',
        deltas:{ fame:-1, heat:2, image:1 },
        caption:'@kabirlol ne meri mimicry ki aur honestly... accurate hai 😭 Love this person. #CreatorHouse',
        reactions:[
          { char:'kabir', text:'BHAI TU BEST HAI 😭🔥 seriously main frosted glass hoon' },
          { char:'ria', text:'They laughed it off. Either very secure or very strategic. Both impressive.' },
          { char:'__fan', name:'creator.tea', text:'laughed at their own mimicry?? confident and iconic 🔥' },
        ],
      },
      {
        t:'Privately tell karo — yeh okay nahi tha',
        s:'Set a boundary. Real friendships can handle honest conversations.',
        deltas:{ fame:2, heat:-3, image:1 },
        caption:'Is ghar mein boundaries bhi hoti hain. Real ones respect them. 🎯 #CreatorHouse',
        reactions:[
          { char:'kabir', text:'Main samjha. Seriously. I\'ll be more careful. 😔' },
          { char:'ananya', text:'Good for them for saying something. Kabir gets carried away. 🥺' },
          { char:'__fan', name:'housewatch_india', text:'set a private boundary with {ally}?? mature or crack forming?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'kabir', caption:'Found the one person in this house who can actually take a joke. Rare species. 😭🔥' },
      B:null,
    },
  },

  // ── DAY 5 ──────────────────────────────────────────────────────────────────
  {
    id:'D5-1', day:5, slot:'Morning', tag:'⚡ DAY 5 · MORNING',
    title:'35 Lakh Ka Sawaal',
    body:[
      'Ek brand manager DM karta hai. 35 lakh ka deal. Luxury fashion — Ria ka territory.',
      'Catch: deal Ria ki management ke through aata hai. Ria ko commission milega. Ya tum direct approach kar sakte ho — zyada money, zyada risk, Ria ke saath tension.',
      '35 lakh. Simple nahi hai yeh decision.',
    ],
    react:{ char:'ria', text:'Deal dekha? Main fair hoon — main commission ke baare mein transparent rahi. Teri call. 🤍' },
    q:'35 lakh deal kaise handle karte ho?',
    choices:[
      {
        t:'Ria ki management ke through jaao',
        s:'Less money but smooth. Relationship maintained.',
        deltas:{ fame:2, heat:-2, image:4 },
        caption:'Smart deals sometimes mean smart partners. Long game. 🤍 #CreatorHouse',
        reactions:[
          { char:'ria', text:'Good choice. This is how it\'s supposed to work. 🤍' },
          { char:'kabir', text:'Tune Ria ko commission diya?? Yaar... 😔' },
          { char:'__fan', name:'creator.tea', text:'went through ria for the deal?? giving or clever?' },
        ],
      },
      {
        t:'Direct approach karo — khud negotiate karo',
        s:'More money. More conflict. More autonomy.',
        deltas:{ fame:4, heat:1, image:-3 },
        caption:'35 lakh. Mera deal, meri terms, meri mehnat. Simple. 🔥 #CreatorHouse',
        reactions:[
          { char:'ria', text:'Direct play. Risky. But I respect the audacity. 👀' },
          { char:'kabir', text:'YESSS. Apna khud negotiate karo. 😭🔥' },
          { char:'__fan', name:'housewatch_india', text:'bypassed ria\'s management for the deal?? bold 💀' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'Some partnerships make sense. Business is business. 🤍 #CreatorHouse' },
      B:{ char:'kabir', caption:'The direct play! You love to see it. 🔥 #CreatorHouse' },
    },
  },
  {
    id:'D5-2', day:5, slot:'Afternoon', tag:'⚡ DAY 5 · AFTERNOON',
    title:'Zoya Jaanti Hai',
    body:[
      'Zoya "casually" mention karti hai ek cheez tumhare baare mein — kuch woh jo tumne sirf {ally} ko bataya tha. Exact words. Exact detail.',
      '"Oh, tujhe pata tha?" woh puchhti hai, muskurate hue.',
      '{ally} ne bataya? Ya Zoya ne koi aur tarika use kiya? Ek hi baat pakki hai — information leak ho gayi.',
    ],
    react:{ char:'zoya', text:'Oh tujhe surprise hua? Main toh sirf... roz baat hoti hai yahan. 💅' },
    q:'Zoya ki information ke baare mein kya karte ho?',
    choices:[
      {
        t:'{ally} ka saamna karo — seedha poochho',
        s:'If they betrayed you, you need to know. Now.',
        deltas:{ fame:3, heat:-4, image:-2 },
        caption:'Is ghar mein trust ek investment hai. Aur main ROI track {p|karta/karti} hoon. 👀 #CreatorHouse',
        reactions:[
          { char:'kabir', text:'{p|Bhai/behen} main ne nahi bataya. I promise. Zoya ne koi aur tarika use kiya. 😭' },
          { char:'zoya', text:'Ooh. Drama. This is what I was waiting for. 💅' },
          { char:'__fan', name:'housewatch_india', text:'confronted {ally} about the leak?? the tension 😭' },
        ],
      },
      {
        t:'Chup raho — observe karo kya hota hai',
        s:'Don\'t reveal what you know. Watch everyone\'s moves.',
        deltas:{ fame:-1, heat:1, image:2 },
        caption:'Is ghar mein jo zyada {p|jaanta/jaanti} hai woh zyada powerful {p|hota/hoti} hai. Mujhe pata hai. 🎯',
        reactions:[
          { char:'zoya', text:'They didn\'t react. Either they didn\'t care or... they know. 💅' },
          { char:'kabir', text:'Tu theek hai aaj? Kuch alag lag {p|raha/rahi} hai. 😭' },
          { char:'__fan', name:'creator.tea', text:'no reaction to zoya knowing private info?? playing 4D chess' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'kabir', caption:'Is ghar mein kuch aisa hua aaj. Main sunaunga. 😭 #Day5' },
      B:null,
    },
  },
  {
    id:'D5-3', day:5, slot:'Evening', tag:'⚡ DAY 5 · EVENING',
    title:'{crush} Ka Collab',
    body:[
      '{crush} tumhare paas {x|aata/aati} hai — nervous, careful. "Ek collab karna tha. Mujhe pata hai mere followers kam hain. Par mujhe lagta hai humari chemistry achi hai."',
      'Numbers mein — bad deal. Chemistry mein — amazing. {crush} genuinely excited hai.',
      'Numbers ya connection?',
    ],
    react:{ char:'ananya', text:'Koi pressure nahi hai. Main genuinely {x|chahta/chahti} hoon. Par sirf haan mein haan nahi chahiye. Sochna. 🥺' },
    q:'{crush} ke collab offer ka kya karte ho?',
    choices:[
      {
        t:'Haan — chemistry matters more',
        s:'Good content comes from genuine connection.',
        deltas:{ fame:1, heat:3, image:-2 },
        caption:'{crush} ke saath collab — numbers nahi, vibe dekhi. Yahi real content hota hai. 🌙 #CreatorHouse',
        reactions:[
          { char:'ananya', text:'Seriously. Thank you. Main itna excited hoon. 🥺🔥' },
          { char:'ria', text:'Interesting choice. Low reach collab. Either genuine or playing naive.' },
          { char:'__fan', name:'creator.tea', text:'collab with {crush} over higher numbers?? soft era 🥺' },
        ],
      },
      {
        t:'Politely decline — numbers matter',
        s:'This is a business. Kindly explain.',
        deltas:{ fame:1, heat:-2, image:2 },
        caption:'Is ghar mein sab decisions business decisions hain bhi. Par real rehna important hai. #Balance',
        reactions:[
          { char:'ananya', text:'...okay. Main samajh {x|gaya/gayi}. It\'s fine. 🥺' },
          { char:'kabir', text:'Smart numbers move. Par {crush} sad {x|tha/thi}. 😔' },
          { char:'__fan', name:'housewatch_india', text:'declined {crush}\'s collab for business reasons?? harsh or smart?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ananya', caption:'Found the person in this house who actually gets it. You know who you are. 🌙 #CreatorHouse' },
      B:null,
    },
  },
  {
    id:'D5-4', day:5, slot:'Night', tag:'⚡ DAY 5 · NIGHT',
    title:'{ally} Sach Bolta Hai',
    loyaltyChoice:'A',
    body:[
      '{ally} raat ko tumhare saath share {p|karta/karti} hai: career tanking tha. Last shot tha yeh show. Real confession.',
      '"Main sabse funny, most entertaining banna {p|chahta/chahti} hoon — par sach mein main sirf relevant rehna {p|chahta/chahti} hoon. Kya tujhe yeh jaanna tha? Shayad nahi. Par tu mera {p|banda/bandi} hai."',
      '{ally} ka real vulnerable self tumhare saamne hai.',
    ],
    react:{ char:'kabir', text:'Main usually yeh share nahi karta. Par tere saath honest rehna chahta hoon. 😭' },
    q:'{ally} ki real vulnerability ke baad kya karte ho?',
    choices:[
      {
        t:'Honestly respond karo — apni bhi share karo',
        s:'Meet vulnerability with vulnerability. Deepen the bond.',
        deltas:{ fame:-1, heat:3, image:1 },
        caption:'Jo log apna sach bolte hain woh brave hote hain. Aur hum brave log saath hain. 🫶 #Day5',
        reactions:[
          { char:'kabir', text:'{p|Bhai/behen}... main nahi sochta tha koi itna {p|samjhega/samjhegi}. 😭🔥' },
          { char:'ria', text:'What were they talking about for 2 hours? I need to know. 👀' },
          { char:'__fan', name:'creator.tea', text:'the mutual vulnerability moment with {ally}?? 🥺 this is a friendship' },
        ],
      },
      {
        t:'Support karo — apna mat batao',
        s:'Be there for them without sharing yourself.',
        deltas:{ fame:1, heat:-2, image:1 },
        caption:'Kuch log tumhare saath honest hote hain. Us trust ka saath dena important hai. 🤝',
        reactions:[
          { char:'kabir', text:'Tu ne suna. Woh kaafi hai. Shukriya. 😭' },
          { char:'zoya', text:'Something happened with {ally} tonight. They look... settled. 💅' },
          { char:'__fan', name:'housewatch_india', text:'supported {ally} without sharing back?? protecting themselves or genuine?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'kabir', caption:'Is ghar mein jo log apna sach bolte hain unke saath rehna chahiye. Woh rare hain. 😭🔥' },
      B:null,
    },
  },

  // ── DAY 6 ──────────────────────────────────────────────────────────────────
  {
    id:'D6-1', day:6, slot:'Morning', tag:'⚡ DAY 6 · MORNING',
    title:'Ria, Bina Mask',
    body:[
      'Subah 6 baje. Sirf tum aur Ria terrace pe ho. Coffee. Sunrise. Koi camera nahi.',
      'Ria — without the performance — shares something: "Main actually thak gayi hoon. Ek image ko maintain karna, hamesha, sab ke liye. Tum kabhi {p|thake/thaki} nahi {p|lagte/lagti}."',
      'Yeh Ria ka real face hai. Tumse zyada kisi aur ke saath nahi dikhaya.',
    ],
    react:{ char:'ria', text:'Yeh conversation — yahan rakhna. Please. 🤍' },
    q:'Real Ria ke saath kya karte ho?',
    choices:[
      {
        t:'Genuinely connect karo — vulnerable Ria ke saath raho',
        s:'This is real. Treat it as real.',
        deltas:{ fame:-1, heat:3, image:2 },
        caption:'Subah ki chai, sunrise, aur ek honest conversation. Is ghar mein yahi kaafi hai. 🌅',
        reactions:[
          { char:'ria', text:'...Thank you. Genuinely. 🤍' },
          { char:'kabir', text:'Tune Ria ke saath 1 hour terrace pe bitaya? Interesting. 👀' },
          { char:'__fan', name:'creator.tea', text:'the ria soft era on day 6?? who is she without the armor??' },
        ],
      },
      {
        t:'Sun lo — par guard rakho',
        s:'She\'s shown you something real. Don\'t forget she\'s still Ria.',
        deltas:{ fame:-1, heat:1, image:3 },
        caption:'Ek interesting subah. Log hamesha woh nahi hote jo lagte hain. Sirf hamesha nahi. 👀 #Day6',
        reactions:[
          { char:'ria', text:'They listened. But they kept their distance. Smart. And a little lonely.' },
          { char:'kabir', text:'Careful yaar. Real Ria phir bhi Ria hai. 😭' },
          { char:'__fan', name:'housewatch_india', text:'guarded around vulnerable ria?? trust issues or chess?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'Some mornings you just need someone to actually be there. 🌅 #Day6' },
      B:null,
    },
  },
  {
    id:'D6-2', day:6, slot:'Afternoon', tag:'⚡ DAY 6 · AFTERNOON',
    title:'Zoya Ka Hisaab',
    body:[
      'Zoya aur tumhara aakhri hisaab hona chahiye. Woh information leak, woh conversations — time aa gaya hai clarity ka.',
      'Ya — store kar lo. Day 7 eviction se pehle use karo. Iska timing matter karta hai.',
      'Confront abhi ya wait karo strategic moment ke liye?',
    ],
    react:{ char:'zoya', text:'Kuch baat karni thi? Main yahan hoon. 💅' },
    q:'Zoya ke saath kya karte ho?',
    choices:[
      {
        t:'Abhi confront karo — saaf karo',
        s:'Put it on the table. Clear the air.',
        deltas:{ fame:3, heat:-4, image:-2 },
        caption:'Is ghar mein kuch conversations honi chahiye thi. Ab ho rahi hain. 👀 #Day6',
        reactions:[
          { char:'zoya', text:'Oh. We\'re doing this. Fine. 💅' },
          { char:'kabir', text:'{p|BHAI/BEHEN} TU NE ZOYA KO CONFRONT KIYA 😭🔥 I\'m here for it' },
          { char:'__fan', name:'housewatch_india', text:'THE ZOYA CONFRONTATION DAY 6?? FINALLY 😭' },
        ],
      },
      {
        t:'Wait karo — day 7 ke liye save karo',
        s:'This is leverage. Don\'t use it yet.',
        deltas:{ fame:-1, heat:1, image:3 },
        caption:'Is ghar mein timing sab kuch hai. Abhi waqt nahi aaya. 🎯 #Day6',
        reactions:[
          { char:'zoya', text:'They didn\'t say anything. Either they know and they\'re waiting, or... 💅' },
          { char:'ria', text:'Something is brewing. I can feel it. 👀' },
          { char:'__fan', name:'creator.tea', text:'saving the zoya confrontation for later?? strategy is real' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'zoya', caption:'Honest conversations. Is ghar mein rare hain. Par hoti hain. 💅 #Day6' },
      B:null,
    },
  },
  {
    id:'D6-3', day:6, slot:'Night', tag:'⚡ DAY 6 · NIGHT',
    title:'{crush} Ka Sach',
    body:[
      '{crush} tumhare paas {x|aata/aati} hai raat ko. "{name}, main serious poochh {x|raha/rahi} hoon — is ghar mein tum kaun ho? Real wala. Game wala nahi."',
      'Yeh tumhare day 2 midnight conversation ka follow-up hai. {crush} genuinely jaanna {x|chahta/chahti} hai.',
      'Kya batate ho?',
    ],
    react:{ char:'ananya', text:'Main judge nahi {x|karunga/karungi}. Main sirf... jaanna {x|chahta/chahti} hoon. 🥺' },
    q:'{crush} ko real jawaab dete ho?',
    choices:[
      {
        t:'Seedha honest raho — real version batao',
        s:'Vulnerability for vulnerability. The real you.',
        deltas:{ fame:-2, heat:4, image:1 },
        caption:'{crush} ne poocha kaun hoon main real mein. Pehli baar kisi ne poocha. Woh sunna {x|chahta/chahti} {x|tha/thi}. 🌙',
        reactions:[
          { char:'ananya', text:'...Thank you for telling me that. Really. 🥺🤍' },
          { char:'ria', text:'Those two are getting close. Real close. 👀' },
          { char:'__fan', name:'creator.tea', text:'the late night real talk with {crush}?? 🥺 soft era 100%' },
        ],
      },
      {
        t:'Edited version — real but guarded',
        s:'Show them something real. Not everything.',
        deltas:{ fame:1, heat:-3, image:2 },
        caption:'Real toh hoon. Bas... sab ek saath nahi. Is ghar mein bhi nahi. 🎯 #Day6',
        reactions:[
          { char:'ananya', text:'...Okay. Theek hai. Main understand {x|karta/karti} hoon. Maybe someday. 🥺' },
          { char:'kabir', text:'Smart. Kuch cheezein apni rehni chahiye. 😭' },
          { char:'__fan', name:'housewatch_india', text:'guarded with {crush} even on night 6?? walls are real' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ananya', caption:'Is ghar mein ek aisa insaan mil gaya. You know who you are. 🌙 #Day6' },
      B:null,
    },
  },

  // ── DAY 7 ──────────────────────────────────────────────────────────────────
  {
    id:'D7-1', day:7, slot:'Morning', tag:'⚡ DAY 7 · MORNING',
    title:'Sab Saaf Ho Gaya',
    body:[
      'Day 7. Doosra eviction. {ally} darr {p|raha/rahi} hai — aur woh tum se {p|kehta/kehti} hai.',
      '"Mujhe nahi pata main {p|bachega/bachungi} ya nahi. Aur main scared hoon yaar. Sach mein."',
      'Tumhara {ally} real hai is moment mein. Tum kaise respond karte ho?',
    ],
    react:{ char:'kabir', text:'Main seriously scared hoon. Yeh ghar... yahan kuch bhi ho sakta hai. 😔' },
    q:'{ally} ke fear ke saath kya karte ho?',
    choices:[
      {
        t:'Assure karo — I\'ll fight for you',
        s:'Make a promise. Mean it.',
        deltas:{ fame:-1, heat:2, image:1 },
        caption:'{ally} ke liye hoon. Is ghar mein kuch log sirf hote hain. Main unhi mein se hoon. 🤝 #Day7',
        reactions:[
          { char:'kabir', text:'Shukriya. Seriously. 😭🔥' },
          { char:'ria', text:'They made a promise. Let\'s see if they keep it. 👀' },
          { char:'__fan', name:'creator.tea', text:'promised to fight for {ally} pre-eviction?? 🥺 better deliver' },
        ],
      },
      {
        t:'Honest raho — "main koshish {p|karunga/karungi}"',
        s:'Don\'t promise what you can\'t guarantee.',
        deltas:{ fame:1, heat:-2, image:2 },
        caption:'Promises is ghar mein currency hain. Main sirf woh waade {p|karta/karti} hoon jo nibha {p|sakta/sakti} hoon. 🎯',
        reactions:[
          { char:'kabir', text:'Honest. I appreciate it. 😔 Main samjha.' },
          { char:'ananya', text:'Real expectations setting. That\'s actually better than false hope. 🥺' },
          { char:'__fan', name:'housewatch_india', text:'honest about limits pre-eviction?? mature or cold?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'kabir', caption:'Is ghar mein kuch log hote hain jo actually show up. Rare. 🔥 #Day7' },
      B:null,
    },
  },
  {
    id:'D7-2', day:7, slot:'Evening', tag:'⚡ DAY 7 · EVENING',
    title:'{ally} Ya Zoya',
    body:[
      'Vote time. {ally} ya Zoya. House split hai. Ria tumhare paas aati hai: "Zoya ko vote karo. Main chahti hoon tum mere saath ho is mein."',
      '{ally} tumhe door se dekh {p|raha/rahi} hai. Aankhon mein sawaal hai.',
      'Yeh woh moment hai. {ally} ya Ria. Choose carefully.',
    ],
    react:{ char:'ria', text:'Simple choice hai. Jo zyada useful hai woh rakho. 🤍' },
    q:'Eviction vote — {ally} ya Zoya?',
    choices:[
      {
        t:'Zoya ko vote karo — Ria ke saath align karo',
        s:'{ally} stays. Ria pleased. But at what cost?',
        deltas:{ fame:-1, heat:3, image:-2 },
        caption:'Game mein decisions hote hain. Is ek ne sab kuch clear kar diya. 🎯 #Day7',
        reactions:[
          { char:'ria', text:'Good. Now we\'re working together. 🤍' },
          { char:'kabir', text:'...Shukriya. Main jaanta hoon yeh easy nahi tha. 😭' },
          { char:'__fan', name:'housewatch_india', text:'voted out zoya?? {ally} safe + ria happy = interesting dynamics ahead' },
        ],
      },
      {
        t:'{ally} ko vote karo — Ria ki baat sunne ke bawajood',
        s:'Ria loses trust. {ally} is shocked. Zoya stays.',
        deltas:{ fame:2, heat:-4, image:3 },
        caption:'Main apni call khud {p|karta/karti} hoon. Chahe jo bhi expect kare. 🎯 #Day7',
        reactions:[
          { char:'ria', text:'...You voted against my advice. Interesting. 👀' },
          { char:'kabir', text:'Wait... main gaya? 😔' },
          { char:'__fan', name:'creator.tea', text:'voted against ria\'s advice?? independent player confirmed' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'zoya', caption:'Is ghar ne mujhe sikhaya — sab kuch curated hota hai. 💅 #Day7' },
      B:{ char:'ria', caption:'Unexpected moves in this house. Always. 👑 #Day7' },
    },
  },
  // [VOTE: allyLoyalty>=2 → Zoya evicted, else Kabir evicted]

  // ── DAY 8 ──────────────────────────────────────────────────────────────────
  {
    id:'D8-1', day:8, slot:'Morning', tag:'⚡ DAY 8 · MORNING',
    title:'Jo Bach Gaya',
    body:[
      'Subah. Villa mein ek silence hai. Jo hona tha, hua.',
      'Agar {ally} bach {p|gaya/gayi} — tumhare dono ke beech ek naya level hai. Agar nahi — tum khud ke saath face to face ho.',
      'Aaj first move tumhara hai.',
    ],
    react:{ char:'ria', text:'Kal raat ke baad — is ghar mein sab change ho gaya. Tum dekh {p|rahe/rahi} ho? 🤍' },
    q:'Subah ka pehla move kya hai?',
    choices:[
      {
        t:'Sabse milne jao — active raho',
        s:'Don\'t let the dust settle without you being in the room.',
        deltas:{ fame:-1, heat:4, image:1 },
        caption:'Jo bhi kal hua — aaj naya din hai. Aur main yahan hoon. 🔥 #Day8',
        reactions:[
          { char:'ria', text:'Back in motion immediately. Respect. 🤍' },
          { char:'ananya', text:'They\'re moving fast. Good. Is ghar ko woh chahiye. 🥺' },
          { char:'__fan', name:'housewatch_india', text:'right back in the game day 8 morning?? not letting anything settle' },
        ],
      },
      {
        t:'Akele raho — process karo',
        s:'You need a moment. Take it.',
        deltas:{ fame:3, heat:-3, image:3 },
        caption:'Kuch din aisa hota hai ki bass process karna padta hai. Aaj woh din hai. 🌅 #Day8',
        reactions:[
          { char:'kabir', text:'They went quiet. Either processing or plotting. Both valid. 👀' },
          { char:'ananya', text:'Give them space. They\'ll be okay. 🥺' },
          { char:'__fan', name:'creator.tea', text:'taking a quiet morning after eviction?? emotional processing or strategy?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'Day 8. The house has fewer people but more intensity. 👑 #CreatorHouse' },
      B:{ char:'ananya', caption:'Some mornings you just need to breathe. And that\'s okay. 🌅 #Day8' },
    },
  },
  {
    id:'D8-2', day:8, slot:'Afternoon', tag:'⚡ DAY 8 · AFTERNOON',
    title:'{crush} Ka Move',
    body:[
      '{crush} ne ek post publish ki hai — inspired by your day 6 conversation. It\'s raw, honest, and different from anything they\'ve done before.',
      'Caption mein subtle reference hai tumhare baare mein. "Someone in this house reminded me that being real is braver than being perfect."',
      'Yeh {crush} ka public brave move hai — tumse inspired.',
    ],
    react:{ char:'ananya', text:'Tune jo kaha tha — woh mujhe yaad raha. Aur main {x|chahta/chahti} {x|tha/thi} sach mein woh show karna. 🥺' },
    q:'{crush} ki brave post pe kya karte ho?',
    choices:[
      {
        t:'Publicly support karo — comment/share karo',
        s:'Show up for them. Publicly.',
        deltas:{ fame:-2, heat:4, image:2 },
        caption:'{crush} ne kuch real kiya aaj. Is ghar mein real cheez rare hai. Aur main iske saath hoon. 🌙',
        reactions:[
          { char:'ananya', text:'TUMNE COMMENT KIYA?? 🥺🔥 main actually cry kar {x|raha/rahi} hoon' },
          { char:'ria', text:'Those two. Interesting. Very interesting. 👀' },
          { char:'__fan', name:'creator.tea', text:'PUBLICLY SUPPORTED {crush}\'S POST?? 🥺 okay this is a vibe' },
        ],
      },
      {
        t:'Private mein appreciate karo — public quiet raho',
        s:'DM them. Keep the moment between you two.',
        deltas:{ fame:-1, heat:2, image:3 },
        caption:'Kuch moments public nahi karne chahiye. Sirf real rehne chahiye. 🌙 #Day8',
        reactions:[
          { char:'ananya', text:'Got your DM. This is better than any comment. 🥺🌙' },
          { char:'kabir', text:'Private appreciation? Interesting choice. Very personal. 👀' },
          { char:'__fan', name:'housewatch_india', text:'kept {crush} appreciation private?? are they actually falling??' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ananya', caption:'This person. Is ghar mein sirf yeh ek hai. You know who you are. 🌙 #Day8' },
      B:{ char:'ananya', caption:'Kuch connections hain jo screen se baahar bhi rehte hain. 🌙 #CreatorHouse' },
    },
  },

  // ── DAY 9 ──────────────────────────────────────────────────────────────────
  {
    id:'D9-1', day:9, slot:'Morning', tag:'⚡ DAY 9 · MORNING',
    title:'Aakhri Subah',
    body:[
      'Finale kal hai. Ria terrace pe hai. Woh tumhe dekh ke muskurati hai — not the game smile. Real one.',
      '"Main actually respect karti hoon jo tum ne kiya yahan. Aur main yeh usually nahi kehti."',
      'Yeh Ria ka acknowledgment hai. Real. Kya karte ho is moment mein?',
    ],
    react:{ char:'ria', text:'Main genuinely bol rahi hoon. Aur tum {p|jaante/jaanti} ho main kisi ko bhi nahi kehti. 🤍' },
    q:'Ria ke genuine respect ke saath kya karte ho?',
    choices:[
      {
        t:'Warmly accept karo — return karo respect',
        s:'Two rivals who made each other better.',
        deltas:{ fame:-2, heat:3, image:3 },
        caption:'Ria se ek baat seekhi — real competitors respect karte hain. Mutual. 🤍 #Day9',
        reactions:[
          { char:'ria', text:'...Thank you. That actually means something. 🤍' },
          { char:'kabir', text:'Tumne Ria ko respect diya?? And she meant it?? Is ghar mein sab possible hai 😭' },
          { char:'__fan', name:'creator.tea', text:'the ria respect moment day 9?? character arcs are REAL 🥺' },
        ],
      },
      {
        t:'Accept karo — par guard maintain karo',
        s:'Acknowledge. Don\'t forget who she is.',
        deltas:{ fame:5, heat:-3, image:4 },
        caption:'Respect dono taraf se hoti hai. Aur woh real hai. Par game bhi real hai. 🎯 #Finale',
        reactions:[
          { char:'ria', text:'Measured response. Smart. Even now. 👑' },
          { char:'ananya', text:'They\'re keeping it together till the end. Impressive. 🥺' },
          { char:'__fan', name:'housewatch_india', text:'accepting ria\'s respect but staying sharp?? finale focus is real' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'10 din. Aur ek {p|banda/bandi} jo actually game played — aur human bhi {p|raha/rahi}. 🤍 #Day9' },
      B:{ char:'kabir', caption:'Kal finale hai. Aur main genuinely excited hoon is ke liye. 🔥 #Day9' },
    },
  },
  {
    id:'D9-2', day:9, slot:'Night', tag:'⚡ DAY 9 · NIGHT',
    title:'Aakhri Bada Faisla',
    body:[
      'Ek viral slot available hai — brand ka massive content opportunity. Par catch: kisi aur creator ko publicly uncomfortable position mein daalna padega. Specifically {ally} ya {crush}.',
      'Yeh opportunity career-changing hai. Par cost real hai.',
      'Kya tum yeh karte ho?',
    ],
    react:{ char:'ria', text:'Main seedha bolungi — yeh offer life-changing hai. Par tum decide karo. 🤍' },
    q:'Viral slot — kissi ko throw under the bus karo ya nahi?',
    choices:[
      {
        t:'Na — {ally}/{crush} ko protect karo',
        s:'The opportunity isn\'t worth it.',
        deltas:{ fame:-5, heat:-8, image:6 },
        caption:'Kuch opportunities nahi leni chahiye. Yeh ek tha. #CreatorHouse #Values',
        reactions:[
          { char:'kabir', text:'TU NE PROTECT KIYA?? 😭🔥 Main iska hisaab nahi bhoolega.' },
          { char:'ria', text:'They passed on the slot. Either very principled or very bad at math. 🤍' },
          { char:'__fan', name:'creator.tea', text:'REFUSED THE VIRAL SLOT TO PROTECT {ally}/{crush}?? LOYALTY ERA 😭' },
        ],
      },
      {
        t:'Le lo — yeh game hai',
        s:'The slot is too big to pass. Make the call.',
        deltas:{ fame:8, heat:10, image:-5 },
        caption:'Is ghar mein final decisions difficult hote hain. Maine le liya. #Finale #CreatorHouse',
        reactions:[
          { char:'ria', text:'They took it. Respect. That\'s the game. 👑' },
          { char:'kabir', text:'...Main samjha. Yeh game hai. Par... 😔' },
          { char:'__fan', name:'housewatch_india', text:'took the viral slot?? finale villain arc or just playing the game?' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'kabir', caption:'Is ghar mein ek {p|banda/bandi} {p|tha/thi} jo apne values pe {p|tikka/tikki} {p|raha/rahi}. You know who. 🔥 #Day9' },
      B:{ char:'ria', caption:'Finale decisions reveal character. Always. 👑 #CreatorHouse #Day9' },
    },
  },
  // [VOTE: Day 7 survivor evicted]

  // ── DAY 10 — FINALE ────────────────────────────────────────────────────────
  {
    id:'D10-1', day:10, slot:'Morning', tag:'⚡ DAY 10 · FINALE MORNING',
    title:'Teen Log',
    body:[
      'Finale subah. Teen log bach gaye. Ria, tum, aur ek aur.',
      'Ria teen coffee banati hai. Koi performance nahi. Sirf teen log jo yahan tak pahunche.',
      '"Dekho," Ria kehti hai, "jo bhi aaj ho — tumne yahan kuch kiya jo hard tha. Woh real hai."',
    ],
    react:{ char:'ria', text:'Aaj finale hai. Sab kuch real ho gaya. Good luck. 🤍' },
    q:'Finale morning kaise approach karte ho?',
    choices:[
      {
        t:'Grateful raho — moment absorb karo',
        s:'Be present. You made it here.',
        deltas:{ fame:-1, heat:3, image:2 },
        caption:'Finale morning. Is ghar mein aana, yahan tak rehna — yeh enough hai. 🌅 #Day10',
        reactions:[
          { char:'ria', text:'Grounded. On finale morning. That\'s impressive. 🤍' },
          { char:'ananya', text:'You\'re here. We\'re here. That\'s everything. 🥺🔥' },
          { char:'__fan', name:'creator.tea', text:'the finale morning peace?? 🥺 win or not this is beautiful' },
        ],
      },
      {
        t:'Focused raho — game abhi khatam nahi',
        s:'Finale isn\'t done. Stay sharp.',
        deltas:{ fame:3, heat:-1, image:3 },
        caption:'Abhi finale hai. Main grateful hoon. Main sharp bhi hoon. Dono ek saath ho sakte hain. 🎯 #Finale',
        reactions:[
          { char:'ria', text:'Still sharp. Even now. Respect. 👑' },
          { char:'kabir', text:'This is the version I was hoping for yaar. 😭🔥' },
          { char:'__fan', name:'housewatch_india', text:'focused AND grateful finale morning?? this is the winner energy' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'Finale morning. Khud se proud hoon. Aur honestly — unse bhi. 🤍 #Day10' },
      B:{ char:'kabir', caption:'Finale day. Ab dekhte hain. 🔥 #CreatorHouse #Day10' },
    },
  },
  {
    id:'D10-2', day:10, slot:'Finale', tag:'⚡ DAY 10 · LIVE FINALE',
    title:'Live Finale',
    body:[
      '1.1 lakh log live hain. Host tumhare saamne hai. "Ek last sawaal — is ghar mein tumne jo seekha, woh kya tha? Real mein."',
      'Yeh tumhara last moment hai. Public. Real. 10 din ka answer.',
      'Kya bolte ho?',
    ],
    react:{ char:'ria', text:'Yeh tumhara moment hai. Maine kuch nahi sikhaya — tum ne khud seekha. 🤍' },
    q:'Live finale pe host ke sawaal ka kya jawab dete ho?',
    choices:[
      {
        t:'Authentic answer — sab kuch share karo',
        s:'Raw. Real. The whole truth.',
        deltas:{ fame:6, heat:4, image:-4 },
        caption:'Is ghar mein seekha — log woh nahi hote jo dikhte hain. Aur main bhi nahi {p|tha/thi}. Ab hoon. 🎤 #Finale',
        reactions:[
          { char:'ria', text:'...That was real. That was actually real. 🤍' },
          { char:'kabir', text:'{p|BHAI/BEHEN} 😭🔥 THAT\'S THE WINNER SPEECH RIGHT THERE' },
          { char:'__fan', name:'housewatch_india', text:'THE FINALE SPEECH IS GOING VIRAL 😭🔥 1.1 LAKH SCREAMING' },
        ],
      },
      {
        t:'Polished answer — curated finale moment',
        s:'Deliver the moment they\'re expecting. Perfectly.',
        deltas:{ fame:8, heat:-6, image:4 },
        caption:'10 din. Aur aaj maine samjha — yeh sirf game nahi tha. Yeh mirror tha. 🤍 #Finale #CreatorHouse',
        reactions:[
          { char:'ria', text:'Perfect. Delivered exactly right. Well played. 👑' },
          { char:'ananya', text:'That was beautiful. Seriously. 🥺🔥' },
          { char:'__fan', name:'creator.tea', text:'the polished finale answer?? 🥺 it\'s giving winner honestly' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'ria', caption:'10 din. Ek {p|banda/bandi}. Real {p|tha/thi}. 🤍 #Finale #CreatorHouse' },
      B:{ char:'kabir', caption:'Finale. Aur yeh moment hamesha yad rahega. 🔥 #Day10 #CreatorHouse' },
    },
  },
]

export const DM_HOOKS: Partial<Record<string, string>> = {
  ria:    'Tumse kuch baat karni thi. Private mein. Woh public scene alag tha — yeh alag hai. 🤍',
  kabir:  'Arre yaar! Finally tere saath directly baat kar sakta hoon. Is ghar mein sab filter hai, tere saath nahi. 😭',
  ananya: 'Hi... main usually DM nahi karti but aaj karna tha. Tum bahut different lagte ho baaki sabse. 🥺',
  dev:    'Numbers. That\'s all this is. But you\'re different — I see it. Don\'t tell anyone I said that. 💪',
  zoya:   'Hey! Bas check kar rahi thi tum theek ho. Is ghar mein sab compete karte hain, main genuinely care karti hoon. 🫶',
}

export const DM_MOCK: Partial<Record<string, string[]>> = {
  ria:    ['Interesting. Main soch rahi hoon.', 'Yeh toh tumne achha kaha.', 'Hmm. Main observe kar rahi hoon. 🤍'],
  kabir:  ['HAHA bhai sahi bola 😭', 'Yaar tu toh mast hai', 'Dekh dekh, game samajh raha hai tu 🔥'],
  ananya: ['Sach mein? 🥺', 'Tum bahut achhe ho honestly', 'Main agree karti hoon... 🤍'],
  dev:    ['Numbers agree karte hain.', 'Solid. 💪', 'Facts. That\'s it.'],
  zoya:   ['Aww tum bahut sweet ho 🫶', 'Main samajhti hoon, sach mein.', 'Yeh toh interesting hai... 💅'],
}

// Legacy compat exports
export const DM_ORDER: CharId[] = ['kabir', 'ananya', 'ria', 'dev', 'zoya']
export const DM_PREVIEW: Partial<Record<string, string>> = {
  ria:    'Tumse kuch baat karni thi... 🤍',
  kabir:  'Finally directly baat kar sakta hoon. 😭',
  ananya: 'Tum bahut different lagte ho... 🥺',
  dev:    'You\'re different — I see it. 💪',
  zoya:   'Bas check kar rahi thi tum theek ho. 🫶',
}
export const DM_TIME: Partial<Record<string, string>> = {
  kabir:'3m', ananya:'8m', ria:'22m', dev:'1h', zoya:'2h',
}
export const DM_UNREAD: CharId[] = ['kabir', 'ananya']
export const DM_TRUST: Partial<Record<string, number>> = {
  ria:40, kabir:60, ananya:55, dev:50, zoya:35,
}
export const DM_QUICK: Partial<Record<string, string[]>> = {
  ria:    ['Tujhe mujhse kya chahiye?', 'Top pe kaise pahuche?', 'Game samjha mujhe.'],
  kabir:  ['Kya soch raha hai tu?', '{ally} ke baare mein kya lagta?', 'Trust karoon ya nahi tujhe?'],
  ananya: ['Tu theek hai?', 'Akela feel hota hai yahan?', 'Saath chalein?'],
  dev:    ['Deal ke baare mein batao', 'Yahan kyun aaye ho?', 'Collab mein kya milega?'],
  zoya:   ['Kya notice kiya tune?', 'Seedhi baat kar', 'Kispe nazar hai teri?'],
}

export function getVisibleSituations(_meters?: import('./types').Meters, _choices?: ('A' | 'B')[]): Situation[] {
  return SITUATIONS
}


// ── Post comment options (shown when tapping comment on a feed post) ──────────
export interface PostCommentOption {
  text: string
  deltas: { fame: number; heat: number; image: number }
  toast: string
}

export const PLAYABLE: { id: CharId; tag: string }[] = [
  { id:'kabir',  tag:'Sabka dost. Kisi ka nahi. 😭' },
  { id:'ananya', tag:'Viral dancer, aur aage jaana hai. 🥺' },
  { id:'ria',    tag:'Main already on top hoon. Sawaal yeh hai — kitne din tak. 👑' },
]
export const LOCKED: CharId[] = ['dev','zoya']

export const POST_COMMENTS: Record<string, PostCommentOption[]> = {
  ria: [
    { text: 'Inspired 🤍 This is everything.',     deltas:{ fame:3, heat:0, image:5 },  toast:'Ria noticed you. Image +5' },
    { text: 'Easy to say when you have it all 🙄', deltas:{ fame:2, heat:8, image:-3 }, toast:'Ria is not pleased. Heat +8' },
    { text: 'Can you mentor me? 🙏',               deltas:{ fame:5, heat:0, image:4 },  toast:'Ria appreciated the ask. Image +4' },
  ],
  kabir: [
    { text: 'Lol this is so accurate 😭',          deltas:{ fame:4, heat:2, image:2 },  toast:'Kabir liked this. Heat +2' },
    { text: 'Off camera you are different too 😅', deltas:{ fame:3, heat:3, image:2 },  toast:'Kabir felt seen. Heat +3' },
    { text: 'Stop trying to be deep 🙄',            deltas:{ fame:1, heat:7, image:-3 }, toast:'Kabir noted this. Heat +7' },
  ],
  housewatch: [
    { text: 'Bahut zyada soch rahe ho 😌',          deltas:{ fame:2, heat:-3, image:1 }, toast:'Low heat move' },
    { text: '👀 accurate tbh',                      deltas:{ fame:6, heat:8, image:0 },  toast:'Engagement up. Heat +8' },
    { text: 'Wrong 🙅 Stop spreading rumours',      deltas:{ fame:3, heat:-5, image:2 }, toast:'You pushed back' },
  ],
  ananya: [
    { text: 'Ro mat 🥺 Tu amazing hai',             deltas:{ fame:2, heat:0, image:3 },  toast:'Ananya trusts you more. Image +3' },
    { text: '2.1M that is insane!! 🔥',             deltas:{ fame:5, heat:0, image:2 },  toast:'Positive energy. Fame +5' },
    { text: 'Nice attempt 😐',                      deltas:{ fame:0, heat:5, image:-4 }, toast:'Ananya is hurt. Heat +5' },
  ],
  zoya: [
    { text: 'Love this energy 🫶',                  deltas:{ fame:3, heat:1, image:3 },  toast:'Zoya is warm. Image +3' },
    { text: 'Hmm interesting 👀',                   deltas:{ fame:2, heat:4, image:0 },  toast:'Zoya is watching. Heat +4' },
    { text: 'Main agree nahi karti 🙅',             deltas:{ fame:1, heat:6, image:-2 }, toast:'Zoya disagrees. Heat +6' },
  ],
  dev: [
    { text: 'Numbers never lie 📈 Respect',         deltas:{ fame:4, heat:0, image:3 },  toast:'Dev respects the grind. Fame +4' },
    { text: 'Ye sab brand PR hai na? 😅',           deltas:{ fame:2, heat:5, image:-2 }, toast:'Dev is sceptical. Heat +5' },
    { text: 'Bhai same thoughts 💪',                deltas:{ fame:3, heat:2, image:2 },  toast:'Dev aligned. Heat +2' },
  ],
}
