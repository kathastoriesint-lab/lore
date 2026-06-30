/* Lore — Creator House · Day 1 (v3) shared content
   Canonical: MALE player (@nabh) · crush = Ananya · antagonist = Ria · schemer = Zoya · ally/witness = Kabir.
   Two hero metrics: Followers (fame) + Bond·Ananya (crushBond). Heat/Image = supporting "house read".
   Consumed by both Option A (Cinematic) and Option B (Chat). */
(function () {
  const AV = 'assets/avatars/';
  const bondTier = (n) => n <= -1 ? 'You traded it'
    : n === 0 ? 'The Almost'
    : n === 1 ? 'She lowers the guard'
    : n === 2 ? 'She picks you back'
    : 'Something real';

  const seeds = [
    { who: 'riaofficial', avatar: AV + 'ria.png', sub: 'Creator House', img: 'assets/scene-terrace-night.png', h: 360, likes: '84,291',
      cap: 'Kaafi log poochte hain — \u2018Ria, tujhe stress nahi hota?\u2019 Stress? Main stress ko content mein convert karti hoon. \uD83E\uDD0D', time: '6 HOURS AGO' },
    { who: 'kabir.exe', avatar: AV + 'kabir.png', sub: 'Creator House \u00b7 8h', img: 'assets/scene-challenge.png', h: 240, likes: '22,108',
      cap: 'din 1 aur energy already 100. yeh ghar kuch karega \uD83D\uDD25', time: '8 HOURS AGO' }
  ];

  const beats = [
    /* ============================ D1-1 · ENTRY ============================ */
    {
      id: 'D1-1', n: 1, label: 'Pehla Kadam', time: 'DAY 1 \u00b7 MORNING', eyebrow: '\u26A1 DAY 1 \u00b7 ENTRY',
      reader: [
        { t: 'nar', text: 'Gate khulta hai. Tum andar kadam rakhte ho \u2014 aur ruk jaate ho. Saamne: ek villa jaisa tumne sirf reels mein dekha tha. Golden light, ring lights, paani pe reflection.' },
        { t: 'img', src: 'assets/seed-villa.png', h: 300 },
        { t: 'nar', text: 'Lounge mein do ladkiyan. Ek \u2014 Ria, sabse tez nazar. Doosri \u2014 Ananya. Dono ki nazar ab tum pe ruk gayi hai.' },
        { t: 'cue', who: 'Ria', avatar: AV + 'ria.png', text: 'Yeh wahi hai na jiski reel viral ho gayi thi pichle mahine? \uD83D\uDC40' },
        { t: 'img', src: AV + 'ananya.png', h: 300, pos: 'center top' },
        { t: 'cue', who: 'Ananya', avatar: AV + 'ananya.png', text: 'Umm\u2026 haan. Haan, main isko jaanti hun.' },
        { t: 'nar', text: 'Ananya ki aankhein ek pal ke liye tumse mili \u2014 phir hat gayi. Teen saal ho gaye. Par woh nazar tumhe abhi bhi yaad hai.' },
        { t: 'nar', big: true, text: 'Poora ghar dekh raha hai. Pehla impression \u2014 yahi tay karega yeh log tumhe kaise dekhenge. Kaise karte ho enter?' }
      ],
      q: 'Kaise karte ho enter?',
      choices: [
        {
          key: 'loud', title: 'Loud entry \uD83D\uDD25', sub: '\u201CMain hi hoon jiska wait tha.\u201D \u2014 spotlight kheench lo.',
          o: {
            compose: true,
            title: 'Sabne dekha.', desc: 'Loud entry ne crowd kheench liya. Followers chad gaye.',
            gainF: 12400, dF: 8, dH: 6, dI: -4, dBond: 0,
            post: { author: 'me', img: 'assets/seed-villa.png', cap: 'Loud and clear. Main character energy \uD83D\uDD25 #Day1 #CreatorHouse', likes: 12400 },
            reactions: [
              { who: 'riaofficial', avatar: AV + 'ria.png', text: 'Kya entry thi \uD83D\uDE05 noted. \uD83D\uDC51' },
              { who: 'housewatch_india', text: 'the energy on day 1 is DIFFERENT this time \uD83D\uDC40' }
            ],
            dm: { who: 'Ananya', handle: 'ananya.creates', avatar: AV + 'ananya.png',
              openers: [
                'Tum toh aise nahi the\u2026',
                '3 saal pehle tum loud nahi the. Tum bas\u2026 real the.',
                'Yaad hai woh raat? Tumne kaha tha tum kabhi perform nahi karoge.',
                'Ab spotlight ke peeche bhaag rahe ho. \uD83D\uDE42',
                'Pata nahi\u2026 yeh tum ho ya tumhara content.'
              ],
              replies: [
                { me: 'Log badalte hain, Ananya.', they: 'Ya bas\u2026 bhool jaate hain woh kaun the.' },
                { me: 'Tu abhi bhi mujhe yaad rakhti hai \uD83D\uDC40', they: 'Maine kab kaha bhool gayi? \uD83D\uDE43' }
              ] }
          }
        },
        {
          key: 'quiet', title: 'Quiet mystery', sub: 'Ek halki smile. Kuch mat bolo \u2014 let them wonder.',
          o: {
            directFeed: true,
            title: 'Sabne notice kiya.', desc: 'Chup-chaap entry. Par Ria ko mauka mil gaya.',
            gainF: 1800, dF: 1, dH: -2, dI: 4, dBond: 0,
            post: { author: 'ria', who: 'riaofficial', avatar: AV + 'ria.png', img: 'assets/scene-terrace-night.png', cap: 'Koi bhi aa jaata hai kya aaj kal \uD83E\uDD71 #Day1', likes: 38420 },
            reactions: [
              { who: 'creator.tea', text: 'okay that was clearly aimed at someone \uD83D\uDC40\uD83C\uDF7F' },
              { who: 'housewatch_india', text: 'ria already started the games on day 1??' }
            ],
            dm: { who: 'Ananya', handle: 'ananya.creates', avatar: AV + 'ananya.png',
              openers: [
                'Tum bilkul nahi badle.',
                'Wahi chup. Wahi \u2018main alag hoon\u2019 wala attitude.',
                'Yeh ghar chup logon ko kha jaata hai. Tum survive nahi kar paaoge yaha.'
              ],
              replies: [
                { me: 'Shayad main attention nahi chahta.', they: 'Toh phir yahan kyun aaye? \uD83D\uDE10' },
                { me: 'Dekhte hain kaun survive karta hai.', they: 'Hmm. Pehli baar kuch sahi bola. \uD83D\uDE0F' }
              ] }
          }
        }
      ]
    },

    /* ====================== D1-2 · THE REUNION (Ananya) ===================== */
    {
      id: 'D1-2', n: 2, label: 'Wahi Shakl, 3 Saal Baad', time: 'DAY 1 \u00b7 AFTERNOON', eyebrow: '\u2764 DAY 1 \u00b7 THE REUNION',
      reader: [
        { t: 'nar', text: 'Dopahar. Ghar settle ho raha hai \u2014 kamre claim ho rahe hain, content shoot ho raha hai. Tum kitchen mein paani lene jaate ho \u2014 aur ruk jaate ho.' },
        { t: 'nar', text: 'Ananya. Wahi shakl. Teen saal pehle \u2014 dono broke the, dono unknown. Wahi insaan jisne tumhara naam is list pe personally daala tha. Woh ek raat thi, ek \u2018almost\u2019 \u2014 jiska zikr kabhi nahi hua. Phir uska career chala, timing slip hui, dono peeche hat gaye.' },
        { t: 'img', src: AV + 'ananya.png', h: 340, pos: 'center top' },
        { t: 'cue', who: 'Ananya', avatar: AV + 'ananya.png', text: 'Saamne aake bhi maine socha tu hi hai. Kitna time ho gaya yaar\u2026 aur abhi bhi wahi.' },
        { t: 'nar', text: 'Woh haste haste bolti hai, par aakhri shabd pe ruk jaati hai. Guard upar hai \u2014 spotlight ne use pehle jala diya tha. Par yeh look\u2026 yeh look teen saal purana hai. Door se Kabir dekh raha hai. Tumhe pata hai woh soch raha hai jo tum soch rahe ho.' },
        { t: 'cue', who: 'Ananya', avatar: AV + 'ananya.png', text: 'Dekh humein content banana hi padega is reunion ka. Ya\u2026 ya hum bas do minute insaan rahein. Teri marzi.' }
      ],
      q: 'Reunion ko kaise milte ho?',
      choices: [
        {
          key: 'lean', title: 'Lean into the history', sub: '\u201CTu na hoti toh main yahan na hota.\u201D \u2014 purani baat name karo, warm raho.',
          o: {
            title: 'Sabne dekha kuch purana hai.', desc: 'Tum ne moment private rakha, viral nahi banaya. Ghar ne dekha \u2014 tum dono ke beech kuch reh gaya hai, teen saal purana.',
            gainF: 3100, dF: -2, dH: 5, dI: 1, dBond: 1,
            whyF: 'Tu ne moment private rakha, viral nahi banaya.',
            whyH: 'Ghar ne dekha \u2014 tum dono ke beech kuch purana hai.',
            whyI: 'Real laga, performance nahi \u2014 log warm hue.',
            bondNote: 'Ananya ne shared past pehli baar zubaan pe laaya. Ab terrace ka raasta khula.',
            bondGate: 'Yeh romance ka pehla darwaza tha \u2014 aur tumne khola.',
            post: { img: AV + 'ananya.png', cap: '3 saal pehle dono ke paas kuch nahi tha. Aaj ek hi ghar. Full circle. \uD83E\uDD0D #CreatorHouse', likes: 3100 },
            reactions: [
              { who: 'kabir.exe', avatar: AV + 'kabir.png', text: 'Woh tujhe pehle se jaanti hai na? \uD83E\uDD7A Yeh dikhta hai.' },
              { who: 'creator.tea', text: 'wait the LORE between these two?? din 1 aur already invested \uD83E\uDD7A' }
            ],
            dm: { who: 'Ananya', handle: 'ananya.creates', avatar: AV + 'ananya.png',
              openers: ['Maine kisi ko nahi bataya tu aa raha hai. Bas\u2026 dekhna chahti thi tera face jab andar aayega. \uD83D\uDE2D', '3 saal yaar. Tu badal gaya\u2026 par nahi badla.'],
              replies: [
                { me: 'Tu na hoti toh yeh list bhi na hoti. I remember.', they: 'Main bhi. Bas\u2026 isko hum dono ke beech rakhte hain, theek? Yeh wala thoda apna hai. \uD83E\uDD0D' },
                { me: 'Us raat ke baad sab itna ajeeb kyun ho gaya tha? \uD83D\uDC40', they: '\u2026Yeh sawaal abhi nahi. Par tu ne poocha. Yaad rahega. \uD83D\uDE05' }
              ] }
          }
        },
        {
          key: 'cool', title: 'Play it cool \u2014 make content of it', sub: 'Hassi mein udao, reunion reel bana do \u2014 clout-safe, guard ke against guard.',
          o: {
            title: 'Reel ban gayi.', desc: 'Tum ne reunion ko content bana diya. \u2018OG creators reunite\u2019 reel ne reach pakdi \u2014 par Ananya ki smile thodi formal ho gayi. Guard wahin ka wahin.',
            gainF: 9800, dF: 6, dH: -3, dI: 2, dBond: 0,
            whyF: '\u2018OG creators reunite\u2019 reel ne reach pakdi.',
            whyH: 'Funny tha, par thodi doori bhi dikhi.',
            whyI: 'Branded reunion content \u2014 clean, marketable.',
            bondNote: 'Bond hold \u2014 \u201CThe Almost.\u201D Tum ne reunion ko content bana diya, guard wahin ka wahin.',
            door: '10k watch confirms \u2014 reel ne ambient feed jaga di.',
            post: { img: AV + 'ananya.png', cap: 'OG creators reunite \uD83D\uDE2D dekho kahan se kahan @ananya.creates \uD83D\uDD25 #Day1 #CreatorHouse', likes: 9800 },
            reactions: [
              { who: 'ananya.creates', avatar: AV + 'ananya.png', text: 'Haha legend. Content first, hamesha. \uD83D\uDD25' },
              { who: 'housewatch_india', text: 'they turned the reunion into a reel in 4 seconds. pro move or\u2026 missed it?' }
            ],
            dm: { who: 'Ananya', handle: 'ananya.creates', avatar: AV + 'ananya.png',
              openers: ['Reel acchi thi yaar, sach mein \uD83D\uDE2D reach dekhi?', 'Tu wahi hai \u2014 bas ab thodi zyada smart. \uD83D\uDC40'],
              replies: [
                { me: 'Content first. Tu ne hi sikhaya tha. \uD83D\uDE0F', they: 'Haan\u2026 maine hi sikhaya tha na. Theek hai. Game on phir. \uD83D\uDD25' },
                { me: 'Baad mein bina camera baat karein?', they: 'Dekhte hain. Yahan \u2018baad mein\u2019 jaldi nahi aata. \uD83D\uDE05' }
              ] }
          }
        }
      ]
    },

    /* ============== D1-3 · ANANYA KI CHHAT vs ZOYA KI CHAI ================= */
    {
      id: 'D1-3', n: 3, label: 'Chhat ya Chai', time: 'DAY 1 \u00b7 EVENING', eyebrow: '\uD83C\uDF19 DAY 1 \u00b7 PEHLA PRIVATE MOMENT',
      reader: [
        { t: 'nar', text: 'Shaam dhalti hai. Ghar thoda thanda ho jaata hai, log apne corners mein. Aur tumhare paas do raaste khulte hain \u2014 ek hi waqt mein.' },
        { t: 'img', src: 'assets/scene-terrace-night.png', h: 250 },
        { t: 'nar', text: 'Lounge mein Zoya \u2014 do chai, ek muskaan, aankhon mein curiosity jo thodi zyada smooth hai. Woh sahi sawaal poochti hai. Too sahi. Ya \u2014 seedhi terrace, jahan Ananya akeli khadi hai. Phone neeche. Guard thoda neeche. Wahi insaan, wahi raat jaisa silence.' },
        { t: 'cue', who: 'Zoya', avatar: AV + 'zoya.png', text: 'Chai? Main genuinely curious hoon tere baare mein. Is ghar mein sab mask lagate hain. \uD83E\uDEF6' },
        { t: 'cue', who: 'Ananya', avatar: AV + 'ananya.png', text: 'Aa jaa upar. Bina camera. 3 saal mein bahut kuch reh gaya bolne ko. \uD83E\uDD0D' },
        { t: 'nar', big: true, text: 'Pehla private moment kiska hoga \u2014 schemer ka, ya crush ka.' }
      ],
      q: 'Shaam kahan le jaate ho?',
      choices: [
        {
          key: 'chhat', title: 'Ananya ki chhat', sub: 'Terrace, no camera, woh purani baat. \u2014 realness over network.',
          o: {
            title: 'Chhat pe, bina camera.', desc: 'Ananya ne us \u2018almost\u2019 raat ka pehla saaf zikr kiya. Guard aur neeche. Network skip \u2014 par jo mila woh asli tha.',
            gainF: 2400, dF: -1, dH: 4, dI: -2, dBond: 1,
            whyF: 'Tum spotlight se nikal ke chhat pe chale gaye.',
            whyH: 'Ghar bhar ko pata chala tum dono ek ghante terrace pe the.',
            whyI: 'Network skip kiya \u2014 Zoya ko khali chai ke saath chhoda.',
            bondNote: 'Ananya ne us \u2018almost\u2019 raat ka pehla saaf zikr kiya. Guard aur neeche.',
            post: { img: 'assets/scene-terrace-night.png', cap: 'best conversations woh hoti hain jinki koi reel nahi banti. \uD83C\uDF19 #Day1', likes: 2400 },
            reactions: [
              { who: 'creator.tea', text: 'din 1 aur already terrace pe ek ghanta \uD83E\uDD7A hum sab dekh rahe hain' },
              { who: 'kabir.exe', avatar: AV + 'kabir.png', text: 'kuch log bina bole bahut kuch keh dete hain. \uD83E\uDD0D' }
            ],
            dm: { who: 'Ananya', handle: 'ananya.creates', avatar: AV + 'ananya.png',
              openers: ['Aaj jo bola maine upar\u2026 3 saal se andar tha. \uD83D\uDE2E\u200D\uD83D\uDCA8', 'Tujhe pata hai na main yeh sirf tere saamne karti hoon? Guard-down wali Ananya.'],
              replies: [
                { me: 'Mujhe bhi yaad hai woh raat. Pura. \uD83C\uDF19', they: '\u2026toh hum dono ne use kabhi delete nahi kiya. Theek hai. \uD83E\uDD0D Kal phir chhat pe?' },
                { me: 'Tu abhi bhi darti hai isse, na?', they: 'Spotlight ne ek baar jala diya tha yaar. Par tu\u2026 tu pehle bhi tha, fame se pehle. Woh alag hai. \uD83D\uDE2E\u200D\uD83D\uDCA8' }
              ] }
          }
        },
        {
          key: 'chai', title: 'Zoya ki chai', sub: 'Lounge, chai, sab \u201Cgenuine.\u201D \u2014 network/info, par woh dekh rahi hai sab.',
          o: {
            title: 'Chai, aur ek thread.', desc: 'Tum chhat nahi gaye. Ananya thodi der railing pe khadi rahi, phir andar chali gayi. Guard wapas upar. Aur Zoya ke paas ab tum pe ek thread hai.',
            gainF: 6600, dF: 4, dH: 2, dI: -3, dBond: 0,
            whyF: 'Zoya ne tujhe apne network mein tag kiya \u2014 reach mili.',
            whyH: 'Do popular log ek saath \u2014 ghar mein buzz.',
            whyI: 'Tu ne crush ko chhat pe akela chhoda \u2014 Ananya ne notice kiya.',
            bondNote: 'Bond hold \u2014 \u201CThe Almost.\u201D Ananya andar chali gayi, guard wapas upar.',
            door: '\u26A0\uFE0F Zoya ke paas ab tum pe ek thread hai (Day 5 seed).',
            post: { img: AV + 'zoya.png', cap: 'chai aur achhi company. is ghar mein yeh bhi PR hai, par aaj nahi. \uD83E\uDEF6 #CreatorHouse', likes: 6600 },
            reactions: [
              { who: 'zoya.creates', avatar: AV + 'zoya.png', text: 'Found my person in this house. You know who you are. \uD83E\uDEF6 #CreatorHouse' },
              { who: 'housewatch_india', text: 'zoya found her day-1 person already?? watch this space \uD83D\uDC40' }
            ],
            dm: { who: 'Zoya', handle: 'zoya.creates', avatar: AV + 'zoya.png',
              openers: ['Aaj acha laga. Sach mein. Tu real lagta hai \u2014 yahan woh rare hai. \uD83E\uDEF6', 'Btw\u2026 tu aur Ananya, woh purani baat \u2014 usme kuch tha kya? Bas curious. \uD83D\uDC40'],
              replies: [
                { me: 'Bas purane dost. Aur kuch nahi. \uD83D\uDE42', they: 'Hmm. Theek hai. Main bas isliye poochi\u2026 kyunki log dekh rahe the. \uD83D\uDC85' },
                { me: 'Tu zyada hi detail mein interested hai, na? \uD83D\uDE0F', they: 'Haha caught. Main bas tujhe protect karna chahti hoon yahan. Promise. \uD83E\uDEF6' }
              ] }
          }
        }
      ]
    }
  ];

  window.LORE_DAY1 = {
    player: { handle: '@nabh', name: 'Nabh', initial: 'N' },
    crush: { name: 'Ananya', handle: 'ananya.creates', avatar: AV + 'ananya.png' },
    start: { followers: 52800, fame: 20, heat: 50, image: 30, bond: 0 },
    bondTier, seeds, beats
  };
})();
