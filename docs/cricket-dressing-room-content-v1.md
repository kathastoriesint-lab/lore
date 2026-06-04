# Indian Dressing Room — Full Content v1

**Source of truth:** `cricket-dressing-room-world-bible-v1.md`  
**Status:** Draft complete — Mumbai Prodigy Season 1 spine authored  
**Last updated:** 2026-06-04  
**Arc:** 30 core situations + run-based conditional modules + 5 endings

---

## Tokens used in content

- `{name}` → player's name
- `{handle}` → player's social handle
- `{friend}` → best friend placeholder; default `Maddy`

Fixed real cricket characters: Hardik, Rohit, Surya, Bumrah, Tilak, Mahela, Trent Boult, Deepak Chahar, Quinton de Kock, Will Jacks, Naman Dhir, Robin Minz, Raj Bawa.

Personal characters:

- `Coach Sir` → childhood coach
- `{friend}` → best friend

Fan/news accounts:

- `@paltanpulse` → emotional MI fan page
- `@cricketroom_india` → analytical cricket page
- `@futurexi` → prospect hype page
- `@memeovers` → cricket meme page

**Meters:** Form 🏏 · Fame ⭐ · Team Trust 🤝 — start at `Form 45 · Fame 55 · Team Trust 35`.  
Deltas shown as `Fo±n Fa±n TT±n`.

Hidden flags:

- `mentorTrust`
- `hypeRisk`
- `roleAcceptance`
- `homeGrounding`

Match variables:

- `debutRuns`
- `leagueRuns`
- `clutchRuns`
- `semiRuns`
- `finalRuns`
- `matchImpact` → `low` / `solid` / `high` / `matchwinner`

Match situations use authored run buckets. The player still chooses emotionally, but the outcome can branch based on current `Form`, `Team Trust`, and hidden flags. This keeps cricket results connected to math instead of feeling random.

---

## Season 1 Opening

> A 16-year-old Indian batter gets picked by Mumbai Indians.
>
> Outside, the internet calls him the future.
>
> Inside, the dressing room asks a simpler question:
>
> *Can he actually play?*

---

# CORE SITUATIONS

## S1 · ⚡ AUCTION NIGHT · "Sold To Mumbai"

**body:**

> Ghar ke drawing room mein TV ka volume itna loud hai ki auctioneer ka har naam seedha seene mein lag raha hai. Tumhare saamne coffee table par teen cheezein rakhi hain: ek half-empty water bottle, Coach Sir ka old notebook, aur tumhara phone — jo abhi tak disturbingly silent hai.
>
> Phir screen par tumhara naam aata hai.
>
> Base price. Do second ki khamoshi. Phir Mumbai Indians ka paddle uthta hai. Ek aur team join karti hai. Tumhare father remote itna tight pakad lete hain ki plastic click karta hai. MI phir paddle uthata hai.
>
> *Sold. Mumbai Indians.*
>
> Room mein awaaz phat jaati hai. Phone vibrate hona shuru. First notification: `@futurexi`: *"MI just bought a 16-year-old batting prodigy. Remember the name: {name}."* Dusra notification: `{friend}` calling. Teesra: unknown number — MI admin.
>
> Tumhara pehla IPL decision cricket ground par nahi, phone screen ke saamne hona hai.

**reactor:** Coach Sir — *"Beta, khushi mana. Par yaad rakh — Mumbai Indians ne tujhe khareeda hai. Cricket ne abhi accept nahi kiya."*

**question:** Auction ke turant baad kya karte ho?

**Choice A — "Phone side pe rakho, family ke saath raho"**

- s: Yeh pehle ghar ka pal hai. Internet baad mein.
- `Fo+1 Fa-1 TT+2`
- flags: `homeGrounding +1`
- caption: *(koi public post nahi — sirf family group mein ek photo)*
- reactions:
  - Coach Sir: *"Sahi. Pehle ghar. Kal se kaam."*
  - {friend}: *"Bro tu call nahi utha raha?? Theek hai superstar, main tujhe abhi se humble rakhunga."*
  - @cricketroom_india: *"Interesting. No immediate post from MI's teenage pick yet. Either media-trained already, or still processing the moment."*
- dmUnlock → MI admin: *"Welcome to Mumbai Indians, {name}. Reporting details shared. Media team will coordinate tomorrow."*
- profileUpdate: status → `Mumbai Indians Squad`

**Choice B — "Emotional MI story post karo"**

- s: Moment bada hai. Duniya ko pata chalna chahiye ki tum aa gaye ho.
- `Fo+0 Fa+5 TT-1`
- flags: `hypeRisk +1`
- caption: *"From academy nets to Mumbai Indians. Dream begins tonight. Paltan, see you soon. 💙 #OneFamily"*
- reactions:
  - {friend}: *"CAPTION READY THA KYA?? 😭 bro sold hua aur influencer mode on."*
  - Coach Sir: *"Post theek hai. Ab comments mat padhna. Kal subah shadow practice."*
  - @paltanpulse: *"OUR KID ALREADY POSTED. He gets it. Paltan is going to love him."*
- feedReaction → @futurexi: *"The 16-year-old has already crossed 500K followers after the MI pick. Hype is officially live."*
- profileUpdate: tag unlocked → `Teen Prodigy`

---

## S2 · ⚡ FIRST DAY · WANKHEDE · "Training Kit"

**body:**

> Wankhede ke players' entrance par tum ek second ruk jaate ho. Blue training kit abhi bhi nayi smell kar rahi hai. Collar thoda stiff hai. Backpack par tumhara naam printed hai — `{name}` — aur uske neeche MI logo.
>
> Andar field par alag duniya chal rahi hai. Hardik boundary ke paas Mahela ke saath baat kar raha hai. Dono ke haath mein folded team sheets. Rohit side-net ke paas khada hai, kisi young bowler ko quietly kuch samjha raha hai. Bumrah apna run-up mark kar raha hai, bina kisi drama ke. Tilak throwdowns le raha hai.
>
> Surya tumhe dekh leta hai. Door se grin. Haath utha ke bolta hai: *"Aaya prodigy?"*
>
> Sab friendly hai. Par sab dekh bhi rahe hain. Tum kaise enter karte ho, yeh pehla data point hai.

**reactor:** Surya — *"Relax. Yeh Wankhede hai, exam hall nahi. Bas haan, yahan sab answer sheet dekhte hain."*

**question:** Pehli Wankhede entry kaise play karte ho?

**Choice A — "Read the room — pehle observe karo"**

- s: Senior room hai. Pehle rhythm samjho, phir apni jagah banao.
- `Fo+1 Fa-1 TT+3`
- caption: *"First day in blue. Less talking, more learning. 🏏"*
- reactions:
  - Tilak: *"Good. Pehle din observe karna underrated hai."*
  - Rohit: *"Naya hai. Dekh raha hai. Theek hai."*
  - @cricketroom_india: *"MI's young pick looked quiet in first training visuals. Not a bad sign. Some players enter loud; some enter listening."*
- feedReaction → Coach Sir: *"Wankhede photo dekha. Pair zameen pe rakh."*

**Choice B — "Energy dikhao — sabse quickly bond karo"**

- s: Agar room mein jagah leni hai, toh invisible mat raho.
- `Fo+0 Fa+2 TT+1`
- caption: *"First training. First blue kit. Energy different hai. 💙"*
- reactions:
  - Surya: *"Good good, energy hai. Ab dekhte hain ball aane pe energy kahan jaati hai 😄"*
  - Hardik: *"Confident lag raha hai. Bas confidence ka output bhi chahiye."*
  - @paltanpulse: *"He looks like he belongs already. That smile in MI kit, man. Play him soon."*
- feedReaction → {friend}: *"Bro tu Surya ke saath same frame mein hai. Main school group mein unbearable ho gaya hoon."*

---

## S3 · ⚡ NETS · AFTERNOON · "Bumrah Ka Over"

**body:**

> Nets ka pehla serious rotation. Tum pads pehne khade ho aur suddenly Mahela bolta hai: *"{name}, next net. Jasprit, one over."*
>
> Bas. Itna hi.
>
> Bumrah ball haath mein ghumata hai. Koi sledging nahi. Koi smile nahi. Pehli ball — length dikhti kuch aur hai, guzarti kuch aur. Beat. Dusri — late movement, edge, side-net. Teesri — slower one, tum almost shot complete kar chuke ho jab ball aati hai.
>
> Side se Surya bolta hai: *"Welcome package."*
>
> Tum dekh sakte ho: Hardik arms folded. Rohit still. Tilak gloves pehne wait kar raha hai. Yeh sirf net over nahi hai. Yeh room ka pehla real test hai.

**reactor:** Bumrah — *"Tum length guess kar rahe ho. Wrist pehle pick karo."*

**question:** Agli ball kaise khelte ho?

**Choice A — "Defend karo, seekho, poochho kya miss hua"**

- s: Publicly beaten hona embarrassing hai. Par information yahi hai.
- `Fo+4 Fa-1 TT+4`
- flags: `mentorTrust +1`
- caption: *(koi post nahi — yeh nets ka sach tha)*
- reactions:
  - Bumrah: *"Better. Is baar tumne dekha."*
  - Rohit: *"Good. Ego bahar rakha."*
  - @cricketroom_india: *"Young MI batter spent extra time after a Bumrah net. This is how serious teams test prospects."*
- feedReaction → Coach Sir: *"Aaj beat hua? Achha. Ab video bhej."*
- profileUpdate: tag unlocked → `Bumrah Tested`

**Choice B — "Charge karo — statement shot maaro"**

- s: Agar sab dekh rahe hain, toh sabko dikhna bhi chahiye.
- `Fo-2 Fa+4 TT-3`
- flags: `hypeRisk +1`
- caption: *"First MI nets. First lesson: fear is optional. 🏏"*
- reactions:
  - Surya: *"Shot intent mast tha. Ball thoda jaldi aa gaya tere plan se 😄"*
  - Hardik: *"Intent hai. Control chahiye."*
  - @memeovers: *"Bro tried to charge Bumrah on day one. Confidence 100, survival pending."*
- feedReaction → @futurexi: *"The kid is not short on confidence. MI may have a live one here."*

---

## S4 · ⚡ NETS · EVENING · "Surya Ka Angle"

**body:**

> Official practice khatam ho chuki hai, par Surya abhi bhi side-net mein hai. Do cones, ek side-arm thrower, aur woh impossible angles jo TV pe casual lagte hain. Fine leg andar. Third man up. Deep square empty.
>
> Surya tumhe bulata hai. *"Aa. Ek cheez dikhaata hoon."*
>
> Woh pehli ball ko wrist se scoop karta hai. Dusri ko extra cover ke upar. Teesri ko itna late guide karta hai ki tumhe samajhne mein ek second lagta hai ki shot hua bhi ya nahi.
>
> Phir bat tumhe deta hai.
>
> *"Kar. Par yaad rakh — shot cool lagna alag cheez hai. Shot correct hona alag."*

**reactor:** Surya — *"Freedom ka matlab random nahi hota. Field dekh, phir pagal ban."*

**question:** Surya ke saath session kaise use karte ho?

**Choice A — "360 shots try karo — range dikhao"**

- s: Yeh chance hai Surya ko dikhane ka ki tum boring nahi ho.
- `Fo+1 Fa+4 TT-1`
- caption: *"Learning angles from the best. Some shots you don't copy, you earn. 😄🏏"*
- reactions:
  - Surya: *"Energy mast. Ab next time ball bhi choose kar lena champion."*
  - Tilak: *"Range hai. Control build karna padega."*
  - @paltanpulse: *"Surya teaching the kid range-hitting. This is the content we signed up for."*
- feedReaction → {friend}: *"Bro please do not break your spine trying SKY shots. But also please do."*

**Choice B — "Poochho kaunsi ball pe kaunsa shot"**

- s: Shot nahi, decision seekho.
- `Fo+4 Fa+1 TT+3`
- flags: `mentorTrust +1`
- caption: *"Aaj samjha: shot se pehle field padhna padta hai. T20 is not random. 🧠🏏"*
- reactions:
  - Surya: *"Good question. Isliye tu seekhega fast."*
  - Rohit: *"Shot sab dekhte hain. Sawal kam log poochte hain."*
  - @cricketroom_india: *"The viral part is SKY teaching the shot. The important part is the youngster asking about field logic."*
- feedReaction → Surya: *"Young lad asked the right question today. Range baad mein. Reason pehle."*

---

## S5 · ⚡ NETS · LATE EVENING · "Rohit Ka Tempo"

**body:**

> Dus minute ke liye tum bhool jaate ho ki kaun dekh raha hai. Throwdowns clean lag rahe hain. Cover drive middle. Pull controlled. Ek on-drive itna sweet hai ki side-net ke bahar khade Naman seedha bolta hai: *"Shot."*
>
> Rohit poore time kuch nahi bolta.
>
> Session khatam hota hai. Tum gloves nikaal rahe ho jab woh paas se guzarta hai. Bina rukhe sirf ek line:
>
> *"Tempo samajh raha hai?"*
>
> Tum smile karte ho, par andar se question seedha chubh gaya. Tumne shots khele. Kya tumne innings bhi kheli?

**reactor:** Rohit — *"Good ball ko respect karna defensive nahi hota. Boring ball ko punish karna attacking nahi hota. Tempo beech mein hai."*

**question:** Rohit ke sawaal ka kya karte ho?

**Choice A — "Seedha poochho — tempo kaise build karun?"**

- s: Senior ne door khola hai. Ego leke khade mat raho.
- `Fo+3 Fa-1 TT+4`
- flags: `mentorTrust +1`
- caption: *(koi post nahi — yeh cricket conversation thi)*
- reactions:
  - Rohit: *"Pehle 12 ball survive nahi. Samajh. Phir game tera."*
  - Tilak: *"Good you asked. Woh line free mein nahi milti."*
  - @cricketroom_india: *"Rohit spent time with MI's young batter after nets. These quiet mentoring moments matter more than viral sixes."*
- feedReaction → Coach Sir: *"Tempo seekh. Har ball audition nahi hoti."*
- profileUpdate: tag unlocked → `Rohit Noticed`

**Choice B — "Confident laugh — dikhne do ki pressure nahi hai"**

- s: Nervous nahi lagna. Senior ko over-respect bhi weakness lag sakta hai.
- `Fo+0 Fa+2 TT-1`
- caption: *"Good first hit at Wankhede. Rhythm aa raha hai. 🏏"*
- reactions:
  - Rohit: *"Hmm."*
  - Surya: *"Haan rhythm hai. Tempo wali baat phir bhi sun le kabhi."*
  - @futurexi: *"The kid looks confident in MI nets. Body language says he knows he belongs."*
- feedReaction → {friend}: *"Rohit said one line and you posted rhythm? Bro I am afraid of your confidence."*

---

## S6 · ⚡ TEAM MEETING · NIGHT · "Hardik Ka Role"

**body:**

> Team hotel ka meeting room. Whiteboard par likely XI nahi likha, sirf matchups. Left-arm spin. Death overs. Powerplay. Impact sub.
>
> Meeting ke baad Hardik tumhe rukne ka signal deta hai. Mahela bhi table ke end par hai. Yeh casual nahi hai.
>
> Hardik seedha bolta hai: *"Tera first chance, jab aayega, opening nahi hoga. Ho sakta hai no. 5. Ho sakta hai no. 6. Ho sakta hai 28 off 15. Ho sakta hai 12 balls to change momentum. Tu ready hai uske liye?"*
>
> Tumne zindagi bhar top order bat kiya hai. Tumhara viral clip powerplay ka hai. Fan pages tumhe opener bol rahe hain.
>
> Dressing room tumse kuch aur maang raha hai.

**reactor:** Hardik — *"Role chhota nahi hota. Execution chhota ya bada hota hai."*

**question:** Hardik ko kya jawaab dete ho?

**Choice A — "Accept karo — team jahan bole, wahan bat karunga"**

- s: Agar MI ko role chahiye, toh role do. Trust yahin banta hai.
- `Fo+2 Fa-1 TT+5`
- flags: `roleAcceptance +1`
- caption: *"Role clarity. Team first. Ready whenever needed. 💙"*
- reactions:
  - Hardik: *"Good. Yeh answer vague nahi tha."*
  - Tilak: *"Yahi se chances open hote hain. Seriously."*
  - @cricketroom_india: *"Role acceptance may decide how soon MI use their teenage batter. Top-order reputation, but lower-order opportunity possible."*
- feedReaction → Mahela: *"Young players who understand roles travel faster."*

**Choice B — "Bol do opening tumhara best use hai"**

- s: Agar tum apni strength nahi bologe, kaun bolega?
- `Fo+1 Fa+3 TT-4`
- caption: *"Clarity matters. I know my game. I know where I can impact. 🏏"*
- reactions:
  - Hardik: *"Fair. Bas team sheet individual comfort se nahi banti."*
  - Rohit: *"Opener banna hai toh wait kar. Player banna hai toh adapt kar."*
  - @paltanpulse: *"Let the kid open! Why buy a prodigy and then hide him at 6?"*
- feedReaction → @futurexi: *"Young batter wants top-order role. Ambition or impatience? Both can look identical at 16."*

---

## S7 · ⚡ MATCHDAY -1 · NIGHT · "Reel Ya Over"

**body:**

> Raat 9:40. Team hotel ke basement nets mein lights abhi bhi on hain. Bumrah apna last spell khatam kar raha hai. Tum gloves pakad ke khade ho jab MI social admin bhaagte hue aata hai.
>
> *"Sponsor reel abhi shoot karni padegi. Approval kal subah hai. Five minutes only."*
>
> Five minutes kabhi five minutes nahi hote. Makeup nahi, par setup. Retake. Product hold. Smile. Caption line.
>
> Dusri taraf Bumrah tumhari taraf dekhta hai. *"One more over?"*
>
> Tumhare paas 12 minute hain. Dono nahi ho sakte. Kam se kam properly toh nahi.

**reactor:** Coach Sir — *(voice note, unread)* *"Match se pehle raat ko jo choose karta hai, wahi player asli hota hai."*

**question:** Raat ke 12 minute kisko dete ho?

**Choice A — "Sponsor reel shoot karo"**

- s: Visibility bhi career ka part hai. MI social team bhi team ka part hai.
- `Fo-3 Fa+6 TT-3`
- flags: `hypeRisk +1`
- caption: *"First matchweek with MI. Grateful for every moment. Big things loading. 💙"*
- reactions:
  - Surya: *"Reel clean tha. Bas kal timing bhi clean rakhna 😄"*
  - Bumrah: *"Over kal nahi milega."*
  - @paltanpulse: *"Sponsor reel already? Starboy behaviour. Need debut now."*
- feedReaction → @memeovers: *"Bro has played 0 IPL balls and already has better lighting than half the league."*

**Choice B — "Extra nets lo — Bumrah ka over"**

- s: Reel wait karegi. Slower ball nahi.
- `Fo+4 Fa-2 TT+4`
- flags: `mentorTrust +1`
- caption: *(koi post nahi — phone kit bag mein raha)*
- reactions:
  - Bumrah: *"Better. Still early on the slower one, but better."*
  - Hardik: *"Noted."*
  - @cricketroom_india: *"MI's young batter skipped a sponsor capture for extra nets, per training visuals. Small thing. Serious signal."*
- feedReaction → Coach Sir: *"Video mila. Kal ball dekh ke khelna, naam dekh ke nahi."*

---

## S8 · ⚡ PRACTICE CHASE · AFTERNOON · "Tilak Ka Finish"

**body:**

> Practice chase: 36 needed off 24. Tilak walks in like he has already watched the ending. First two balls singles. Third ball sweep. Fourth ball deep midwicket ke upar, but not slog — placement. Last over tak chase khatam.
>
> Mahela seedha bolta hai: *"That is role clarity."*
>
> Hardik nods. Rohit smiles thoda sa. Surya claps once.
>
> Tum boundary rope ke paas helmet haath mein pakad ke khade ho. Tumhare viral clips mein bhi shots the. Par yahan room ne sirf shot ko nahi, clarity ko clap kiya.
>
> Tilak gloves nikaal ke tumhari taraf aata hai.

**reactor:** Tilak — *"Good shots sab maar lete hain. Jab team ko kya chahiye woh clear ho na, tab easy lagta hai."*

**question:** Tilak ke praise ko kaise handle karte ho?

**Choice A — "Congratulate karo aur poochho kya socha tha"**

- s: Benchmark se jalna easy hai. Usse seekhna useful hai.
- `Fo+3 Fa-1 TT+3`
- caption: *(koi post nahi — practice ka learning moment)*
- reactions:
  - Tilak: *"Good question. Main bataata hoon kaunsa bowler target tha."*
  - Rohit: *"Competition se zyada learning important hai pehle."*
  - @cricketroom_india: *"Tilak remains the template for MI's young Indian batting pathway. New kid watching closely."*
- feedReaction → `Young Table`: *"Tilak: kal same chase tu karega. Naman: pressure forwarded successfully."*

**Choice B — "Personal lo aur late tak akela train karo"**

- s: Agar trust nahi mil raha, toh extra work se lo.
- `Fo+2 Fa+1 TT-2`
- caption: *"Extra work. No shortcuts. 🏏"*
- reactions:
  - Tilak: *"Work good hai. Bas isolation ko process mat samajh."*
  - Surya: *"Akela maarna easy hai. Match mein 10 log saath hote hain."*
  - @futurexi: *"The kid stayed late after Tilak's practice chase. Competition in MI camp is real."*
- feedReaction → {friend}: *"Bro I saw late-night training post. Inspirational but also please eat dinner."*

---

## S9 · ⚡ BENCH PHASE · MATCH 3 · "Drinks Break"

**body:**

> Teesra match. Teesri baar tum XI sheet mein nahi ho.
>
> Pehle match mein tumne bola: *"Good for team."* Dusre mein: *"Long season."* Aaj jab team sheet aayi, tumne bas smile kiya. Woh professional smile jo aankhon tak nahi jaata.
>
> Wankhede mein crowd MI chant kar raha hai. Tum orange bib mein boundary ke paas warm-up kar rahe ho. Fan page notification: `@paltanpulse`: *"Why buy {name} if you're not going to play him?"*
>
> Drinks break ke time Hardik tumhe bottle deta hai. *"Stay ready."*
>
> Yeh simple line hai. Ya test. Ya warning.

**reactor:** Hardik — *"Bench pe kaise behave karta hai player, XI se pehle wahi dikhta hai."*

**question:** Teesri benching ke baad kya karte ho?

**Choice A — "Stay ready — drills, drinks, full involvement"**

- s: Playing XI nahi, par team se bahar bhi nahi.
- `Fo+2 Fa-1 TT+5`
- flags: `roleAcceptance +1`
- caption: *"Not in the XI yet. Still in the work. Still in the team. 💙"*
- reactions:
  - Hardik: *"Good. Yeh attitude useful hai."*
  - Tilak: *"I know it sucks. Par yahi phase kaam aata hai."*
  - @cricketroom_india: *"Body language watch: young MI batter active in drills despite third straight benching. Staff will notice."*
- feedReaction → Coach Sir: *"Bench bhi classroom hai. Notebook leke baith."*
- profileUpdate: tag unlocked → `Bench Ready`

**Choice B — "Fan posts like karo — public pressure ko bolne do"**

- s: Agar fans sach bol rahe hain, toh unhe ignore kyun karein?
- `Fo+0 Fa+5 TT-4`
- flags: `hypeRisk +1`
- caption: *(no direct post, but liked fan posts become visible)*
- reactions:
  - Surya: *"Likes bhi screenshots ban jaate hain champion."*
  - Hardik: *"Public pressure selection meeting mein kaam nahi karta."*
  - @paltanpulse: *"HE LIKED OUR POST. The kid wants to play. Give him the debut."*
- feedReaction → @memeovers: *"Teenage cricketer discovered the dangerous sport of liking tweets."*

---

## S10 · ⚡ TACTICAL ROOM · AFTERNOON · "Mahela Ka Screen"

**body:**

> Hotel meeting room thanda hai. AC zyada. Screen par tumhara wagon wheel. Uske side mein numbers: vs leg spin, vs left-arm orthodox, first 10 balls, balls 11-20.
>
> Mahela pointer se ek red zone highlight karta hai.
>
> *"This is where teams will bowl to you."*
>
> Tumhare stomach mein halka sa drop. Yeh wahi area hai jahan tum domestic/U19 mein hands se nikal jaate the. Yahan woh data ban gaya hai.
>
> Mahela seedha poochta hai: *"Are you ready for this matchup?"*
>
> Room mein Hardik hai. Analyst hai. Tilak bhi corner mein hai. Safe answer obvious hai. Sahi answer mushkil.

**reactor:** Mahela — *"Young players lose time pretending they don't have weaknesses. Good ones start building plans."*

**question:** Spin matchup ke baare mein kya kehte ho?

**Choice A — "Weakness admit karo, plan maango"**

- s: Sach bolna short-term uncomfortable hai. Long-term useful.
- `Fo+4 Fa-1 TT+4`
- flags: `mentorTrust +1`
- caption: *(koi post nahi — tactical room private raha)*
- reactions:
  - Mahela: *"Good. Now we can work."*
  - Tilak: *"Admit karna hard hota hai. But plan tabhi banta hai."*
  - @cricketroom_india: *"If MI use the youngster, watch his spin matchup. That may decide batting position."*
- feedReaction → Rohit: *"Weakness naam dene se chhoti ho jaati hai. Ignore karne se badi."*

**Choice B — "Bol do ready ho kisi bhi matchup ke liye"**

- s: Opportunity ke pehle doubt dikhana dangerous lagta hai.
- `Fo+0 Fa+2 TT-3`
- caption: *"Ready for whatever comes. That's the job. 🏏"*
- reactions:
  - Mahela: *"Confidence noted. Plan still needed."*
  - Bumrah: *"Opponent plan ke saath aayega. Statement ke saath nahi."*
  - @futurexi: *"Love the confidence. Big players believe before others do."*
- feedReaction → Coach Sir: *"Ready bolne se ready nahi hota. Ready hone se ready hota."*

---

## S11 · ⚡ MATCHDAY · EVENING · "Slot Khul Gaya"

**body:**

> Toss se 90 minute pehle dressing room mein woh silence aata hai jo sirf injury news ke baad aata hai. Ek player ka niggle warm-up mein tight ho gaya. Physio Hardik ko side mein le jaata hai. Mahela sheet fold karta hai.
>
> Five minutes baad Hardik tumhare paas aata hai.
>
> *"There is one slot. Agar tu khelta hai, role flexible hoga. Maybe no. 5. Maybe impact. Maybe field first and wait. What can you give us tonight?"*
>
> Phone locker mein hai, par tum jaante ho bahar kya ho raha hoga. Fan pages. Debut watch. Edits. Pressure.
>
> Andar sirf ek sawaal hai: team ko kya doge?

**reactor:** Hardik — *"Mujhe answer chahiye, slogan nahi."*

**question:** Debut chance pe kya bolte ho?

**Choice A — "Wherever the team needs"**

- s: Role fluid hai. Tum bhi fluid ho.
- `Fo+2 Fa+0 TT+5`
- flags: `roleAcceptance +1`
- caption: *"If the chance comes, the role is simple: do what the team needs. 💙"*
- reactions:
  - Hardik: *"Good. Clear."*
  - Tilak: *"Ab chance aayega toh ready rehna. Yeh line easy nahi hoti."*
  - @cricketroom_india: *"Role flexibility may be the reason MI finally use their young batter."*
- feedReaction → Mahela: *"Preparedness is not about knowing your slot. It is about knowing your options."*
- profileUpdate: status → `Debut Watch`

**Choice B — "Top-order chance maango"**

- s: Agar debut hai, toh best chance bhi hona chahiye.
- `Fo+1 Fa+3 TT-2`
- caption: *"Big stages need clear roles. I know where I can impact the game. 🏏"*
- reactions:
  - Hardik: *"Noted. Team balance bhi noted."*
  - Rohit: *"Opening ka pressure glamorous lagta hai jab tak pehli ball swing nahi karti."*
  - @paltanpulse: *"Give him top order. Don't waste him. Wankhede wants the kid."*
- feedReaction → @futurexi: *"If MI debut him, batting position will tell us how much they trust him."*

---

## S12 · ⚡ DEBUT · WANKHEDE LIGHTS · "Pehli Ball"

**body:**

> Wankhede lights ke neeche sound alag hota hai. TV pe jo roar lagta hai, ground pe woh pressure ban ke chest mein baithta hai.
>
> MI need 42 off 28. Tum no. 5 par ja rahe ho. Helmet ke andar breath loud lag rahi hai. Non-striker tumhe sirf itna bolta hai: *"Ball dekh."*
>
> Bowler run-up start karta hai. Field: long-on back, deep midwicket back, third up, fine leg inside. First ball thodi short, thodi pace-off. Hittable hai. Risk-free nahi.
>
> Crowd tumhara naam nahi jaanta poora, par chant karne ki koshish kar raha hai.
>
> Tumhari pehli IPL ball. Tumhari first public truth.

**reactor:** Rohit — *(boundary ke paas, almost to himself)* *"Pehli ball career nahi hoti. Bas pehli ball hoti hai."*

**question:** Pehli ball ka kya karte ho?

**Choice A — "Build the chase — gap mein do lo"**

- s: Moment bada hai. Ball utni badi nahi.
- `Fo+6 Fa+2 TT+5`
- runOutcome: `debutRuns = Form >= 60 ? 36*(27) : 22(19)`; `matchImpact = solid`
- caption: *"First IPL innings. Noise alag tha. Lesson simple: ball by ball. 💙🏏"*
- reactions:
  - Hardik: *"Good first decision. Scorecard se pehle decision dikhta hai."*
  - Rohit: *"Panic nahi kiya. Good."*
  - @cricketroom_india: *"First ball: no slog, found the gap. That says more than a highlight would have."*
- feedReaction → Coach Sir: *"Pehli ball pe cricket khela. Drama nahi. Achha."*
- profileUpdate: tag unlocked → `Role-Ready`

**Choice B — "Big shot early — announce yourself"**

- s: Wankhede ko yaad rehna chahiye ki tum aaye the.
- `Fo+2 Fa+7 TT-2`
- flags: `hypeRisk +1`
- runOutcome: `debutRuns = Form >= 65 ? 44(21) : 8(6)`; `matchImpact = Form >= 65 ? high : low`
- caption: *"First IPL ball. First instinct. No fear. 💙🔥"*
- reactions:
  - Surya: *"Intent mast. Bas field bhi dekh le next time champion."*
  - Hardik: *"Crowd ko pasand aaya. Dressing room ko context bhi chahiye."*
  - @paltanpulse: *"THE KID WENT FOR IT FIRST BALL. I don't care what anyone says, he has star written all over him."*
- feedReaction → @memeovers: *"16-year-old saw Wankhede pressure and chose vibes. Respectful madness."*
- profileUpdate: tag unlocked → `Paltan Favourite`

---

## S13 · ⚡ POST-MATCH · MIDNIGHT · "Phone Explosion"

**body:**

> Match khatam. Dressing room ka noise dheere dheere normal ho raha hai — kit bags zip, recovery shakes, physio table, someone laughing too loud because pressure finally left the room.
>
> Tumhara phone locker se nikalte hi freeze. 217 WhatsApp messages. 48 missed calls. 11,000 new followers. MI tag. Fan edits. Ek clip jisme tumhara pehla shot slow-motion mein hai, background mein dramatic music.
>
> Top par teen unread messages:
>
> Hardik: *"Good. Recovery first."*  
> Coach Sir: *"Call when free. Not before stretching."*  
> {friend}: *"BROOOOOOOOOOOOO."*
>
> Bahar public tumhara moment bana rahi hai. Andar team already next match ki baat kar rahi hai.

**reactor:** Tilak — *"Phone baad mein. Pehle ice bath. Trust me."*

**question:** Pehle 20 minutes kisko dete ho?

**Choice A — "Team seniors ko message, recovery, then phone"**

- s: Public moment hai. Par dressing room routine pe chalta hai.
- `Fo+1 Fa+1 TT+4`
- flags: `homeGrounding +1`
- caption: *"Debut done. Work continues. Thank you Paltan. 💙"*
- reactions:
  - Hardik: *"Good. Recovery first means you listened."*
  - Coach Sir: *"Ab call kar. Score discuss karenge, emotions nahi."*
  - @cricketroom_india: *"Understated post after debut. MI will like that more than fans do."*
- feedReaction → Rohit: *"First game ke baad sab message karte hain. Second game ke liye kaun ready hai, woh important hai."*

**Choice B — "Cinematic celebration reel post karo"**

- s: Yeh moment dobara nahi aayega. Own it.
- `Fo+0 Fa+6 TT-3`
- flags: `hypeRisk +1`
- caption: *"Dreamt it. Lived it. Wankhede, you were unreal. 💙🔥 #DebutNight"*
- reactions:
  - {friend}: *"Reel fire. Comments warzone. Main moderation sambhal raha hoon."*
  - Surya: *"Good edit. Ab kal bowling machine edit karegi tujhe if late hua."*
  - @paltanpulse: *"Debut reel gave chills. This kid understands the stage."*
- feedReaction → @futurexi: *"One innings and the brand is already forming. Cricket now has to keep up."*

---

## S14 · ⚡ NEXT MATCH · AFTERNOON · "Same Process?"

**body:**

> Agla match. Ab tum unknown nahi ho. Analyst screen par opposition plan clear hai: hard length early, spin into pads, no width. Public expects repeat. Fan pages have already made a graphic: `{name} 2.0 loading?`
>
> Nets mein tum thoda late ho jaate ho ek ball pe. Bumrah notice karta hai. Tilak notice karta hai. Hardik kuch nahi bolta.
>
> Rohit tumhare paas se guzarta hai. Sirf do words:
>
> *"Same process?"*
>
> Pehle match mein tumne duniya ko surprise kiya. Ab duniya tumhe plan kar rahi hai. Yeh second test zyada real hai.

**reactor:** Rohit — *"Repeat karne ki koshish mat kar. Process repeat kar."*

**question:** Next match pressure kaise handle karte ho?

**Choice A — "Same process — ball, role, situation"**

- s: Repeat highlight nahi, repeat decision-making.
- `Fo+5 Fa+1 TT+4`
- caption: *"Second game. Same process. New problem. 🏏"*
- reactions:
  - Rohit: *"Good. Yeh mature answer hai."*
  - Hardik: *"This is useful."*
  - @cricketroom_india: *"The second match will tell us more than the debut. Watch decision-making, not just runs."*
- feedReaction → Coach Sir: *"Ab cricket shuru."*

**Choice B — "Headline chase karo — public ko second clip do"**

- s: Momentum public ka hai. Agar ab thande pad gaye toh story khatam.
- `Fo-2 Fa+5 TT-3`
- caption: *"No hiding now. Bigger stage, bigger intent. 🔥"*
- reactions:
  - Surya: *"Intent achha hai. Bas intent ke naam pe wicket mat gift kar."*
  - Bumrah: *"Plans change. You also have to."*
  - @paltanpulse: *"We want the same fearless kid. Don't overcoach him please."*
- feedReaction → @memeovers: *"Cricket fans after one debut: either future captain or fraud, no middle overs."*

---

## S15 · ⚡ REVIEW ROOM · NEXT MORNING · "Runs Ka Matlab"

**body:**

> Subah 10:15. Hotel review room. Tumhari first innings screen par pause hai. Scorecard ek number dikhata hai, par room us number ko alag tareeke se padh raha hai.
>
> Agar tumne 30+ banaye, fan pages tumhe already future bol rahe hain. Agar tum jaldi out hue, wohi fan pages bol rahe hain: *"At least intent tha."* Agar beech ka score tha, sab confused hain — good start ya missed chance?
>
> Mahela clip chalata hai. First scoring shot. First dot. First risk. First mistake.
>
> Public ne innings ko story bana diya. Dressing room usse information bana raha hai.

**reactor:** Mahela — *"Runs matter. But how you got them tells us what to do next."*

**question:** Review room mein apni innings kaise discuss karte ho?

**Choice A — "Specific mistakes accept karo"**

- s: Score se zyada process dikhao. Seniors ko yeh language samajh aati hai.
- `Fo+3 Fa-1 TT+4`
- flags: `mentorTrust +1`
- caption: *(koi post nahi — review room private raha)*
- reactions:
  - Mahela: *"Good. That is useful feedback."*
  - Bumrah: *"You saw the mistake. Now reduce repeat."*
  - @cricketroom_india: *"Post-debut review will decide whether MI use him as a one-off spark or a serious role option."*
- profileUpdate: recent note → `Debut review: coachable`

**Choice B — "Positive spin rakho — confidence project karo"**

- s: Young player ko doubt dikhana dangerous lag sakta hai.
- `Fo+0 Fa+3 TT-2`
- flags: `hypeRisk +1`
- caption: *"First one done. Took lessons. Still backing my game. 🏏"*
- reactions:
  - Hardik: *"Backing game is fine. Naming gaps is better."*
  - Surya: *"Confidence rakho. Bas feedback ko enemy mat samjho."*
  - @futurexi: *"Loved the confidence after debut. This kid carries himself like he belongs."*

---

## S16 · ⚡ TEAM ACTIVITY · EVENING · "Young Table"

**body:**

> Rest evening. No nets. No media. Officially recovery.
>
> Unofficially, yeh woh time hai jahan dressing room decide karta hai kaun actually group ka part hai. Young Table mein Tilak, Naman, Robin aur Raj Bawa cards khel rahe hain. Surya side se commentary kar raha hai jaise yeh World Cup final ho.
>
> Tumhare phone par {friend} ke 12 memes unread hain. Coach Sir ka message bhi: *"Kal subah video call. Footwork."*
>
> Ek taraf squad mein ghulna. Dusri taraf woh log jo tumhe tab jaante the jab tumhare paas MI kit nahi thi.

**reactor:** Tilak — *"Aaja. Har cheez nets mein nahi seekhte."*

**question:** Rest evening kaise spend karte ho?

**Choice A — "Young Table ke saath raho"**

- s: Dressing room trust sirf runs se nahi, time se bhi banta hai.
- `Fo-1 Fa+0 TT+4`
- caption: *(koi post nahi — team room moment)*
- reactions:
  - Naman: *"Finally prodigy normal nikla."*
  - Surya: *"Cards mein bhi shot selection weak hai iska."*
  - @paltanpulse: *"Young MI group bonding clips are too wholesome. Future core?"*
- dmUnlock → {friend}: *"No reply. Fine. I am losing you to rich cricket friends."*

**Choice B — "Home Circle ko call karo"**

- s: Famous room se bahar bhi tumhari ek duniya hai. Use zinda rakho.
- `Fo+1 Fa-1 TT+1`
- flags: `homeGrounding +1`
- caption: *(koi post nahi)*
- reactions:
  - Coach Sir: *"Good. Ab stance dikha."*
  - {friend}: *"Finally. I had 14 jokes loaded."*
  - @cricketroom_india: *"Young players who keep old anchors often handle hype better. Not visible, but real."*
- feedReaction → Coach Sir: *"Training starts even on rest day."*

---

## S17 · ⚡ BRAND ROOM · AFTERNOON · "Bat Sticker Offer"

**body:**

> MI hotel ke business lounge mein ek sports equipment brand ka team baitha hai. Contract table par hai. Bat sticker, gloves, two campaign shoots, bonus if you play 5 matches.
>
> Line jo baar baar repeat ho rahi hai: *"India's youngest fearless finisher."*
>
> Problem yahi hai. Tum abhi finisher ho ya nahi, yeh dressing room bhi decide kar raha hai. Brand ne decide kar liya.
>
> Agent-type voice phone par bolta hai: *"This is how you build market early. Don't overthink."*

**reactor:** Coach Sir — *(message)* *"Bat pe sticker badalne se middle nahi badalta."*

**question:** Brand offer kaise handle karte ho?

**Choice A — "Deal sign karo, campaign bhi commit karo"**

- s: IPL career short ho sakta hai. Market jab aaye, pakadna chahiye.
- `Fo-1 Fa+6 TT-3`
- flags: `hypeRisk +1`
- caption: *"Big partnership announcement soon. Grateful for the journey. 🏏"*
- reactions:
  - @futurexi: *"Brand deals already. Star trajectory has started."*
  - Hardik: *"Just make sure practice schedule doesn't move."*
  - {friend}: *"Bro got bat sticker money before I got internship."*

**Choice B — "Performance clauses rakho, shoots delay karo"**

- s: Paisa lo, par cricket calendar pehle.
- `Fo+2 Fa+1 TT+3`
- flags: `roleAcceptance +1`
- caption: *(announcement hold par rakha)*
- reactions:
  - Mahela: *"Professional answer."*
  - Coach Sir: *"Pehle bat ka kaam. Sticker baad mein."*
  - @cricketroom_india: *"Delaying commercial noise until role stabilizes would be a mature call for a young IPL player."*

---

## S18 · ⚡ AWAY MATCH · CHENNAI · "Spin Ka Trap"

**body:**

> Chennai. Surface slow. Crowd yellow. Dressing room whiteboard par teen words: *"No ego sweep."*
>
> Tum no. 4 par jaate ho because matchup opened. Spinner over the wicket, deep square back, long-on tempting, point up. First two balls dots. Third ball tumhare pad ke paas land hoti hai.
>
> Is pitch par 30 off 28 bhi useful hai. Par public ko 30 off 28 slow lagega. Fan pages ko six chahiye.
>
> Tilak non-striker end se bolta hai: *"Pitch accept kar."*

**reactor:** Mahela — *"On slow pitches, maturity looks boring on TV."*

**question:** Spin trap kaise play karte ho?

**Choice A — "Pitch accept karo, gaps mein build karo"**

- s: Ugly runs bhi runs hote hain. Especially away.
- `Fo+5 Fa-1 TT+4`
- runOutcome: `leagueRuns = Form >= 62 ? 41(35) : 27(25)`; `matchImpact = solid`
- caption: *"Away runs teach different things. Not every innings is pretty. 🏏"*
- reactions:
  - Tilak: *"Good. Pitch ko ego se nahi, plan se khela."*
  - Rohit: *"Useful runs."*
  - @cricketroom_india: *"This may not trend, but those were difficult away runs for a 16-year-old."*

**Choice B — "Spinner ko pressure mein daalo"**

- s: Dot balls se pressure ban raha hai. Ek over palatna padega.
- `Fo+1 Fa+5 TT-2`
- flags: `hypeRisk +1`
- runOutcome: `leagueRuns = Form >= 68 ? 52(27) : 12(9)`; `matchImpact = Form >= 68 ? high : low`
- caption: *"Sometimes you have to change the pitch's mood. 🔥"*
- reactions:
  - Surya: *"Agar nikal gaya toh genius. Agar nahi nikla toh clip. Dono mein farak hai."*
  - Hardik: *"Risk samajh ke liya tha ya pressure mein?"*
  - @paltanpulse: *"That intent in Chennai. He is not scared of conditions."*

---

## S19 · ⚡ HOTEL CORRIDOR · MIDNIGHT · "Runs Ke Baad Silence"

**body:**

> Away match ke baad hotel corridor quiet hai. Tumhare room ke bahar kit bag pada hai, shoes abhi bhi mitti se bhare. Score jo bhi raha — achha, kharab, beech ka — usne tumhe thaka diya.
>
> Agar runs aaye, phone loud hai. Agar nahi aaye, phone aur loud hai. Dono cases mein andar ka silence same hai.
>
> Rohit lift ke paas milta hai. Poochta nahi kitne banaye. Sirf poochta hai:
>
> *"Kya seekha?"*

**reactor:** Rohit — *"Runs yaad rahenge thode din. Learning rehni chahiye."*

**question:** Match ke baad apni story kaise frame karte ho?

**Choice A — "Learning note banao, public low rakho"**

- s: Har innings ko event mat banao. Kuch cheezein andar rehni chahiye.
- `Fo+3 Fa-2 TT+3`
- flags: `mentorTrust +1`
- caption: *"Tough conditions. Good lessons. Onwards. 🏏"*
- reactions:
  - Rohit: *"Good. Short rakha."*
  - Coach Sir: *"Video bhej. Caption nahi."*
  - @cricketroom_india: *"The understated post after a tricky away game says MI may be managing the hype carefully."*

**Choice B — "Result ko narrative banao"**

- s: Public ko context chahiye. Tum khud do, warna woh bana lenge.
- `Fo+0 Fa+4 TT-2`
- flags: `hypeRisk +1`
- caption: *"Every away game teaches who really wants it. I want it. Badly."*
- reactions:
  - {friend}: *"Caption intense. Comments worse. I am tired as your unofficial admin."*
  - Hardik: *"Wanting it is common. Building it is rare."*
  - @futurexi: *"The hunger is visible. These are the players you invest in."*

---

## S20 · ⚡ TEAM TRAVEL · FLIGHT · "Seat 12A"

**body:**

> Team flight. Tum window seat 12A. Across the aisle Quinton de Kock headphones laga ke quietly scorebook dekh raha hai. Surya aur Will Jacks kisi shot ke angle par debate kar rahe hain. Bumrah so raha hai, ya shayad bas eyes closed.
>
> Young Table group mein meme war chal raha hai. Saath hi Mahela ne tumhe three clips bheje hain: spin, hard length, slower bouncer.
>
> Flight teen ghante ki hai. Yeh free time nahi hai. Yeh choice hai.

**reactor:** Quinton de Kock — *"Long seasons are built in boring hours."*

**question:** Flight time kaise use karte ho?

**Choice A — "Analysis clips dekho"**

- s: Boring hours. Useful hours.
- `Fo+3 Fa-1 TT+3`
- flags: `mentorTrust +1`
- caption: *(koi post nahi)*
- reactions:
  - Mahela: *"Good. We discuss tomorrow."*
  - Bumrah: *"Saw you watching. Note the release points."*
  - @cricketroom_india: *"A lot of IPL development happens off-camera. Video work matters."*

**Choice B — "Young Table ke saath bond karo"**

- s: Season long hai. Room mein apne log bhi chahiye.
- `Fo-1 Fa+1 TT+3`
- caption: *(Young Table selfie, close friends only)*
- reactions:
  - Naman: *"Prodigy finally has bad memes. Good sign."*
  - Tilak: *"Balance. Thoda clips bhi dekh lena."*
  - @paltanpulse: *"Young MI core on flight together. Future looks blue."*

---

## S21 · ⚡ MI FOUNDATION DAY · MORNING · "Kids Clinic"

**body:**

> MI Foundation cricket clinic. 40 school kids, tiny pads, oversized helmets, questions that are somehow more dangerous than press conferences.
>
> Ek 11-year-old tumse poochta hai: *"Aapko darr lagta hai kya batting karte time?"*
>
> Camera side mein hai. Brand backdrop bhi hai. Yeh answer cute bhi ban sakta hai, real bhi.

**reactor:** Surya — *"Bachche PR answer pakad lete hain. Sambhal ke."*

**question:** Kids clinic mein kya answer dete ho?

**Choice A — "Sach bolo — darr lagta hai, par practice help karti hai"**

- s: Honest answer brand-safe bhi ho sakta hai, bas plastic nahi.
- `Fo+2 Fa+1 TT+3`
- flags: `homeGrounding +1`
- caption: *"Best question today came from the smallest helmet in the room. Fear is real. Practice helps. 💙"*
- reactions:
  - Coach Sir: *"Achha jawab. Bachche ko jhooth nahi bola."*
  - Surya: *"Good. Real tha."*
  - @paltanpulse: *"This clip is adorable and actually deep. Protect him."*

**Choice B — "Star answer do — no fear, only confidence"**

- s: Kids ko hero chahiye. Hero bano.
- `Fo-1 Fa+4 TT-2`
- flags: `hypeRisk +1`
- caption: *"No fear when you love the game. 💙"*
- reactions:
  - Rohit: *"Fear nahi bolna easy hai. Handle karna hard."*
  - {friend}: *"No fear? Bro you screamed at a cockroach last year."*
  - @futurexi: *"That's the mentality. Big-stage players speak differently."*

---

## S22 · ⚡ MUST-WIN LEAGUE MATCH · NIGHT · "17 Off 8"

**body:**

> League table tight hai. MI ko yeh match jeetna zaroori hai. Tum crease par ho. 17 needed off 8. Bowler death specialist. Fine leg up, third up, long boundaries square.
>
> Hardik dugout se signal karta hai: *"Take it deep."*
>
> Surya boundary line se chillata hai: *"Ball dekh!"*
>
> Paltan noise mein tumhe apni heartbeat bhi nahi sun rahi. Yeh woh moment hai jahan highlight aur win ek hi shot lagte hain. Par hamesha nahi hote.

**reactor:** Hardik — *"Finish ka matlab six maarna nahi. Finish ka matlab game khatam karna."*

**question:** 17 off 8 kaise finish karte ho?

**Choice A — "Game deep le jao, matchups target karo"**

- s: Ek over aur. Right bowler, right ball.
- `Fo+5 Fa+2 TT+5`
- flags: `roleAcceptance +1`
- runOutcome: `clutchRuns = Form + TeamTrust >= 125 ? 23*(10) : 14(9)`; `matchImpact = Form + TeamTrust >= 125 ? matchwinner : solid`
- caption: *"Finish means staying there. Huge win. 💙"*
- reactions:
  - Hardik: *"That is finishing."*
  - Rohit: *"Good. Situation jeeta."*
  - @cricketroom_india: *"This was the most mature innings of his season if you watched the balls, not just the score."*
- profileUpdate: tag unlocked → `Clutch Watch`

**Choice B — "Abhi over palto — early boundary dhoondo"**

- s: Pressure bowler pe daalo. Wait karoge toh equation tumhe kha jaayegi.
- `Fo+1 Fa+6 TT-2`
- flags: `hypeRisk +1`
- runOutcome: `clutchRuns = Form >= 72 ? 26*(8) : 9(5)`; `matchImpact = Form >= 72 ? matchwinner : low`
- caption: *"Pressure is a choice. Tonight I chose to hit back. 🔥"*
- reactions:
  - Surya: *"Agar connect karta hai toh hero. Agar nahi, toh meeting."*
  - Hardik: *"Intent was clear. Execution decides whether it was right."*
  - @paltanpulse: *"Fearless finish attempt. This kid is box office."*

---

## S23 · ⚡ SPONSOR NIGHT · POST-WIN · "Party Ya Recovery"

**body:**

> Win ke baad sponsor dinner. Hotel rooftop. Blue lights, mocktails, brand cameras, players rotating through photo booths. Tumhara name card front table par hai now. Pehle yeh nahi hota tha.
>
> Social team bolti hai: *"Just thirty minutes."* Physio bolta hai: *"Ice bath in fifteen."* Young Table bolta hai: *"Aaja, free dessert."*
>
> Season mein pehli baar tumhe feel hota hai ki success bhi schedule tod sakti hai.

**reactor:** Bumrah — *"Recovery bhi skill hai."*

**question:** Post-win night kaise handle karte ho?

**Choice A — "Sponsor presence do, phir recovery"**

- s: Professional balance. Dikho bhi, ready bhi raho.
- `Fo+1 Fa+2 TT+3`
- flags: `roleAcceptance +1`
- caption: *"Big win. Bigger recovery. Long season. 💙"*
- reactions:
  - Bumrah: *"Good."*
  - Mahela: *"Professional."*
  - @cricketroom_india: *"Young players learning schedule discipline early is a good sign."*

**Choice B — "Full sponsor night enjoy karo"**

- s: Win rare hoti hai. Team bonding bhi important hai.
- `Fo-2 Fa+5 TT-1`
- flags: `hypeRisk +1`
- caption: *"Nights like these. Paltan energy unmatched. 💙🔥"*
- reactions:
  - {friend}: *"Bro party stories are insane. Also Coach Sir has seen them. RIP."*
  - Coach Sir: *"Kal subah call mat miss karna."*
  - @paltanpulse: *"He is enjoying the season and we love to see it."*

---

## S24 · ⚡ PRESS ROOM · AFTERNOON · "Future India Sawaal"

**body:**

> Press room mein aaj sawaal MI se zyada India ka hai.
>
> Journalist poochta hai: *"Do you think this IPL can put you in India conversation sooner than expected?"*
>
> Room thoda still ho jaata hai. Hardik side mein bottle cap ghuma raha hai. Mahela expressionless. Tum 16 ho. Sawaal 26 saal ka lag raha hai.
>
> Safe answer available hai. Viral answer bhi.

**reactor:** Hardik — *(low voice)* *"Team ka naam pehle."*

**question:** India hype ka jawab kaise dete ho?

**Choice A — "MI role pe focus rakho"**

- s: Future ke chakkar mein present mat kho.
- `Fo+2 Fa-2 TT+4`
- caption: *"Right now, my job is Mumbai Indians. One role, one game at a time."*
- reactions:
  - Hardik: *"Good."*
  - Rohit: *"Sahi answer."*
  - @cricketroom_india: *"Mature answer. India talk can wait; role clarity cannot."*

**Choice B — "Dream accept karo — India is the goal"**

- s: Sapna chhupana kyun? Har player ka goal wahi hai.
- `Fo+0 Fa+5 TT-2`
- flags: `hypeRisk +1`
- caption: *"Every kid dreams of India. I do too. But work first. 🇮🇳"*
- reactions:
  - @futurexi: *"He said it. India dream is live."*
  - Hardik: *"Work first wala part yaad rakh."*
  - Coach Sir: *"India word bol diya. Ab extra practice."*

---

## S25 · ⚡ PLAYOFF RACE · TEAM MEETING · "Net Run Rate"

**body:**

> Last league game. Qualification possible hai, par clean nahi. Net run rate equation screen par hai. MI ko sirf jeetna nahi, certain margin se jeetna hai.
>
> Mahela roles explain karta hai. Agar chase fast karna pada, tumhe promote kiya ja sakta hai. Agar wickets gire, tumhe hold karna padega.
>
> Same player. Two opposite jobs. One night.

**reactor:** Mahela — *"Playoff teams are not the ones with one style. They are the ones who can change styles without panic."*

**question:** NRR game ke liye kaise prepare karte ho?

**Choice A — "Two plans banao — attack aur hold dono"**

- s: Flexibility boring prep hai, exciting payoff.
- `Fo+4 Fa-1 TT+4`
- flags: `roleAcceptance +1`
- caption: *(koi post nahi — analyst session private raha)*
- reactions:
  - Mahela: *"This is the right preparation."*
  - Tilak: *"Do roles ready rakhna hard hai. But useful."*
  - @cricketroom_india: *"MI may use the youngster as a floating matchup piece in the playoff race."*

**Choice B — "Attack role demand karo"**

- s: NRR game mein conservative player yaad nahi rehta.
- `Fo+1 Fa+4 TT-2`
- caption: *"Some games need intent from ball one. Ready."*
- reactions:
  - Hardik: *"Intent noted. Flexibility pending."*
  - Surya: *"Attack role fun hai. Bas exit door bhi paas hota hai."*
  - @paltanpulse: *"Give him the license. Qualification needs fearless cricket."*

---

## S26 · ⚡ SEMI-FINAL · NIGHT · "Slow Pitch, Big Crowd"

**body:**

> Semi-final. Neutral venue, par blue shirts har jagah. Pitch dry. Ball grip kar rahi hai. Scoreboard pressure slow poison jaisa.
>
> MI 62/3. Tum walk in. Required rate manageable hai, par ek wicket aur game khol dega. Bowler spinner hai, long boundary leg side. Short boundary off side. Field tumhe invite kar rahi hai ek shot ke liye jo TV pe beautiful lagega.
>
> Dugout mein Hardik khada hai. Rohit baitha hai, helmet ke neeche aankhen fixed. Surya towel chew kar raha hai.
>
> Yeh league nahi. Yeh semi-final hai. Yahan 22 off 20 bhi career bana sakta hai. 12 off 5 bhi.

**reactor:** Rohit — *"Knockout mein hero banne se pehle game samajh."*

**question:** Semi-final ka role kaise play karte ho?

**Choice A — "Anchor karo, match ko 18th over tak le jao"**

- s: Bada shot baad mein. Pehle game zinda.
- `Fo+6 Fa+1 TT+6`
- flags: `roleAcceptance +1`
- runOutcome: `semiRuns = Form + TeamTrust >= 135 ? 47*(39) : 29(27)`; `matchImpact = Form + TeamTrust >= 135 ? high : solid`
- caption: *"Knockout cricket. Stay longer than the noise. 💙"*
- reactions:
  - Rohit: *"Good. Game samjha."*
  - Hardik: *"This was serious cricket."*
  - @cricketroom_india: *"That semi-final innings may not be the loudest, but it was structurally important."*

**Choice B — "Counterattack karo — pressure wapas bhejo"**

- s: Semi-final mein momentum wait nahi karta.
- `Fo+2 Fa+7 TT-3`
- flags: `hypeRisk +1`
- runOutcome: `semiRuns = Form >= 76 ? 58(29) : 13(8)`; `matchImpact = Form >= 76 ? matchwinner : low`
- caption: *"Knockouts don't scare me. They wake me up. 🔥"*
- reactions:
  - Surya: *"Agar yeh tera ball tha, genius. Agar nahi tha, meeting mein milte hain."*
  - Hardik: *"Brave. Need to check if it was right."*
  - @paltanpulse: *"This is why you play fearless kids in playoffs."*

---

## S27 · ⚡ SEMI-FINAL AFTERMATH · MIDNIGHT · "Hero Ya Passenger"

**body:**

> Semi-final ke baad dressing room ka mood result ke hisaab se nahi, contribution ke hisaab se tumhare andar settle ho raha hai.
>
> Agar tumne runs banaye, cameras tumhe dhoondh rahe hain. Agar tum miss hue, cameras phir bhi tumhe dhoondh rahe hain. Knockout mein invisibility luxury nahi hoti.
>
> Team bus ke bahar fan chillata hai: *"{name}, final mein century!"*
>
> Coach Sir ka message: *"Final mein zero se start."*

**reactor:** Hardik — *"Semi-final khatam. Final alag game hai."*

**question:** Semi-final ke baad apna headspace kaise set karte ho?

**Choice A — "Reset karo — final ko new game treat karo"**

- s: Hero bhi zero se start karta hai. Failure bhi.
- `Fo+3 Fa-2 TT+4`
- flags: `homeGrounding +1`
- caption: *"One more game. Reset. 💙"*
- reactions:
  - Hardik: *"Good. Reset matters."*
  - Coach Sir: *"Ab sahi."*
  - @cricketroom_india: *"The reset after a playoff game may decide whether the youngster handles the final."*

**Choice B — "Emotion ride karo — final hype build karo"**

- s: Momentum ko bottle nahi karte. Use amplify karte hain.
- `Fo+0 Fa+5 TT-2`
- flags: `hypeRisk +1`
- caption: *"Final. One more night. One more chance. 💙🔥"*
- reactions:
  - @paltanpulse: *"I have goosebumps. This kid was born for the stage."*
  - Rohit: *"Chance word yaad rakho. Guarantee nahi."*
  - {friend}: *"Bro your caption made my entire building ask me for tickets."*

---

## S28 · ⚡ FINAL WEEK · BRAND CALL · "Final Campaign"

**body:**

> Final se 48 hours pehle brand call. Same equipment company. Bigger offer. Campaign line:
>
> *"From prodigy to champion."*
>
> Problem: final abhi hua nahi hai.
>
> Brand team polite hai, excited hai, thoda desperate bhi. Shoot short hai, woh bol rahe hain. One hour. Maybe two. Final week mein two hours bhi bada hota hai.

**reactor:** Bumrah — *"Final se pehle future tense mein jeena dangerous hai."*

**question:** Final campaign ka kya karte ho?

**Choice A — "Shoot kar lo — opportunity rare hai"**

- s: Final week visibility ka price high hota hai. Yeh career window hai.
- `Fo-3 Fa+7 TT-4`
- flags: `hypeRisk +1`
- caption: *"Something special loading. Final week. 💙"*
- reactions:
  - @futurexi: *"The commercial machine is moving. Star confirmed."*
  - Hardik: *"Timing could have waited."*
  - Coach Sir: *"Champion word final ke baad use karna."*

**Choice B — "Campaign final ke baad rakho"**

- s: Trophy se pehle trophy caption nahi.
- `Fo+3 Fa-2 TT+4`
- flags: `homeGrounding +1`
- caption: *(koi announcement nahi)*
- reactions:
  - Bumrah: *"Good."*
  - Mahela: *"Clear priority."*
  - @cricketroom_india: *"Delaying a final-week campaign is exactly the kind of unglamorous decision teams respect."*

---

## S29 · ⚡ IPL FINAL · NIGHT · "Last 12 Balls"

**body:**

> IPL Final. Stadium ka noise body ke andar vibrate kar raha hai. MI need 24 off 12. Tum crease par ho. Non-striker Tilak. Dugout mein Hardik khada. Rohit bilkul still. Surya hands on head. Bumrah pads pehne nahi, par eyes locked.
>
> Bowler pace-off specialist. Field spread, par fine leg andar. Ek ramp possible hai. Ek hard two possible hai. Ek wrong shot possible hai jo poore season ka headline ban sakta hai.
>
> Scoreboard simple hai. Moment nahi.
>
> 24 off 12. Trophy line ke us paar hai.

**reactor:** Tilak — *"Hero banne ke liye pehle game finish kar."*

**question:** Final ke last 12 balls kaise play karte ho?

**Choice A — "Partnership finish — strike rotate, right ball boundary"**

- s: Trophy highlight se badi hai. Galat ball hero nahi banati.
- `Fo+7 Fa+3 TT+6`
- flags: `roleAcceptance +1`
- runOutcome: `finalRuns = Form + TeamTrust >= 145 ? 32*(15) : 19(13)`; `matchImpact = Form + TeamTrust >= 145 ? matchwinner : solid`
- caption: *"Finals are not played in captions. They are played one ball at a time. 💙🏆"*
- reactions:
  - Hardik: *"That is how you finish."*
  - Rohit: *"Mature. Very mature."*
  - @cricketroom_india: *"For a teenager, that final-over decision-making was absurdly composed."*
- profileUpdate: tag unlocked → `Final Nerve`

**Choice B — "Ramp/six option lo — final ko apna moment banao"**

- s: Fine leg up hai. Shot hai. Agar nikal gaya, history.
- `Fo+2 Fa+9 TT-3`
- flags: `hypeRisk +1`
- runOutcome: `finalRuns = Form >= 82 ? 36*(12) : 6(4)`; `matchImpact = Form >= 82 ? matchwinner : low`
- caption: *"Final night. No fear. No hiding. 💙🔥"*
- reactions:
  - Surya: *"Shot option tha. Bas execution gods bhi chahiye hote hain."*
  - Bumrah: *"High risk means you accept both results."*
  - @paltanpulse: *"My heart stopped. This kid is cinema."*

---

## S30 · ⚡ FINAL NIGHT · DRESSING ROOM · "Trophy Ke Baad"

**body:**

> Final khatam. Result jo bhi ho, dressing room mein ek ajeeb sa vacuum hai. Noise bahar chhoot gaya. Andar sirf kit bags, sweat, tape, empty bottles, aur woh feeling ki kuch bada abhi abhi guzra hai.
>
> Tumhare phone par 999+ notifications. MI media team waiting. Brand team waiting. {friend} calling. Coach Sir ka message pinned: *"Call jab akela ho."*
>
> Hardik trophy table ke paas khada hai. Rohit door ke frame se bahar field dekh raha hai. Surya tumhari taraf phone hila ke bolta hai: *"Caption ready?"*
>
> Yeh final choice scorecard se zyada identity ka hai. Tum season ko kaise close karte ho?

**reactor:** Rohit — *"Season ka last post bhi season ka part hota hai."*

**question:** Final night ka public/private close kaise karte ho?

**Choice A — "Team-first note, private calls, quiet close"**

- s: Trophy ya heartbreak, dono team ke saath close karo.
- `Fo+2 Fa-2 TT+6`
- flags: `homeGrounding +1`
- caption: *"This season taught me what team means. Thank you, Mumbai. Work continues. 💙"*
- reactions:
  - Hardik: *"Good season. Good close."*
  - Coach Sir: *"Ab call kar."*
  - @cricketroom_india: *"Team-first closing note from the youngster. MI's development bet looks serious."*

**Choice B — "Cinematic season reel — own the story"**

- s: Yeh tumhara season bhi tha. Public ko ending do.
- `Fo+0 Fa+8 TT-4`
- flags: `hypeRisk +1`
- caption: *"16. First season. Mumbai. Lights. Lessons. This is only the beginning. 💙🔥"*
- reactions:
  - @futurexi: *"This reel will be in every future India comp for the next five years."*
  - Surya: *"Good reel. Ab offseason mein real work."*
  - Coach Sir: *"Beginning bol diya. Ab prove kar."*

---

# CONDITIONAL MODULES

These are not random. They appear at fixed checkpoints if the condition is true.

---

## C1 · CONDITIONAL · AFTER S7 · "Why Isn't He Playing?"

**Trigger:** `Fame >= 70` after S7.

**body:**

> Matchday morning. Tum XI mein nahi ho, par tumhara naam trend kar raha hai. `#PlayName` type hashtags. Fan edits. One post has 80k likes: *"If MI don't trust young talent, why buy him?"*
>
> MI social team kuch nahi bolti. Hardik kuch nahi bolta. Silence bhi answer lagne lagta hai.
>
> {friend} screenshot bhejta hai: *"Bro they are fighting wars for you and you are probably eating oats."*

**reactor:** Hardik — *"Public pressure ko handle karna bhi skill hai. Use selection pressure mat bana."*

**question:** Public demand ko kaise handle karte ho?

**Choice A — "Ignore karo, practice pe raho"**

- s: Fans tumhare liye chillayenge. Tumhe ready rehna hai.
- `Fo+2 Fa-2 TT+3`
- flags: `homeGrounding +1`
- caption: *(koi post nahi)*
- reactions:
  - Hardik: *"Good. Noise ko noise rehne diya."*
  - Coach Sir: *"Hashtag se XI nahi banti."*
  - @cricketroom_india: *"No public reaction from the youngster despite fan pressure. Smart."*

**Choice B — "Support repost karo — subtle pressure build hone do"**

- s: Fans tumhare saath hain. Unhe completely ignore karna bhi weird hai.
- `Fo+0 Fa+4 TT-2`
- flags: `hypeRisk +1`
- caption: *"Love from Paltan means everything. Waiting, working. 💙"*
- reactions:
  - @paltanpulse: *"HE SEES US. Play him."*
  - Tilak: *"Careful. Waiting, working line good hai. Bas selection ko public mat bana."*
  - @memeovers: *"Subtle story. Extremely unsubtle internet."*

---

## C2 · CONDITIONAL · AFTER S9 · "Mahela Warning"

**Trigger:** `Team Trust <= 40` after S9.

**body:**

> Practice ke baad Mahela tumhe meeting room mein rokta hai. Screen off hai. Is baar numbers nahi, sirf baat.
>
> *"You are very visible,"* woh kehta hai. *"That is not the same as being ready."*
>
> Line polite hai, par seedhi. Tumhe samajh aa jaata hai ki room ne fan posts, reels, likes — sab dekha hai.

**reactor:** Mahela — *"We don't need you less famous. We need you more usable."*

**question:** Warning kaise lete ho?

**Choice A — "Accept karo — ask what usable means"**

- s: Yeh attack nahi, map hai.
- `Fo+3 Fa-1 TT+3`
- flags: `mentorTrust +1`
- caption: *(koi post nahi)*
- reactions:
  - Mahela: *"Good. Then we can work."*
  - Hardik: *"Useful answer."*
  - @cricketroom_india: *"MI staff reportedly working on role clarity with young batter. That matters."*

**Choice B — "Defend karo — visibility bhi pressure handling hai"**

- s: Tum famous ho gaye, iska matlab tum unserious nahi.
- `Fo+1 Fa+2 TT-2`
- caption: *"Pressure is part of the job. Learning every day. 🏏"*
- reactions:
  - Mahela: *"Learning has to be visible in choices."*
  - Bumrah: *"Pressure ko naam dena easy hai. Prepare karna hard."*
  - @futurexi: *"The kid is clearly aware of pressure. This arc is going to be fascinating."*

---

## C3 · CONDITIONAL · BEFORE S11 · "Promoted Role?"

**Trigger:** `Form >= 65 && roleAcceptance >= 2` before S11.

**body:**

> Matchday morning. Mahela calls you over with the analyst. Screen par possible batting order. Tumhara naam no. 6 par nahi — no. 4 ke side mein pencil mark.
>
> *"If matchup opens, we may push you earlier."*
>
> Yeh reward bhi hai, test bhi. Early entry ka matlab more balls. More balls ka matlab more ways to fail.

**reactor:** Rohit — *"Upar batting glamorous lagti hai. Time zyada milta hai, excuses kam."*

**question:** Promoted role pe kya bolte ho?

**Choice A — "Accept, but ask for situation clarity"**

- s: Upar jaaoge, par plan ke saath.
- `Fo+2 Fa+0 TT+4`
- flags: `roleAcceptance +1`
- caption: *(koi post nahi)*
- reactions:
  - Mahela: *"Good. Situation first."*
  - Rohit: *"Yeh answer better hai."*
  - @cricketroom_india: *"If MI promote the youngster, it will be because of role discipline, not fan noise."*

**Choice B — "Excited ho jao — this is the chance"**

- s: Finally, proper stage mil raha hai.
- `Fo+1 Fa+3 TT-1`
- caption: *"Some chances you wait for. Some you prepare for. 🏏"*
- reactions:
  - Surya: *"Caption nice. Bas chance ko caption mat bana dena."*
  - Hardik: *"Energy good. Keep role clear."*
  - @paltanpulse: *"Is this a hint? Is he batting up? Paltan detectives assemble."*

---

## C4 · CONDITIONAL · ANY TIME AFTER S9 · "Too Much Too Soon?"

**Trigger:** `hypeRisk >= 2` after benching.

**body:**

> Ek sports page headline drop karta hai: *"Too Much Too Soon? MI's Teenage Pick Already Bigger Than His Role."*
>
> Comments split. Half defend you. Half call you hype. Ek clip circulates jahan tum fan post like karte dikhe. Ek reel caption: *"Bro has more content than runs."*
>
> {friend} message karta hai: *"Do not open comments. I opened. I am changed as a person."*

**reactor:** Coach Sir — *"Naam jaldi aaya toh theek hai. Dimaag jaldi mat uda."*

**question:** Media storm kaise handle karte ho?

**Choice A — "Silent raho, next session pe kaam karo"**

- s: Narrative ka best reply cricket hai.
- `Fo+2 Fa-2 TT+3`
- flags: `homeGrounding +1`
- caption: *(koi post nahi)*
- reactions:
  - Bumrah: *"Good."*
  - Hardik: *"Noise ko answer nahi diya. Noted."*
  - @cricketroom_india: *"No reaction from the player after hype backlash. Sensible if he keeps working."*

**Choice B — "Cryptic story daalo"**

- s: Sabko lag raha hai tum chup rahoge. Thoda jawab zaroori hai.
- `Fo-1 Fa+5 TT-4`
- flags: `hypeRisk +1`
- caption: *"They talk before they know. Let them. 🔒"*
- reactions:
  - {friend}: *"Bro delete? Maybe? Too late, screenshots."*
  - Surya: *"Cryptic stories kabhi cryptic nahi rehti champion."*
  - @memeovers: *"Athlete cryptic story before selection drama. Cinema has arrived."*

---

## C5 · CONDITIONAL DM PACK · "Mentor Recovery"

**Trigger:** `mentorTrust >= 2` after a low-Form choice or failed innings in future versions.

**DM options:**

- Rohit: *"Failure ka video dekh. Comments ka nahi."*
- Bumrah: *"Ball jisne out kiya, woh dobara aayegi. Plan bana."*
- Surya: *"Thoda hurt hona allowed hai. Bas kal nets mein joke bhi allowed hai."*
- Coach Sir: *"Rona hai toh 10 minute. Phir front-foot drill."*

---

## C6 · CONDITIONAL DM PACK · "Old Academy Video"

**Trigger:** `homeGrounding >= 2` before first innings.

**DM: Coach Sir**

> *"Yeh video 4 saal purana hai. Tu cement pitch pe 200 ball khel raha tha. Tab koi camera nahi tha. Aaj camera hai. Ball wahi hai."*

**Player choice inside DM:**

**A — "Reply: wahi player hoon"**  
`Fo+1 Fa-1 TT+1`

**B — "Leave unread until after match"**  
`Fo+0 Fa+1 TT-1`

---

## C7 · CONDITIONAL · AFTER S12 · "Debut Headline"

**Trigger:** `debutRuns >= 30`.

**body:**

> Subah tak tumhara first innings clip har jagah hai. `@futurexi` ne graphic bana diya: *"{name} belongs."* `@paltanpulse` ne pinned post badal diya. MI admin pooch raha hai ek quick reaction video kar sakte ho?
>
> Dressing room mein praise hai, par measured. Rohit ne good bola, bas. Hardik ne recovery schedule bheja. Public ne tumhe arrive karwa diya. Team abhi bhi tumhe build kar rahi hai.

**reactor:** Rohit — *"Ek good innings se entry milti hai. Room nahi."*

**question:** Debut praise kaise handle karte ho?

**Choice A — "Measured reaction — team aur process pe focus"**

- s: Headline ko hawa mat do. Use ground karo.
- `Fo+2 Fa+1 TT+3`
- caption: *"Good to contribute. More to learn. Team win matters most. 💙"*
- reactions:
  - Hardik: *"Good line. Good mindset."*
  - Coach Sir: *"Ab next innings. Bas."*
  - @cricketroom_india: *"Measured reaction after a strong debut. MI will like this."*

**Choice B — "Hype lean karo — arrival moment own karo"**

- s: Kabhi kabhi arrival ko arrival bolna padta hai.
- `Fo+0 Fa+5 TT-2`
- flags: `hypeRisk +1`
- caption: *"Wankhede, I felt you. This is only the beginning. 💙🔥"*
- reactions:
  - @paltanpulse: *"HE KNOWS. We have our wonderkid."*
  - Rohit: *"Beginning word heavy hota hai."*
  - {friend}: *"Bro you posted 'beginning'. I am scared of episode 2."*

---

## C8 · CONDITIONAL · AFTER S12 · "First Failure"

**Trigger:** `debutRuns < 15`.

**body:**

> Debut ke baad phone silent nahi hai. Kaash hota.
>
> Clips chal rahe hain: slow-motion edge, missed ramp, dugout reaction, fan facepalm. Ek comment baar baar dikh raha hai: *"Too young. Not ready."*
>
> Tum locker ke saamne pads khol rahe ho jab Bumrah paas se guzarta hai. Woh rukta nahi. Bas bolta hai:
>
> *"Ball dobara aayegi."*

**reactor:** Coach Sir — *"Rona hai toh 10 minute. Phir bat uthao."*

**question:** First failure ka response kya hai?

**Choice A — "Failure study karo, comments band"**

- s: Jo ball out karti hai, woh teacher hai. Comments nahi.
- `Fo+3 Fa-2 TT+3`
- flags: `mentorTrust +1`, `homeGrounding +1`
- caption: *"Tough debut. Work starts now. 🏏"*
- reactions:
  - Bumrah: *"Good. Video dekh."*
  - Rohit: *"Yehi career hai."*
  - @cricketroom_india: *"How he responds after this debut will matter more than the dismissal."*

**Choice B — "Motivational comeback reel post karo"**

- s: Public ko dikhna chahiye ki tum toot nahi rahe.
- `Fo+0 Fa+4 TT-2`
- flags: `hypeRisk +1`
- caption: *"They'll doubt. I'll work. Comeback loading. 🔒"*
- reactions:
  - {friend}: *"Bro caption achha hai but please actually work also."*
  - Hardik: *"Work should be louder than caption."*
  - @memeovers: *"Comeback loading after debut. IPL content cycle undefeated."*

---

## C9 · CONDITIONAL · AFTER S22 · "Clutch Clip"

**Trigger:** `clutchRuns >= 20` OR `matchImpact = matchwinner` after S22.

**body:**

> 17 off 8 wala clip ab har jagah hai. Ek angle dugout ka hai jahan Hardik clap kar raha hai. Ek angle crowd ka hai. Ek angle tumhara hai — helmet ke andar aankhen still.
>
> Brand team message kar rahi hai. MI admin wants a sit-down. Fan pages ne naya nickname launch kar diya.
>
> Finishing is useful. Finishing is also addictive.

**reactor:** Hardik — *"Finish kar diya. Ab finish karne ka expectation bhi aayega."*

**question:** Clutch moment ke baad kya karte ho?

**Choice A — "Role ko repeatable process banao"**

- s: Finisher tag se pehle finisher routine.
- `Fo+3 Fa+1 TT+3`
- flags: `roleAcceptance +1`
- caption: *"One finish. Many more situations to learn. 💙"*
- reactions:
  - Hardik: *"Good. Repeatability."*
  - Tilak: *"Welcome to expectation."*
  - @cricketroom_india: *"A mature player turns a clutch clip into a repeatable role."*

**Choice B — "Nickname aur hype ride karo"**

- s: Fans ne naam diya hai. Moment pakdo.
- `Fo-1 Fa+5 TT-2`
- flags: `hypeRisk +1`
- caption: *"Paltan, that one was for you. 💙🔥"*
- reactions:
  - @paltanpulse: *"OUR FINISHER. I said what I said."*
  - Surya: *"Nickname dangerous hota hai. Pehle do aur innings."*
  - Coach Sir: *"Finisher tab jab baar baar finish kare."*

---

## C10 · CONDITIONAL DM PACK · "Final Fallout"

**Trigger:** `finalRuns < 15` OR `matchImpact = low` after S29.

**DM options:**

- Coach Sir: *"Final fail hua toh duniya khatam nahi. Par lesson ignore kiya toh problem."*
- Rohit: *"Big games hurt. Good. Yaad rahega."*
- Hardik: *"Result tough. Off-season plan important now."*
- {friend}: *"Internet is being internet. I am sending you only food reels for 24 hours."*

---

# ENDINGS

Endings resolve after S30 and all active conditional modules.

```
RealDeal        if Form >= 78 AND Form - max(Fame, TeamTrust) >= 8
CaptainsProject if TeamTrust >= 78 AND TeamTrust - max(Form, Fame) >= 8
PaltanWonderkid if Fame >= 78 AND Fame - max(Form, TeamTrust) >= 8
TooMuchTooSoon  if Fame >= 70 AND TeamTrust < 55
else            QuietClimber
```

---

## Ending 1 · "The Real Deal"

**final frame:**

> Wankhede khaali ho chuka hai. Floodlights aadhi band. Tum pitch ke edge par khade ho, gloves haath mein. Scoreboard ab match ka nahi, tumhara season dikha raha hai: runs, balls, strike rate, one line below — `MI see long-term role`.
>
> Fan pages pehle bol rahe the. Ab dressing room bhi maan raha hai. Tum highlight nahi, player ho.
>
> Rohit jaate-jaate sirf bolta hai: *"Ab agla season tough hoga."*
>
> Yeh compliment hai.

**ending copy:**

> *"{name}, tum sirf next big thing nahi. Tum real ho."*

**final profile tag:** `The Real Deal`

**closing DMs:**

- Hardik: *"Good season. Next one, teams will plan properly. Start now."*
- Coach Sir: *"Ab asli kaam shuru."*
- {friend}: *"Bro you became serious cricketer. I preferred when you were unemployed with me but proud."*

---

## Ending 2 · "Captain's Project"

**final frame:**

> Team hotel ke meeting room mein retention discussion chal raha hai. Tum bahar ho, obviously. Par jab door khulta hai, Hardik tumhari taraf dekh ke sirf itna bolta hai:
>
> *"Off-season plan bhejenge."*
>
> Public ko yeh line boring lagegi. Tumhe nahi. Tum samajh gaye ho — MI ne tumhe viral moment ke liye nahi, project ke liye rakha hai.

**ending copy:**

> *"Sabko tumhara naam trend karna zaroori nahi laga. Hardik ko tumhara role samajh aaya. Mahela ko tumhari clarity dikhi. Rohit ne sirf ek line boli: 'Isko time do.' IPL mein kabhi kabhi yahi sabse bada contract hota hai."*

**final profile tag:** `Captain's Project`

**closing DMs:**

- Hardik: *"Proud of how you handled role. Build body, build options."*
- Tilak: *"Next season easier nahi hota. Better hota hai if you work."*
- Coach Sir: *"Trust mila hai. Ab uska interest bharna."*

---

## Ending 3 · "Paltan Wonderkid"

**final frame:**

> MI official post ke comments load hi nahi ho rahe. Every second new comment. Edits, chants, blue hearts, old U19 clips, fake India XI graphics. Tumhara follower count spin karta rehta hai.
>
> Dressing room abhi bhi tumhe polish karna chahta hai. Par public ne decision le liya hai.
>
> Surya tumhara phone dekh ke hasta hai: *"Ab tu comment section ka problem hai."*

**ending copy:**

> *"Every edit had your name. Every MI fan page had your face. Tumne Wankhede ko ek naya obsession de diya. Public ke liye prodigy aa gaya. Ab cricket ko us hype ke saath chalna padega."*

**final profile tag:** `Paltan Wonderkid`

**closing DMs:**

- Surya: *"Enjoy kar. Bas kal se field dekh ke shot."*
- {friend}: *"Your fan pages are fighting other fan pages. You have entered boss level."*
- Coach Sir: *"Fame aa gaya. Ab game ko usse bada rakh."*

---

## Ending 4 · "Too Much Too Soon"

**final frame:**

> Phone screen bright hai. Room dark. Ek headline baar baar refresh ho raha hai: *"Is MI's teenage bet becoming a distraction?"*
>
> Tumhare clips chal rahe hain. Tumhare captions discuss ho rahe hain. Tumhare likes decode ho rahe hain. Par team sheet mein tumhara naam pencil se likha hai, permanent marker se nahi.
>
> Hardik kuch nahi bolta. Mahela sirf plan bhejta hai. Rohit ka message nahi aaya.
>
> Fame room ke bahar khada hai. Trust andar baitha wait kar raha hai.

**ending copy:**

> *"Tum trend hue. Bahut. Shayad zyada. Clips chale, captions aaye, debates bani. Par dressing room ke andar ek sawaal reh gaya: jab next time pressure aayega, kya tum cricket choose karoge ya camera?"*

**final profile tag:** `Too Much Too Soon`

**closing DMs:**

- Coach Sir: *"Abhi bhi time hai. Par pehle phone side pe."*
- {friend}: *"Comments ugly hain. Main memes bhej raha hoon. Tu practice kar."*
- Surya: *"Noise aaya. Happens. Ab game ko loud kar."*

---

## Ending 5 · "Quiet Climber"

**final frame:**

> Last match ke baad Wankhede ka dressing room half-packed hai. Tumhara kit bag corner mein hai. Is season mein tumne sab kuch nahi toda. Na tum flop hue. Na tum superstar bane.
>
> Tum bench pe baithe. Nets mein beat hue. Ek-do shots aaye. Ek-do moments haath se nikle. Tumne kuch seekha jo fan pages nahi dekh paaye.
>
> Tilak tumhare paas se guzarta hai. *"Off-season mein milte hain."*
>
> Itna sa sentence. Par pehle din se zyada hai.

**ending copy:**

> *"Na tumne season tod diya, na season ne tumhe. Bahar ke log shayad samjhe nahi. Andar ke log samajh gaye: yeh story khatam nahi hui. Yeh toh pehli entry thi."*

**final profile tag:** `Quiet Climber`

**closing DMs:**

- Coach Sir: *"Good. Ab U19 wala hunger wapas."*
- {friend}: *"You survived IPL. I survived your fan accounts. We both grew."*
- Tilak: *"Next time, more ready."*

---

# CONTENT COMPLETE — v1

**Core situations:** 30  
**Conditional modules:** 10  
**Endings:** 5  
**Meters:** Form, Fame, Team Trust  
**Hidden flags:** mentorTrust, hypeRisk, roleAcceptance, homeGrounding  
**Core promise:** Every cricket choice changes how the team sees you, how the public sees you, and how you see yourself.
