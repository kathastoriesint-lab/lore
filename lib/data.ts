import type { Character, Situation, CharId } from './types'

export const CHARS: Record<CharId, Character> = {
  reya:   { id:'reya',   name:'Reya',   handle:'reya',       cls:'c-reya',   init:'R', fame:85, trust:40, heat:20, role:'Luxury lifestyle · 24 saal · The alpha' },
  kabir:  { id:'kabir',  name:'Kabir',  handle:'kabirlol',   cls:'c-kabir',  init:'K', fame:55, trust:25, heat:40, role:'Comedy · 26 saal · Chaos merchant' },
  meher:  { id:'meher',  name:'Meher',  handle:'meher',      cls:'c-meher',  init:'M', fame:40, trust:70, heat:15, role:'Lifestyle · 25 saal · The house\'s heart' },
  dev:    { id:'dev',    name:'Dev',    handle:'devlifts',   cls:'c-dev',    init:'D', fame:30, trust:65, heat:10, role:'Fitness · 27 saal · Grindset' },
  ananya: { id:'ananya', name:'Ananya', handle:'ananya',     cls:'c-ananya', init:'A', fame:15, trust:60, heat:5,  role:'Dance creator · 19 saal · Ingenue' },
  zoya:   { id:'zoya',   name:'Zoya',   handle:'zoya',       cls:'c-zoya',   init:'Z', fame:50, trust:45, heat:25, role:'Beauty · 23 saal · Sweet on-camera, sharp off it' },
  rishi:  { id:'rishi',  name:'Rishi',  handle:'rishivlogs', cls:'c-rishi',  init:'R', fame:35, trust:55, heat:20, role:'Vlogs · 24 saal · Records everything' },
  adi:    { id:'adi',    name:'Adi',    handle:'adi',        cls:'c-adi',    init:'A', fame:25, trust:40, heat:35, role:'Content · 22 saal · The new one' },
}

export const STORY_ORDER: CharId[] = ['reya','kabir','meher','dev','ananya','zoya','rishi','adi']
export const SEEN_CHARS: CharId[] = ['dev','zoya']

export const PLAYABLE = [
  { id:'ananya' as CharId, tag:'Prove karna hai sirf khud ko.' },
  { id:'kabir'  as CharId, tag:'Game already shuru kar chuka hoon. 👀' },
  { id:'reya'   as CharId, tag:'Main toh already on top hoon. Sawaal yeh hai — kitne din tak.' },
]
export const LOCKED: CharId[] = ['meher','dev','zoya','rishi','adi']

export const NARR_LINES = [
  { text:'Creator House.', cls:'narr-h' },
  { text:'8 creators. Ek villa. 30 din.', cls:'narr-p' },
  { text:'Yahan sab kuch content hai.', cls:'narr-p dim' },
]

export const NARR_CHARS: [CharId, string][] = [
  ['reya',  'Luxury. Lifestyle. Untouchable.\nWoh sab kuch fake hai jo woh dikhati hai.'],
  ['kabir', 'Sabka dost. Kisi ka nahi.\nDrama woh banata hai. Record bhi wahi karta hai.'],
  ['meher', 'Ghar ki dil. Sab se wise.\nPar "authenticity" bhi ek brand hai.'],
  ['dev',   'Fitness. Brand deals. Grindset.\nLoyalty for sale — jo zyada de.'],
  ['ananya','The viral dancer. 19 saal ki.\nSirf "thumkewaali" nahi banana — par ye log sunenge?'],
  ['zoya',  'On-camera: sweet. Off-camera? Seedha kaat dungi.'],
  ['rishi', 'Sab record karta hai. Kisi ka nahi.'],
  ['adi',   'Naya. Eager. Abhi khud ko banana hai.'],
]

export const STORY_CONTENT: Record<CharId, { time: string; text: string }> = {
  reya:   { time:'6h ago',    text:'Kaafi log poochte hain — "Reya, tujhe stress nahi hota?" Stress? Main stress ko content mein convert karti hoon. Yeh alag cheez hai. Seekho. 🤍' },
  kabir:  { time:'2h ago',    text:'Is ghar mein sab serious ho jaate hain jab camera on hota hai. Main serious tab hota hoon jab camera off hota hai. Iss farq ko samajhna — yahi game hai. 😭👀' },
  meher:  { time:'4h ago',    text:'Aaj subah Ananya ro rahi thi, akeli kitchen mein. Main wahan thi. Kisi camera ne nahi pakda. Kuch cheezein real rehni chahiye. 🫶' },
  dev:    { time:'3h ago',    text:'5 AM. Sirf main aur weights. Is ghar mein sab kuch content hai — par gym ka waqt sirf mera hai. 💪' },
  ananya: { time:'45m ago',   text:'Meri latest reel pe 2.1M views aa gaye raat mein. Subah uthke dekha toh ro padi — khushi se. Phir Reya ko bataya. Usne bola... "nice." Bas. Nice. 🥺✨' },
  zoya:   { time:'1h ago',    text:'Kuch log in-person bahut different hote hain apne on-camera persona se. Is ghar mein kaafi log hain aise. Main bhi hoon. Difference yeh hai ki main jaanti hoon. 💅' },
  rishi:  { time:'5h ago',    text:'Main record karta rehta hoon. Log bhool jaate hain. Phir kuch hafte baad woh moment trending ho jaata hai. Life is content. Content is life. 🎥' },
  adi:    { time:'just now',  text:'Pehla hafte khatam ho raha hai. Abhi tak koi real dost nahi banaya. Main still apna angle figure out kar raha hoon. 🙏' },
}

export const SITUATIONS: Situation[] = [
  {
    tag:'⚡ DAY 1 · MORNING',
    title:'Brand deal ka phone aaya',
    body:[
      'Subah 8 baje. Villa mein sab so rahe hain. Tum kitchen mein akele ho, chai ke liye pani garam kar rahe ho.',
      'Reya ka phone counter pe rakha hai. Screen lit hoti hai — <b>"Luminary Brands."</b> Par woh number. Luminary ne kal tujhe bhi DM kiya tha. Direct. Seedha tujhe. Ek solo deal. 5 lakh. Ek post.',
      'Contract technically Reya ke through aata hai kyunki woh "house ki official face" hai. Agar tu seedha accept karta hai — complicated ho jaata hai. Agar Reya se poochta hai — power uske haath mein. Yeh decision abhi karna hoga.'
    ],
    react:{ char:'kabir', text:'Ek baar deal pakad lo yaar. Politics baad mein. Baad mein sab smooth ho jaata hai. Trust me. 😭' },
    q:'Kya karoge?',
    choices:[
      {
        t:'Seedha accept karo — Reya ko bypass karo',
        s:'Tujhe permission nahi chahiye. Yeh tera deal hai.',
        deltas:{fame:14,trust:-9,heat:18},
        caption:'Solo deal. No middlemen, no permission. Mera kaam, mera naam. 🤍',
        reactions:[
          {char:'kabir', text:'BHAI isko koi nahi rokta 🔥 seedha khel gaya, no warning'},
          {char:'reya',  text:'Interesting move. Chalte chalte pata chal jaata hai kaun kya hai.'},
          {char:'__fan', name:'creator.tea', text:'omg she BYPASSED reya for the deal 😭😭 house is going to blow up'},
        ]
      },
      {
        t:'Reya se pehle baat karo',
        s:'Politics avoid karo. Usse loop mein rakhna smarter hai.',
        deltas:{fame:5,trust:12,heat:-4},
        caption:'House mein respect chalta hai. Reya ko loop mein rakha. Akela nahi, smart. 🤝',
        reactions:[
          {char:'reya',  text:'Smart. Tu samajhdaar hai. Yeh... yaad rahega. 🤍'},
          {char:'meher', text:'Yahi sahi tha. Is ghar mein bharosa currency hai.'},
          {char:'__fan', name:'housewatch_india', text:'safe play... boring ya genius? jury is out 👀'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 1 · AFTERNOON',
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
          {char:'reya',  text:'Cold play. Mujhe yeh approach pasand aayi.'},
          {char:'__fan', name:'housewatch_india', text:'composed reh gayi... ya darr gayi?? 👀'},
        ]
      },
    ]
  },
  {
    tag:'⚡ DAY 2 · EVENING',
    title:'Dev ka collab offer',
    body:[
      'Shaam 6 baje. Dev tujhe terrace pe bulata hai — "ek cheez discuss karni thi." Upar, sunset perfect hai. Ring light on hai. Yeh clearly pre-planned setting hai.',
      '"Ek collab reel," woh kehta hai. "60-40, mera split bada. Par mere 2.1 million audience ke against tujhe consider karo — tera reach 3x ho jaayega. Minimum."',
      'Catch: Dev chahta hai ki reel mein tu ek subtle jab daale Reya ke taraf. "Sirf ek line. Kuch direct nahi. Audience khud samjhenge. Content ko drama chahiye." Woh muskura raha hai.'
    ],
    react:{ char:'dev', text:'Zyada mat soch yaar. Numbers jhooth nahi bolte. Bas ek line — Reya ke baare mein. Kitna mushkil hai? 💪' },
    q:'Dev ko kya bologe?',
    choices:[
      {
        t:'Collab karo — dig bhi daal do',
        s:'Reach > loyalty. Reya khud yahi karti.',
        deltas:{fame:18,trust:-12,heat:16},
        caption:'New collab dropping tonight. 👀 Kuch log "clean" rehne ka dikhava karte hain — hum sab dekh rahe hain.',
        reactions:[
          {char:'dev',  text:'LET\'S GO 🔥 numbers aane wale hain, prepared reh'},
          {char:'reya', text:'Toh tum bhi iss level pe aa gaye. Noted. Game on.'},
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
    title:'Housewatch ne tera naam liya',
    body:[
      'Raat ke 11 baje. <b>housewatch_india</b> — 2.8M followers — ne ek thread daala hai. Subject: tum. "Creator House ka sabse calculated player." 94 hazaar likes in 3 hours.',
      '"Har move scripted hai. Har emotion timed hai. Receipts aa rahe hain." Comments mein teri clips edit ki hui hain. Out of context. Convincing lag rahi hain.',
      'Tera phone non-stop vibrate ho raha hai. Reya online hai — ab woh teri post pe hai. Meher ne DM kiya: "Don\'t react yet." Kabir ne woh thread already 3 logon ko forward kar diya hai.'
    ],
    react:{ char:'reya', text:'Internet bhool jaata hai — par sirf tab jab tum sahi move karo. Soch. 👑' },
    q:'Iska jawaab kaise doge?',
    choices:[
      {
        t:'Live aa jao — seedha address karo',
        s:'Sabke saamne, abhi. Darr nahi dikhna chahiye.',
        deltas:{fame:24,trust:6,heat:14},
        caption:'Going live in 5. Jo poochna hai poochlo. Main chhupti nahi. 🎙️',
        reactions:[
          {char:'reya',  text:'Bold. Ab dekhte hain handle kaise karti hai. Mujhe yeh pasand aaya.'},
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
    tag:'⚡ DAY 5 · ELIMINATION',
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
          {char:'reya',  text:'Ruthless. Mujhe yeh version zyada pasand aaya. Welcome to the top floor.'},
          {char:'__fan', name:'housewatch_india', text:'voted out the sweet one?? 💀 villain arc fully confirmed'},
        ]
      },
    ]
  },
]

export const DM_ORDER: CharId[] = ['kabir','meher','reya','ananya','dev','zoya','rishi','adi']

export const DM_HOOKS: Record<CharId, string> = {
  kabir:  'Yaar, tere baare mein curious hoon. Kya deal hai tera? 👀 Main help kar sakta hoon — bas ek cheez chahiye mere se pehle.',
  meher:  'Arey, seedha message kar le. Kyun sochna? Yeh ghar sab ka hai. 🫶 Pehla din kaisa raha tera?',
  reya:   'Tune aaj achha decision liya. Main notice karti hoon. 👀',
  ananya: 'Omg tujhe bhi akela lag raha hai kya?? Main toh subah se 😭 Tu sacha insaan hai na?',
  dev:    'Perfect timing yaar. Ek collab reel — tera follower count 3x guaranteed. Seedha deal, koi strings nahi.',
  zoya:   'Tujhe thodi der se dekh rahi thi. Interesting aura hai tera. 💅',
  rishi:  'Yaar main record kar raha tha — nahi pata tha tu tha wahan. Good content tha honestly.',
  adi:    'Bhai main bhi naya hoon yahan. Solidarity. 🙏 Ek collab kabhi?',
}

export const DM_PREVIEW: Record<CharId, string> = {
  kabir:  'Sun, ek baat poochhni thi... 👀',
  meher:  'Pehla din kaisa raha? Adjust ho rahi ho? 🫶',
  reya:   'Interesting choice thi teri aaj. 👀',
  ananya: 'Tu acha hai na? Yahan koi samajhta nahi 🥺',
  dev:    'Collab karte hain. 60-40. Tera reach phatega.',
  zoya:   'Maine notice kiya tujhe. Just saying. 💅',
  rishi:  'Camera hai tere paas? Ek shot lete hain.',
  adi:    'Naya hoon main bhi. Chalein saath? 🙏',
}

export const DM_TIME: Record<CharId, string> = {
  kabir:'3m', meher:'8m', reya:'22m', ananya:'1h',
  dev:'2h', zoya:'3h', rishi:'5h', adi:'just now',
}

export const DM_UNREAD: CharId[] = ['kabir','meher']
export const DM_TRUST: Record<CharId, number> = {
  kabir:25, meher:70, reya:40, ananya:60, dev:65, zoya:45, rishi:55, adi:40,
}

export const DM_QUICK: Record<CharId, string[]> = {
  kabir:  ['Kya soch raha hai tu?', 'Reya ke baare mein kya lagta?', 'Trust karoon ya nahi tujhe?'],
  meher:  ['Yahan kaise survive karoon?', 'Kispe bharosa karoon?', 'Kabir ka kya scene hai?'],
  reya:   ['Tujhe mujhse kya chahiye?', 'Top pe kaise pahuche?', 'Game samjha mujhe.'],
  ananya: ['Tu theek hai?', 'Akela feel hota hai yahan?', 'Saath chalein?'],
  dev:    ['Deal ke baare mein batao', '60-40 kyun?', 'Collab mein kya milega mujhe?'],
  zoya:   ['Kya notice kiya tune?', 'Seedhi baat kar', 'Kispe nazar hai teri?'],
  rishi:  ['Kya record kiya tune?', 'Footage kiske paas jaata hai?', 'Mujhe woh clip chahiye'],
  adi:    ['Collab karein?', 'Yahan kaisa chal raha?', 'Dost banein?'],
}

export const DM_MOCK: Record<CharId, string[]> = {
  kabir: [
    'Seedhi baat — tujhe koi nahi dekh raha yahan. Main dekh raha hoon. 👀 Ab question yeh hai ki teri value kya hai mere liye.',
    'Arre sun, Reya ke baare mein jo suna hai tune woh 50% sach hai. Baaki 50% main fill karta hoon. Kya milega mujhe? 😭',
    'Bhai sab log socha hai ki main villain hoon. Par villain bhi toh ek role hai na? Is ghar mein bekar log character karte hain. Tu alag lag raha hai. 🔥',
    'Rishi ne kuch record kiya hai. Tujhe interesting lagega. Main share kar sakta hoon — ek choti si help ke badle. 👀',
    'Ek sach bolunga — is ghar mein koi genuinely tera dost nahi hai. Main bhi nahi. Par main honest toh hoon. Aur honesty ki bhi kuch value hoti hai na? 😭',
  ],
  meher: [
    'Mujhe laga tha adjust hone mein waqt lagega. Par tum theek lag rahe ho. Dekh, is ghar mein sab play karte hain. Main bhi. Par tere saath honest rahungi. 🫶',
    'Kabir pe trust mat karna. Woh footage rakhta hai. Bakwaas ke liye nahi — leverage ke liye.',
    'Yahan jaldi decide mat karna kuch bhi. Is ghar mein patience sabse rare cheez hai — aur sabse powerful bhi. ✨',
    'Main tujhe kuch bolunga off record — Reya ki "clean" image puri manufactured hai. Par tujhe decide karna hai kya karna chahte ho is information ka. 🫶',
    'Yahan har koi angle play kar raha hai. Mera angle yeh hai ki ek banda hona chahiye jo genuinely sab dekhe. Mujhe lagta hai tu woh ho sakta hai. ✨',
  ],
  reya: [
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
    'Reya ne aaj meri latest reel pe bola "cute attempt." Cute attempt. Main 10 minute confessional mein akele baithi rahi. Tu samajhta hai na? ✨',
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
    'Reya aur main? History hai. Ek din unse poochna kya happen kiya Season 0 mein. Woh nahi bolegi. Shayad main bolun. 💅',
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
  reya: [
    { text: 'Inspired 🤍 This is everything.',   deltas:{ fame:3, trust:5, heat:0 },  toast:'Reya noticed you. Trust +5' },
    { text: 'Easy to say when you have it all 🙄', deltas:{ fame:2, trust:-8, heat:8 }, toast:'Reya is not pleased. Trust -8' },
    { text: 'Can you mentor me? 🙏',              deltas:{ fame:5, trust:10, heat:0 },  toast:'Reya appreciated the ask. Trust +10' },
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
