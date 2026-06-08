/**
 * Indian Dressing Room — Mumbai Prodigy Season 1
 * World bible: docs/cricket-dressing-room-world-bible-v1.md
 * Content:     docs/cricket-dressing-room-content-v1.md
 *
 * Meter mapping (stored in fame/heat/image slots):
 *   fame  = Form  🏏
 *   heat  = Fame  ⭐
 *   image = Team Trust 🤝
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

  // ── S1 · AUCTION NIGHT ────────────────────────────────────────────────────────
  {
    id:'CR-S1', day:1, slot:'Auction Night', tag:'⚡ AUCTION NIGHT',
    title:'Sold To Mumbai',
    body:[
      'Ghar ke drawing room mein TV ka volume itna loud hai ki auctioneer ka har naam seedha seene mein lag raha hai. Tumhare saamne teen cheezein rakhi hain: ek half-empty water bottle, Coach Sir ka old notebook, aur tumhara phone — jo abhi tak disturbingly silent hai.',
      'Phir screen par tumhara naam aata hai. Base price. Do second ki khamoshi. Phir Mumbai Indians ka paddle uthta hai. Ek aur team join karti hai. MI phir paddle uthata hai.',
      '*Sold. Mumbai Indians.*',
      'Room mein awaaz phat jaati hai. Phone vibrate hona shuru. First notification: @futurexi: "MI just bought a 16-year-old batting prodigy. Remember the name: {name}." Dusra: {friend} calling. Teesra: unknown number — MI admin.',
    ],
    react:{ char:'coach', text:'Beta, khushi mana. Par yaad rakh — Mumbai Indians ne tujhe khareeda hai. Cricket ne abhi accept nahi kiya.' },
    q:'Auction ke turant baad kya karte ho?',
    choices:[
      {
        t:'Phone side pe rakho, family ke saath raho',
        s:'Yeh pehle ghar ka pal hai. Internet baad mein.',
        deltas:{ fame:0, heat:-1, image:2 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
          caption:'Mumbai Indians dressing room mein ek naya sensation aa gaya hai. Young, fearless, and already carrying a city-sized dream. Welcome to the Paltan, {name}. 💙',
          reactions:[
            { char:'coach', text:'Sahi. Pehle ghar. Kal se kaam.' },
            { char:'friend', text:'MI Paltan ne post kar diya aur tu phone nahi utha raha?? Superstar era officially scary hai.' },
            { char:'__fan', name:'cricketroom_india', text:'MI introduces their teenage pick. The curiosity around this kid is real.' },
          ],
        },
        dm:[
          { char:'friend', text:'Bro call kar. Main khush hoon, jealous bhi hoon, aur thoda emotional bhi. Family ke saath reh pehle, phir mujhe full story chahiye.' },
          { char:'coach', text:'Beta, aaj ghar ke saath rehna sahi decision tha. Kal subah se phone kam, practice zyada.' },
        ],
      },
      {
        t:'Emotional MI story post karo',
        s:'Moment bada hai. Duniya ko pata chalna chahiye ki tum aa gaye ho.',
        deltas:{ fame:0, heat:2, image:-1 },
        post:[
          {
            source:'account',
            ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
            caption:'Mumbai Indians dressing room mein ek naya sensation aa gaya hai. Paltan, remember this face. The journey starts now. 💙',
            reactions:[
              { char:'__fan', name:'paltanpulse', text:'OUR KID IS HERE. This is exactly the kind of story Paltan loves.' },
            ],
          },
          {
            source:'player',
            caption:'First time MI jersey haath mein aayi toh samajh nahi aaya smile karun ya ro doon. From academy nets to this blue. Dream begins tonight. 💙',
            reactions:[
              { char:'friend', text:'CAPTION READY THA KYA?? 😭 bro sold hua aur influencer mode on.' },
              { char:'coach', text:'Post theek hai. Ab comments mat padhna. Kal subah shadow practice.' },
              { char:'__fan', name:'paltanpulse', text:'The emotional jersey post landed. Paltan is already adopting him.' },
            ],
          },
        ],
        dm:[
          { char:'friend', text:'Bro emotional MI jersey post ne group chat tod diya. Proud of you. Bas ab mujhe seen pe mat chhod.' },
          { char:'coach', text:'Photo achha tha. Lekin yaad rakh, jersey pehna start hai. Us jersey ko justify karna kaam hai.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'coach', caption:'Wankhede photo dekha. Pair zameen pe rakh.' },
      B:{ char:'friend', caption:'Bro tu MI mein hai aur meri abhi bhi attendance proxy chalti hai. At least tag karta 😭' },
    },
  },

  // ── S2 · FIRST DAY ────────────────────────────────────────────────────────────
  {
    id:'CR-S2', day:1, slot:'Morning', tag:'⚡ FIRST DAY · WANKHEDE',
    title:'Training Kit',
    body:[
      'Wankhede ke players\' entrance par tum ek second ruk jaate ho. Blue training kit abhi bhi nayi smell kar rahi hai. Backpack par tumhara naam printed hai — {name} — aur uske neeche MI logo.',
      'Andar field par alag duniya chal rahi hai. Hardik boundary ke paas Mahela ke saath baat kar raha hai. Rohit side-net ke paas khada hai, kisi young bowler ko quietly kuch samjha raha hai. Bumrah apna run-up mark kar raha hai. Tilak throwdowns le raha hai.',
      'Surya tumhe dekh leta hai. Door se grin. Haath utha ke bolta hai: "Aa gaya finally?"',
      'Sab friendly hai. Par sab dekh bhi rahe hain. Tum kaise enter karte ho, yeh pehla data point hai.',
    ],
    react:{ char:'surya', text:'Relax. Yeh Wankhede hai, exam hall nahi. Bas haan, yahan sab answer sheet dekhte hain.' },
    q:'Pehli Wankhede entry kaise play karte ho?',
    choices:[
      {
        t:'Read the room — pehle observe karo',
        s:'Senior room hai. Pehle rhythm samjho, phir apni jagah banao.',
        deltas:{ fame:1, heat:-1, image:2 },
        post:[
          {
            source:'player',
            display:'live-only',
            caption:'First day in blue. Less talking, more learning. 🏏',
            reactions:[
              { char:'tilak', text:'Good. Pehle din observe karna underrated hai.' },
              { char:'rohit', text:'Naya hai. Dekh raha hai. Theek hai.' },
              { char:'__fan', name:'cricketroom_india', text:'MI\'s young pick looked quiet in first training visuals. Some players enter listening.' },
            ],
          },
          {
            source:'account',
            ...CRICKET_SOCIAL_ACCOUNTS.mumbaiIndians,
            display:'feed-only',
            caption:'Training day at Wankhede. New faces, old standards, and the same blue intensity. 💙',
          },
          {
            source:'account',
            ...CRICKET_SOCIAL_ACCOUNTS.cricketroom,
            display:'feed-only',
            caption:'MI training visuals show Rohit speaking quietly with the young group while Hardik and Mahela keep the focus on roles. Early days, useful signals.',
          },
        ],
        caption:'First day in blue. Less talking, more learning. 🏏',
        reactions:[
          { char:'tilak', text:'Good. Pehle din observe karna underrated hai.' },
          { char:'rohit', text:'Naya hai. Dekh raha hai. Theek hai.' },
          { char:'__fan', name:'cricketroom_india', text:'MI\'s young pick looked quiet in first training visuals. Some players enter listening.' },
        ],
      },
      {
        t:'Energy dikhao — sabse quickly bond karo',
        s:'Agar room mein jagah leni hai, toh invisible mat raho.',
        deltas:{ fame:0, heat:1, image:0 },
        post:[
          {
            source:'player',
            display:'live-only',
            caption:'First training. First blue kit. Energy different hai. 💙',
            reactions:[
              { char:'surya', text:'Good good, energy hai. Ab dekhte hain ball aane pe energy kahan jaati hai 😄' },
              { char:'hardik', text:'Confident lag raha hai. Bas confidence ka output bhi chahiye.' },
              { char:'__fan', name:'paltanpulse', text:'He looks like he belongs already. Play him soon.' },
            ],
          },
          {
            source:'account',
            ...CRICKET_SOCIAL_ACCOUNTS.mumbaiIndians,
            display:'feed-only',
            caption:'Wankhede training had the full range today: Hardik in tactical chats, SKY bringing the smiles, and the young guns settling into blue. 💙',
          },
          {
            source:'account',
            ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
            display:'feed-only',
            imageUrl:'/generated/cricket-posts/cr-s2-paltanpulse.png',
            caption:'First training visuals are out. The new kid looks excited, not overwhelmed. Paltan timeline is already asking for more clips.',
          },
        ],
        caption:'First training. First blue kit. Energy different hai. 💙',
        reactions:[
          { char:'surya', text:'Good good, energy hai. Ab dekhte hain ball aane pe energy kahan jaati hai 😄' },
          { char:'hardik', text:'Confident lag raha hai. Bas confidence ka output bhi chahiye.' },
          { char:'__fan', name:'paltanpulse', text:'He looks like he belongs already. Play him soon.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'coach', caption:'Wankhede photo dekha. Pair zameen pe rakh.' },
      B:{ char:'friend', caption:'Bro tu Surya ke saath same frame mein hai. Main school group mein unbearable ho gaya hoon.' },
    },
  },

  // ── S3 · BUMRAH KA OVER ───────────────────────────────────────────────────────
  {
    id:'CR-S3', day:2, slot:'Afternoon', tag:'⚡ NETS · AFTERNOON',
    title:'Bumrah Ka Over',
    body:[
      'Nets ka pehla serious rotation. Tum pads pehne khade ho jab Mahela bolta hai: "{name}, next net. Jasprit, one over."',
      'Bas. Itna hi. Bumrah ball haath mein ghumata hai. Koi sledging nahi. Koi smile nahi. Pehli ball — length dikhti kuch aur hai, guzarti kuch aur. Beat. Dusri — late movement, edge, side-net. Teesri — slower one, tum almost shot complete kar chuke ho jab ball aati hai.',
      'Side se Surya bolta hai: "Welcome package."',
      'Tum dekh sakte ho: Hardik arms folded. Rohit still. Tilak gloves pehne wait kar raha hai. Yeh sirf net over nahi hai. Yeh room ka pehla real test hai.',
    ],
    react:{ char:'bumrah', text:'Tum length guess kar rahe ho. Wrist pehle pick karo.' },
    q:'Agli ball kaise khelte ho?',
    choices:[
      {
        t:'Defend karo, seekho, poochho kya miss hua',
        s:'Publicly beaten hona embarrassing hai. Par information yahi hai.',
        deltas:{ fame:3, heat:-1, image:2 },
        post:{
          source:'player',
          caption:'Bumrah bhai ko saamne se dekh ke samjha: best player sirf ball nahi daalta, poora problem solve karwata hai. Learning from the best. 🏏',
          reactions:[
            { char:'bumrah', text:'Better. Is baar tumne dekha.' },
            { char:'rohit', text:'Good. Ego bahar rakha.' },
            { char:'__fan', name:'cricketroom_india', text:'Young MI batter calling Bumrah the best after a net over. Smart respect, smarter learning.' },
          ],
        },
        dm:{ char:'bumrah', text:'Good that you asked. Next time, release point pehle pick karo. Shot baad mein decide karna.' },
      },
      {
        t:'Charge karo — statement shot maaro',
        s:'Agar sab dekh rahe hain, toh sabko dikhna bhi chahiye.',
        deltas:{ fame:-2, heat:2, image:-2 },
        post:{
          source:'player',
          caption:'Tried to take on Bumrah bhai and got the real lesson: best player wahi hai jo intent ko bhi test bana deta hai. Respect. 🏏',
          reactions:[
            { char:'surya', text:'Shot intent mast tha. Ball thoda jaldi aa gaya tere plan se 😄' },
            { char:'hardik', text:'Intent hai. Control chahiye.' },
            { char:'__fan', name:'memeovers', text:'Bro tried to charge Bumrah and still posted respect. Confidence 100, survival pending.' },
          ],
        },
        dm:{ char:'bumrah', text:'Intent useful hai. Bas pehle ball ko identify karo. Mere against guess karoge toh net bhi long lagta hai.' },
      },
    ],
    feedReaction:{
      A:{ char:'coach', caption:'Aaj beat hua? Achha. Ab video bhej.' },
      B:{ char:'friend', caption:'Bhai Bumrah ka over face kiya aur still alive. Legends only.' },
    },
  },

  // ── S4 · SURYA KA ANGLE ───────────────────────────────────────────────────────
  {
    id:'CR-S4', day:2, slot:'Evening', tag:'⚡ NETS · EVENING',
    title:'Surya Ka Angle',
    body:[
      'Bumrah ke session ke baad tum abhi bhi us over ko dimaag mein rewind kar rahe ho. Tabhi Surya practice ke side-net se awaaz deta hai. Bumrah ne tumhe ball padhna sikhaya; Surya ab tumhe field padhna sikhane wala hai.',
      'Official practice khatam ho chuki hai, par Surya abhi bhi side-net mein hai. Do cones, ek side-arm thrower, aur woh impossible angles jo TV pe casual lagte hain.',
      'Surya tumhe bulata hai. "Aa. Ek cheez dikhaata hoon." Woh pehli ball ko wrist se scoop karta hai. Dusri ko extra cover ke upar. Teesri ko itna late guide karta hai ki tumhe samajhne mein ek second lagta hai ki shot hua bhi ya nahi.',
      'Phir bat tumhe deta hai. "Kar. Par yaad rakh — shot cool lagna alag cheez hai. Shot correct hona alag."',
    ],
    react:{ char:'surya', text:'Freedom ka matlab random nahi hota. Field dekh, phir pagal ban.' },
    q:'Surya ke saath session kaise use karte ho?',
    choices:[
      {
        t:'360 shots try karo — range dikhao',
        s:'Yeh chance hai Surya ko dikhane ka ki tum boring nahi ho.',
        deltas:{ fame:1, heat:2, image:-1 },
        caption:'Learning angles from the best. Some shots you don\'t copy, you earn. 😄🏏',
        reactions:[
          { char:'surya', text:'Energy mast. Ab next time ball bhi choose kar lena champion.' },
          { char:'tilak', text:'Range hai. Control build karna padega.' },
          { char:'__fan', name:'paltanpulse', text:'Surya teaching the kid range-hitting. This is the content we signed up for.' },
        ],
        dm:{ char:'surya', text:'Range dikh gaya champion 😄 Ab next time pehle field bata, phir shot. Tab maza aayega.' },
      },
      {
        t:'Poochho kaunsi ball pe kaunsa shot',
        s:'Shot nahi, decision seekho.',
        deltas:{ fame:3, heat:0, image:2 },
        caption:'Aaj samjha: shot se pehle field padhna padta hai. T20 is not random. 🧠🏏',
        reactions:[
          { char:'surya', text:'Good question. Isliye tu seekhega fast.' },
          { char:'rohit', text:'Shot sab dekhte hain. Sawal kam log poochte hain.' },
          { char:'__fan', name:'cricketroom_india', text:'The viral part is SKY teaching the shot. The important part is the youngster asking about field logic.' },
        ],
        dm:{ char:'surya', text:'Good question tha. Kal 10 minute jaldi aa. Field map pehle banayenge, shots baad mein.' },
      },
    ],
    feedReaction:{
      A:{ char:'friend', caption:'Bro please do not break your spine trying SKY shots. But also please do.' },
      B:{ char:'surya', caption:'Young lad asked the right question today. Range baad mein. Reason pehle.' },
    },
  },

  // ── S5 · ROHIT KA TEMPO ──────────────────────────────────────────────────────
  {
    id:'CR-S5', day:3, slot:'Morning', tag:'⚡ NETS · LATE EVENING',
    title:'Rohit Ka Tempo',
    body:[
      'Dus minute ke liye tum bhool jaate ho ki kaun dekh raha hai. Throwdowns clean lag rahe hain. Cover drive middle. Pull controlled. Ek on-drive itna sweet hai ki side-net ke bahar khade Naman Dhir bolta hai: "Shot."',
      'Naman Dhir bolta hai, "Rohit bhai poore time kuch nahi bolte. Jab bolte hain na, seedha kaam ki baat hoti hai."',
      'Session khatam hota hai. Tum gloves nikaal rahe ho jab Rohit paas se guzarte hain. Bina rukhe sirf ek line:',
      '"Tempo samajh raha hai?"',
      'Tum smile karte ho, par andar se question seedha chubh gaya. Tumne shots khele. Kya tumne innings bhi kheli?',
    ],
    react:{ char:'rohit', text:'Good ball ko respect karna defensive nahi hota. Boring ball ko punish karna attacking nahi hota. Tempo beech mein hai.' },
    q:'Rohit ke sawaal ka kya karte ho?',
    choices:[
      {
        t:'Seedha poochho — tempo kaise build karun?',
        s:'Senior ne door khola hai. Ego leke khade mat raho.',
        deltas:{ fame:3, heat:-1, image:2 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
          caption:'Quiet Rohit masterclass at MI nets today. No speeches, no drama. Just one line to a newcomer and suddenly the whole session had meaning. This is how seniors guide the next batch.',
          reactions:[
            { char:'rohit', text:'Bas game samajhna hai. Baaki aa jaata hai.' },
            { char:'naman', text:'Maine bola tha. Rohit bhai ka one line = full chapter.' },
            { char:'__fan', name:'mipaltan', text:'These mentoring moments are why the MI pathway matters.' },
          ],
        },
        caption:'Aaj seekha: innings aur shots alag hoti hain. 🏏',
        reactions:[
          { char:'rohit', text:'Pehle 12 ball survive nahi. Samajh. Phir game tera.' },
          { char:'tilak', text:'Good you asked. Woh line free mein nahi milti.' },
          { char:'__fan', name:'cricketroom_india', text:'Rohit spent time with MI\'s young batter after nets. These quiet mentoring moments matter.' },
        ],
      },
      {
        t:'Confident laugh — pressure nahi hai dikhao',
        s:'Nervous nahi lagna. Senior ko over-respect bhi weakness lag sakta hai.',
        deltas:{ fame:0, heat:1, image:-1 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
          caption:'Rohit quietly guiding newcomers again. One line after nets, one confused smile from the kid, and a lot for MI fans to decode.',
          reactions:[
            { char:'surya', text:'Rohit bhai one-liners ko lightly mat lena 😄' },
            { char:'naman', text:'Paas se guzarte hain aur homework de jaate hain.' },
            { char:'__fan', name:'cricketroom_india', text:'The young batter looked confident, but Rohit\'s tempo point may matter more than the shots.' },
          ],
        },
        caption:'Good first hit at Wankhede. Rhythm aa raha hai. 🏏',
        reactions:[
          { char:'rohit', text:'Hmm.' },
          { char:'surya', text:'Haan rhythm hai. Tempo wali baat phir bhi sun le kabhi.' },
          { char:'__fan', name:'futurexi', text:'The kid looks confident in MI nets. Body language says he knows he belongs.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'coach', caption:'Tempo seekh. Har ball audition nahi hoti.' },
      B:{ char:'friend', caption:'Rohit said one line and you posted rhythm? Bro I am afraid of your confidence.' },
    },
  },

  // ── S6 · HARDIK KA ROLE ──────────────────────────────────────────────────────
  {
    id:'CR-S6', day:3, slot:'Evening', tag:'⚡ TEAM MEETING · NIGHT',
    title:'Hardik Ka Role',
    body:[
      'Team hotel ka meeting room. Whiteboard par likely XI nahi likha, sirf matchups. Left-arm spin. Death overs. Powerplay. Impact sub.',
      'Meeting ke baad Hardik tumhe rukne ka signal deta hai. Mahela bhi table ke end par hai. Yeh casual nahi hai.',
      'Hardik seedha bolta hai: "Tera first chance, jab aayega, opening nahi hoga. Ho sakta hai no. 5. Ho sakta hai no. 6. Ho sakta hai 28 off 15. Tu ready hai uske liye?"',
      'Tumne zindagi bhar top order bat kiya hai. Tumhara viral clip powerplay ka hai. Fan pages tumhe opener bol rahe hain. Dressing room tumse kuch aur maang raha hai.',
    ],
    react:{ char:'hardik', text:'Role chhota nahi hota. Execution chhota ya bada hota hai.' },
    q:'Hardik ko kya jawaab dete ho?',
    choices:[
      {
        t:'Accept karo — team jahan bole, wahan bat karunga',
        s:'Agar MI ko role chahiye, toh role do. Trust yahin banta hai.',
        deltas:{ fame:1, heat:-1, image:3 },
        caption:'Role clarity. Team first. Ready whenever needed. 💙',
        reactions:[
          { char:'hardik', text:'Good. Yeh answer vague nahi tha.' },
          { char:'tilak', text:'Yahi se chances open hote hain. Seriously.' },
          { char:'__fan', name:'cricketroom_india', text:'Role acceptance may decide how soon MI use their teenage batter.' },
        ],
        dm:{ char:'hardik', text:'Good answer. Role clear rakhna. Jab chance aayega, mujhe flexibility chahiye, explanation nahi.' },
      },
      {
        t:'Bol do opening tumhara best use hai',
        s:'Agar tum apni strength nahi bologe, kaun bolega?',
        deltas:{ fame:1, heat:2, image:-3 },
        caption:'Clarity matters. I know my game. I know where I can impact. 🏏',
        reactions:[
          { char:'hardik', text:'Fair. Bas team sheet individual comfort se nahi banti.' },
          { char:'rohit', text:'Opener banna hai toh wait kar. Player banna hai toh adapt kar.' },
          { char:'__fan', name:'paltanpulse', text:'Let the kid open! Why buy a prodigy and then hide him at 6?' },
        ],
        dm:{ char:'hardik', text:'I like clarity, but team balance pehle aata hai. Apni strength rakh, par role ke liye ready reh.' },
      },
    ],
    feedReaction:{
      A:{ char:'mahela', caption:'Young players who understand roles travel faster.' },
      B:{ char:'friend', caption:'Bro you told Hardik Pandya you want to open. You are built different. Terrifyingly different.' },
    },
  },

  // ── S7 · REEL YA OVER ────────────────────────────────────────────────────────
  {
    id:'CR-S7', day:4, slot:'Night', tag:'⚡ MATCHDAY -1 · NIGHT',
    title:'Reel Ya Over',
    body:[
      'Raat 9:40. Team hotel ke basement nets mein lights abhi bhi on hain. Bumrah apna last spell khatam kar raha hai. Tum gloves pakad ke khade ho jab MI social admin bhaagte hue aata hai.',
      '"Sponsor reel abhi shoot karni padegi. Approval kal subah hai. Five minutes only."',
      'Five minutes kabhi five minutes nahi hote. Makeup nahi, par setup. Retake. Product hold. Smile.',
      'Dusri taraf Bumrah tumhari taraf dekhta hai. "One more over?"',
      'Tumhare paas 12 minute hain. Dono nahi ho sakte.',
    ],
    react:{ char:'coach', text:'Match se pehle raat ko jo choose karta hai, wahi player asli hota hai.' },
    q:'Raat ke 12 minute kisko dete ho?',
    choices:[
      {
        t:'Sponsor reel shoot karo',
        s:'Visibility bhi career ka part hai. MI social team bhi team ka part hai.',
        deltas:{ fame:-2, heat:3, image:-2 },
        caption:'First matchweek with MI. Grateful for every moment. Big things loading. 💙',
        reactions:[
          { char:'surya', text:'Reel clean tha. Bas kal timing bhi clean rakhna 😄' },
          { char:'bumrah', text:'Over kal nahi milega.' },
          { char:'__fan', name:'paltanpulse', text:'Sponsor reel already? Starboy behaviour. Need debut now.' },
        ],
        dm:null,
      },
      {
        t:'Extra nets lo — Bumrah ka over',
        s:'Reel wait karegi. Slower ball nahi.',
        deltas:{ fame:3, heat:-1, image:2 },
        caption:'Phone kit bag mein raha. Nets mein tha. 🏏',
        reactions:[
          { char:'bumrah', text:'Better. Still early on the slower one, but better.' },
          { char:'hardik', text:'Noted.' },
          { char:'__fan', name:'cricketroom_india', text:'MI\'s young batter skipped a sponsor capture for extra nets. Small thing. Serious signal.' },
        ],
        dm:null,
      },
    ],
    feedReaction:{
      A:{ char:'friend', caption:'Bro has played 0 IPL balls and already has better lighting than half the league.' },
      B:{ char:'coach', caption:'Video mila. Kal ball dekh ke khelna, naam dekh ke nahi.' },
    },
  },

  // ── S8 · TILAK KA FINISH ─────────────────────────────────────────────────────
  {
    id:'CR-S8', day:5, slot:'Afternoon', tag:'⚡ PRACTICE CHASE',
    title:'Tilak Ka Finish',
    body:[
      'Practice chase: 36 needed off 24. Tilak walks in like he has already watched the ending. First two balls singles. Third ball sweep. Fourth ball deep midwicket ke upar — not slog — placement. Last over tak chase khatam.',
      'Mahela seedha bolta hai: "That is role clarity." Hardik nods. Rohit smiles thoda sa. Surya claps once.',
      'Tum boundary rope ke paas helmet haath mein pakad ke khade ho. Tumhare viral clips mein bhi shots the. Par yahan room ne sirf shot ko nahi, clarity ko clap kiya.',
      'Tilak gloves nikaal ke tumhari taraf aata hai.',
    ],
    react:{ char:'tilak', text:'Good shots sab maar lete hain. Jab team ko kya chahiye woh clear ho na, tab easy lagta hai.' },
    q:'Tilak ke praise ko kaise handle karte ho?',
    choices:[
      {
        t:'Congratulate karo aur poochho kya socha tha',
        s:'Benchmark se jalna easy hai. Usse seekhna useful hai.',
        deltas:{ fame:2, heat:-1, image:2 },
        post:{
          source:'player',
          imageUrl:'/generated/cricket-posts/cr-s8-player.png',
          caption:'Tilak bhai ka finish dekh ke samjha: good shots alag cheez hain, right situation mein right shot alag. Public praise because this was a lesson. 💙',
          reactions:[
            { char:'tilak', text:'Respect. Ab next chase mein tu bata bowler ka plan kya tha.' },
            { char:'rohit', text:'Competition se zyada learning important hai pehle.' },
            { char:'__fan', name:'cricketroom_india', text:'Publicly praising Tilak after a practice chase is a mature dressing-room signal.' },
          ],
        },
        caption:'Benchmark hai toh seekhna padega. Simple. 🏏',
        reactions:[
          { char:'tilak', text:'Good question. Main bataata hoon kaunsa bowler target tha.' },
          { char:'rohit', text:'Competition se zyada learning important hai pehle.' },
          { char:'__fan', name:'cricketroom_india', text:'Tilak remains the template for MI\'s young Indian batting pathway. New kid watching closely.' },
        ],
        dm:{ char:'tilak', text:'Good that you asked. Next time chase dekhte waqt sirf shot mat dekh, bowler ka over plan dekh.' },
      },
      {
        t:'Personal lo aur late tak akela train karo',
        s:'Agar trust nahi mil raha, toh extra work se lo.',
        deltas:{ fame:2, heat:1, image:-1 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
          imageUrl:'/generated/cricket-posts/cr-s8-mipaltan.png',
          caption:'Lights stayed on late at the MI nets tonight. The young group is pushing hard, and {name} was among the last to leave. Work quietly. Grow loudly. 💙',
          reactions:[
            { char:'tilak', text:'Work good hai. Bas isolation ko process mat samajh.' },
            { char:'surya', text:'Akela maarna easy hai. Match mein 10 log saath hote hain.' },
            { char:'__fan', name:'futurexi', text:'Late-night nets after watching Tilak finish. Competition in MI camp is real.' },
          ],
        },
        caption:'Extra work. No shortcuts. 🏏',
        reactions:[
          { char:'tilak', text:'Work good hai. Bas isolation ko process mat samajh.' },
          { char:'surya', text:'Akela maarna easy hai. Match mein 10 log saath hote hain.' },
          { char:'__fan', name:'futurexi', text:'The kid stayed late after Tilak\'s practice chase. Competition in MI camp is real.' },
        ],
        dm:{ char:'tilak', text:'Extra work achha hai. Par next time saath mein karenge. Young table bhi process ka part hai.' },
      },
    ],
    feedReaction:{
      A:null,
      B:{ char:'friend', caption:'Bro I saw late-night training post. Inspirational but also please eat dinner.' },
    },
  },

  // ── S9 · DRINKS BREAK ────────────────────────────────────────────────────────
  {
    id:'CR-S9', day:5, slot:'Night', tag:'⚡ BENCH PHASE · MATCH 3',
    title:'Drinks Break',
    body:[
      'Teesra match. Teesri baar tum XI sheet mein nahi ho.',
      'Pehle match mein tumne bola: "Good for team." Dusre mein: "Long season." Aaj jab team sheet aayi, tumne bas smile kiya. Woh professional smile jo aankhon tak nahi jaata.',
      'Wankhede mein crowd MI chant kar raha hai. Tum orange bib mein boundary ke paas warm-up kar rahe ho. Fan page notification: @paltanpulse: "Why buy {name} if you\'re not going to play him?"',
      'Drinks break ke time Hardik tumhe bottle deta hai. "Stay ready." Yeh simple line hai. Ya test. Ya warning.',
    ],
    react:{ char:'hardik', text:'Bench pe kaise behave karta hai player, XI se pehle wahi dikhta hai.' },
    q:'Teesri benching ke baad kya karte ho?',
    choices:[
      {
        t:'Stay ready — drills, drinks, full involvement',
        s:'Playing XI nahi, par team se bahar bhi nahi.',
        deltas:{ fame:1, heat:-1, image:3 },
        post:{
          source:'player',
          caption:'Not in the XI yet, but drills, drinks, fielding, energy — full involvement. Bench phase bhi team ka part hai. 💙',
          reactions:[
            { char:'hardik', text:'Good. Yeh attitude useful hai.' },
            { char:'tilak', text:'I know it sucks. Par yahi phase kaam aata hai.' },
            { char:'__fan', name:'cricketroom_india', text:'Body language watch: active in drills despite another benching. Staff notice this.' },
          ],
        },
        caption:'Not in the XI yet. Still in the work. Still in the team. 💙',
        reactions:[
          { char:'hardik', text:'Good. Yeh attitude useful hai.' },
          { char:'tilak', text:'I know it sucks. Par yahi phase kaam aata hai.' },
          { char:'__fan', name:'cricketroom_india', text:'Body language watch: young MI batter active in drills despite third straight benching. Staff will notice.' },
        ],
        dm:null,
      },
      {
        t:'Fan posts like karo — public pressure bolne do',
        s:'Agar fans sach bol rahe hain, toh unhe ignore kyun karein?',
        deltas:{ fame:0, heat:3, image:-3 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
          caption:'Question needs asking: why draft a 16-year-old prodigy if the plan is only orange bibs and drinks duty? Paltan wants clarity. The kid looks ready. Does MI trust him yet?',
          reactions:[
            { char:'surya', text:'Likes bhi screenshots ban jaate hain champion.' },
            { char:'hardik', text:'Public pressure selection meeting mein kaam nahi karta.' },
            { char:'__fan', name:'memeovers', text:'From wonderkid to waterboy discourse in three matches. IPL timeline never sleeps.' },
          ],
        },
        caption:'Paltan dekh raha hai. Main ready hoon. 💙',
        reactions:[
          { char:'surya', text:'Likes bhi screenshots ban jaate hain champion.' },
          { char:'hardik', text:'Public pressure selection meeting mein kaam nahi karta.' },
          { char:'__fan', name:'paltanpulse', text:'HE LIKED OUR POST. The kid wants to play. Give him the debut.' },
        ],
        dm:{ char:'surya', text:'Champion, mat kar yeh. Fan post like karna chhota lagta hai, par dressing room mein screenshot bada ho jaata hai.' },
      },
    ],
    feedReaction:{
      A:{ char:'coach', caption:'Bench bhi classroom hai. Notebook leke baith.' },
      B:null,
    },
  },

  // ── S10 · MAHELA KA SCREEN ───────────────────────────────────────────────────
  {
    id:'CR-S10', day:6, slot:'Afternoon', tag:'⚡ TACTICAL ROOM',
    title:'Mahela Ka Screen',
    body:[
      'Mahela meeting start karte hi acknowledge karta hai: "You have not played yet. That is not punishment. That is preparation time. What we do with this time matters."',
      'Hotel meeting room thanda hai. AC zyada. Screen par tumhara wagon wheel. Uske side mein numbers: vs leg spin, vs left-arm orthodox, first 10 balls, balls 11-20.',
      'Mahela pointer se ek red zone highlight karta hai. "This is where teams will bowl to you."',
      'Tumhare stomach mein halka sa drop. Yeh wahi area hai jahan tum domestic/U19 mein hands se nikal jaate the. Yahan woh data ban gaya hai.',
      'Mahela seedha poochta hai: "Are you ready for this matchup?" Room mein Hardik hai. Analyst hai. Tilak bhi corner mein hai. Safe answer obvious hai. Sahi answer mushkil.',
    ],
    react:{ char:'mahela', text:'Young players lose time pretending they don\'t have weaknesses. Good ones start building plans.' },
    q:'Spin matchup ke baare mein kya kehte ho?',
    choices:[
      {
        t:'Weakness admit karo, plan maango',
        s:'Sach bolna short-term uncomfortable hai. Long-term useful.',
        deltas:{ fame:3, heat:-1, image:2 },
        caption:'Weakness naam dene se chhoti ho jaati hai. Ignore karne se badi. 🏏',
        reactions:[
          { char:'mahela', text:'Good. Now we can work.' },
          { char:'tilak', text:'Admit karna hard hota hai. But plan tabhi banta hai.' },
          { char:'__fan', name:'cricketroom_india', text:'If MI use the youngster, watch his spin matchup. That may decide batting position.' },
        ],
        dm:null,
      },
      {
        t:'Bol do ready ho kisi bhi matchup ke liye',
        s:'Opportunity ke pehle doubt dikhana dangerous lagta hai.',
        deltas:{ fame:0, heat:1, image:-2 },
        caption:'Ready for whatever comes. That\'s the job. 🏏',
        reactions:[
          { char:'mahela', text:'Confidence noted. Plan still needed.' },
          { char:'bumrah', text:'Opponent plan ke saath aayega. Statement ke saath nahi.' },
          { char:'__fan', name:'futurexi', text:'Love the confidence. Big players believe before others do.' },
        ],
        dm:null,
      },
    ],
    feedReaction:{
      A:{ char:'rohit', caption:'Weakness naam dene se chhoti ho jaati hai. Ignore karne se badi.' },
      B:{ char:'coach', caption:'Ready bolne se ready nahi hota. Ready hone se ready hota.' },
    },
  },

  // ── S11 · SLOT KHUL GAYA ─────────────────────────────────────────────────────
  {
    id:'CR-S11', day:7, slot:'Evening', tag:'⚡ MATCHDAY · EVENING',
    title:'Slot Khul Gaya',
    body:[
      'Toss se 90 minute pehle dressing room mein woh silence aata hai jo sirf injury news ke baad aata hai. Ek player ka niggle warm-up mein tight ho gaya. Physio Hardik ko side mein le jaata hai.',
      'Five minutes baad Hardik tumhare paas aata hai. "There is one slot. Agar tu khelta hai, role flexible hoga. Maybe no. 5. Maybe impact. Maybe field first and wait. What can you give us tonight?"',
      'Phone locker mein hai, par tum jaante ho bahar kya ho raha hoga. Fan pages. Debut watch. Edits. Pressure. Andar sirf ek sawaal hai: team ko kya doge?',
    ],
    react:{ char:'hardik', text:'Mujhe answer chahiye, slogan nahi.' },
    q:'Debut chance pe kya bolte ho?',
    choices:[
      {
        t:'"Wherever the team needs"',
        s:'Role fluid hai. Tum bhi fluid ho.',
        deltas:{ fame:1, heat:0, image:3 },
        caption:'If the chance comes, the role is simple: do what the team needs. 💙',
        reactions:[
          { char:'hardik', text:'Good. Clear.' },
          { char:'tilak', text:'Ab chance aayega toh ready rehna. Yeh line easy nahi hoti.' },
          { char:'__fan', name:'cricketroom_india', text:'Role flexibility may be the reason MI finally use their young batter.' },
        ],
        dm:null,
      },
      {
        t:'Top-order chance maango',
        s:'Agar debut hai, toh best chance bhi hona chahiye.',
        deltas:{ fame:1, heat:2, image:-2 },
        caption:'Big stages need clear roles. I know where I can impact. 🏏',
        reactions:[
          { char:'hardik', text:'Noted. Team balance bhi noted.' },
          { char:'rohit', text:'Opening ka pressure glamorous lagta hai jab tak pehli ball swing nahi karti.' },
          { char:'__fan', name:'paltanpulse', text:'Give him top order. Don\'t waste him. Wankhede wants the kid.' },
        ],
        dm:null,
      },
    ],
    feedReaction:{
      A:{ char:'mahela', caption:'Preparedness is not about knowing your slot. It is about knowing your options.' },
      B:null,
    },
  },

  // ── S12 · PEHLI BALL ─────────────────────────────────────────────────────────
  {
    id:'CR-S12', day:7, slot:'Night', tag:'⚡ DEBUT · WANKHEDE LIGHTS',
    title:'Pehli Ball',
    body:[
      'Wankhede lights ke neeche sound alag hota hai. TV pe jo roar lagta hai, ground pe woh pressure ban ke chest mein baithta hai.',
      'MI need 42 off 28. Tum no. 5 par ja rahe ho. Helmet ke andar breath loud lag rahi hai. Non-striker tumhe sirf itna bolta hai: "Ball dekh."',
      'Bowler run-up start karta hai. Field: long-on back, deep midwicket back, third up, fine leg inside. First ball thodi short, thodi pace-off. Hittable hai. Risk-free nahi.',
      'Crowd tumhara naam nahi jaanta poora, par chant karne ki koshish kar raha hai. Tumhari pehli IPL ball. Tumhari first public truth.',
    ],
    react:{ char:'rohit', text:'Pehli ball career nahi hoti. Bas pehli ball hoti hai.' },
    q:'Pehli ball ka kya karte ho?',
    choices:[
      {
        t:'Build the chase — gap mein do lo',
        s:'Moment bada hai. Ball utni badi nahi.',
        deltas:{ fame:4, heat:1, image:3 },
        outcomeGate:{
          metric:'fame',
          threshold:52,
          pass:{
            title:'YOU PLAYED WELL',
            note:'Your Form is above 52, so the first-ball nerves settle quickly. You watch the pace-off ball, find the gap, and the debut starts with control.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              imageUrl:'/generated/cricket-posts/cr-s12-mipaltan.png',
              caption:'Calm first touch from {name} on debut. Noise around, eyes still. Found the gap, ran hard, and gave the chase exactly what it needed. 💙',
              reactions:[
                { char:'hardik', text:'Good first decision. Scorecard se pehle decision dikhta hai.' },
                { char:'rohit', text:'Panic nahi kiya. Good.' },
                { char:'__fan', name:'cricketroom_india', text:'First ball: no slog, found the gap. That says more than a highlight would have.' },
              ],
            },
          },
          fail:{
            title:'OUT EARLY',
            note:'Your Form is 52 or below, and it shows under lights. The shot starts before the read is complete. Early edge, short stay. Poor Form has caught up at the worst time.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              imageUrl:'/generated/cricket-posts/cr-s12-mipaltan.png',
              caption:'Tough first outing for {name}. Debut pressure is real, and today the stay was short. The work continues. Paltan stays behind the kid. 💙',
              reactions:[
                { char:'rohit', text:'Happens. But learn quickly.' },
                { char:'hardik', text:'Short stay. Long season.' },
                { char:'__fan', name:'cricketroom_india', text:'Early wicket on debut. The question now is how MI protect and rebuild the youngster.' },
              ],
            },
          },
        },
        caption:'First IPL innings. Noise alag tha. Lesson simple: ball by ball. 💙🏏',
        reactions:[
          { char:'hardik', text:'Good first decision. Scorecard se pehle decision dikhta hai.' },
          { char:'rohit', text:'Panic nahi kiya. Good.' },
          { char:'__fan', name:'cricketroom_india', text:'First ball: no slog, found the gap. That says more than a highlight would have.' },
        ],
      },
      {
        t:'Big shot early — announce yourself',
        s:'Wankhede ko yaad rehna chahiye ki tum aaye the.',
        deltas:{ fame:1, heat:3, image:-2 },
        outcomeGate:{
          metric:'fame',
          threshold:52,
          pass:{
            title:'YOU PLAYED WELL',
            note:'Your Form is above 52, so the aggressive option comes from timing, not panic. You clear the infield and Wankhede finally learns your name.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              imageUrl:'/generated/cricket-posts/cr-s12-mipaltan.png',
              caption:'First ball, first roar. {name} backed the shot and Wankhede felt the spark. Fearless, yes. But the timing made it work. 💙🔥',
              reactions:[
                { char:'surya', text:'Intent mast. Field bhi padha, isliye shot nikla.' },
                { char:'hardik', text:'Crowd ko pasand aaya. Dressing room ko timing bhi dikha.' },
                { char:'__fan', name:'paltanpulse', text:'THE KID WENT FOR IT FIRST BALL. Wankhede has a new sound.' },
              ],
            },
          },
          fail:{
            title:'OUT EARLY',
            note:'Your Form is 52 or below, so the big shot becomes a guess. The crowd rises, the ball hangs, and the fielder settles under it. Early wicket because the base was not ready.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              imageUrl:'/generated/cricket-posts/cr-s12-mipaltan.png',
              caption:'A bold first-ball intent from {name}, but debut nights are unforgiving. Out early today. Back to work tomorrow. 💙',
              reactions:[
                { char:'surya', text:'Intent tha. Base missing tha.' },
                { char:'hardik', text:'Fearless is useful only with clarity.' },
                { char:'__fan', name:'memeovers', text:'First-ball hero shot became first-ball lesson. IPL is brutal.' },
              ],
            },
          },
        },
        caption:'First IPL ball. First instinct. No fear. 💙🔥',
        reactions:[
          { char:'surya', text:'Intent mast. Bas field bhi dekh le next time champion.' },
          { char:'hardik', text:'Crowd ko pasand aaya. Dressing room ko context bhi chahiye.' },
          { char:'__fan', name:'paltanpulse', text:'THE KID WENT FOR IT FIRST BALL. He has star written all over him.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'coach', caption:'Pehli ball pe cricket khela. Drama nahi. Achha.' },
      B:{ char:'friend', caption:'BRO YOU HIT THE FIRST BALL IN AN IPL MATCH. I am not normal anymore.' },
    },
  },

  // ── S13 · PHONE EXPLOSION ────────────────────────────────────────────────────
  {
    id:'CR-S13', day:8, slot:'Morning', tag:'⚡ POST-MATCH · MIDNIGHT',
    title:'Phone Explosion',
    body:[
      'Match khatam. Dressing room ka noise dheere dheere normal ho raha hai — kit bags zip, recovery shakes, physio table, someone laughing too loud.',
      'Tumhara phone locker se nikalte hi freeze. 217 WhatsApp messages. 48 missed calls. 11,000 new followers. MI tag. Fan edits. Ek clip jisme tumhara pehla shot slow-motion mein hai, dramatic music.',
      'Top par teen unread messages: Hardik: "Good. Recovery first." Coach Sir: "Call when free. Not before stretching." {friend}: "BROOOOOOOOOOOOO."',
      'Bahar public tumhara moment bana rahi hai. Andar team already next match ki baat kar rahi hai.',
    ],
    react:{ char:'tilak', text:'Phone baad mein. Pehle ice bath. Trust me.' },
    q:'Pehle 20 minutes kisko dete ho?',
    choices:[
      {
        t:'Team seniors ko message, recovery, then phone',
        s:'Public moment hai. Par dressing room routine pe chalta hai.',
        deltas:{ fame:0, heat:0, image:3 },
        post:[
          {
            source:'character',
            char:'hardik',
            display:'feed-only',
            caption:'Debut nights are special. What matters more is how a young player comes back the next morning. Good start, {name}. Long season. 💙',
            reactions:[{ char:'__fan', name:'mipaltan', text:'Captain backing the kid after debut. Big moment.' }],
          },
          {
            source:'character',
            char:'surya',
            display:'feed-only',
            caption:'First match pressure hits different. Kid handled the room well. Ab kal nets mein real fun 😄💙',
            reactions:[{ char:'__fan', name:'paltanpulse', text:'SKY approval after debut. We are seated.' }],
          },
          {
            source:'account',
            ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
            display:'feed-only',
            caption:'DEBUT WATCH: {name} has officially played for Mumbai Indians. Whatever the scorecard says, this is the start of a very serious Indian cricket story.',
            reactions:[{ char:'__fan', name:'futurexi', text:'The timeline will remember this first appearance.' }],
          },
          {
            source:'character',
            char:'friend',
            display:'feed-only',
            caption:'My bro really debuted for MI and still owes me a call. Proud? Yes. Angry? Also yes. BROOOOOOOOOOOOO.',
            reactions:[{ char:'__fan', name:'memeovers', text:'Maddy is all of us after that debut.' }],
          },
        ],
        caption:'Debut done. Work continues. Thank you Paltan. 💙',
        reactions:[
          { char:'hardik', text:'Good. Recovery first means you listened.' },
          { char:'coach', text:'Ab call kar. Score discuss karenge, emotions nahi.' },
          { char:'__fan', name:'cricketroom_india', text:'Understated post after debut. MI will like that more than fans do.' },
        ],
        dm:[
          { char:'hardik', text:'Good. Recovery first. Kal review mein specifics chahiye, emotions nahi.' },
          { char:'coach', text:'Call jab stretching khatam. Pehle body cool down. Phir innings todte hain.' },
          { char:'friend', text:'BROOOOOOOOOOOOO. Tu TV pe tha. Main normal behave nahi kar pa raha.' },
          { char:'surya', text:'Debut ho gaya champion. Ab second game mein same energy, thoda kam drama 😄' },
        ],
      },
      {
        t:'Cinematic celebration reel post karo',
        s:'Yeh moment dobara nahi aayega. Own it.',
        deltas:{ fame:0, heat:3, image:-2 },
        post:[
          {
            source:'character',
            char:'hardik',
            display:'feed-only',
            caption:'Debut is one step. The league tests repeatability. Back to work, {name}.',
            reactions:[{ char:'__fan', name:'cricketroom_india', text:'Captain keeping the hype grounded.' }],
          },
          {
            source:'character',
            char:'surya',
            display:'feed-only',
            caption:'Debut reel fire tha. Bas kal bowling machine bhi reel banayegi if late hua 😄💙',
            reactions:[{ char:'__fan', name:'paltanpulse', text:'SKY teasing him after debut is wholesome content.' }],
          },
          {
            source:'account',
            ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
            display:'feed-only',
            caption:'The debut reel is everywhere. {name} has arrived on the IPL timeline, and Paltan has already started making edits.',
            reactions:[{ char:'__fan', name:'futurexi', text:'This is how star arcs begin.' }],
          },
          {
            source:'character',
            char:'friend',
            display:'feed-only',
            caption:'Debut reel viral. Group chat finished. I am accepting interviews as childhood friend from today.',
            reactions:[{ char:'__fan', name:'memeovers', text:'Maddy monetizing friendship faster than brands.' }],
          },
        ],
        caption:'Dreamt it. Lived it. Wankhede, you were unreal. 💙🔥 #DebutNight',
        reactions:[
          { char:'friend', text:'Reel fire. Comments warzone. Main moderation sambhal raha hoon.' },
          { char:'surya', text:'Good edit. Ab kal bowling machine edit karegi tujhe if late hua.' },
          { char:'__fan', name:'paltanpulse', text:'Debut reel gave chills. This kid understands the stage.' },
        ],
        dm:[
          { char:'friend', text:'BROOOOO reel viral. Main comments mein logon se lad raha hoon. Proud but tu reply kar.' },
          { char:'surya', text:'Good edit champion. Bas kal late mat hona. Viral reel se bowling machine slow nahi hoti 😄' },
          { char:'hardik', text:'Enjoy tonight. Tomorrow review. Debut cannot become distraction.' },
          { char:'coach', text:'Reel dekh li. Ab video call pe footwork dekhunga.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'rohit', caption:'First game ke baad sab message karte hain. Second game ke liye kaun ready hai, woh important hai.' },
      B:{ char:'friend', caption:'Bro your debut reel is viral. Simultaneously proud and embarrassed to know you.' },
    },
  },

  // ── S14 · PUBLIC INTERVIEW ───────────────────────────────────────────────────
  {
    id:'CR-S14', day:8, slot:'Evening', tag:'⚡ MEDIA ROOM · BRAND DESK',
    title:'First Match Interview',
    body:[
      'Next afternoon, MI media room ka setup ready hai. Backdrop par sponsor logos, table par mic, aur side mein ek brand bottle exactly frame ke center mein rakhi hui.',
      'Reporter poochta hai: "First match ke baad kaisa feel ho raha hai? Nervous? Proud? Pressure?"',
      'MI media manager aankhon se signal deta hai: brand line miss mat karna. Dressing room ka ek assistant quietly record kar raha hai. Yeh sirf interview nahi hai; yeh public image ka first test hai.',
      'Tum jaante ho fans emotional answer chahenge. Brand polished line chahega. Team bas yeh dekh rahi hai ki tum fake toh nahi lag rahe.',
    ],
    react:{ char:'hardik', text:'Media mein sach bolo, par headline mat gift karo.' },
    q:'Public interview ka answer kaise dete ho?',
    choices:[
      {
        t:'Honest answer do, brand ko natural rakho',
        s:'Emotion real rakho. Sponsor line ko plastic mat banao.',
        deltas:{ fame:1, heat:1, image:2 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
          caption:'First interview after debut. {name} kept it honest: nerves, gratitude, and back to work. Presented by our hydration partner. 💙',
          reactions:[
            { char:'hardik', text:'Good. No headline. Clear answer.' },
            { char:'__fan', name:'cricketroom_india', text:'Handled the brand integration without sounding scripted. Rare for a teenager.' },
          ],
        },
        caption:'First interview done. Nerves bhi the, gratitude bhi. Back to work. 💙',
        reactions:[
          { char:'hardik', text:'Good. No headline. Clear answer.' },
          { char:'__fan', name:'cricketroom_india', text:'The answer felt honest, not media-trained.' },
        ],
        dm:null,
      },
      {
        t:'Big emotional quote do, brand line push karo',
        s:'Interview bhi moment hai. Clip banana hai.',
        deltas:{ fame:-1, heat:3, image:-2 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
          caption:'Debut interview: big emotions, bigger dreams. {name} says the first match was "only the trailer" while thanking Paltan and our hydration partner. 💙',
          reactions:[
            { char:'surya', text:'Trailer line mast tha. Bas series bhi achhi banana 😄' },
            { char:'__fan', name:'paltanpulse', text:'ONLY THE TRAILER. Clip this. Star language already here.' },
          ],
        },
        caption:'First match was only the trailer. Paltan, thank you. 💙',
        reactions:[
          { char:'surya', text:'Trailer line mast tha. Bas series bhi achhi banana 😄' },
          { char:'hardik', text:'Headline mil gaya. Ab performance bhi repeat kar.' },
          { char:'__fan', name:'paltanpulse', text:'ONLY THE TRAILER. Clip this.' },
        ],
        dm:null,
      },
    ],
    feedReaction:{
      B:null,
      A:null,
    },
  },

  // ── S15–S30: abbreviated to key situations ───────────────────────────────────
  {
    id:'CR-S15', day:9, slot:'Morning', tag:'⚡ REVIEW ROOM',
    title:'Runs Ka Matlab',
    body:[
      'Subah 10:15. Hotel review room. Tumhari first innings screen par pause hai. Scorecard ek number dikhata hai, par room us number ko alag tareeke se padh raha hai.',
      'Mahela clip chalata hai. First scoring shot. First dot. First risk. First mistake.',
      'Public ne innings ko story bana diya. Dressing room usse information bana raha hai.',
    ],
    react:{ char:'mahela', text:'Runs matter. But how you got them tells us what to do next.' },
    q:'Review room mein apni innings kaise discuss karte ho?',
    choices:[
      {
        t:'Specific mistakes accept karo',
        s:'Score se zyada process dikhao. Seniors ko yeh language samajh aati hai.',
        deltas:{ fame:2, heat:-1, image:2 },
        caption:'Kal ki innings kal ki thi. Aaj ka session aaj ka hai. 🏏',
        reactions:[
          { char:'mahela', text:'Good. That is useful feedback.' },
          { char:'bumrah', text:'You saw the mistake. Now reduce repeat.' },
          { char:'__fan', name:'cricketroom_india', text:'Post-debut review will decide whether MI use him as a one-off spark or a serious role option.' },
        ],
        dm:null,
      },
      {
        t:'Positive spin rakho — confidence project karo',
        s:'Young player ko doubt dikhana dangerous lag sakta hai.',
        deltas:{ fame:0, heat:1, image:-1 },
        caption:'First one done. Took lessons. Still backing my game. 🏏',
        reactions:[
          { char:'hardik', text:'Backing game is fine. Naming gaps is better.' },
          { char:'surya', text:'Confidence rakho. Bas feedback ko enemy mat samjho.' },
          { char:'__fan', name:'futurexi', text:'Loved the confidence after debut. This kid carries himself like he belongs.' },
        ],
        dm:null,
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S16', day:9, slot:'Evening', tag:'⚡ TEAM ACTIVITY · EVENING',
    title:'Young Table',
    body:[
      'Rest evening. No nets. No media. Officially recovery.',
      'Young Table mein Tilak, Naman, Robin aur Raj Bawa cards khel rahe hain. Surya side se commentary kar raha hai jaise yeh World Cup final ho.',
      'Tumhare phone par Maddy ke 12 memes unread hain: ek mein tum helmet pehne toddler lag rahe ho, dusre mein caption hai "MI prodigy waiting for free dessert." Coach Sir ka exact message bhi aaya hai: "Kal subah video call. Footwork."',
      'Ek taraf squad mein ghulna. Dusri taraf woh log jo tumhe tab jaante the jab tumhare paas MI kit nahi thi.',
    ],
    react:{ char:'tilak', text:'Aaja. Har cheez nets mein nahi seekhte.' },
    q:'Rest evening kaise spend karte ho?',
    choices:[
      {
        t:'Young Table ke saath raho',
        s:'Dressing room trust sirf runs se nahi, time se bhi banta hai.',
        deltas:{ fame:0, heat:0, image:2 },
        caption:'Squad time. 💙',
        reactions:[
          { char:'naman', text:'Finally prodigy normal nikla.' },
          { char:'surya', text:'Cards mein bhi shot selection weak hai iska.' },
          { char:'__fan', name:'paltanpulse', text:'Young MI group bonding clips are too wholesome.' },
        ],
        dm:[
          { char:'friend', text:'Meme dump incoming. 1) tu helmet mein toddler. 2) tu free dessert ke liye serious face. 3) "prodigy but can he reply?"' },
          { char:'coach', text:'Kal subah video call. Footwork.' },
        ],
      },
      {
        t:'Home Circle ko call karo',
        s:'Famous room se bahar bhi tumhari ek duniya hai. Use zinda rakho.',
        deltas:{ fame:1, heat:-1, image:1 },
        caption:'Ghar se baat ki. Ground pe raha. 💙',
        reactions:[
          { char:'coach', text:'Good. Ab stance dikha.' },
          { char:'friend', text:'Finally. I had 14 jokes loaded.' },
          { char:'__fan', name:'cricketroom_india', text:'Young players who keep old anchors often handle hype better.' },
        ],
        dm:[
          { char:'friend', text:'Finally call kiya. Meme no. 7 best hai, wait. Also genuinely, proud of you yaar.' },
          { char:'coach', text:'Kal subah video call. Footwork.' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:{ char:'coach', caption:'Training starts even on rest day.' },
    },
  },

  {
    id:'CR-S17', day:10, slot:'Afternoon', tag:'⚡ BRAND ROOM',
    title:'Bat Sticker Offer',
    body:[
      'MI hotel ke business lounge mein ek sports equipment brand ka team baitha hai. Contract table par hai. Bat sticker, gloves, two campaign shoots.',
      'Line jo baar baar repeat ho rahi hai: "India\'s youngest fearless finisher."',
      'Problem yahi hai. Tum abhi finisher ho ya nahi, yeh dressing room bhi decide kar raha hai. Brand ne decide kar liya.',
    ],
    react:{ char:'coach', text:'Bat pe sticker badalne se middle nahi badalta.' },
    q:'Brand paperwork sign ho gaya. Continue?',
    choices:[
      {
        t:'Sign quietly, practice first',
        s:'Deal ho gaya. Announcement simple rakho, schedule untouched.',
        deltas:{ fame:0, heat:2, image:1 },
        post:{
          source:'player',
          caption:'Proud to partner with StrikePro Cricket. Same bat, bigger responsibility. Work continues. 🏏 #StrikePro',
          reactions:[
            { char:'friend', text:'Bro got bat sticker money before I got internship.' },
            { char:'hardik', text:'Just make sure practice schedule doesn\'t move.' },
            { char:'__fan', name:'futurexi', text:'Brand deals already. Star trajectory has started.' },
          ],
        },
        dm:null,
      },
      {
        t:'Lean into the launch',
        s:'Sponsor post polished rakho. Moment ko professional banaao.',
        deltas:{ fame:0, heat:2, image:-1 },
        post:{
          source:'player',
          caption:'Proud to partner with StrikePro Cricket. Same bat, bigger responsibility. Work continues. 🏏 #StrikePro',
          reactions:[
            { char:'friend', text:'Bro got bat sticker money before I got internship.' },
            { char:'hardik', text:'Just make sure practice schedule doesn\'t move.' },
            { char:'__fan', name:'futurexi', text:'Brand deals already. Star trajectory has started.' },
          ],
        },
        dm:null,
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S18', day:11, slot:'Morning', tag:'⚡ AWAY MATCH · CHENNAI',
    title:'Spin Ka Trap',
    body:[
      'Chennai. Surface slow. Crowd yellow. Dressing room whiteboard par teen words: "No ego sweep."',
      'Tum no. 4 par jaate ho because matchup opened. Spinner over the wicket, deep square back, long-on tempting. First two balls dots. Third ball tumhare pad ke paas land hoti hai.',
      'Is pitch par 30 off 28 bhi useful hai. Par public ko 30 off 28 slow lagega. Fan pages ko six chahiye. Tilak non-striker end se bolta hai: "Pitch accept kar."',
    ],
    react:{ char:'mahela', text:'On slow pitches, maturity looks boring on TV.' },
    q:'Spin trap kaise play karte ho?',
    choices:[
      {
        t:'Pitch accept karo, gaps mein build karo',
        s:'Ugly runs bhi runs hote hain. Especially away.',
        deltas:{ fame:3, heat:-1, image:2 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
          caption:'Superstar in the making? {name} just found ugly, useful away runs in Chennai. Not every future star arrives through sixes. Some arrive through hard singles.',
          reactions:[
            { char:'tilak', text:'Good. Pitch ko ego se nahi, plan se khela.' },
            { char:'rohit', text:'Useful runs.' },
            { char:'__fan', name:'cricketroom_india', text:'These were difficult away runs for a 16-year-old. They matter.' },
          ],
        },
        caption:'Away runs teach different things. Not every innings is pretty. 🏏',
        reactions:[
          { char:'tilak', text:'Good. Pitch ko ego se nahi, plan se khela.' },
          { char:'rohit', text:'Useful runs.' },
          { char:'__fan', name:'cricketroom_india', text:'These were difficult away runs for a 16-year-old. May not trend, but they matter.' },
        ],
      },
      {
        t:'Spinner ko pressure mein daalo',
        s:'Dot balls se pressure ban raha hai. Ek over palatna padega.',
        deltas:{ fame:1, heat:2, image:-2 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.futurexi,
          caption:'There is a superstar shape here. {name} tried to change Chennai\'s mood instead of surviving it. Risky? Yes. Box office? Also yes.',
          reactions:[
            { char:'surya', text:'Agar nikal gaya toh genius. Agar nahi nikla toh clip. Dono mein farak hai.' },
            { char:'hardik', text:'Risk samajh ke liya tha ya pressure mein?' },
            { char:'__fan', name:'paltanpulse', text:'He is not scared of conditions.' },
          ],
        },
        caption:'Sometimes you have to change the pitch\'s mood. 🔥',
        reactions:[
          { char:'surya', text:'Agar nikal gaya toh genius. Agar nahi nikla toh clip. Dono mein farak hai.' },
          { char:'hardik', text:'Risk samajh ke liya tha ya pressure mein?' },
          { char:'__fan', name:'paltanpulse', text:'That intent in Chennai. He is not scared of conditions.' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S19', day:11, slot:'Night', tag:'⚡ HOTEL CORRIDOR · MIDNIGHT',
    title:'Runs Ke Baad Silence',
    body:[
      'Chennai waale match ke baad hotel corridor quiet hai. Tumne effort dala, ugly runs nikaale, pressure absorb kiya — par team match haar gayi.',
      'Scorecard tumhara contribution dikha raha hai. Dressing room loss feel kar raha hai. Yeh confusing hota hai: tumne apna kaam kiya, par team jeeti nahi.',
      'Rohit lift ke paas milta hai. Tum usko honestly batana chahte ho ki andar kya chal raha hai. Woh poochta nahi kitne banaye. Sirf poochta hai: "Kya seekha?"',
    ],
    react:{ char:'rohit', text:'Runs yaad rahenge thode din. Learning rehni chahiye.' },
    q:'Rohit ko kya bolte ho?',
    choices:[
      {
        t:'"Runs aaye, par loss zyada feel ho raha hai"',
        s:'Apna score side mein rakho. Team result pe baat karo.',
        deltas:{ fame:2, heat:-1, image:2 },
        post:{
          source:'character',
          char:'rohit',
          caption:'Young blood ko runs se zyada result feel hona chahiye. Aaj ek kid ne woh line samjhi. Good sign.',
          reactions:[
            { char:'hardik', text:'This is the right pain.' },
            { char:'__fan', name:'cricketroom_india', text:'Rohit posting about young blood after the Chennai loss is a serious endorsement.' },
          ],
        },
        caption:'Tough conditions. Good lessons. Onwards. 🏏',
        reactions:[
          { char:'rohit', text:'Good. Short rakha.' },
          { char:'coach', text:'Video bhej. Caption nahi.' },
          { char:'__fan', name:'cricketroom_india', text:'Understated post after a tricky away game. MI may be managing the hype carefully.' },
        ],
      },
      {
        t:'"Mujhe lag raha hai meri innings waste ho gayi"',
        s:'Emotion real hai. Rohit ko batao.',
        deltas:{ fame:0, heat:2, image:-2 },
        post:{
          source:'character',
          char:'rohit',
          caption:'Young blood ko yeh samajhna padta hai: good innings bhi loss mein incomplete lagti hai. That discomfort is useful.',
          reactions:[
            { char:'coach', text:'Sahi discomfort.' },
            { char:'__fan', name:'paltanpulse', text:'Rohit guiding the kid after a loss. This is cinema.' },
          ],
        },
        caption:'Every away game teaches who really wants it. I want it. Badly.',
        reactions:[
          { char:'friend', text:'Caption intense. Comments worse. I am tired as your unofficial admin.' },
          { char:'hardik', text:'Wanting it is common. Building it is rare.' },
          { char:'__fan', name:'futurexi', text:'The hunger is visible. These are the players you invest in.' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S20', day:12, slot:'Morning', tag:'⚡ TEAM TRAVEL · FLIGHT',
    title:'Seat 12A',
    body:[
      'Team flight. Tum window seat 12A. Across the aisle Quinton de Kock headphones laga ke quietly scorebook dekh raha hai. Surya aur Will Jacks kisi shot ke angle par debate kar rahe hain.',
      'Young Table group mein meme war chal raha hai. Saath hi Mahela ne tumhe teen clips bheje hain: spin, hard length, slower bouncer.',
      'Flight teen ghante ki hai. Yeh free time nahi hai. Yeh choice hai.',
    ],
    react:{ char:'rohit', text:'Long seasons are built in boring hours.' },
    q:'Flight time kaise use karte ho?',
    choices:[
      {
        t:'Analysis clips dekho',
        s:'Boring hours. Useful hours.',
        deltas:{ fame:2, heat:-1, image:1 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
          caption:'Travel day. Recovery, analysis, and a young squad learning how long seasons are built between games. 💙',
          reactions:[{ char:'__fan', name:'cricketroom_india', text:'Generic travel post, but the process is visible.' }],
        },
        caption:'Flight mein homework. 🏏',
        reactions:[
          { char:'mahela', text:'Good. We discuss tomorrow.' },
          { char:'bumrah', text:'Saw you watching. Note the release points.' },
          { char:'__fan', name:'cricketroom_india', text:'A lot of IPL development happens off-camera. Video work matters.' },
        ],
      },
      {
        t:'Young Table ke saath bond karo',
        s:'Season long hai. Room mein apne log bhi chahiye.',
        deltas:{ fame:-1, heat:0, image:2 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
          caption:'MI travel day scenes: young table memes, seniors locked into analysis, and the season rolling into its serious phase.',
          reactions:[{ char:'__fan', name:'memeovers', text:'Young table content is undefeated.' }],
        },
        caption:'Squad vibes. 💙',
        reactions:[
          { char:'naman', text:'Prodigy finally has bad memes. Good sign.' },
          { char:'tilak', text:'Balance. Thoda clips bhi dekh lena.' },
          { char:'__fan', name:'paltanpulse', text:'Young MI core on flight together. Future looks blue.' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S21', day:12, slot:'Evening', tag:'⚡ MI FOUNDATION DAY',
    title:'Kids Clinic',
    body:[
      'MI Foundation cricket clinic. 40 school kids, tiny pads, oversized helmets, questions that are somehow more dangerous than press conferences.',
      'Ek 11-year-old tumse poochta hai: "Aapko darr lagta hai kya batting karte time?"',
      'Camera side mein hai. Brand backdrop bhi hai. Yeh answer cute bhi ban sakta hai, real bhi.',
    ],
    react:null,
    q:'Kids clinic mein kya answer dete ho?',
    choices:[
      {
        t:'Sach bolo — darr lagta hai, par practice help karti hai',
        s:'Honest answer brand-safe bhi ho sakta hai, bas plastic nahi.',
        deltas:{ fame:1, heat:1, image:2 },
        caption:'Best question today came from the smallest helmet in the room. Fear is real. Practice helps. 💙',
        reactions:[
          { char:'coach', text:'Achha jawab. Bachche ko jhooth nahi bola.' },
          { char:'surya', text:'Good. Real tha.' },
          { char:'__fan', name:'paltanpulse', text:'This clip is adorable and actually deep. Protect him.' },
        ],
      },
      {
        t:'Star answer do — no fear, only confidence',
        s:'Kids ko hero chahiye. Hero bano.',
        deltas:{ fame:-1, heat:2, image:-2 },
        caption:'No fear when you love the game. 💙',
        reactions:[
          { char:'rohit', text:'Fear nahi bolna easy hai. Handle karna hard.' },
          { char:'friend', text:'No fear? Bro you screamed at a cockroach last year.' },
          { char:'__fan', name:'futurexi', text:'That\'s the mentality. Big-stage players speak differently.' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S22', day:13, slot:'Night', tag:'⚡ MUST-WIN LEAGUE MATCH',
    title:'17 Off 8',
    loyaltyChoice:'A',
    body:[
      'League table tight hai. MI ko yeh match jeetna zaroori hai. Tum crease par ho. 17 needed off 8.',
      'Bowler death specialist. Fine leg up, third up, long boundaries square. Hardik dugout se signal karta hai: "Take it deep." Surya boundary line se chillata hai: "Ball dekh!"',
      'Paltan noise mein tumhe apni heartbeat bhi nahi sun rahi. Yeh woh moment hai jahan highlight aur win ek hi shot lagte hain. Par hamesha nahi hote.',
    ],
    react:{ char:'hardik', text:'Finish ka matlab six maarna nahi. Finish ka matlab game khatam karna.' },
    q:'17 off 8 kaise finish karte ho?',
    choices:[
      {
        t:'Game deep le jao, matchups target karo',
        s:'Ek over aur. Right bowler, right ball.',
        deltas:{ fame:3, heat:1, image:3 },
        post:[
          {
            source:'account',
            ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
            caption:'17 off 8. Finished in blue. {name} stayed calm, picked the right matchup, and took MI home in a must-win game. Paltan, remember this night. 💙',
            reactions:[{ char:'hardik', text:'That is finishing.' }],
          },
          {
            source:'character',
            char:'hardik',
            display:'feed-only',
            caption:'Finish ka matlab game khatam karna. Tonight {name} did that.',
            reactions:[{ char:'__fan', name:'paltanpulse', text:'Captain stamp after a win. Huge.' }],
          },
          {
            source:'character',
            char:'rohit',
            display:'feed-only',
            caption:'Good. Situation jeeta.',
            reactions:[{ char:'__fan', name:'cricketroom_india', text:'Rohit does not waste words. This means something.' }],
          },
        ],
        caption:'Finish means staying there. Huge win. 💙',
        reactions:[
          { char:'hardik', text:'That is finishing.' },
          { char:'rohit', text:'Good. Situation jeeta.' },
          { char:'__fan', name:'cricketroom_india', text:'This was the most mature innings of his season if you watched the balls, not just the score.' },
        ],
        dm:[
          { char:'hardik', text:'That is finishing. You won the game, not just a moment.' },
          { char:'rohit', text:'Good. Situation jeeta. Remember this feeling, not the noise.' },
          { char:'friend', text:'BHAIIII YOU WON IT. I have watched the last over 19 times.' },
        ],
      },
      {
        t:'Abhi over palto — early boundary dhoondo',
        s:'Pressure bowler pe daalo. Wait karoge toh equation tumhe kha jaayegi.',
        deltas:{ fame:1, heat:3, image:-2 },
        post:[
          {
            source:'account',
            ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
            caption:'Must-win night, massive pressure, and {name} went for the early boundary. The finish got tense, but the spark changed the over. 💙',
            reactions:[{ char:'surya', text:'Intent clear tha. Finish cleaner ho sakta tha.' }],
          },
          {
            source:'character',
            char:'surya',
            display:'feed-only',
            caption:'Pressure mein intent dikh gaya. Ab finishing ka shape aur clean karna hai.',
            reactions:[{ char:'__fan', name:'paltanpulse', text:'SKY mentoring arc continues.' }],
          },
        ],
        caption:'Pressure is a choice. Tonight I chose to hit back. 🔥',
        reactions:[
          { char:'surya', text:'Agar connect karta hai toh hero. Agar nahi, toh meeting.' },
          { char:'hardik', text:'Intent was clear. Execution decides whether it was right.' },
          { char:'__fan', name:'paltanpulse', text:'Fearless finish attempt. This kid is box office.' },
        ],
        dm:[
          { char:'surya', text:'Intent good tha champion. But finish ko thoda cleaner karna padega. Win ke baad bhi review hota hai.' },
          { char:'friend', text:'You nearly gave me a heart attack. Also hero. Also never do this again.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'rohit', caption:'Ek good finish se confidence milta hai. Sirf confidence.' },
      B:null,
    },
  },

  {
    id:'CR-S23', day:14, slot:'Evening', tag:'⚡ SPONSOR NIGHT · POST-WIN',
    title:'Post-Win Brand Deal',
    body:[
      'Must-win finish ke baad brand room ka mood badal gaya hai. Jo offer pehle "potential" par tha, ab "match-winner" language mein aa raha hai.',
      'StrikePro team tumhe ek limited-edition bat sticker aur short campaign line pitch karti hai: "Built for the finish."',
      'Is baar choice jaisi koi cheez nahi lagti. Win ne market khol diya hai. Ab sirf public announcement hona baaki hai.',
    ],
    react:{ char:'hardik', text:'Win ke baad deals aayengi. Bas deals ko game ke upar mat bithana.' },
    q:'Brand announcement live hota hai. Continue?',
    choices:[
      {
        t:'Keep it team-first',
        s:'Brand post mein win aur MI ko center rakho.',
        deltas:{ fame:0, heat:2, image:1 },
        post:{
          source:'player',
          caption:'Built for the finish. Proud to announce my match-week partnership with StrikePro Cricket after a special win for MI. Work continues. 🏏 #StrikePro',
          reactions:[
            { char:'hardik', text:'Good. Keep the work first.' },
            { char:'friend', text:'Bro brand deal after winning a match. Movie script.' },
            { char:'__fan', name:'futurexi', text:'Match-winning knock into brand deal. Superstar lane opening.' },
          ],
        },
        dm:null,
      },
      {
        t:'Own the match-winner tag',
        s:'Campaign line bold rakho: built for the finish.',
        deltas:{ fame:0, heat:2, image:-1 },
        post:{
          source:'player',
          caption:'Built for the finish. Proud to announce my match-week partnership with StrikePro Cricket after a special win for MI. Work continues. 🏏 #StrikePro',
          reactions:[
            { char:'hardik', text:'Good. Keep the work first.' },
            { char:'friend', text:'Bro brand deal after winning a match. Movie script.' },
            { char:'__fan', name:'futurexi', text:'Match-winning knock into brand deal. Superstar lane opening.' },
          ],
        },
        dm:null,
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S24', day:15, slot:'Afternoon', tag:'⚡ PRESS ROOM',
    title:'Future India Sawaal',
    body:[
      'Press room mein aaj sawaal MI se zyada India ka hai.',
      'Journalist poochta hai: "Do you think this IPL can put you in India conversation sooner than expected?"',
      'Room thoda still ho jaata hai. Hardik side mein bottle cap ghuma raha hai. Mahela expressionless. Tum 16 ho. Sawaal 26 saal ka lag raha hai.',
    ],
    react:{ char:'hardik', text:'Team ka naam pehle.' },
    q:'India hype ka jawab kaise dete ho?',
    choices:[
      {
        t:'MI role pe focus rakho',
        s:'Future ke chakkar mein present mat kho.',
        deltas:{ fame:1, heat:-1, image:3 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
          caption:'India question came early. {name} kept the focus on Mumbai Indians: one role, one game at a time. 💙',
          reactions:[
            { char:'hardik', text:'Good.' },
            { char:'rohit', text:'Sahi answer.' },
            { char:'__fan', name:'cricketroom_india', text:'Mature answer. India talk can wait; role clarity cannot.' },
          ],
        },
        caption:'Right now, my job is Mumbai Indians. One role, one game at a time.',
        reactions:[
          { char:'hardik', text:'Good.' },
          { char:'rohit', text:'Sahi answer.' },
          { char:'__fan', name:'cricketroom_india', text:'Mature answer. India talk can wait; role clarity cannot.' },
        ],
      },
      {
        t:'Dream accept karo — India is the goal',
        s:'Sapna chhupana kyun? Har player ka goal wahi hai.',
        deltas:{ fame:0, heat:3, image:-2 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
          caption:'Big dreams, bigger work. {name} admits every kid dreams of India, but says the current job is still Mumbai Indians. 🇮🇳💙',
          reactions:[
            { char:'hardik', text:'Work first wala part yaad rakh.' },
            { char:'coach', text:'India word bol diya. Ab extra practice.' },
            { char:'__fan', name:'paltanpulse', text:'He said the India dream out loud. Timeline is moving.' },
          ],
        },
        caption:'Every kid dreams of India. I do too. But work first. 🇮🇳',
        reactions:[
          { char:'friend', text:'HE SAID IT. Bro I am putting this in my bio.' },
          { char:'hardik', text:'Work first wala part yaad rakh.' },
          { char:'coach', text:'India word bol diya. Ab extra practice.' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S25', day:16, slot:'Morning', tag:'⚡ PLAYOFF RACE',
    title:'Net Run Rate',
    body:[
      'Last league game. Qualification possible hai, par clean nahi. Net run rate equation screen par hai. MI ko sirf jeetna nahi, certain margin se jeetna hai.',
      'Mahela roles explain karta hai. Agar chase fast karna pada, tumhe promote kiya ja sakta hai. Agar wickets gire, tumhe hold karna padega.',
      'Same player. Two opposite jobs. One night.',
    ],
    react:{ char:'mahela', text:'Playoff teams are not the ones with one style. They are the ones who can change styles without panic.' },
    q:'NRR game ke liye kaise prepare karte ho?',
    choices:[
      {
        t:'Do plans banao — attack aur hold dono',
        s:'Flexibility boring prep hai, exciting payoff.',
        deltas:{ fame:3, heat:-1, image:3 },
        outcomeGate:{
          metric:'fame',
          threshold:64,
          pass:{
            title:'MATCH WON',
            note:'Your Form is strong, and the two-plan preparation pays off. You read the chase correctly, switch gears, and win it for MI.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              caption:'NRR pressure, two roles, one calm finish. {name} switched gears and won the match for MI. Playoff race is alive. 💙',
              reactions:[
                { char:'rohit', text:'Good. Match situation samjha.' },
                { char:'mahela', text:'This is why preparation matters.' },
                { char:'__fan', name:'cricketroom_india', text:'He did not just score. He solved the equation.' },
              ],
            },
            dm:{ char:'rohit', text:'Good. You won the situation, not just the match. Keep this template.' },
          },
          fail:{
            title:'GENERIC WIN',
            note:'The team gets through, but your role stays small. Preparation was fine, impact was not big enough to become the story.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              caption:'Qualification race stays alive. Team effort, sharp fielding, and calm late overs get MI over the line. 💙',
              reactions:[
                { char:'__fan', name:'paltanpulse', text:'Win is a win. Bigger tests coming.' },
              ],
            },
          },
        },
        caption:'Same player. Different modes. Ready. 🏏',
        reactions:[
          { char:'mahela', text:'This is the right preparation.' },
          { char:'tilak', text:'Do roles ready rakhna hard hai. But useful.' },
          { char:'__fan', name:'cricketroom_india', text:'MI may use the youngster as a floating matchup piece in the playoff race.' },
        ],
      },
      {
        t:'Attack role demand karo',
        s:'NRR game mein conservative player yaad nahi rehta.',
        deltas:{ fame:1, heat:2, image:-2 },
        outcomeGate:{
          metric:'fame',
          threshold:64,
          pass:{
            title:'MATCH WON',
            note:'Your Form is high enough to back the attacking call. You find the early boundary, break the equation, and MI win because of your intent.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              caption:'Intent under NRR pressure. {name} attacked early, broke the chase open, and MI got the margin they needed. 💙🔥',
              reactions:[
                { char:'hardik', text:'Intent worked because execution was there.' },
                { char:'__fan', name:'paltanpulse', text:'This is the fearless cricket qualification needed.' },
              ],
            },
            dm:{ char:'rohit', text:'Shot selection risky tha, but execution clear tha. Good impact.' },
          },
          fail:{
            title:'NOT YOUR NIGHT',
            note:'The attacking call does not become the headline. MI get a generic result around you, but your personal impact stays limited.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              caption:'Qualification equation goes down to the wire. MI stay alive through a full-team effort. 💙',
              reactions:[
                { char:'__fan', name:'cricketroom_india', text:'The youngster wanted the attacking role, but this was more team grind than individual story.' },
              ],
            },
          },
        },
        caption:'Some games need intent from ball one. Ready.',
        reactions:[
          { char:'hardik', text:'Intent noted. Flexibility pending.' },
          { char:'surya', text:'Attack role fun hai. Bas exit door bhi paas hota hai.' },
          { char:'__fan', name:'paltanpulse', text:'Give him the license. Qualification needs fearless cricket.' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S26', day:17, slot:'Night', tag:'⚡ SEMI-FINAL · NIGHT',
    title:'Slow Pitch, Big Crowd',
    loyaltyChoice:'A',
    body:[
      'MI qualify kar gaya. Ab semi-final. Neutral venue, par blue shirts har jagah. Pitch dry. Ball grip kar rahi hai. Scoreboard pressure slow poison jaisa.',
      'MI 62/3. Tum walk in. Required rate manageable hai, par ek wicket aur game khol dega. Bowler spinner hai, long boundary leg side. Short boundary off side. Field tumhe invite kar rahi hai ek shot ke liye jo TV pe beautiful lagega.',
      'Dugout mein Hardik khada hai. Rohit baitha hai, helmet ke neeche aankhen fixed. Surya towel chew kar raha hai.',
    ],
    react:{ char:'rohit', text:'Knockout mein hero banne se pehle game samajh.' },
    q:'Semi-final ka role kaise play karte ho?',
    choices:[
      {
        t:'Anchor karo, match ko 18th over tak le jao',
        s:'Bada shot baad mein. Pehle game zinda.',
        deltas:{ fame:4, heat:0, image:3 },
        outcomeGate:{
          metric:'fame',
          threshold:66,
          pass:{
            title:'FINAL MEIN MI',
            note:'Your Form is high enough for knockout control. You hold the chase together, and MI reach the final because of your innings.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              caption:'MI ARE IN THE FINAL. On a slow pitch, {name} stayed longer than the noise and carried the chase into safe waters. 💙',
              reactions:[
                { char:'rohit', text:'Good. Game samjha.' },
                { char:'hardik', text:'This was serious cricket.' },
                { char:'__fan', name:'cricketroom_india', text:'That semi-final innings was structurally massive.' },
              ],
            },
          },
          fail:{
            title:'TEAM REACHES FINAL',
            note:'MI qualify for the final, but not because of a defining innings from you. Your Form is not high enough to own the semi-final story.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              caption:'MI ARE IN THE FINAL. A full-team semi-final grind takes the Paltan to the big night. 💙',
              reactions:[
                { char:'__fan', name:'paltanpulse', text:'Final time. Everyone breathe.' },
              ],
            },
          },
        },
        caption:'Knockout cricket. Stay longer than the noise. 💙',
        reactions:[
          { char:'rohit', text:'Good. Game samjha.' },
          { char:'hardik', text:'This was serious cricket.' },
          { char:'__fan', name:'cricketroom_india', text:'That semi-final innings may not be the loudest, but it was structurally important.' },
        ],
      },
      {
        t:'Counterattack karo — pressure wapas bhejo',
        s:'Semi-final mein momentum wait nahi karta.',
        deltas:{ fame:2, heat:3, image:-2 },
        outcomeGate:{
          metric:'fame',
          threshold:66,
          pass:{
            title:'FINAL MEIN MI',
            note:'Your Form is high, so the counterattack lands. You flip the semi-final pressure and become the reason MI reach the final.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              caption:'Counterattack in a semi-final. {name} changed the pressure, changed the chase, and MI are in the final. 💙🔥',
              reactions:[
                { char:'surya', text:'Aaj tera ball tha. Good.' },
                { char:'hardik', text:'Brave and right.' },
                { char:'__fan', name:'paltanpulse', text:'This is why you play fearless kids in playoffs.' },
              ],
            },
          },
          fail:{
            title:'TEAM REACHES FINAL',
            note:'The counterattack does not fully land. MI still reach the final through the team, but your personal semi-final impact stays uncertain.',
            post:{
              source:'account',
              ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
              caption:'MI ARE IN THE FINAL. Not the cleanest chase, not the easiest night, but the team finds a way. 💙',
              reactions:[
                { char:'__fan', name:'cricketroom_india', text:'Youngster tried to counterattack, but the team story was bigger tonight.' },
              ],
            },
          },
        },
        caption:'Knockouts don\'t scare me. They wake me up. 🔥',
        reactions:[
          { char:'surya', text:'Agar yeh tera ball tha, genius. Agar nahi tha, meeting mein milte hain.' },
          { char:'hardik', text:'Brave. Need to check if it was right.' },
          { char:'__fan', name:'paltanpulse', text:'This is why you play fearless kids in playoffs.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'rohit', caption:'Ek good innings se confidence milta hai. Sirf confidence.' },
      B:{ char:'friend', caption:'BRO YOU ARE IN THE IPL SEMI FINAL. I need a minute.' },
    },
  },

  {
    id:'CR-S27', day:17, slot:'Late Night', tag:'⚡ SEMI-FINAL AFTERMATH',
    title:'Hero Ya Passenger',
    body:[
      'MI final mai pahoch gayi hai. Ab pressure ka shape badal gaya hai. Selection, batting position, fan edits — sab final ke lens se dekha ja raha hai.',
      'Tumhaare pe pressure bahot hai ab. Semi-final ke contribution par debate chal raha hai: hero, passenger, or unfinished story?',
      'Semi-final ke baad dressing room ka mood result ke hisaab se nahi, contribution ke hisaab se tumhare andar settle ho raha hai.',
      'Team bus ke bahar fan chillata hai: "{name}, final mein century!"',
      'Coach Sir ka message: "Final mein zero se start."',
    ],
    react:{ char:'hardik', text:'Semi-final khatam. Final alag game hai.' },
    q:'Semi-final ke baad apna headspace kaise set karte ho?',
    choices:[
      {
        t:'Reset karo — final ko new game treat karo',
        s:'Hero bhi zero se start karta hai. Failure bhi.',
        deltas:{ fame:2, heat:-1, image:2 },
        caption:'One more game. Reset. 💙',
        reactions:[
          { char:'hardik', text:'Good. Reset matters.' },
          { char:'coach', text:'Ab sahi.' },
          { char:'__fan', name:'cricketroom_india', text:'The reset after a playoff game may decide whether the youngster handles the final.' },
        ],
      },
      {
        t:'Emotion ride karo — final hype build karo',
        s:'Momentum ko bottle nahi karte. Use amplify karte hain.',
        deltas:{ fame:0, heat:2, image:-2 },
        caption:'Final. One more night. One more chance. 💙🔥',
        reactions:[
          { char:'friend', text:'Bro your caption made my entire building ask me for tickets.' },
          { char:'rohit', text:'Chance word yaad rakho. Guarantee nahi.' },
          { char:'__fan', name:'paltanpulse', text:'I have goosebumps. This kid was born for the stage.' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S28', day:18, slot:'Morning', tag:'⚡ FINAL WEEK · BRAND CALL',
    title:'Final Campaign',
    body:[
      'Final se 48 hours pehle brand call. Same equipment company. Bigger offer. Campaign line: "From prodigy to champion."',
      'Problem: final abhi hua nahi hai. Brand team polite hai, excited hai, thoda desperate bhi. Shoot short hai, woh bol rahe hain. One hour. Final week mein bhi do ghante bade hote hain.',
    ],
    react:{ char:'bumrah', text:'Final se pehle future tense mein jeena dangerous hai.' },
    q:'Final campaign ka kya karte ho?',
    choices:[
      {
        t:'Shoot kar lo — opportunity rare hai',
        s:'Final week visibility ka price high hota hai.',
        deltas:{ fame:-3, heat:7, image:-4 },
        caption:'Something special loading. Final week. 💙',
        reactions:[
          { char:'hardik', text:'Timing could have waited.' },
          { char:'coach', text:'Champion word final ke baad use karna.' },
          { char:'__fan', name:'futurexi', text:'The commercial machine is moving. Star confirmed.' },
        ],
      },
      {
        t:'Campaign final ke baad rakho',
        s:'Trophy se pehle trophy caption nahi.',
        deltas:{ fame:3, heat:-2, image:4 },
        caption:'Pehle kaam. Baad mein sab. 🏏',
        reactions:[
          { char:'bumrah', text:'Good.' },
          { char:'mahela', text:'Clear priority.' },
          { char:'__fan', name:'cricketroom_india', text:'Delaying a final-week campaign is exactly the kind of unglamorous decision teams respect.' },
        ],
      },
    ],
    feedReaction:{
      A:null,
      B:null,
    },
  },

  {
    id:'CR-S29', day:18, slot:'Night', tag:'⚡ IPL FINAL · NIGHT',
    title:'Last 12 Balls',
    body:[
      'IPL Final. Stadium ka noise body ke andar vibrate kar raha hai. Tum 92 par ho. MI need 18 off 10. Non-striker Tilak. Dugout mein Hardik khada. Rohit bilkul still. Surya hands on head.',
      'Bowler pace-off specialist. Fine leg andar. Ek ramp se tum 98/100 ke paas ja sakte ho. Ek hard two aur strike rotate se match safer ho sakta hai.',
      'Scoreboard simple nahi hai ab. Personal milestone ek taraf. Trophy doosri taraf. Season ka sach yahin likha jaayega.',
    ],
    react:{ char:'tilak', text:'Hero banne ke liye pehle game finish kar.' },
    q:'Final ke last 10 balls kaise play karte ho?',
    choices:[
      {
        t:'Trophy pehle — strike rotate, win close karo',
        s:'Hundred wait karega. Trophy nahi.',
        deltas:{ fame:4, heat:1, image:5 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
          caption:'Trophy over hundred. {name} put the win first, trusted Tilak, and MI crossed the line. Young blood, team heart. 💙🏆',
          reactions:[
            { char:'hardik', text:'Great innings, bud. Team-first.' },
            { char:'rohit', text:'Mature. Very mature.' },
            { char:'__fan', name:'cricketroom_india', text:'A teenager choosing the trophy over the hundred is the season-defining moment.' },
          ],
        },
        caption:'Finals are not played in captions. They are played one ball at a time. 💙🏆',
        reactions:[
          { char:'hardik', text:'That is how you finish.' },
          { char:'rohit', text:'Mature. Very mature.' },
          { char:'__fan', name:'cricketroom_india', text:'For a teenager, that final-over decision-making was absurdly composed.' },
        ],
        dm:[
          { char:'rohit', text:'Great innings, bud. Hundred chhod ke trophy choose ki. That is serious cricket.' },
          { char:'hardik', text:'Great innings, bud. Trust gained massively tonight.' },
        ],
      },
      {
        t:'Hundred ke liye jao — personal milestone lo',
        s:'Final hundred history hota hai. Shot hai. Naam amar ho sakta hai.',
        deltas:{ fame:1, heat:4, image:-4 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
          caption:'MI WON THE TROPHY, but the debate has started. {name} chased the hundred, and Tilak\'s last-over brilliance finished the final. Young blood, big talent, bigger questions.',
          reactions:[
            { char:'tilak', text:'Trophy aa gayi. Baaki baad mein.' },
            { char:'hardik', text:'We will talk.' },
            { char:'__fan', name:'cricketroom_india', text:'This is complicated: MI champions, Tilak closes it, and the youngster\'s milestone call will be debated.' },
          ],
        },
        caption:'Final night. No fear. No hiding. 💙🔥',
        reactions:[
          { char:'surya', text:'Hundred ka pull samajhta hoon. Trophy ka context bhi samajh.' },
          { char:'bumrah', text:'High risk means you accept both conversations.' },
          { char:'__fan', name:'paltanpulse', text:'MI won but this debate is not ending tonight.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'rohit', caption:'Finals teach you who you are. Every ball.' },
      B:{ char:'friend', caption:'BHAI. THAT SHOT. I AM NOT NORMAL. I WILL NEVER BE NORMAL AGAIN.' },
    },
  },

  {
    id:'CR-S30', day:19, slot:'Night', tag:'⚡ FINAL NIGHT · DRESSING ROOM',
    title:'Trophy Ke Baad',
    body:[
      'Final khatam. MI trophy jeet chuki hai. Dressing room mein blue shirts, sweat, tape, empty bottles aur trophy ke aas-paas woh silence hai jo sirf winning ke baad aata hai.',
      'Agar tumne trophy ko hundred se upar rakha tha, seniors ki aankhon mein ek alag trust hai. Agar tum milestone ke peeche gaye the, trophy table par hai, par conversation pending hai.',
      'Tumhare phone par 999+ notifications. Hardik trophy ke paas khada hai. Rohit door ke frame se bahar field dekh raha hai. Surya tumhari taraf phone hila ke bolta hai: "Caption ready?"',
    ],
    react:{ char:'rohit', text:'Season ka last post bhi season ka part hota hai.' },
    q:'Final night ka public/private close kaise karte ho?',
    choices:[
      {
        t:'Team-first note, private calls, quiet close',
        s:'Trophy ya heartbreak, dono team ke saath close karo.',
        deltas:{ fame:1, heat:-1, image:3 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.miPaltan,
          caption:'Champions. {name} closes the season with a team-first note and a quiet dressing-room moment. The first season in blue is only the beginning. 💙🏆',
          reactions:[
            { char:'hardik', text:'Good season. Good close.' },
            { char:'rohit', text:'Next one starts tomorrow.' },
            { char:'__fan', name:'cricketroom_india', text:'The closing tone matters after the final. This was mature.' },
          ],
        },
        caption:'This season taught me what team means. Thank you, Mumbai. Work continues. 💙',
        reactions:[
          { char:'hardik', text:'Good season. Good close.' },
          { char:'coach', text:'Ab call kar.' },
          { char:'__fan', name:'cricketroom_india', text:'Team-first closing note from the youngster. MI\'s development bet looks serious.' },
        ],
      },
      {
        t:'Cinematic season reel — own the story',
        s:'Yeh tumhara season bhi tha. Public ko ending do.',
        deltas:{ fame:0, heat:3, image:-3 },
        post:{
          source:'account',
          ...CRICKET_SOCIAL_ACCOUNTS.paltanPulse,
          caption:'Season reel is out. Trophy, lights, pressure, debate, and a 16-year-old who became impossible to ignore. Whether you loved every choice or questioned some, {name} owned the timeline.',
          reactions:[
            { char:'surya', text:'Good reel. Ab offseason mein real work.' },
            { char:'coach', text:'Beginning bol diya. Ab prove kar.' },
            { char:'__fan', name:'futurexi', text:'This reel will be in every future India comp for the next five years.' },
          ],
        },
        caption:'16. First season. Mumbai. Lights. Lessons. This is only the beginning. 💙🔥',
        reactions:[
          { char:'surya', text:'Good reel. Ab offseason mein real work.' },
          { char:'coach', text:'Beginning bol diya. Ab prove kar.' },
          { char:'__fan', name:'futurexi', text:'This reel will be in every future India comp for the next five years.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'hardik', caption:'Good season. Next one starts tomorrow.' },
      B:{ char:'friend', caption:'Bro your season reel has more views than most movies. I need therapy.' },
    },
  },
]

// Ending resolver for cricket world
// Slot mapping: fame=Form 🏏, heat=Fame ⭐, image=Team Trust 🤝
// Tuned for tradeoffs from Form 40 · Fame 25 · Team Trust 20.
// Resolver priority keeps one final ending even when a path has mixed signals.
export function resolveCricketEnding(m: import('./types').Meters): 'realDeal' | 'captainsProject' | 'paltanWonderkid' | 'tooMuchTooSoon' | 'quietClimber' {
  // Too Much Too Soon: public Fame outruns cricket credibility and dressing-room trust.
  if (m.heat >= 54 && m.image < 26 && m.fame < 68) return 'tooMuchTooSoon'
  // Paltan Wonderkid: public Fame clearly outruns dressing-room Trust.
  if (m.heat >= 53 && m.heat >= m.image + 14) return 'paltanWonderkid'
  // Captain's Project: Trust is strong enough that the dressing room backs the project.
  if (m.image >= 38 && m.image >= m.heat - 8 && m.image >= m.fame - 35) return 'captainsProject'
  // Real Deal: Form is the dominant meter (cricket credibility wins)
  if (m.fame >= 70 && m.fame >= m.heat + 14 && m.fame >= m.image + 28) return 'realDeal'
  return 'quietClimber'
}

export const CRICKET_ENDING_DATA = {
  realDeal:         { arc: 'The Real Deal',        sub: '{name}, tum sirf next big thing nahi. Tum real ho. Fan pages pehle bol rahe the. Ab dressing room bhi maan raha hai.',                     color: '#3DD6C8' },
  captainsProject:  { arc: 'Captain\'s Project',   sub: 'Hardik ko tumhara role samajh aaya. Mahela ko tumhari clarity dikhi. Rohit ne sirf ek line boli: "Isko time do." Yahi sabse bada contract hai.', color: '#FFB020' },
  paltanWonderkid:  { arc: 'Paltan Wonderkid',     sub: 'Every edit had your name. Every MI fan page had your face. Public ne decision le liya. Prodigy aa gaya.',                                   color: '#FF2D78' },
  tooMuchTooSoon:   { arc: 'Too Much Too Soon',    sub: 'Tum trend hue. Bahut. Shayad zyada. Par dressing room ke andar ek sawaal reh gaya: jab next time pressure aayega, kya cricket choose karoge?', color: '#FF5C3A' },
  quietClimber:     { arc: 'Quiet Climber',        sub: 'Na tumne season tod diya, na season ne tumhe. Andar ke log samajh gaye: yeh story khatam nahi hui. Yeh toh pehli entry thi.',               color: '#8a4ab0' },
}

// DM hooks for cricket characters
export const CRICKET_DM_HOOKS: Partial<Record<import('./types').CharId, string>> = {
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
