import type { Character, Situation, CharId } from './types'

export const CHARS: Record<CharId, Character> = {
  ria:   { id:'ria',   name:'Ria',   handle:'ria',       cls:'c-reya',   init:'R', fame:85, trust:40, heat:20, role:'Luxury lifestyle · 24 saal · The alpha' },
  kabir:  { id:'kabir',  name:'Kabir',  handle:'kabirlol',   cls:'c-kabir',  init:'K', fame:55, trust:25, heat:40, role:'Comedy · 26 saal · Chaos merchant' },
  meher:  { id:'meher',  name:'Meher',  handle:'meher',      cls:'c-meher',  init:'M', fame:40, trust:70, heat:15, role:'Lifestyle · 25 saal · The house\'s heart' },
  dev:    { id:'dev',    name:'Dev',    handle:'devlifts',   cls:'c-dev',    init:'D', fame:30, trust:65, heat:10, role:'Fitness · 27 saal · Grindset' },
  ananya: { id:'ananya', name:'Ananya', handle:'ananya',     cls:'c-ananya', init:'A', fame:15, trust:60, heat:5,  role:'Dance creator · 19 saal · Ingenue' },
  zoya:   { id:'zoya',   name:'Zoya',   handle:'zoya',       cls:'c-zoya',   init:'Z', fame:50, trust:45, heat:25, role:'Beauty · 23 saal · Sweet on-camera, sharp off it' },
  rishi:  { id:'rishi',  name:'Rishi',  handle:'rishivlogs', cls:'c-rishi',  init:'R', fame:35, trust:55, heat:20, role:'Vlogs · 24 saal · Records everything' },
  adi:    { id:'adi',    name:'Adi',    handle:'adi',        cls:'c-adi',    init:'A', fame:25, trust:40, heat:35, role:'Content · 22 saal · The new one' },
}

export const STORY_ORDER: CharId[] = ['ria','kabir','meher','dev','ananya','zoya','rishi','adi']
export const SEEN_CHARS: CharId[] = ['dev','zoya']

export const PLAYABLE = [
  { id:'ananya' as CharId, tag:'Prove karna hai sirf khud ko.' },
  { id:'kabir'  as CharId, tag:'Game already shuru kar chuka hoon. 👀' },
  { id:'ria'   as CharId, tag:'Main already on top hoon. Sawaal yeh hai — kitne din tak.' },
]
export const LOCKED: CharId[] = ['meher','dev','zoya','rishi','adi']

export const NARR_LINES = [
  { text:'Creator House.', cls:'narr-h' },
  { text:'8 creators. Ek villa. 30 din.', cls:'narr-p' },
  { text:'Yahan sab kuch content hai.', cls:'narr-p dim' },
]

export const NARR_CHARS: [CharId, string][] = [
  ['ria',  'Luxury. Lifestyle. Untouchable.\nSab kuch curated hai. Woh jaanti hai.'],
  ['kabir', 'Sabka dost. Kisi ka nahi.\nDrama woh banata hai. Record bhi wahi karta hai.'],
  ['meher', 'Ghar ki dil. Sab se wise.\nPar "authenticity" bhi ek brand hai.'],
  ['dev',   'Fitness. Brand deals. Grindset.\nLoyalty for sale — jo zyada de.'],
  ['ananya','The viral dancer. 19 saal ki.\nSirf "thumkewaali" nahi banana — par ye log sunenge?'],
  ['zoya',  'On-camera: sweet. Off-camera? Seedha kaat dungi.'],
  ['rishi', 'Sab record karta hai. Kisi ka nahi.'],
  ['adi',   'Naya. Eager. Abhi khud ko banana hai.'],
]

export const STORY_CONTENT: Record<CharId, { time: string; text: string }> = {
  ria:   { time:'6h ago',    text:'Kaafi log poochte hain — "Ria, tujhe stress nahi hota?" Stress? Main stress ko content mein convert karti hoon. Yeh alag cheez hai. Seekho. 🤍' },
  kabir:  { time:'2h ago',    text:'Is ghar mein sab serious ho jaate hain jab camera on hota hai. Main serious tab hota hoon jab camera off hota hai. Iss farq ko samajhna — yahi game hai. 😭👀' },
  meher:  { time:'4h ago',    text:'Aaj subah Ananya ro rahi thi, akeli kitchen mein. Main wahan thi. Kisi camera ne nahi pakda. Kuch cheezein real rehni chahiye. 🫶' },
  dev:    { time:'3h ago',    text:'5 AM. Sirf main aur weights. Is ghar mein sab kuch content hai — par gym ka waqt sirf mera hai. 💪' },
  ananya: { time:'45m ago',   text:'Meri latest reel pe 2.1M views aa gaye raat mein. Subah uthke dekha toh ro padi — khushi se. Phir Ria ko bataya. Usne bola... "nice." Bas. Nice. 🥺✨' },
  zoya:   { time:'1h ago',    text:'Kuch log in-person bahut different hote hain apne on-camera persona se. Is ghar mein kaafi log hain aise. Main bhi hoon. Difference yeh hai ki main jaanti hoon. 💅' },
  rishi:  { time:'5h ago',    text:'Main record karta rehta hoon. Log bhool jaate hain. Phir kuch hafte baad woh moment trending ho jaata hai. Life is content. Content is life. 🎥' },
  adi:    { time:'just now',  text:'Pehla hafte khatam ho raha hai. Abhi tak koi real dost nahi banaya. Main still apna angle figure out kar raha hoon. 🙏' },
}

export const SITUATIONS: Situation[] = [
  {
    tag:'⚡ DAY 1 · MORNING',
    day:1,
    feedReaction:{
      A:{char:'ria', caption:'Some people move fast. No alliances, no warnings — just moves. Respect and fear are different things. Both are useful. 👀'},
      B:{char:'ria', caption:'Today someone in this house showed me something rare — they asked first. Not permission. Just courtesy. That matters here. 🤍'},
    },
    title:'Brand deal ka phone aaya',
    body:[
      'Subah 8 baje. Villa mein sab so rahe hain. Tum kitchen mein akele ho, chai ke liye pani garam kar rahe ho.',
      'Ria ka phone counter pe rakha hai. Screen lit hoti hai — <b>"Luminary Brands."</b> Par woh number. Luminary ne kal tujhe bhi DM kiya tha. Direct. Seedha tujhe. Ek solo deal. 5 lakh. Ek post.',
      'Contract technically Ria ke through aata hai kyunki woh "house ki official face" hai. Agar tu seedha accept karta hai — complicated ho jaata hai. Agar Ria se poochta hai — power uske haath mein. Yeh decision abhi karna hoga.'
    ],
    react:{ char:'kabir', text:'Ek baar deal pakad lo yaar. Politics baad mein. Baad mein sab smooth ho jaata hai. Trust me. 😭' },
    q:'Kya karoge?',
    choices:[
      {
        t:'Seedha accept karo — Ria ko bypass karo',
        s:'Tujhe permission nahi chahiye. Yeh tera deal hai.',
        deltas:{fame:14,trust:-9,heat:18},
        caption:'Solo deal. No middlemen, no permission. Mera kaam, mera naam. 🤍',
        reactions:[
          {char:'kabir', text:'BHAI isko koi nahi rokta 🔥 seedha khel gaya, no warning'},
          {char:'ria',  text:'Interesting move. Chalte chalte pata chal jaata hai kaun kya hai.'},
          {char:'__fan', name:'creator.tea', text:'omg she BYPASSED ria for the deal 😭😭 house is going to blow up'},
        ]
      },
      {
        t:'Ria se pehle baat karo',
        s:'Politics avoid karo. Usse loop mein rakhna smarter hai.',
        deltas:{fame:5,trust:12,heat:-4},
        caption:'House mein respect chalta hai. Ria ko loop mein rakha. Akela nahi, smart. 🤝',
        reactions:[
          {char:'ria',  text:'Smart. Tu samajhdaar hai. Yeh... yaad rahega. 🤍'},
          {char:'meher', text:'Yahi sahi tha. Is ghar mein bharosa currency hai.'},
          {char:'__fan', name:'housewatch_india', text:'safe play... boring ya genius? jury is out 👀'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 1 · AFTERNOON',
    day:1,
    feedReaction:{
      A:{char:'kabir', caption:'Okay wow. Named publicly Day 1. Bold move. I respect the audacity though 😭🔥 Game on.'},
      B:{char:'meher', caption:'The most powerful move in a crisis is usually to say nothing. Some people learn that. Some don\'t. 🫶'},
    },
    title:'Group chat leak ho gaya',
    body:[
      'Dopahar 2 baje. Villa ke bahar, Twitter pe aag lagi hui hai. House ka private WhatsApp group — screenshots ban ke viral ho gaya hai. <b>#CreatorHouseLeak</b> trending hai.',
      'Usme ek message hai — kisi housemate ne tere baare mein likha tha: <i>"yeh zyada hi innocent act karti hai, real nahi lagti."</i> Woh message screenshotted, circled, 60k times share hua hai.',
      'Sab living room mein hain. Ring light band hai. Kabir ke haath mein phone hai. Woh muskura raha hai. Thoda zyada calm hai. Kisi ne toh yeh kiya hai.'
    ],
    react:{ char:'meher', text:'Suno — abhi gusse mein mat bolo. Camera har jagah hai. Jo bolna hai, soch ke bolo. Main hoon. 🫶' },
    q:'Living room mein kya karoge?',
    choices:[
      {
        t:'Kabir ko sabke saamne call out karo',
        s:'"Tere paas woh screenshots the. Bol — kyun kiya?"',
        deltas:{fame:20,trust:-6,heat:24},
        caption:'Main chup nahi baithti. Kabir, receipts tere paas the. Pura ghar gawah hai. 🎤',
        reactions:[
          {char:'kabir', text:'Wow wow wow. Proof hai tere paas? Ya bas drama? 😭 mast clip ban rahi hai'},
          {char:'zoya',  text:'finally koi bola jo main soch rahi thi 💅'},
          {char:'__fan', name:'creator.tea', text:'SHE WENT STRAIGHT FOR KABIR omg 😭🔥 i cannot'},
        ]
      },
      {
        t:'Calm raho — quietly handle karo',
        s:'Public scene se kuch nahi milta. Asli kaam private hota hai.',
        deltas:{fame:-3,trust:15,heat:-8},
        caption:'Jo bolna hai, camera ke peeche bolungi. Receipts tayaar ho rahe hain. 🤐',
        reactions:[
          {char:'meher', text:'Proud of you. Yeh real maturity hai. ❤️'},
          {char:'ria',  text:'Cold play. Mujhe yeh approach pasand aayi.'},
          {char:'__fan', name:'housewatch_india', text:'composed reh gayi... ya darr gayi?? 👀'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 2 · EVENING', day:2,
    title:'Dev ka collab offer',
    body:[
      'Shaam 6 baje. Dev tujhe terrace pe bulata hai — "ek cheez discuss karni thi." Upar, sunset perfect hai. Ring light on hai. Yeh clearly pre-planned setting hai.',
      '"Ek collab reel," woh kehta hai. "60-40, mera split bada. Par mere 2.1 million audience ke against tujhe consider karo — tera reach 3x ho jaayega. Minimum."',
      'Catch: Dev chahta hai ki reel mein tu ek subtle jab daale Ria ke taraf. "Sirf ek line. Kuch direct nahi. Audience khud samjhenge. Content ko drama chahiye." Woh muskura raha hai.'
    ],
    react:{ char:'dev', text:'Zyada mat soch yaar. Numbers jhooth nahi bolte. Bas ek line — Ria ke baare mein. Kitna mushkil hai? 💪' },
    q:'Dev ko kya bologe?',
    choices:[
      {
        t:'Collab karo — dig bhi daal do',
        s:'Reach > loyalty. Ria khud yahi karti.',
        deltas:{fame:18,trust:-12,heat:16},
        caption:'New collab dropping tonight. 👀 Kuch log "clean" rehne ka dikhava karte hain — hum sab dekh rahe hain.',
        reactions:[
          {char:'dev',  text:'LET\'S GO 🔥 numbers aane wale hain, prepared reh'},
          {char:'ria', text:'Toh tum bhi iss level pe aa gaye. Noted. Game on.'},
          {char:'__fan', name:'creator.tea', text:'the SHADE in this reel 💀 dev ne grind karaaya'},
        ]
      },
      {
        t:'Collab karo — par dig nahi daalna',
        s:'Reach chahiye. Kisi ko gira ke nahi.',
        deltas:{fame:11,trust:8,heat:2},
        caption:'Collab with @devlifts. Apne kaam se reach banao — kisi ko gira ke nahi. 🤝',
        reactions:[
          {char:'dev',   text:'theek hai... thodi kam spicy. chalega. numbers toh aayenge 🤷'},
          {char:'meher', text:'Dekha? Reach bina gandagi ke bhi milti hai. 🫶'},
          {char:'__fan', name:'housewatch_india', text:'refused the dig. respect. or strategy? 👀'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 3 · NIGHT',
    day:3,
    title:'Housewatch ne tera naam liya',
    body:[
      'Raat ke 11 baje. <b>housewatch_india</b> — 2.8M followers — ne ek thread daala hai. Subject: tum. "Creator House ka sabse calculated player." 94 hazaar likes in 3 hours.',
      '"Har move scripted hai. Har emotion timed hai. Receipts aa rahe hain." Comments mein teri clips edit ki hui hain. Out of context. Convincing lag rahi hain.',
      'Tera phone non-stop vibrate ho raha hai. Ria online hai — ab woh teri post pe hai. Meher ne DM kiya: "Don\'t react yet." Kabir ne woh thread already 3 logon ko forward kar diya hai.'
    ],
    react:{ char:'ria', text:'Internet bhool jaata hai — par sirf tab jab tum sahi move karo. Soch. 👑' },
    q:'Iska jawaab kaise doge?',
    choices:[
      {
        t:'Live aa jao — seedha address karo',
        s:'Sabke saamne, abhi. Darr nahi dikhna chahiye.',
        deltas:{fame:24,trust:6,heat:14},
        caption:'Going live in 5. Jo poochna hai poochlo. Main chhupti nahi. 🎙️',
        reactions:[
          {char:'ria',  text:'Bold. Ab dekhte hain handle kaise karti hai. Mujhe yeh pasand aaya.'},
          {char:'kabir', text:'LIVE?? bhai yeh INSANE content hai 😭 main bhi join kar raha hoon'},
          {char:'__fan', name:'creator.tea', text:'SHE IS GOING LIVE TO CLAP BACK 😭🔥 absolutely fearless'},
        ]
      },
      {
        t:'Ek shaant story post karo',
        s:'Dignity. No drama. Sirf ek line.',
        deltas:{fame:8,trust:14,heat:-6},
        caption:'Jinko jaanna hai woh jaante hain. Baaki ke liye — 🤍 stay blessed.',
        reactions:[
          {char:'meher', text:'Classy. Yahi asli power hoti hai. ❤️'},
          {char:'zoya',  text:'unbothered energy 💅 sikhao please'},
          {char:'__fan', name:'housewatch_india', text:'no clapback?? ice cold or scared?? can\'t tell 👀'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 5 · ELIMINATION', day:5,
    title:'Deciding vote. Tere haath mein.',
    body:[
      'Week 1 khatam. Aaj Creator House ki pehli eviction hai. Do log bottom pe hain: <b>Kabir</b> — jisne shayad group chat leak kiya, par proof nahi — aur <b>Ananya</b> — jise audience "entertaining nahi" bol rahi hai.',
      'Producers ne tujhe deciding vote diya hai. Live show pe. Camera on. Pura ghar dekh raha hai, aur 200k viewers.',
      'Kabir powerful hai, connected hai, aur dangerous hai — lekin tere kaam aa sakta hai. Ananya safe hai, loyal hai — lekin teri shield nahi ban sakti. Ek vote. Ek choice.'
    ],
    react:{ char:'kabir', text:'Yaar... main jaanta hoon tension hai humaarey beech. Par main Week 2 mein tere kaam aaunga. Promise. 🤝' },
    q:'Kisko vote karoge?',
    choices:[
      {
        t:'Kabir ko bahar karo',
        s:'Threat hatao. Game clean karo.',
        deltas:{fame:16,trust:18,heat:10},
        caption:'Maine Kabir ko vote kiya. Drama ka source gaya. Ab asli game shuru. 🎯',
        reactions:[
          {char:'meher', text:'Sahi faisla. Ghar mein ab thodi clarity aayegi. 🫶'},
          {char:'kabir', text:'😮‍💨 theek hai. Yaad rakhungi yeh faisla. Bahar milte hain... ya nahi. 👀'},
          {char:'__fan', name:'creator.tea', text:'KABIR OUT 😭 power move or biggest mistake of week 1??'},
        ]
      },
      {
        t:'Ananya ko bahar karo',
        s:'Strong players rakho. Khud ko shield do.',
        deltas:{fame:12,trust:-14,heat:22},
        caption:'Ananya ko vote kiya. Yeh game hai, charity nahi. Strong survive karte hain. ♟️',
        reactions:[
          {char:'kabir', text:'NOW we\'re talking 🔥 tu samajhdaar nikla. Team?'},
          {char:'ria',  text:'Ruthless. Mujhe yeh version zyada pasand aaya. Welcome to the top floor.'},
          {char:'__fan', name:'housewatch_india', text:'voted out the sweet one?? 💀 villain arc fully confirmed'},
        ]
      },
    ]
  },
  // ── Day 2-4 (AI-generated, gpt-5.4) ───────────────────────────────────────
  {
    tag:'⚡ DAY 2 · MORNING', day:2,
    title:"Ria's Loyalty Test",
    body:[
      "Breakfast time in the villa garden. Ria sits across from you, sunglasses on, chai in hand. The others are still asleep.",
      "She leans in: <b>'Main jaanna chahti hoon</b> — agar things get rough, main tumpe count kar sakti hoon?' The Luminary deal is still in the air. She knows you know.",
      "Yeh moment is not a question. It's a test. Aur Kabir is watching from the kitchen window."
    ],
    react:{ char:'kabir', text:'Sabko test karegi. Tujhe bhi. Smart move dekh. 👀' },
    q:'Kya bologe?',
    choices:[
      {
        t:'Pledge loyalty to Ria',
        s:'Lock in the most powerful alliance in the house.',
        deltas:{fame:10,trust:-5,heat:8},
        caption:'Kuch alliances feel right from day one. Main in hoon. 🤝',
        reactions:[
          {char:'ria', text:'Good. Main bhool nahi karti. Woh bhi promises, woh bhi betrayals.'},
          {char:'meher', text:'Ria ke saath? Be careful — uski loyalty selective hoti hai. 🫶'},
          {char:'__fan', name:'housewatch_india', text:'Alliance confirmed?? Game changer or trap? 👀'},
        ]
      },
      {
        t:'Stay non-committal',
        s:"Keep your options open — don't bind yourself.",
        deltas:{fame:5,trust:12,heat:-3},
        caption:'Is ghar mein kuch bhi pakka nahi. Main soch ke chalti hoon. 🎯',
        reactions:[
          {char:'kabir', text:'Smart. Ria ke haath mein khud ko mat de. Main hoon na. 😭'},
          {char:'ria', text:"Interesting. Let's see how long that lasts. 👑"},
          {char:'__fan', name:'creator.tea', text:'Not committing to Ria?? Bold or stupid?'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 2 · AFTERNOON', day:2,
    title:"Kabir's Secret Offer",
    body:[
      "Dopahar ka shoot khatam hua. Kabir ne camera band karte waqt aapko side pe bulaya. Living room khali hai.",
      "<b>'Sun, main tujhe kuch bata raha hoon</b> — Ria is playing EVERYONE. Main uska Counter hoon. Agar tu mere saath hai, Week 2 mein tera naam top pe hoga.'",
      "Uski eyes mein genuineness hai ya calculation? Dono ek saath bhi ho sakte hain."
    ],
    react:{ char:'meher', text:'Kabir ne tujhe approach kiya? Careful yaar. Woh sab record karta hai. ✨' },
    q:'Kabir ke offer ka kya karoge?',
    choices:[
      {
        t:'Accept the alliance',
        s:'Risk it for the most strategic pairing in the house.',
        deltas:{fame:15,trust:-10,heat:12},
        caption:'Kuch allies loud hote hain, kuch silent. Main dono ke saath hoon. 🔥',
        reactions:[
          {char:'kabir', text:'YO. Ab game shuru hota hai. Week 2 mein duniya dekhegi 😭🔥'},
          {char:'ria', text:'I heard. Noted. 👑'},
          {char:'__fan', name:'housewatch_india', text:'Kabir alliance CONFIRMED?? This changes everything 👀'},
        ]
      },
      {
        t:"Reject — trust your gut",
        s:"Kabir is chaos. Useful, but dangerous.",
        deltas:{fame:8,trust:15,heat:-5},
        caption:'Kuch offers bahut acha lagte hain. Yahi problem hai. 🎯',
        reactions:[
          {char:'kabir', text:'Your loss. But respect. 😭'},
          {char:'ananya', text:'Tu ne na bola?? I knew you were different 🥺'},
          {char:'__fan', name:'creator.tea', text:'Refused Kabir?? Either genius or naive'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 2 · NIGHT', day:2,
    title:"Overheard in the Kitchen",
    body:[
      "Raat ke 11 baje. Tum paani lene kitchen mein gaye. Meher wahan pehle se hai.",
      "From the hallway: Dev and Ananya. 'Woh zyada fit nahi hoti is house mein. Next week ke liye — vote pakka kar lo.'",
      "<b>Woh tum baare mein baat kar rahe hain.</b> Meher ne suna. Tum dono ne suna. Ab?"
    ],
    react:{ char:'meher', text:'Main pehle se jaanti thi. Yahan koi bhi genuinely safe nahi hai. 🫶' },
    q:'Is betrayal ka kya karoge?',
    choices:[
      {
        t:'Confront them — right now',
        s:"Don't let it slide. Names were said. Faces will be made.",
        deltas:{fame:20,trust:-15,heat:18},
        caption:'Seedha sawaal karo. Seedha jawaab lo. #NoFilter',
        reactions:[
          {char:'dev', text:'Main toh bas... hypothetically bol raha tha. 💪'},
          {char:'ananya', text:'I\'m so sorry, I didn\'t mean it that way 🥺😭'},
          {char:'__fan', name:'housewatch_india', text:'CONFRONTATION NIGHT 2 LET\'S GO 🔥🔥'},
        ]
      },
      {
        t:'Stay quiet — play the long game',
        s:"Store this. Use it when it matters most.",
        deltas:{fame:5,trust:12,heat:-4},
        caption:'Jo sunta hai, woh jeetta hai. #StrategicSilence',
        reactions:[
          {char:'meher', text:'Smart. Patience is power here. ✨'},
          {char:'kabir', text:'You heard?? Main already jaanta tha 😭 aaj discuss karte hain'},
          {char:'__fan', name:'creator.tea', text:'Did they hear the conversation?? 👀'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 3 · MORNING', day:3,
    title:"housewatch DM",
    body:[
      "Subah uthte hi phone pe ek anonymous DM: 'Tum jaante ho Ria ke baare mein woh cheez jo tum sochte ho sirf tumhe pata hai? 3 aur log jaante hain. Main unme se ek hoon.'",
      "Ria abhi neeche breakfast kar rahi hai. Woh confident hai. Shayad woh yeh nahi jaanti.",
      "<b>Information = leverage.</b> Ya information = trap. Dono possible hain."
    ],
    react:{ char:'rishi', text:'Anonymous DMs mein truth bhi hoti hai. Main proof chahta hoon. 🎥' },
    q:'Is DM ka kya karoge?',
    choices:[
      {
        t:'Warn Ria — tell her privately',
        s:"If she finds out you knew and stayed quiet, you lose her forever.",
        deltas:{fame:8,trust:15,heat:-2},
        caption:'Jo sach hai woh kehna padta hai, chahe comfortable na ho. 🤍',
        reactions:[
          {char:'ria', text:'...Tu ne mujhe bataya. That matters. 👑'},
          {char:'kabir', text:'Oh interesting. Ria ke loyal ban rahe ho? 😭 Dekh lena'},
          {char:'__fan', name:'creator.tea', text:'Is this loyalty or strategy??'},
        ]
      },
      {
        t:'Keep it — information is power',
        s:"This anonymous DM is your ace. Don't show cards yet.",
        deltas:{fame:12,trust:-7,heat:9},
        caption:'Sabke paas stories hain. Main apni timing choose karti hoon. 👀',
        reactions:[
          {char:'kabir', text:'YESSSS. Ab tu real player ban rahi hai 🔥'},
          {char:'zoya', text:'Something changed today. I can tell. 💅'},
          {char:'__fan', name:'housewatch_india', text:'She knows something. Thread incoming 👀'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 3 · AFTERNOON', day:3,
    title:"Confession Room",
    body:[
      "Producers ne bulaya. Red light. Soundproof room. Just you and the camera.",
      "'Is hafte ki sabse <b>badi galti</b> kya thi tum ne?' the producer's voice says through a speaker. 'Aur sabse bada regret?'",
      "The confession room clips jaate hain sometimes — seedha social media pe. Kabir ne pehle hi ek clip leak kiya tha. Woh sab jaanta hai."
    ],
    react:{ char:'dev', text:'Confession room mein sach bolna? Respect. Par be careful. 💪' },
    q:'Confession room mein kya bologe?',
    choices:[
      {
        t:'Spill it — raw and honest',
        s:"Real confession. The kind that goes viral because it's true.",
        deltas:{fame:20,trust:-10,heat:15},
        caption:'Pehli baar kisi ne sach poocha toh sach hi bolunga. Dekhte hain. 🎙️',
        reactions:[
          {char:'zoya', text:'Oh that\'s going to clip. Screenshot lete hoon 💅'},
          {char:'ananya', text:'That was... actually really real. Respect. ✨'},
          {char:'__fan', name:'housewatch_india', text:'CONFESSION CLIP DROPPING IN 3... 2...'},
        ]
      },
      {
        t:'Stay vague — protect yourself',
        s:"Enough to seem human. Not enough to be used against you.",
        deltas:{fame:5,trust:12,heat:-3},
        caption:'Har cheez shareable nahi hoti. Aur that\'s okay. 🤍',
        reactions:[
          {char:'meher', text:'Wise. Not everything needs to be content. 🫶'},
          {char:'kabir', text:'Smart or boring? Fine line. 😭'},
          {char:'__fan', name:'creator.tea', text:'Vague confession — calculated or genuine?'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 3 · NIGHT',
    day:3,
    title:"Fan Account Backlash",
    body:[
      "Raat ko scroll karte waqt: <b>@creator.tea</b> ne ek thread daala. 'Creator House ka sabse fake player — receipts neeche.' 47 retweets. Growing.",
      "Comments mein tumhare naam ke saath woh clip hai — confession room ya living room se, unclear. Teammates dekh rahe hain.",
      "Tumhare paas yeh option hai: ignore karo aur sone jao. Ya address karo aur raat bhar jaago."
    ],
    react:{ char:'adi', text:'Main toh personally tera saath hoon. Par social media alag game hai. 🙏' },
    q:'Backlash ka response kya hoga?',
    choices:[
      {
        t:'Go live — address it directly',
        s:"Don't let the narrative write itself. Take control.",
        deltas:{fame:18,trust:5,heat:14},
        caption:'Main hun, yeh meri story hai. Koi aur nahi likhega. 🎙️',
        reactions:[
          {char:'ria', text:'Bold. Par ab tujhe actually deliver karna hoga. 👑'},
          {char:'rishi', text:'Live recording start kar diya. Good content. 🎥'},
          {char:'__fan', name:'housewatch_india', text:'SHE\'S GOING LIVE ABOUT THE THREAD 🔥🔥'},
        ]
      },
      {
        t:'Ignore it — rise above',
        s:"Responding gives it more oxygen. Silence can be loud.",
        deltas:{fame:6,trust:10,heat:-2},
        caption:'Jo jaanta hai woh jaanta hai. Baaki sab eventually samjhenge. 🤍',
        reactions:[
          {char:'meher', text:'Good call. Sometimes silence wins. ✨'},
          {char:'kabir', text:'Ignore kiya? Hmm. Interesting strategy. 😭'},
          {char:'__fan', name:'creator.tea', text:'No response?? She really said unbothered 💅'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 4 · MORNING', day:4,
    title:"Luminary Deal: Final Answer",
    body:[
      "Luminary Brands ne final deadline di hai: aaj shaam tak. Woh chahte hain ki <b>ek solo creator</b> deal sign kare — official face of the campaign.",
      "Ria assumes it's hers. Dev ne already apply kar diya — quietly, through Kabir's contact. Tumhara DM abhi bhi unanswered hai.",
      "5 lakh. Ek post. Ek naam. Sirf ek."
    ],
    react:{ char:'zoya', text:'Main sunta toh hoon sab par bolti nahi. Par yeh deal... interesting hai. 💅' },
    q:'Luminary deal ka kya karogi?',
    choices:[
      {
        t:'Go for it — apply directly',
        s:"You earned the reach. Why should it go to someone else?",
        deltas:{fame:25,trust:-18,heat:22},
        caption:'Opportunities wait for no one. Especially not in Creator House. 🔥',
        reactions:[
          {char:'ria', text:'Oh. OH. Main yaad rakhungi yeh. 👑'},
          {char:'dev', text:'Competitor confirmed 💪 may the best one win'},
          {char:'__fan', name:'housewatch_india', text:'THE BRAND DEAL WAR HAS BEGUN 💀💀'},
        ]
      },
      {
        t:"Let it pass — trust over money",
        s:"The relationships in this house will outlast one deal.",
        deltas:{fame:8,trust:20,heat:-5},
        caption:'Kuch cheezein hain jo 5 lakh se zyada valuable hain. #LongGame',
        reactions:[
          {char:'meher', text:'You gave that up?? I respect you more now. 🫶'},
          {char:'ananya', text:'That was actually so mature omg 🥺✨'},
          {char:'__fan', name:'creator.tea', text:'She passed on 5 lakh?? Clout move or genuine?'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 4 · AFTERNOON', day:4,
    title:"Rishi's Footage",
    body:[
      "Rishi finds you alone in the studio. He looks serious — which is rare. 'Mere paas kuch footage hai,' he says. '<b>Tere baare mein nahi — tere liye.</b>'",
      "He shows you a clip: Kabir, Day 1, on the phone. Saying your name. Saying things you didn't know were said.",
      "Rishi wants something in return. He always does. The question is: at what cost?"
    ],
    react:{ char:'adi', text:'Rishi ne kisi ko kuch dikhaya? Yeh pehli baar nahi hai. Careful. 🙏' },
    q:'Rishi ke saath kya karoge?',
    choices:[
      {
        t:'Take the footage — deal with Rishi later',
        s:"Evidence first. Consequences second.",
        deltas:{fame:15,trust:-5,heat:10},
        caption:'Jo record hua hai, woh exist karta hai. #Receipts',
        reactions:[
          {char:'rishi', text:'Smart. Main jaanta tha tu samjhegi. Tere kaam aayega. 🎥'},
          {char:'kabir', text:'You two talked? Interesting... 👀'},
          {char:'__fan', name:'housewatch_india', text:'Rishi giving footage to someone?? RECEIPTS INCOMING'},
        ]
      },
      {
        t:"Refuse — don't get into Rishi's game",
        s:"Rishi's footage always comes with strings. You don't want his strings.",
        deltas:{fame:5,trust:10,heat:-3},
        caption:'Kuch information ki keemat bahut zyada hoti hai. #NoThanks 🎯',
        reactions:[
          {char:'rishi', text:'Interesting. You\'ll regret it or you won\'t. I\'ll keep recording. 🎥'},
          {char:'meher', text:'Good call. Rishi\'s help always comes with a bill. ✨'},
          {char:'__fan', name:'creator.tea', text:'Refused Rishi\'s footage?? Bold or mistake?'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 4 · NIGHT', day:4,
    title:"Week 1 Vote",
    body:[
      "The house gathers. Week 1 is done. Second elimination vote — and this time, <b>Ria has the deciding vote.</b>",
      "But there's a twist: she's asking for yours first. 'Meher ya Kabir?' she whispers. 'Main same vote karungi, promise.'",
      "Meher — loyal, safe, genuine. Kabir — powerful, dangerous, entertaining. Ek vote. Ab."
    ],
    react:{ char:'zoya', text:'Ria ne tujhse poocha? Woh tujhe trust karti hai. Ya test kar rahi hai. 💅' },
    q:'Kisko vote karoge?',
    choices:[
      {
        t:'Vote Kabir out',
        s:"Remove the chaos merchant before he removes you.",
        deltas:{fame:16,trust:18,heat:10},
        caption:'Week 2 mein sirf genuine log chahiye. Main ne decide kar liya. 🎯',
        reactions:[
          {char:'meher', text:'Thank you. Main yaad rakhungi. 🫶'},
          {char:'kabir', text:'Wow. Tu ne mujhe? Fine. Main bahar se khelta hoon. 👀'},
          {char:'__fan', name:'housewatch_india', text:'KABIR GETTING VOTED OUT?? WEEK 2 IS GOING TO BE UNHINGED'},
        ]
      },
      {
        t:'Vote Meher out',
        s:"She's everyone's emotional anchor. That's power. Dangerous power.",
        deltas:{fame:12,trust:-14,heat:22},
        caption:'Yeh game hai. Aur main yahan sirf dost banane nahi aayi. ♟️',
        reactions:[
          {char:'ria', text:'Interesting. Tu same vote kiya. Now I know where you stand. 👑'},
          {char:'kabir', text:'YASSS. NOW WE TALK. You\'re actually playing 🔥🔥'},
          {char:'__fan', name:'housewatch_india', text:'SHE VOTED OUT MEHER?? Villain arc CONFIRMED 💀'},
        ]
      },
    ]
  },

  // ── ANANYA-SPECIFIC Day 1 situations ──────────────────────────────────────
  {
    tag:'⚡ DAY 1 · WELCOME DINNER',
    day:1, chars:['ananya'],
    title:'The Dance Girl Comment',
    body:[
      'Welcome dinner, villa terrace. Fairy lights, everyone looking incredible. You\'re between Zoya and Adi, telling them about your latest reel hitting 2M views. Finally among your people.',
      'Then Rohan from brand partner Aestivo does a casual intro round. He calls Meher "brilliant" — and when he gets to you: <b>"Ananya! The dance girl. Super cute, yaar. My 14-year-old cousin loves your transitions."</b> He moves on before you can say anything else.',
      'The table heard. Kabir raises an eyebrow. Ria, at the far end, meets your eyes for exactly one second — the kind that says she filed that moment away. You have the rest of this dinner to decide who you are in this house. Or let them decide for you.',
    ],
    react:{ char:'kabir', text:'Ooh. Rohan just sorted you into the kiddie table. What are you going to do with that? 👀' },
    q:'The "dance girl" comment lands in front of everyone. How do you handle it?',
    choices:[
      {
        t:'Reclaim the table — own the room',
        s:'You laugh it off, then pivot hard.',
        deltas:{fame:12,trust:-4,heat:6},
        caption:'Showed up to dinner, stayed for the conversation. Just because I dance doesn\'t mean I can\'t talk 💀 #CreatorHouse #Day1',
        reactions:[
          {char:'ria', text:'Interesting. She recovered faster than I expected.'},
          {char:'__fan', name:'housewatch_india', text:'ANANYA CLAPPING BACK AT ROHAN AESTIVO omg she\'s not here to play'},
        ]
      },
      {
        t:'Let it go — watch who flinches',
        s:'You smile, say nothing. Absorb. Watch.',
        deltas:{fame:3,trust:14,heat:-2},
        caption:'Day 1 and I\'m already learning. Listening is underrated. 👀 #CreatorHouse',
        reactions:[
          {char:'meher', text:'Smart girl. She\'s watching. I need to watch her back.'},
          {char:'__fan', name:'creator.tea', text:'Ananya not reacting to Rohan is lowkey the most powerful thing she did tonight'},
        ]
      },
    ]
  },
  {
    tag:'☀️ DAY 1 · AFTERNOON',
    day:1, chars:['ananya'],
    title:"Ria's Compliment",
    body:[
      "You're on the terrace stretching, phone propped against the railing. Ria drifts over with her iced coffee. Casual. Unhurried. Like she owns this space — which she does.",
      "<b>'I love how you're completely unbothered by all this,'</b> she says. 'Like, there's something genuinely sweet about a creator who's still just... happy to be here. Most people lose that.' She smiles. It's warm. It's kind. Three seconds later you realize it's a sentence with a knife inside it.",
      "What you don't know: Rishi's on the far end of the terrace with his camera pointed at you both. That clip — Ria saying 'sweet about a creator who's still just happy to be here' — is about to hit #CreatorHouseLeak with 'Ria putting Ananya in her place??' You have forty seconds before you lose control of this moment.",
    ],
    react:{ char:'rishi', text:'Already uploading. This is going to be the clip of the day. 🎥' },
    q:"Ria's backhanded compliment is about to go viral. What's your move?",
    choices:[
      {
        t:'Flip the frame — straight to camera',
        s:'You look at Rishi\'s lens and respond warmly but sharply. Make the clip yours.',
        deltas:{fame:18,trust:-8,heat:12},
        caption:'She said sweet. I heard that as a compliment. We\'re good here 🤍 #CreatorHouse #Day1',
        reactions:[
          {char:'ria', text:'She saw Rishi. Good instincts. I\'m going to have to be more careful.'},
          {char:'__fan', name:'housewatch_india', text:'ANANYA KNEW THE CAMERA WAS ON AND STILL SAID IT. this girl is not what i expected'},
        ]
      },
      {
        t:'Miss it — respond genuinely',
        s:'You take Ria at face value. You don\'t realize the clip is already live.',
        deltas:{fame:-5,trust:16,heat:3},
        caption:'Day 1 and Ria said the sweetest thing to me 🥹 grateful to be here for real. #CreatorHouse',
        reactions:[
          {char:'meher', text:'Oh no. She didn\'t catch it. Someone should warn her.'},
          {char:'__fan', name:'creator.tea', text:'Ananya thought that was a real compliment... someone tell her what Ria actually said 😭'},
        ]
      },
    ]
  },
  {
    tag:'🌙 DAY 1 · NIGHT',
    day:1, chars:['ananya'],
    title:"Kabir's Kitchen Offer",
    body:[
      "It's 11PM. House is quiet. You're in the kitchen making chai because you cannot sleep — brain running too fast. Kabir finds you here. He always finds people in kitchens.",
      "He doesn't perform anything. He just makes chai with you. <b>'You're talented,'</b> he says, watching the milk. 'But talent doesn't protect you in here. You need to understand what this house actually is.' He tells you: everyone here is building something, and watching everyone else. 'I can show you how to move. Whose trust is worth having. Think of it as — older sibling energy.' He slides your mug toward you and smiles.",
      "The offer is real. You can tell he's not lying about the information. But when someone offers to teach you the game on Day 1, they're also recruiting you into their version of it. If you say yes, you owe Kabir something.",
    ],
    react:{ char:'kabir', text:'No pressure. I just think you\'re too interesting to get eaten on Day 3. 😭' },
    q:"Kabir's offering to be your guide — but guides always have a destination in mind.",
    choices:[
      {
        t:'Accept — but stay alert',
        s:'Take the offer, keep your eyes open.',
        deltas:{fame:6,trust:-10,heat:14},
        caption:'Got some perspective tonight from someone unexpected. Taking it. 🙏 #CreatorHouse',
        reactions:[
          {char:'zoya', text:'She said yes to Kabir. Interesting. I need to find out what he told her. 💅'},
          {char:'__fan', name:'housewatch_india', text:'Ananya and Kabir having a late night kitchen convo... the alliance rumours are already starting'},
        ]
      },
      {
        t:'Decline — stay your own person',
        s:'Thank him and mean it. Figure this out yourself.',
        deltas:{fame:4,trust:8,heat:-6},
        caption:'Day 1 done. Still standing. Still me. That\'s enough for tonight. ✨ #CreatorHouse',
        reactions:[
          {char:'meher', text:'She turned Kabir down? On Day 1? Okay. I underestimated her.'},
          {char:'__fan', name:'creator.tea', text:'Ananya said no to Kabir at the kitchen offer I cannot 😭 she\'s either very smart or very naive'},
        ]
      },
    ]
  },
  {
    tag:'🌒 DAY 1 · 2 AM',
    day:1, chars:['ananya'],
    title:'The Stolen Idea',
    body:[
      "You couldn't sleep, so you opened your notes app. It came fast and clean: a challenge format where each creator in the house teaches one skill in under 60 seconds. Simple, viral, generous. You voice-noted yourself, got excited, <b>sent it to the house group chat at 1:47 AM</b> because you couldn't hold it in.",
      "By 2:14 AM, Dev had posted it. Not credited to you. His caption: 'New format idea just dropped in my brain, let me know if you're in.' Three creators already replied with hearts. Rishi screen-recorded the thread.",
      "You are lying in your bed. The voice note is right there in your recents. The timestamps are right there. Dev's post is 27 minutes old and already has 400 comments. You are 19 years old, this is your first day, and you just learned something about how this house works.",
    ],
    react:{ char:'dev', text:'What? It was just inspiration. Ideas don\'t have owners, Ananya. 💪' },
    q:"Dev stole your idea and posted it 27 minutes later. It's 2AM. What do you do?",
    choices:[
      {
        t:'Post your voice note immediately',
        s:'You timestamp your receipts publicly — messy, emotional, but real.',
        deltas:{fame:20,trust:-6,heat:18},
        caption:'Posted my idea at 1:47AM. Dev posted 2:14AM. Just so the timeline is clear. 🙂 #CreatorHouse',
        reactions:[
          {char:'ria', text:'She kept receipts and posted them on Day 1. She\'s going to be a problem.'},
          {char:'__fan', name:'housewatch_india', text:'THE TIMESTAMPS. THE VOICE NOTE. ANANYA SAID CHOOSE VIOLENCE I AM SCREAMING'},
        ]
      },
      {
        t:'Sleep on it — call it out tomorrow',
        s:'Screenshot everything. Close your phone. Wait until you can be strategic.',
        deltas:{fame:5,trust:10,heat:4},
        caption:'Good ideas find their way. Trusting the process. 🌙 #CreatorHouse #Day1',
        reactions:[
          {char:'meher', text:'She went quiet. Either she didn\'t notice or she\'s saving it. Both are interesting.'},
          {char:'__fan', name:'creator.tea', text:'Ananya\'s silence after Dev\'s post is the most suspicious thing in this thread'},
        ]
      },
    ]
  },

  // ── KABIR-SPECIFIC Day 1 situations ───────────────────────────────────────
  {
    tag:'⚡ DAY 1 · EARLY MORNING',
    day:1, chars:['kabir'],
    title:'The Receipts Room',
    body:[
      "You're getting water at 7:43 AM when you hear it — Ria and Meher, low voices on the balcony. The sliding door is cracked. Ria is telling Meher she already has a brand deal lined up that bypasses the house manager. <b>Before anyone else even unpacks.</b> You hear a number. It's big.",
      "This is Day 1. You haven't even had breakfast. And you already have something no one else has — a secret that belongs to the house's alpha.",
      "Kabir's brain runs the math. Tell someone and you're a gossip. Record it and you're protected. Walk away clean — but you walk away with nothing except knowledge. And knowledge, in this house, is the only currency that doesn't run out.",
    ],
    react:{ char:'kabir', text:'Yaar... tumhara mic is always on. Even when it\'s off. 😭' },
    q:'You have maybe 8 seconds before they finish. What do you do?',
    choices:[
      {
        t:'Record it. Silently.',
        s:'Evidence is insurance. Decide how to use it later.',
        deltas:{fame:0,trust:-10,heat:15},
        caption:'Day 1 and already feeling like the house has layers 👀 #CreatorHouse #JustObserving',
        reactions:[
          {char:'meher', text:'Why does he look like he knows something? He always looks like he knows something.'},
          {char:'__fan', name:'housewatch_india', text:'kabir was in the kitchen at 7:43. ria and meher were on the balcony. the timeline is right there people 🧵'},
        ]
      },
      {
        t:'Walk away. Let them have it.',
        s:'Cleanest hands win the longest game.',
        deltas:{fame:5,trust:8,heat:-5},
        caption:'Morning energy in the house is immaculate. No notes. ☀️ #CreatorHouse #Day1',
        reactions:[
          {char:'ria', text:'Kabir seems chill. Which is either genuine or a performance. Both are concerning.'},
          {char:'__fan', name:'content.tea.daily', text:'see this is why kabir always survives. he just MOVES DIFFERENT. no unnecessary noise.'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 1 · LATE MORNING',
    day:1, chars:['kabir'],
    title:"Ria Asks Directly",
    body:[
      "The group chat drama has been live for forty minutes. Ria is moving quietly through the house, talking to people one by one. Now it's your turn.",
      "She sits across from you, sets her phone face-down, and looks at you with the calm of someone who already has a theory. <b>'Kabir. Be honest with me. Do you know who started the leak?'</b> She's not asking like she suspects you. She's asking like she's decided you're the person who would know.",
      "This is the test. If you lie cleanly, you're her informant — useful, protected, but obligated. If you tell enough truth — that you did it, played right — you're either her enemy or the most interesting person in this house.",
    ],
    react:{ char:'kabir', text:'Yaar, why does everyone think I know things? ...Okay I know things. 😭' },
    q:'Ria is waiting. Eye contact. What do you tell her?',
    choices:[
      {
        t:'Deflect with a name. Point at Dev.',
        s:'Not a full lie. Dev IS transactional enough that it\'s plausible.',
        deltas:{fame:8,trust:-15,heat:12},
        caption:'Some people come in playing chess, some come in playing checkers. Bas. 🤷 #CreatorHouse',
        reactions:[
          {char:'ria', text:'Interesting. He said Dev without hesitating. Either it\'s true or he practiced that.'},
          {char:'__fan', name:'dramaalert_creators', text:'KABIR JUST THREW DEV UNDER THE BUS ON DAY ONE. I am not okay. I am eating. 🍿'},
        ]
      },
      {
        t:'Give her just enough truth.',
        s:'"I have a theory. But I need to know you won\'t use it against me."',
        deltas:{fame:12,trust:5,heat:18},
        caption:'Sometimes the most powerful thing you can do is just... listen. 🎙️ #CreatorHouse #Day1',
        reactions:[
          {char:'ria', text:'He bargained with me. On Day 1. I actually respect it. I need to watch him closely.'},
          {char:'__fan', name:'housewatch_india', text:'the way kabir and ria were at the table for 12 minutes and both came out smiling. ALLIANCE CONFIRMED OR THREAT ASSESSMENT?'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 1 · AFTERNOON',
    day:1, chars:['kabir'],
    title:"Rishi's Offer",
    body:[
      "Rishi finds you by the pool. Camera always present — but it's pointed at the water, not at you, which is either politeness or strategy. He speaks quietly: he's been recording everything. B-roll, reactions, candid moments. He already has footage of the group chat fallout that could go massive.",
      "<b>'I'm not putting it out alone,'</b> he says. 'But if we co-release — your commentary, my footage — we both eat.'",
      "You look at him. Rishi is 35 fame and got here by documenting other people's stories. The offer is real. But Rishi records everything, which means Rishi also has footage of <i>you</i>. This alliance has a surveillance component you can't turn off.",
    ],
    react:{ char:'kabir', text:'Rishi bhai, your camera is pointed at me while you say this. Coincidence? 🎥' },
    q:"Rishi's waiting for an answer. Alliance or independence?",
    choices:[
      {
        t:'Take the alliance. Co-create the story.',
        s:'Reach now, risk later. You can manage Rishi.',
        deltas:{fame:20,trust:-8,heat:15},
        caption:'When the right people find each other in the right room, kuch toh hoga 🤝 #CreatorHouse',
        reactions:[
          {char:'zoya', text:'Rishi and Kabir together is a nightmare. Rishi has footage. Kabir has narrative. That\'s a media operation.'},
          {char:'__fan', name:'housewatch_india', text:'THE COLLAB WE DIDN\'T KNOW WE NEEDED. two of the most underrated people finding each other DAY ONE.'},
        ]
      },
      {
        t:'Pass. Keep your hands clean.',
        s:'Your commentary doesn\'t need a co-author. Or a witness.',
        deltas:{fame:6,trust:10,heat:-8},
        caption:'Watching this house wake up is genuinely the most entertaining thing I\'ve done all year 🍵 #CreatorHouse',
        reactions:[
          {char:'rishi', text:'He said no. Which means he\'s got his own plan. I\'m going to film him more. 🎥'},
          {char:'__fan', name:'content.tea.daily', text:'kabir staying solo is the CORRECT MOVE. the narrator doesn\'t have allegiances. he has an audience.'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 1 · EVENING',
    day:1, chars:['kabir'],
    title:'Meher Knows',
    body:[
      "7 PM. Fragile post-drama calm. People are cooking, editing, performing normalcy. Meher finds you on the terrace alone — she doesn't have her usual warm energy. She has a different face. The one she doesn't show on camera.",
      "She sits next to you and says, quietly, without drama: <b>'I know it was you, Kabir. The leak. I can't prove it yet, but I know.'</b>",
      "She's not threatening you. That's what makes it worse. She's just telling you. Like she wants you to know that she knows. You understand immediately — Meher is not Dev, who is transactional. Meher is a strategist who has been playing warm because warm works. She's the one you should have been watching from the beginning.",
    ],
    react:{ char:'kabir', text:'Meher bhai... tumhara "warm strategist" brand is really doing its job, haan? 😭' },
    q:'Meher is watching your face. What do you do with this?',
    choices:[
      {
        t:'Deny it. Calmly and completely.',
        s:'She said she can\'t prove it. Let her spend the energy trying.',
        deltas:{fame:0,trust:-18,heat:10},
        caption:'Day 1 taught me: people see patterns where there are none. We\'re all just reacting. #CreatorHouse',
        reactions:[
          {char:'meher', text:'He looked me right in the eye and lied. Good liar. Which confirms everything.'},
          {char:'__fan', name:'housewatch_india', text:'meher and kabir had a 6 minute terrace conversation and she came down looking like she solved something. WHAT WAS SAID.'},
        ]
      },
      {
        t:"Let her in. Enough to make her complicit.",
        s:'"Okay. But now you\'re in it too. So what do you want?"',
        deltas:{fame:5,trust:15,heat:20},
        caption:'The people who see you clearly are either your biggest threats or your most valuable allies. No in between. 🌙',
        reactions:[
          {char:'meher', text:'He didn\'t even flinch. Just pivoted to "so what do you want." I think I just became his partner by accident.'},
          {char:'__fan', name:'meherkabir.theorists', text:'something shifted on that terrace. there is an alliance we are not being shown and it is the most dangerous one in the house.'},
        ]
      },
    ]
  },

  // ── REYA-SPECIFIC Day 1 situations ────────────────────────────────────────
  {
    tag:'⚡ DAY 1 · MORNING',
    day:1, chars:['ria'],
    title:'The Receipt',
    body:[
      "You're mid-unpacking when Rishi wanders in — camera on, obviously. He's hovering near the bed where you dumped your tote. The Prada bag you carried in. The one with the dry-cleaning tag still looped around the handle. And underneath it, slipping out: <b>a return receipt. Zara Home. ₹4,200.</b> For a throw blanket you posted as 'gifted, obsessed' three weeks ago.",
      "He hasn't seen it yet. His eyes are on his camera screen. The receipt is cream-coloured and small but the word RETURN is printed in caps and you know exactly what it looks like.",
      "85 fame. Three brand pitches in your pipeline. One receipt and the whole architecture wobbles. You have maybe four seconds.",
    ],
    react:{ char:'rishi', text:'"Your setup looks so curated, Ria. Can I do a room tour with you?" 🎥' },
    q:"Rishi's camera is live. The receipt is inches from his lens. How do you play this?",
    choices:[
      {
        t:'Pocket it smoothly — pivot hard',
        s:'Grab it mid-motion like it\'s trash, redirect to your "housewarming aesthetic."',
        deltas:{fame:4,trust:-8,heat:12},
        caption:'Day 1 energy: setting intentions, not unpacking receipts 🤍 #CreatorHouse',
        reactions:[
          {char:'rishi', text:'Posts the clip anyway. You can see his finger hesitate on the tag. 🎥'},
          {char:'__fan', name:'housewatch_india', text:'why did she flinch when he looked at her bag 👁️ slow down the clip someone'},
        ]
      },
      {
        t:'Own it — make it a bit',
        s:'Wave it at camera, do a "sustainable girlie returns what she doesn\'t love" spin.',
        deltas:{fame:9,trust:5,heat:6},
        caption:'Sustainable era loading 🌿 I return things. I\'m not ashamed. #ConsciousCreator #CreatorHouse',
        reactions:[
          {char:'meher', text:'"That was actually smart. I didn\'t know you had that gear."'},
          {char:'__fan', name:'creator.tea', text:'ok the return queen arc is cute but also… is everything she posts \'gifted\' actually kept??'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 1 · AFTERNOON',
    day:1, chars:['ria'],
    title:'Luminary Is Shopping',
    body:[
      "The DM comes in at 2:47 PM. It's Priya from Luminary — the partnerships lead, the one who went cold on you for six weeks.",
      "'Hey babe — so excited about the house! Quick q — noticed a few other faces in the cast list. Are any of them aligned with the luxury positioning we talked about? Just doing our due diligence before we finalise things 🙏'",
      "<b>They're shopping.</b> Six weeks of decks and mood boards and a three-call pitch and they're in your house, looking at your competitors. Ananya posted a reel this morning that got 2.3M views in four hours. You have 85 fame and Luminary just watched Ananya trend.",
    ],
    react:{ char:'kabir', text:'"Ria you look stressed. Bad news? Or just the afternoon light?" 😭' },
    q:'Luminary wants intel on your housemates. What do you send back?',
    choices:[
      {
        t:'Play brand consultant — subtly undercut everyone',
        s:'A warm, professional reply positioning each competitor as "lovely but a different vibe."',
        deltas:{fame:3,trust:-14,heat:18},
        caption:'Luxury is a feeling, not a price tag. Some people get it 🤍 #CreatorHouse',
        reactions:[
          {char:'ananya', text:'Has no idea. Posts a thank-you reel for the housemates. It does numbers.'},
          {char:'__fan', name:'lore.archive', text:'Ria\'s confessional cut away really fast when she checked her phone. production noticed.'},
        ]
      },
      {
        t:'Call Priya — stop the text chain',
        s:'Step outside. Call directly. Pitch yourself as the anchor, not a participant in their comparison shopping.',
        deltas:{fame:7,trust:2,heat:9},
        caption:'When the deal is worth doing, you show up differently. Non-negotiable energy 🖤 #CreatorHouse',
        reactions:[
          {char:'zoya', text:'Spots you on the phone outside, notes the body language, says nothing to your face. 💅'},
          {char:'__fan', name:'housewatch_india', text:'Ria disappeared for 20 min right after Ananya\'s reel popped off. coincidence?'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 1 · EVENING',
    day:1, chars:['ria'],
    title:'Humble Beginnings',
    body:[
      "First group dinner. Twelve mics, two camera rigs. Someone asks everyone to share 'their origin story — where they started, what drove them here.'",
      "Meher goes first. Dad's medical debt, skincare channel from a shared bathroom. Standing ovation. Ananya mentions a chawl in Mulund and everyone melts. Then the camera turns to you.",
      "You have a version: 'I was just a girl from Bandra with a phone and a dream.' Technically true. <b>Bandra West. Second floor of a building your parents own outright.</b> A phone that cost ₹1.4 lakh. Kabir is sitting directly across from you with a look on his face like he already knows the zip code.",
    ],
    react:{ char:'kabir', text:'"Bandra, right Ria? Which part — Hill Road side or the other side? 😇"' },
    q:"The camera is on you. Kabir just named the postcode. What's your origin story tonight?",
    choices:[
      {
        t:'Lean into the honest rebrand',
        s:'"I came from money and I had to earn credibility anyway." Flip the narrative.',
        deltas:{fame:11,trust:16,heat:-5},
        caption:'Privilege doesn\'t protect you from imposter syndrome. That\'s my honest origin. #CreatorHouse',
        reactions:[
          {char:'meher', text:'"Honestly? That took more guts than the sad story. Respect."'},
          {char:'__fan', name:'creator.tea', text:'ok ria admitting the bandra west life is actually more interesting than her usual vague "hustle" narrative??'},
        ]
      },
      {
        t:'Give the rehearsed version and get out clean',
        s:'Deliver the "phone and a dream" line. Don\'t let Kabir steer.',
        deltas:{fame:2,trust:-10,heat:15},
        caption:'Everyone starts somewhere. Mine just started with a lot of intention 🤍 #CreatorHouse',
        reactions:[
          {char:'kabir', text:'Smiles into his water glass. Doesn\'t say another word. That\'s somehow worse.'},
          {char:'__fan', name:'housewatch_india', text:"why does ria's origin story change slightly every time she tells it. someone make a compilation"},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 1 · NIGHT',
    day:1, chars:['ria'],
    title:"Meher's Alliance",
    body:[
      "Past midnight. Cameras still on but crew has thinned. You're on the terrace doing your nighttime skincare. Meher comes out with two cups of chai and sits without being invited.",
      "She talks about house dynamics, how the group is going to splinter fast. Then: <b>'I think we'd make sense as allies. Not content partners — I mean actually watching each other's backs. Different enough that we don't compete. Both smart enough to know when something's about to go wrong.'</b>",
      "She means it. You are extremely good at reading performance and this is not performance — it's the specific warmth of someone who genuinely likes the version of you they've seen. Which means she's operating on incomplete information. If she knew the full picture — the receipts, the debt, the wardrobe scam — she'd either pity you or use it.",
    ],
    react:{ char:'meher', text:'"You don\'t have to trust me tonight. Just don\'t rule it out." 🫶' },
    q:"Meher is offering a genuine alliance and you can't figure out her angle.",
    choices:[
      {
        t:'Accept warmly — keep the actual walls up',
        s:'Say yes, mean maybe. Give her enough access to feel real.',
        deltas:{fame:5,trust:8,heat:4},
        caption:'Night one and I already found my person in the house 🤍 you know who you are #CreatorHouse',
        reactions:[
          {char:'meher', text:'Squeezes your hand. Doesn\'t perform it for the camera. Somehow this makes it worse.'},
          {char:'__fan', name:'lore.archive', text:'Ria and Meher terrace scene already has a ship name in the comments. they\'re going to eat this up.'},
        ]
      },
      {
        t:'Deflect with warmth — keep the distance',
        s:'Be charming, grateful, call her "someone I respect" — without committing.',
        deltas:{fame:1,trust:-6,heat:2},
        caption:'Day 1 energy: choosing carefully, not quickly. 🖤 #CreatorHouse',
        reactions:[
          {char:'meher', text:'Nods once. Picks up her chai. Lets the silence sit without filling it.'},
          {char:'__fan', name:'housewatch_india', text:'Meher literally offered friendship and Ria gave her a press statement. girl is ARMORED'},
        ]
      },
    ]
  },
]

// Single source of truth for character-filtered situation list.
// Use this everywhere instead of inline SITUATIONS.filter() calls.
export function getVisibleSituations(charId: CharId | null): typeof SITUATIONS {
  if (!charId) return SITUATIONS.filter(s => !s.chars)
  return SITUATIONS.filter(s => !s.chars || s.chars.includes(charId))
}

export const DM_ORDER: CharId[] = ['kabir','meher','ria','ananya','dev','zoya','rishi','adi']

export const DM_HOOKS: Record<CharId, string> = {
  kabir:  'Yaar, tere baare mein curious hoon. Kya deal hai tera? 👀 Main help kar sakta hoon — bas ek cheez chahiye mere se pehle.',
  meher:  'Arey, seedha message kar le. Kyun sochna? Yeh ghar sab ka hai. 🫶 Pehla din kaisa raha tera?',
  ria:   'Tune aaj achha decision liya. Main notice karti hoon. 👀',
  ananya: 'Omg tujhe bhi akela lag raha hai kya?? Main toh subah se 😭 Tu sacha insaan hai na?',
  dev:    'Perfect timing yaar. Ek collab reel — tera follower count 3x guaranteed. Seedha deal, koi strings nahi.',
  zoya:   'Tujhe thodi der se dekh rahi thi. Interesting aura hai tera. 💅',
  rishi:  'Yaar main record kar raha tha — nahi pata tha tu tha wahan. Good content tha honestly.',
  adi:    'Bhai main bhi naya hoon yahan. Solidarity. 🙏 Ek collab kabhi?',
}

export const DM_PREVIEW: Record<CharId, string> = {
  kabir:  'Sun, ek baat poochhni thi... 👀',
  meher:  'Pehla din kaisa raha? Adjust ho rahi ho? 🫶',
  ria:   'Interesting choice thi teri aaj. 👀',
  ananya: 'Tu acha hai na? Yahan koi samajhta nahi 🥺',
  dev:    'Collab karte hain. 60-40. Tera reach phatega.',
  zoya:   'Maine notice kiya tujhe. Just saying. 💅',
  rishi:  'Camera hai tere paas? Ek shot lete hain.',
  adi:    'Naya hoon main bhi. Chalein saath? 🙏',
}

export const DM_TIME: Record<CharId, string> = {
  kabir:'3m', meher:'8m', ria:'22m', ananya:'1h',
  dev:'2h', zoya:'3h', rishi:'5h', adi:'just now',
}

export const DM_UNREAD: CharId[] = ['kabir','meher']
export const DM_TRUST: Record<CharId, number> = {
  kabir:25, meher:70, ria:40, ananya:60, dev:65, zoya:45, rishi:55, adi:40,
}

export const DM_QUICK: Record<CharId, string[]> = {
  kabir:  ['Kya soch raha hai tu?', 'Ria ke baare mein kya lagta?', 'Trust karoon ya nahi tujhe?'],
  meher:  ['Yahan kaise survive karoon?', 'Kispe bharosa karoon?', 'Kabir ka kya scene hai?'],
  ria:   ['Tujhe mujhse kya chahiye?', 'Top pe kaise pahuche?', 'Game samjha mujhe.'],
  ananya: ['Tu theek hai?', 'Akela feel hota hai yahan?', 'Saath chalein?'],
  dev:    ['Deal ke baare mein batao', '60-40 kyun?', 'Collab mein kya milega mujhe?'],
  zoya:   ['Kya notice kiya tune?', 'Seedhi baat kar', 'Kispe nazar hai teri?'],
  rishi:  ['Kya record kiya tune?', 'Footage kiske paas jaata hai?', 'Mujhe woh clip chahiye'],
  adi:    ['Collab karein?', 'Yahan kaisa chal raha?', 'Dost banein?'],
}

export const DM_MOCK: Record<CharId, string[]> = {
  kabir: [
    'Seedhi baat — tujhe koi nahi dekh raha yahan. Main dekh raha hoon. 👀 Ab question yeh hai ki teri value kya hai mere liye.',
    'Arre sun, Ria ke baare mein jo suna hai tune woh 50% sach hai. Baaki 50% main fill karta hoon. Kya milega mujhe? 😭',
    'Bhai sab log socha hai ki main villain hoon. Par villain bhi toh ek role hai na? Is ghar mein bekar log character karte hain. Tu alag lag raha hai. 🔥',
    'Rishi ne kuch record kiya hai. Tujhe interesting lagega. Main share kar sakta hoon — ek choti si help ke badle. 👀',
    'Ek sach bolunga — is ghar mein koi genuinely tera dost nahi hai. Main bhi nahi. Par main honest toh hoon. Aur honesty ki bhi kuch value hoti hai na? 😭',
  ],
  meher: [
    'Mujhe laga tha adjust hone mein waqt lagega. Par tum theek lag rahe ho. Dekh, is ghar mein sab play karte hain. Main bhi. Par tere saath honest rahungi. 🫶',
    'Kabir pe trust mat karna. Woh footage rakhta hai. Bakwaas ke liye nahi — leverage ke liye.',
    'Yahan jaldi decide mat karna kuch bhi. Is ghar mein patience sabse rare cheez hai — aur sabse powerful bhi. ✨',
    'Main tujhe kuch bolunga off record — Ria ki "clean" image puri manufactured hai. Par tujhe decide karna hai kya karna chahte ho is information ka. 🫶',
    'Yahan har koi angle play kar raha hai. Mera angle yeh hai ki ek banda hona chahiye jo genuinely sab dekhe. Mujhe lagta hai tu woh ho sakta hai. ✨',
  ],
  ria: [
    'Main timepass nahi karti. Agar tujhse baat kar rahi hoon toh koi reason hai. Socho.',
    'Bharosa? Is ghar mein? Seedha bolo kya chahiye — phir dekhte hain.',
    'Tere baare mein interesting kya hai — tu khud nahi jaanta. Main jaanti hoon. 👀',
    'Dev ne tujhe approach kiya hoga already. Ek test de usse — kya kehta hai jab bolta hai free kaam karne ko. Woh answer sab bata dega.',
    'Is ghar mein sab mujhe villain banate hain. Fine. Par villain woh hota hai jo honest hota hai — baaki sab sirf polite hain.',
  ],
  ananya: [
    'Tu sach mein puch raha hai?? 🥺 koi nahi puchta yahan. Main bas... thak gayi hoon acting se.',
    'Main strong dikhne ki koshish karti hoon par andar se darr lagta hai. Tu judge toh nahi karega na? ✨',
    'Kabir ne help karne ka promise kiya tha. Phir bina bataye woh clip post kar di. Yahan koi kisi ka nahi hai. 😭',
    'Main sirf ek cheez chahti hoon — log mujhe seriously lein. Sirf dancer nahi. Ek real creator. Kya tujhe lagta hai woh kabhi hoga yahan? 🥺',
    'Ria ne aaj meri latest reel pe bola "cute attempt." Cute attempt. Main 10 minute confessional mein akele baithi rahi. Tu samajhta hai na? ✨',
  ],
  dev: [
    'Sun, time = money. Ek collab, 60-40, mera split. Tera reach 2-3x minimum. Haan ya na? 💪',
    'Loyalty? Woh bhi ek currency hai bhai. Jo zyada de, uska. Tu kitna de sakta hai? 🔥',
    'Main gym bro nahi hoon sirf. Maine business analytics padha hai. Sab underestimate karte hain — yeh meri advantage hai. Tu mat karna. 💪',
    'Ek collab reel mein tera subscriber count realistically 2-3x ho sakta hai. Main numbers se jhooth nahi bolta. Decision tera hai. 🔥',
    'Honestly bolunga — is ghar mein sab "authentic" bolte hain par hain nahi. Main authentically transactional hoon. Difference samajh aaya? 💪',
  ],
  zoya: [
    'Maine dekha tujhe Kabir se baat karte. Careful. Woh sweet nahi hai. Main hoon... thodi zyada. 💅',
    'On camera main sabki dost hoon. Off camera? Main sirf un logon ki dost hoon jo kaam aate hain. Tu aayega? 👀',
    'Ria aur main? History hai. Ek din unse poochna kya happen kiya Season 0 mein. Woh nahi bolegi. Shayad main bolun. 💅',
    'Mujhe laga tu interesting nahi hoga. Main galat thi. Is ghar mein interesting log rare hain. 👀',
    'Seedha baat karein — tu mere liye useful ho sakta hai, main tere liye. Transactional friendship bhi friendship hoti hai. 💅',
  ],
  rishi: [
    'Mere paas tera ek clip hai jo tu shayad nahi chahega koi dekhe. Relax — abhi tak. 🎥',
    'Footage sabse badi power hai is ghar mein. Tu mere saath hai ya unke?',
    'Main villain nahi hoon. Main just camera hoon. Camera ka koi side nahi hota. 🎥',
    'Tune jo aaj kiya woh mere lens se bahut interesting laga. Kabir ne bhi notice kiya. Main sirf FYI bata raha hoon. 🎥',
    'Is ghar mein sabse powerful banda woh nahi jo zyada clout rakhta hai. Woh hota hai jiske paas sabse zyada footage hai.',
  ],
  adi: [
    'Bhai sach mein, yahan koi apna nahi. Tu bhi naya, main bhi. Team bana lein? 🙏',
    'Mujhe nahi pata main yahan tik paunga ya nahi. Par tu cool lagta hai. Saath rahein?',
    'Yaar honestly bol — yahan kaise survive karte hain? Sab itne calculated lagte hain. Main bas... main hoon. Kya yahi problem hai? 🙏',
    'Kabir ne mujhe apna group join karne ke liye bol raha tha. Par kuch theek nahi laga. Tera kya opinion hai uske baare mein? 🙏',
    'Main bas ek cheez chahta hoon yahan se — kuch meaningful. Content, connections, kuch bhi. Tu help karega kabhi? 🙏',
  ],
}

// ── Post comment options (shown when tapping comment on a feed post) ──────────
export interface PostCommentOption {
  text: string        // what the player writes
  deltas: { fame: number; trust: number; heat: number }
  toast: string       // feedback shown after
}

export const POST_COMMENTS: Record<string, PostCommentOption[]> = {
  ria: [
    { text: 'Inspired 🤍 This is everything.',   deltas:{ fame:3, trust:5, heat:0 },  toast:'Ria noticed you. Trust +5' },
    { text: 'Easy to say when you have it all 🙄', deltas:{ fame:2, trust:-8, heat:8 }, toast:'Ria is not pleased. Trust -8' },
    { text: 'Can you mentor me? 🙏',              deltas:{ fame:5, trust:10, heat:0 },  toast:'Ria appreciated the ask. Trust +10' },
  ],
  kabir: [
    { text: 'Lol this is so accurate 😭',         deltas:{ fame:4, trust:6, heat:2 },  toast:'Kabir liked this. Trust +6' },
    { text: 'Off camera you are different too 😅', deltas:{ fame:3, trust:8, heat:3 },  toast:'Kabir felt seen. Trust +8' },
    { text: 'Stop trying to be deep 🙄',           deltas:{ fame:1, trust:-10, heat:7 }, toast:'Kabir noted this. Trust -10' },
  ],
  housewatch: [
    { text: 'Bahut zyada soch rahe ho 😌',         deltas:{ fame:2, trust:0, heat:-3 }, toast:'Low heat move' },
    { text: '👀 accurate tbh',                     deltas:{ fame:6, trust:0, heat:8 },  toast:'Engagement up. Heat +8' },
    { text: 'Wrong 🙅 Stop spreading rumours',     deltas:{ fame:3, trust:0, heat:-5 }, toast:'You pushed back' },
  ],
  ananya: [
    { text: 'Ro mat 🥺 Tu amazing hai',            deltas:{ fame:2, trust:10, heat:0 }, toast:'Ananya trusts you more. Trust +10' },
    { text: '2.1M that is insane!! 🔥',            deltas:{ fame:5, trust:6, heat:0 },  toast:'Positive energy. Fame +5' },
    { text: 'Nice attempt 😐',                     deltas:{ fame:0, trust:-12, heat:5 }, toast:"Ananya is hurt. Trust -12" },
  ],
}
