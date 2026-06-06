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
 * Starting meters: Form 45 · Fame 55 · Team Trust 35
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
        deltas:{ fame:1, heat:-1, image:2 },
        caption:'Family ke saath first. Wankhede baad mein. 💙',
        reactions:[
          { char:'coach', text:'Sahi. Pehle ghar. Kal se kaam.' },
          { char:'friend', text:'{name} bro tu call nahi utha raha?? Theek hai superstar, main tujhe abhi se humble rakhunga.' },
          { char:'__fan', name:'cricketroom_india', text:'No immediate post from MI\'s teenage pick. Either media-trained or still processing.' },
        ],
      },
      {
        t:'Emotional MI story post karo',
        s:'Moment bada hai. Duniya ko pata chalna chahiye ki tum aa gaye ho.',
        deltas:{ fame:0, heat:5, image:-1 },
        caption:'From academy nets to Mumbai Indians. Dream begins tonight. Paltan, see you soon. 💙 #OneFamily',
        reactions:[
          { char:'friend', text:'CAPTION READY THA KYA?? 😭 bro sold hua aur influencer mode on.' },
          { char:'coach', text:'Post theek hai. Ab comments mat padhna. Kal subah shadow practice.' },
          { char:'__fan', name:'paltanpulse', text:'OUR KID ALREADY POSTED. He gets it. Paltan is going to love him.' },
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
        deltas:{ fame:1, heat:-1, image:3 },
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
        deltas:{ fame:0, heat:2, image:1 },
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
        deltas:{ fame:4, heat:-1, image:4 },
        caption:'Nets mein beat hua. Sahi jagah hai seekhne ke liye. 🏏',
        reactions:[
          { char:'bumrah', text:'Better. Is baar tumne dekha.' },
          { char:'rohit', text:'Good. Ego bahar rakha.' },
          { char:'__fan', name:'cricketroom_india', text:'Young MI batter spent extra time after a Bumrah net. Serious teams test prospects like this.' },
        ],
      },
      {
        t:'Charge karo — statement shot maaro',
        s:'Agar sab dekh rahe hain, toh sabko dikhna bhi chahiye.',
        deltas:{ fame:-2, heat:4, image:-3 },
        caption:'First MI nets. First lesson: fear is optional. 🏏',
        reactions:[
          { char:'surya', text:'Shot intent mast tha. Ball thoda jaldi aa gaya tere plan se 😄' },
          { char:'hardik', text:'Intent hai. Control chahiye.' },
          { char:'__fan', name:'memeovers', text:'Bro tried to charge Bumrah on day one. Confidence 100, survival pending.' },
        ],
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
        deltas:{ fame:1, heat:4, image:-1 },
        caption:'Learning angles from the best. Some shots you don\'t copy, you earn. 😄🏏',
        reactions:[
          { char:'surya', text:'Energy mast. Ab next time ball bhi choose kar lena champion.' },
          { char:'tilak', text:'Range hai. Control build karna padega.' },
          { char:'__fan', name:'paltanpulse', text:'Surya teaching the kid range-hitting. This is the content we signed up for.' },
        ],
      },
      {
        t:'Poochho kaunsi ball pe kaunsa shot',
        s:'Shot nahi, decision seekho.',
        deltas:{ fame:4, heat:1, image:3 },
        caption:'Aaj samjha: shot se pehle field padhna padta hai. T20 is not random. 🧠🏏',
        reactions:[
          { char:'surya', text:'Good question. Isliye tu seekhega fast.' },
          { char:'rohit', text:'Shot sab dekhte hain. Sawal kam log poochte hain.' },
          { char:'__fan', name:'cricketroom_india', text:'The viral part is SKY teaching the shot. The important part is the youngster asking about field logic.' },
        ],
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
      'Dus minute ke liye tum bhool jaate ho ki kaun dekh raha hai. Throwdowns clean lag rahe hain. Cover drive middle. Pull controlled. Ek on-drive itna sweet hai ki side-net ke bahar khade Naman bolta hai: "Shot."',
      'Rohit poore time kuch nahi bolta. Session khatam hota hai. Tum gloves nikaal rahe ho jab woh paas se guzarta hai. Bina rukhe sirf ek line:',
      '"Tempo samajh raha hai?"',
      'Tum smile karte ho, par andar se question seedha chubh gaya. Tumne shots khele. Kya tumne innings bhi kheli?',
    ],
    react:{ char:'rohit', text:'Good ball ko respect karna defensive nahi hota. Boring ball ko punish karna attacking nahi hota. Tempo beech mein hai.' },
    q:'Rohit ke sawaal ka kya karte ho?',
    choices:[
      {
        t:'Seedha poochho — tempo kaise build karun?',
        s:'Senior ne door khola hai. Ego leke khade mat raho.',
        deltas:{ fame:3, heat:-1, image:4 },
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
        deltas:{ fame:0, heat:2, image:-1 },
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
        deltas:{ fame:2, heat:-1, image:5 },
        caption:'Role clarity. Team first. Ready whenever needed. 💙',
        reactions:[
          { char:'hardik', text:'Good. Yeh answer vague nahi tha.' },
          { char:'tilak', text:'Yahi se chances open hote hain. Seriously.' },
          { char:'__fan', name:'cricketroom_india', text:'Role acceptance may decide how soon MI use their teenage batter.' },
        ],
      },
      {
        t:'Bol do opening tumhara best use hai',
        s:'Agar tum apni strength nahi bologe, kaun bolega?',
        deltas:{ fame:1, heat:3, image:-4 },
        caption:'Clarity matters. I know my game. I know where I can impact. 🏏',
        reactions:[
          { char:'hardik', text:'Fair. Bas team sheet individual comfort se nahi banti.' },
          { char:'rohit', text:'Opener banna hai toh wait kar. Player banna hai toh adapt kar.' },
          { char:'__fan', name:'paltanpulse', text:'Let the kid open! Why buy a prodigy and then hide him at 6?' },
        ],
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
        deltas:{ fame:-3, heat:6, image:-3 },
        caption:'First matchweek with MI. Grateful for every moment. Big things loading. 💙',
        reactions:[
          { char:'surya', text:'Reel clean tha. Bas kal timing bhi clean rakhna 😄' },
          { char:'bumrah', text:'Over kal nahi milega.' },
          { char:'__fan', name:'paltanpulse', text:'Sponsor reel already? Starboy behaviour. Need debut now.' },
        ],
      },
      {
        t:'Extra nets lo — Bumrah ka over',
        s:'Reel wait karegi. Slower ball nahi.',
        deltas:{ fame:4, heat:-2, image:4 },
        caption:'Phone kit bag mein raha. Nets mein tha. 🏏',
        reactions:[
          { char:'bumrah', text:'Better. Still early on the slower one, but better.' },
          { char:'hardik', text:'Noted.' },
          { char:'__fan', name:'cricketroom_india', text:'MI\'s young batter skipped a sponsor capture for extra nets. Small thing. Serious signal.' },
        ],
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
        deltas:{ fame:3, heat:-1, image:3 },
        caption:'Benchmark hai toh seekhna padega. Simple. 🏏',
        reactions:[
          { char:'tilak', text:'Good question. Main bataata hoon kaunsa bowler target tha.' },
          { char:'rohit', text:'Competition se zyada learning important hai pehle.' },
          { char:'__fan', name:'cricketroom_india', text:'Tilak remains the template for MI\'s young Indian batting pathway. New kid watching closely.' },
        ],
      },
      {
        t:'Personal lo aur late tak akela train karo',
        s:'Agar trust nahi mil raha, toh extra work se lo.',
        deltas:{ fame:2, heat:1, image:-2 },
        caption:'Extra work. No shortcuts. 🏏',
        reactions:[
          { char:'tilak', text:'Work good hai. Bas isolation ko process mat samajh.' },
          { char:'surya', text:'Akela maarna easy hai. Match mein 10 log saath hote hain.' },
          { char:'__fan', name:'futurexi', text:'The kid stayed late after Tilak\'s practice chase. Competition in MI camp is real.' },
        ],
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
        deltas:{ fame:2, heat:-1, image:5 },
        caption:'Not in the XI yet. Still in the work. Still in the team. 💙',
        reactions:[
          { char:'hardik', text:'Good. Yeh attitude useful hai.' },
          { char:'tilak', text:'I know it sucks. Par yahi phase kaam aata hai.' },
          { char:'__fan', name:'cricketroom_india', text:'Body language watch: young MI batter active in drills despite third straight benching. Staff will notice.' },
        ],
      },
      {
        t:'Fan posts like karo — public pressure bolne do',
        s:'Agar fans sach bol rahe hain, toh unhe ignore kyun karein?',
        deltas:{ fame:0, heat:5, image:-4 },
        caption:'Paltan dekh raha hai. Main ready hoon. 💙',
        reactions:[
          { char:'surya', text:'Likes bhi screenshots ban jaate hain champion.' },
          { char:'hardik', text:'Public pressure selection meeting mein kaam nahi karta.' },
          { char:'__fan', name:'paltanpulse', text:'HE LIKED OUR POST. The kid wants to play. Give him the debut.' },
        ],
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
        deltas:{ fame:4, heat:-1, image:4 },
        caption:'Weakness naam dene se chhoti ho jaati hai. Ignore karne se badi. 🏏',
        reactions:[
          { char:'mahela', text:'Good. Now we can work.' },
          { char:'tilak', text:'Admit karna hard hota hai. But plan tabhi banta hai.' },
          { char:'__fan', name:'cricketroom_india', text:'If MI use the youngster, watch his spin matchup. That may decide batting position.' },
        ],
      },
      {
        t:'Bol do ready ho kisi bhi matchup ke liye',
        s:'Opportunity ke pehle doubt dikhana dangerous lagta hai.',
        deltas:{ fame:0, heat:2, image:-3 },
        caption:'Ready for whatever comes. That\'s the job. 🏏',
        reactions:[
          { char:'mahela', text:'Confidence noted. Plan still needed.' },
          { char:'bumrah', text:'Opponent plan ke saath aayega. Statement ke saath nahi.' },
          { char:'__fan', name:'futurexi', text:'Love the confidence. Big players believe before others do.' },
        ],
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
        deltas:{ fame:2, heat:0, image:5 },
        caption:'If the chance comes, the role is simple: do what the team needs. 💙',
        reactions:[
          { char:'hardik', text:'Good. Clear.' },
          { char:'tilak', text:'Ab chance aayega toh ready rehna. Yeh line easy nahi hoti.' },
          { char:'__fan', name:'cricketroom_india', text:'Role flexibility may be the reason MI finally use their young batter.' },
        ],
      },
      {
        t:'Top-order chance maango',
        s:'Agar debut hai, toh best chance bhi hona chahiye.',
        deltas:{ fame:1, heat:3, image:-2 },
        caption:'Big stages need clear roles. I know where I can impact. 🏏',
        reactions:[
          { char:'hardik', text:'Noted. Team balance bhi noted.' },
          { char:'rohit', text:'Opening ka pressure glamorous lagta hai jab tak pehli ball swing nahi karti.' },
          { char:'__fan', name:'paltanpulse', text:'Give him top order. Don\'t waste him. Wankhede wants the kid.' },
        ],
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
        deltas:{ fame:6, heat:2, image:5 },
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
        deltas:{ fame:2, heat:7, image:-2 },
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
        deltas:{ fame:1, heat:1, image:4 },
        caption:'Debut done. Work continues. Thank you Paltan. 💙',
        reactions:[
          { char:'hardik', text:'Good. Recovery first means you listened.' },
          { char:'coach', text:'Ab call kar. Score discuss karenge, emotions nahi.' },
          { char:'__fan', name:'cricketroom_india', text:'Understated post after debut. MI will like that more than fans do.' },
        ],
      },
      {
        t:'Cinematic celebration reel post karo',
        s:'Yeh moment dobara nahi aayega. Own it.',
        deltas:{ fame:0, heat:6, image:-3 },
        caption:'Dreamt it. Lived it. Wankhede, you were unreal. 💙🔥 #DebutNight',
        reactions:[
          { char:'friend', text:'Reel fire. Comments warzone. Main moderation sambhal raha hoon.' },
          { char:'surya', text:'Good edit. Ab kal bowling machine edit karegi tujhe if late hua.' },
          { char:'__fan', name:'paltanpulse', text:'Debut reel gave chills. This kid understands the stage.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'rohit', caption:'First game ke baad sab message karte hain. Second game ke liye kaun ready hai, woh important hai.' },
      B:{ char:'friend', caption:'Bro your debut reel is viral. Simultaneously proud and embarrassed to know you.' },
    },
  },

  // ── S14 · SAME PROCESS? ──────────────────────────────────────────────────────
  {
    id:'CR-S14', day:8, slot:'Evening', tag:'⚡ NEXT MATCH · AFTERNOON',
    title:'Same Process?',
    body:[
      'Agla match. Ab tum unknown nahi ho. Analyst screen par opposition plan clear hai: hard length early, spin into pads, no width. Public expects repeat.',
      'Nets mein tum thoda late ho jaate ho ek ball pe. Bumrah notice karta hai. Tilak notice karta hai. Hardik kuch nahi bolta.',
      'Rohit tumhare paas se guzarta hai. Sirf do words: "Same process?"',
      'Pehle match mein tumne duniya ko surprise kiya. Ab duniya tumhe plan kar rahi hai. Yeh second test zyada real hai.',
    ],
    react:{ char:'rohit', text:'Repeat karne ki koshish mat kar. Process repeat kar.' },
    q:'Next match pressure kaise handle karte ho?',
    choices:[
      {
        t:'Same process — ball, role, situation',
        s:'Repeat highlight nahi, repeat decision-making.',
        deltas:{ fame:5, heat:1, image:4 },
        caption:'Second game. Same process. New problem. 🏏',
        reactions:[
          { char:'rohit', text:'Good. Yeh mature answer hai.' },
          { char:'hardik', text:'This is useful.' },
          { char:'__fan', name:'cricketroom_india', text:'The second match will tell us more than the debut. Watch decision-making, not just runs.' },
        ],
      },
      {
        t:'Headline chase karo — public ko second clip do',
        s:'Momentum public ka hai. Thande pad gaye toh story khatam.',
        deltas:{ fame:-2, heat:5, image:-3 },
        caption:'No hiding now. Bigger stage, bigger intent. 🔥',
        reactions:[
          { char:'surya', text:'Intent achha hai. Bas intent ke naam pe wicket mat gift kar.' },
          { char:'bumrah', text:'Plans change. You also have to.' },
          { char:'__fan', name:'memeovers', text:'Cricket fans after one debut: either future captain or fraud, no middle overs.' },
        ],
      },
    ],
    feedReaction:{
      A:{ char:'coach', caption:'Ab cricket shuru.' },
      B:null,
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
        deltas:{ fame:3, heat:-1, image:4 },
        caption:'Kal ki innings kal ki thi. Aaj ka session aaj ka hai. 🏏',
        reactions:[
          { char:'mahela', text:'Good. That is useful feedback.' },
          { char:'bumrah', text:'You saw the mistake. Now reduce repeat.' },
          { char:'__fan', name:'cricketroom_india', text:'Post-debut review will decide whether MI use him as a one-off spark or a serious role option.' },
        ],
      },
      {
        t:'Positive spin rakho — confidence project karo',
        s:'Young player ko doubt dikhana dangerous lag sakta hai.',
        deltas:{ fame:0, heat:3, image:-2 },
        caption:'First one done. Took lessons. Still backing my game. 🏏',
        reactions:[
          { char:'hardik', text:'Backing game is fine. Naming gaps is better.' },
          { char:'surya', text:'Confidence rakho. Bas feedback ko enemy mat samjho.' },
          { char:'__fan', name:'futurexi', text:'Loved the confidence after debut. This kid carries himself like he belongs.' },
        ],
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
      'Tumhare phone par {friend} ke 12 memes unread hain. Coach Sir ka message bhi: "Kal subah video call. Footwork."',
      'Ek taraf squad mein ghulna. Dusri taraf woh log jo tumhe tab jaante the jab tumhare paas MI kit nahi thi.',
    ],
    react:{ char:'tilak', text:'Aaja. Har cheez nets mein nahi seekhte.' },
    q:'Rest evening kaise spend karte ho?',
    choices:[
      {
        t:'Young Table ke saath raho',
        s:'Dressing room trust sirf runs se nahi, time se bhi banta hai.',
        deltas:{ fame:-1, heat:0, image:4 },
        caption:'Squad time. 💙',
        reactions:[
          { char:'naman', text:'Finally prodigy normal nikla.' },
          { char:'surya', text:'Cards mein bhi shot selection weak hai iska.' },
          { char:'__fan', name:'paltanpulse', text:'Young MI group bonding clips are too wholesome.' },
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
    q:'Brand offer kaise handle karte ho?',
    choices:[
      {
        t:'Deal sign karo, campaign bhi commit karo',
        s:'IPL career short ho sakta hai. Market jab aaye, pakadna chahiye.',
        deltas:{ fame:-1, heat:6, image:-3 },
        caption:'Big partnership announcement soon. Grateful for the journey. 🏏',
        reactions:[
          { char:'friend', text:'Bro got bat sticker money before I got internship.' },
          { char:'hardik', text:'Just make sure practice schedule doesn\'t move.' },
          { char:'__fan', name:'futurexi', text:'Brand deals already. Star trajectory has started.' },
        ],
      },
      {
        t:'Performance clauses rakho, shoots delay karo',
        s:'Paisa lo, par cricket calendar pehle.',
        deltas:{ fame:2, heat:1, image:3 },
        caption:'Kaam pehle. Baaki sab baad mein. 🏏',
        reactions:[
          { char:'mahela', text:'Professional answer.' },
          { char:'coach', text:'Pehle bat ka kaam. Sticker baad mein.' },
          { char:'__fan', name:'cricketroom_india', text:'Delaying commercial noise until role stabilizes — mature call for a young IPL player.' },
        ],
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
        deltas:{ fame:5, heat:-1, image:4 },
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
        deltas:{ fame:1, heat:5, image:-2 },
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
      'Away match ke baad hotel corridor quiet hai. Tumhare room ke bahar kit bag pada hai, shoes abhi bhi mitti se bhare.',
      'Rohit lift ke paas milta hai. Poochta nahi kitne banaye. Sirf poochta hai: "Kya seekha?"',
    ],
    react:{ char:'rohit', text:'Runs yaad rahenge thode din. Learning rehni chahiye.' },
    q:'Match ke baad apni story kaise frame karte ho?',
    choices:[
      {
        t:'Learning note banao, public low rakho',
        s:'Har innings ko event mat banao. Kuch cheezein andar rehni chahiye.',
        deltas:{ fame:3, heat:-2, image:3 },
        caption:'Tough conditions. Good lessons. Onwards. 🏏',
        reactions:[
          { char:'rohit', text:'Good. Short rakha.' },
          { char:'coach', text:'Video bhej. Caption nahi.' },
          { char:'__fan', name:'cricketroom_india', text:'Understated post after a tricky away game. MI may be managing the hype carefully.' },
        ],
      },
      {
        t:'Result ko narrative banao',
        s:'Public ko context chahiye. Tum khud do, warna woh bana lenge.',
        deltas:{ fame:0, heat:4, image:-2 },
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
        deltas:{ fame:3, heat:-1, image:3 },
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
        deltas:{ fame:-1, heat:1, image:3 },
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
    react:{ char:'surya', text:'Bachche PR answer pakad lete hain. Sambhal ke.' },
    q:'Kids clinic mein kya answer dete ho?',
    choices:[
      {
        t:'Sach bolo — darr lagta hai, par practice help karti hai',
        s:'Honest answer brand-safe bhi ho sakta hai, bas plastic nahi.',
        deltas:{ fame:2, heat:1, image:3 },
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
        deltas:{ fame:-1, heat:4, image:-2 },
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
        deltas:{ fame:5, heat:2, image:5 },
        caption:'Finish means staying there. Huge win. 💙',
        reactions:[
          { char:'hardik', text:'That is finishing.' },
          { char:'rohit', text:'Good. Situation jeeta.' },
          { char:'__fan', name:'cricketroom_india', text:'This was the most mature innings of his season if you watched the balls, not just the score.' },
        ],
      },
      {
        t:'Abhi over palto — early boundary dhoondo',
        s:'Pressure bowler pe daalo. Wait karoge toh equation tumhe kha jaayegi.',
        deltas:{ fame:1, heat:6, image:-2 },
        caption:'Pressure is a choice. Tonight I chose to hit back. 🔥',
        reactions:[
          { char:'surya', text:'Agar connect karta hai toh hero. Agar nahi, toh meeting.' },
          { char:'hardik', text:'Intent was clear. Execution decides whether it was right.' },
          { char:'__fan', name:'paltanpulse', text:'Fearless finish attempt. This kid is box office.' },
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
    title:'Party Ya Recovery',
    body:[
      'Win ke baad sponsor dinner. Hotel rooftop. Blue lights, mocktails, brand cameras, players rotating through photo booths. Tumhara name card front table par hai now.',
      '"Just thirty minutes," social team bolti hai. Physio bolta hai: "Ice bath in fifteen." Young Table bolta hai: "Aaja, free dessert."',
      'Season mein pehli baar tumhe feel hota hai ki success bhi schedule tod sakti hai.',
    ],
    react:{ char:'bumrah', text:'Recovery bhi skill hai.' },
    q:'Post-win night kaise handle karte ho?',
    choices:[
      {
        t:'Sponsor presence do, phir recovery',
        s:'Professional balance. Dikho bhi, ready bhi raho.',
        deltas:{ fame:1, heat:2, image:3 },
        caption:'Big win. Bigger recovery. Long season. 💙',
        reactions:[
          { char:'bumrah', text:'Good.' },
          { char:'mahela', text:'Professional.' },
          { char:'__fan', name:'cricketroom_india', text:'Young players learning schedule discipline early is a good sign.' },
        ],
      },
      {
        t:'Full sponsor night enjoy karo',
        s:'Win rare hoti hai. Team bonding bhi important hai.',
        deltas:{ fame:-2, heat:5, image:-1 },
        caption:'Nights like these. Paltan energy unmatched. 💙🔥',
        reactions:[
          { char:'friend', text:'Bro party stories are insane. Also Coach Sir has seen them. RIP.' },
          { char:'coach', text:'Kal subah call mat miss karna.' },
          { char:'__fan', name:'paltanpulse', text:'He is enjoying the season and we love to see it.' },
        ],
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
        deltas:{ fame:2, heat:-2, image:4 },
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
        deltas:{ fame:0, heat:5, image:-2 },
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
        deltas:{ fame:4, heat:-1, image:4 },
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
        deltas:{ fame:1, heat:4, image:-2 },
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
      'Semi-final. Neutral venue, par blue shirts har jagah. Pitch dry. Ball grip kar rahi hai. Scoreboard pressure slow poison jaisa.',
      'MI 62/3. Tum walk in. Required rate manageable hai, par ek wicket aur game khol dega. Bowler spinner hai, long boundary leg side. Short boundary off side. Field tumhe invite kar rahi hai ek shot ke liye jo TV pe beautiful lagega.',
      'Dugout mein Hardik khada hai. Rohit baitha hai, helmet ke neeche aankhen fixed. Surya towel chew kar raha hai.',
    ],
    react:{ char:'rohit', text:'Knockout mein hero banne se pehle game samajh.' },
    q:'Semi-final ka role kaise play karte ho?',
    choices:[
      {
        t:'Anchor karo, match ko 18th over tak le jao',
        s:'Bada shot baad mein. Pehle game zinda.',
        deltas:{ fame:6, heat:1, image:6 },
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
        deltas:{ fame:2, heat:7, image:-3 },
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
        deltas:{ fame:3, heat:-2, image:4 },
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
        deltas:{ fame:0, heat:5, image:-2 },
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
      'IPL Final. Stadium ka noise body ke andar vibrate kar raha hai. MI need 24 off 12. Tum crease par ho. Non-striker Tilak. Dugout mein Hardik khada. Rohit bilkul still. Surya hands on head.',
      'Bowler pace-off specialist. Field spread, par fine leg andar. Ek ramp possible hai. Ek hard two possible hai. Ek wrong shot possible hai jo poore season ka headline ban sakta hai.',
      'Scoreboard simple hai. Moment nahi. 24 off 12. Trophy line ke us paar hai.',
    ],
    react:{ char:'tilak', text:'Hero banne ke liye pehle game finish kar.' },
    q:'Final ke last 12 balls kaise play karte ho?',
    choices:[
      {
        t:'Partnership finish — strike rotate, right ball boundary',
        s:'Trophy highlight se badi hai. Galat ball hero nahi banati.',
        deltas:{ fame:7, heat:3, image:6 },
        caption:'Finals are not played in captions. They are played one ball at a time. 💙🏆',
        reactions:[
          { char:'hardik', text:'That is how you finish.' },
          { char:'rohit', text:'Mature. Very mature.' },
          { char:'__fan', name:'cricketroom_india', text:'For a teenager, that final-over decision-making was absurdly composed.' },
        ],
      },
      {
        t:'Ramp/six option lo — final ko apna moment banao',
        s:'Fine leg up hai. Shot hai. Agar nikal gaya, history.',
        deltas:{ fame:2, heat:9, image:-3 },
        caption:'Final night. No fear. No hiding. 💙🔥',
        reactions:[
          { char:'surya', text:'Shot option tha. Bas execution gods bhi chahiye hote hain.' },
          { char:'bumrah', text:'High risk means you accept both results.' },
          { char:'__fan', name:'paltanpulse', text:'My heart stopped. This kid is cinema.' },
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
      'Final khatam. Result jo bhi ho, dressing room mein ek ajeeb sa vacuum hai. Noise bahar chhoot gaya. Andar sirf kit bags, sweat, tape, empty bottles.',
      'Tumhare phone par 999+ notifications. Hardik trophy table ke paas khada hai. Rohit door ke frame se bahar field dekh raha hai. Surya tumhari taraf phone hila ke bolta hai: "Caption ready?"',
      'Yeh final choice scorecard se zyada identity ka hai.',
    ],
    react:{ char:'rohit', text:'Season ka last post bhi season ka part hota hai.' },
    q:'Final night ka public/private close kaise karte ho?',
    choices:[
      {
        t:'Team-first note, private calls, quiet close',
        s:'Trophy ya heartbreak, dono team ke saath close karo.',
        deltas:{ fame:2, heat:-2, image:6 },
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
        deltas:{ fame:0, heat:8, image:-4 },
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
// Thresholds lowered so endings are reachable from starting meters (Form 45, Fame 55, Trust 35).
// ~30 situations × avg net +3 per meter = realistic range of 70-80 by finale.
export function resolveCricketEnding(m: import('./types').Meters): 'realDeal' | 'captainsProject' | 'paltanWonderkid' | 'tooMuchTooSoon' | 'quietClimber' {
  // Real Deal: Form is the dominant meter (cricket credibility wins)
  if (m.fame >= 70 && m.fame >= m.heat && m.fame >= m.image) return 'realDeal'
  // Captain's Project: Trust is dominant (dressing room belief wins)
  if (m.image >= 68 && m.image >= m.fame && m.image >= m.heat) return 'captainsProject'
  // Paltan Wonderkid: Fame clearly dominant over Trust (fan favourite)
  if (m.heat >= 70 && m.heat > m.image + 8) return 'paltanWonderkid'
  // Too Much Too Soon: high Fame but Trust lagging badly
  if (m.heat >= 62 && m.image < 50) return 'tooMuchTooSoon'
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
