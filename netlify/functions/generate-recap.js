// netlify/functions/generate-recap.js
//
// Place this file at exactly that path in your project: netlify/functions/generate-recap.js
//
// SETUP REQUIRED before this works:
//   1. In Netlify: Site settings > Environment variables > add ANTHROPIC_API_KEY
//      (your Anthropic API key — never put this in App.jsx or anywhere client-side).
//   2. Deploy via a Git-connected repo, or `netlify deploy` from the CLI. Plain
//      drag-and-drop of the dist/ folder to app.netlify.com/drop does NOT deploy
//      functions — only static assets.
//   3. Done — your 4 real recaps (weeks 4-7) are embedded in STYLE_EXAMPLES below.
//      Add more of your own here over time as you write future recaps by hand,
//      to keep expanding what the model has to learn your voice from.
//
// Called from App.jsx as: fetch("/.netlify/functions/generate-recap", { method: "POST", ... })

const STYLE_EXAMPLES = `
Week 4 (first time I did the recap):

The League: First Outdoor Night Edition 🀄☀️

We finally earned a night warm enough to play outside, which is the cruelest possible timing for Anna, who is in Spain. Yes, she's "having the trip of a lifetime" or whatever, but let's be honest — she'd ditch a Spanish sunset in seconds to sit in a lawn chair and lose to us in person. We felt her longing from across the Atlantic. Stay strong, Anna.

Our host Dixie spent the entire day setting up and cooking Thai food in honor of mahjong — a game from China — and served sake, which is from Japan. A truly pan-Asian tribute with the geography held together by vibes alone. It was all delicious and nobody had the heart to file a complaint. We ate, we drank, we asked zero questions.

Kari joined late after heroically learning mahjong from scratch, then lost essentially every game. Her one non-loss? A wall game — where nobody wins. So her crowning achievement of the evening was successfully dragging everyone down with her. Rookie of the Year, frankly.

Zoe stumbled in jet-lagged off a flight from Italy, loudly announcing she had no chance of winning anything — and then won twice. Nothing humbles a table like a sleep-deprived woman who can't find her own time zone cleaning house. She also brought the chips, so we've decided to forgive her.

Alyssa breastfed mid-game while the table lamp drifted into perfect position like a guardian angel with impeccable timing. Nobody planned it. Nobody needed to. Meanwhile Scottie is logging hands of mahjong before she can hold her own neck up — destined to out-strategize every adult here by age four.

Abbey is in first place by a margin that should honestly be investigated. Every time she declares mahjong a little piece of the table dies inside, because we love her, but we'd also love for her to lose just once for our emotional wellbeing. Her younger sister Ellen is locked in at second, eternally half a step behind, living the little-sibling dream of being very good and still getting beaten by Abbey at the dinner table since birth. Some rivalries never die.

Erica, our certified vibe specialist who is "just here for fun," was also the last to arrive — partly because Google Maps confidently routed her behind Dixie's house and directly into the cows. She emerged unharmed, then casually won this week's flower challenge AND notched her first mahjong of the season. Nothing more dangerous than someone who can't find the house and still wins everything. We'd like her to pick a lane.

Alexa broke in her gorgeous new mat, instantly decided her tiles weren't cute enough to deserve it, and billed the upgrade to her husband as a birthday gift. A masterclass in turning a hobby into a line item.

Shannon came into the night sitting second-to-last, kept company at the bottom only by Alyssa, who has the airtight excuse of having recently produced a human and missed the last two weeks. So Shannon's basement spot came with a bit of an asterisk. Not anymore — she landed her first mahjong of the entire league last night and rocketed all the way up to 8th. A breakout performance, a vibe shift, a woman on the rise. The rest of the table should be nervous.

And the mastermind behind it all: Michelle. Everyone keeps gushing about how much they love this league, which is really just a long way of saying they love Michelle. She built this empire from nothing — the tiles, the tables, the sunsets practically show up on her command. A genius. A legend. Don't tell her, it'll go to her head.

🀄 Week 5 Recap — The One Where We Air-Conditioned the Great Outdoors

Huge thanks to Erica for hosting and putting out a spread that had everyone fighting over the BBQ chicken — which is extra hilarious given that Erica looked the AI recipe dead in the eye, saw the clearly-stated 325°, and confidently set the oven to 375° instead. We can only assume the instructions were more of a loose suggestion. By some miracle the chicken came out a 10/10 anyway, which has unfortunately taught Erica nothing about the value of reading directions.

Double birthday alert — happy birthday to Alexa and Kari! 🎉 Cake was had, celebrations were celebrated. Alexa also got brand-new tiles to break in... and we promptly seated her at a Game 1 table that wasn't even using them, robbing the birthday girl of her own tile debut. We felt appropriately terrible. But she got her redemption arc in Game 2 — first game with her new tiles, and she won. Cinematic. The tiles are clearly blessed.

Scottie made another appearance and remains the most composed member of this league — slept through the whole night being passed around like a hot-potato without a single complaint, which is more than any of us managed after a bad hand.

💸 Outstanding Debts: It has come to my attention that a $5 side bet from last week between Abbey, Dixie, and Erica remains unsettled. Abbey won (shocking), and being the gracious reigning first-place champ that she is, felt too bad to come collect. So allow me: Dixie and Erica, consider this your friendly reminder and very public shaming that you each owe Abbey $5. Let's recap the situation — she beat you, she's in first place, she's too polite to ask twice, and you're still not paying. That is a genuinely spectacular way to lose twice in one transaction. The debt remains gloriously unpaid. The interest is accruing in dignity.

🧙 Witch Watch: Abbey and Ellen just kept winning. Again. At a rate that no longer feels statistically possible. Some light witchcraft may be involved. We're keeping an eye on it.

📊 Scoring Update: We've officially switched to average points per game, and the app's updated if you want to see the damage. Biggest mover: Anna leapt from 6th to 4th. The top 3 — Abbey, Ellen, and Zoe — are all averaging above 10 points per game; the rest of us are stuck below 10, gazing up at them. Good news for the peasants: steady wall games close the gap. Consistency is the great equalizer.

🕵️ The Great Game-Logging Conspiracy: While updating everything, I discovered I had five games logged despite only playing four. Turns out a game between Erica, Ellen, and Anna had somehow been recorded as Erica, Ellen, and me — meaning a 0-point game that should've gone on Anna's record was instead being quietly stapled to mine. Ellen won that one (and locked the weekly challenge), so the bad log was actively dragging my average down while inflating Anna's. Convenient! Anna, I'm not officially accusing you of cooking the books to climb the standings off my back... but the math is doing a lot of accusing on its own. 👀 Refocus though, people — the real enemy is Abbey, not me. Aim your treachery upward. (Also fixed Zoe's win to the correct line. You're welcome, Zoe.)

Nearly full attendance — only Shannon missed out, stuck home on kid duty while her husband was off on a golf trip. Shannon, we missed you. And a word for the husband: mahjong is the priority, the golf can wait. Get your scheduling straight.

And finally: we played every game outside. In 90-degree heat. A choice we proudly committed to until we were all sweating directly into our tiles, at which point Erica deployed a full arsenal of AC fans, power strips, and extension cords to keep us breathing. Nothing says "casual, low-key, recreational league" like building a backyard climate-control facility from scratch. We are not high maintenance. We simply refuse to suffer.

Programming note: Abbey and Ellen are both out of town for next mahjong night. I cannot stress enough what an opportunity this is. The two witches, gone, on the same night — this is the power vacuum we've been praying for. The rest of us have exactly two weeks to figure out how to capitalize, by any means necessary. Strategy, sabotage, light bribery, suspiciously good luck — nothing is off the table. The standings are wide open and morality is optional. Come prepared. 🀄

🀄️ WEEK 6 RECAP - THE ONE WHERE ZOE COULDN'T BE STOPPED

Yes, this is the real summary you've all been waiting for. Anna already beat me to the group chat with her painfully brief, allegedly-AI-free recap and dared us to notice — we noticed, Anna, and we appreciate the effort, but some of us use our AI-enhanced personalities for a reason. Buckle up bitches.

🐍 SIX WOMEN, ZERO WITCHES, ONE ZOE: Halfway through the season now, and this week the universe handed us a gift: Abbey and Ellen off gallivanting in Dublin and cursing us from afar, which meant the rest of us finally had a shot at climbing the podium. Six of us gathered at Zoe's, whose backyard looked like a Pinterest board and delivered perfect weather to match, the occasional zap of the fly trap doing its work in the background. Once we settled in, it didn't take long to identify Zoe as the biggest threat in the yard, and we built an entire coordinated takedown strategy to gang up on her. The plan lasted approximately zero games. She just kept winning. And winning. Democracy failed us last night.

🍔 CHARLIE'S BURGER CAMPAIGN: Charlie made us ladies his signature burgers and they were, as always, elite. But let's call this what it is: word on the street is Charlie's golf league is not going well for him, and suddenly he's out here buttering up an entirely different league of women with beef (+1 turkey) patties. Sir, this is Mahjong League. We don't have a trophy to give you. We see the strategy, Charlie. Losing at golf, winning at burgers. Diversify your portfolio, we suppose.

⚽ SOCCER ALERT It was also the round of 32 soccer game last night between USA and Bosnia, so I was obnoxious about putting the game on the second I crossed Zoe's threshold, then migrated to outside via iPad because I have no chill. I rudely paid no mind to Zoe's personally curated Mahjong night playlist as I blasted the soccer broadcast over her music in her peaceful backyard. Sorry not sorry, Go Team USA!!

🀄 DIXIE RETURNS FROM MAHJONG BOOT CAMP: Dixie spent the last two weeks visiting family and, apparently, doing nothing but playing mahjong — including hitting up actual Southern mahjong clubs and picking up "tips" from total strangers. She came back trying to sell us on "bam bird" instead of "bird bam," which, no, absolutely not. She also brought us the phrase "may the jokers be with you" as a pregame blessing, which is cute and all, except the jokers decided to abandon her last night just like she abandoned Ty to deal with another family emergency (all jokes aside, we are very grateful Dick is OK). Two weeks of practice, multiple new strategies, real Southern mahjong credentials, but unlucky tiles. Honestly, Dixie, we love the effort — you clearly did the work, and we're rooting for your luck to catch up to your knowledge.

🎉 THE VIRGINS ARE VIRGINS NO MORE: Kari and Alyssa popped their mahjong cherries last night! Which included Kari taking the weekly challenge (13579) — and based on how fast she was already mentally spending that money, she seemed to think $7 was going to cover both a latte AND egg bites from Starbucks. Not in this economy, Kari! Then, apparently unsatisfied with a single taste of glory, each went and won a second game before the night was out. Welcome to the big leagues ladies, there's no going back now.

💅 A HUMBLE BRAG, LIGHTLY SEASONED: I picked up a 50-point Singles & Pairs hand -- putting me in an extremely elite three-person club with Abbey and Ellen. They're still miles ahead of me on PPG, so let's not get carried away, but I'll take my moment. I will be adding this to my Clack profile (IYKYK).

🌿 NO ERICA, NO SUPPLY, NO EXCUSES: No Erica last night meant no communal smoke break -- and it turns out Anna's mahjong game runs on a very specific fuel source -- because bless her, she played her heart out and just couldn't find the wins without it. Anna, we missed your co-pilot too. We're calling it a scientific control group experiment and the results are in: Erica isn't just good company, she's apparently a competitive advantage. This was a supply chain issue, not a skills issue. Come back soon, Erica. Anna's stats depend on it.

🔥 THE VIBES WERE OFF (in a good way): Consensus theory of the evening: the night had an edge to it. Sharper. More cutthroat. Turns out when the top two players aren't in the room, it turns us all into tiny competitive gremlins. More feisty, a little unhinged, the whole table feral. Nothing like the absence of a dynasty to bring out everyone's inner shark. And guess what? The leaderboard says it didn't make much of a difference.

👑 A THRONE SITS EMPTY NEXT WEEK: Heads up, I'm probably out next week, which will be held at Shannon's house. My parents are flying in, and when I floated the idea of Rob driving our two kids out to the airport solo around dinner/bedtime so I could go play a tile game with my friends, the look on his face said I'd asked him to donate a kidney. So, airport duty it is! I briefly considered sabotaging my own parents' flight so I could sneak in a game or two, but that might not help me stay in the top spot as their favorite daughter of the 4. So....the league needs a temporary commissioner, and I cannot stress enough that this is a REAL job, people. The job description is simple: use the suggested table assignments, get the games logged properly, and don't let Dixie say bam bird ever again. Remember I was an auditor for 12 years. I will know if things went off the rails.

Week 7 (done by Dixie):

🀄️ WEEK 7 RECAP -- THE ONE WHERE THE COMMISSIONERS LEFT US UNSUPERVISED: Greetings from your acting commissioner recap writer—a title I did not campaign for but was voluntold to accept. Our commissioner, Michelle, and vice commissioner, Anna, abandoned us for Tahoe, trusting us with league operations, rule enforcement, and basic adult decision-making. That was their first mistake. If Week 7 had a theme, it was "The Comedy of Errors." Rules were forgotten, flowers multiplied, tiles were thrown, and the witches returned. Somehow, the games were still logged correctly.

📋 ADMINISTRATIVE UPDATES: Before we get into this week's player reports, there are a few pressing league matters that require immediate attention.

\- 🌸 FlowerGate 2026: Following an internal investigation (conducted entirely by confused players staring at the middle of the table), it has been confirmed that eight extra flowers were somehow in circulation for two full games before anyone noticed. The flowers have since been accounted for, the offending tiles (Alexa's) have been corrected, and no further questions will be taken at this time. Michelle and Anna, we respectfully request you don't ask how no one declared mahjong with 16 flowers in rotation—twice—and just pretend you never read this paragraph. Michelle, you should absolutely add a "Flower Count Audit" to next year's commissioner handbook.

\- 🧱 Motion to Form Bob: We would also like to announce that a league vote has been held regarding an imaginary fourth player (aka Bob) in our three-person Mahjong games, in order to perform a full Charleston. The results are in. By "league vote," I mean mostly me—Kari voted no because, unsurprisingly, she thrives in chaos. But quite frankly, we all deserve a full Charleston.

🌮 HOSTESS WITH THE MOSTEST AND TACOS: Shannon hosted us this week and deserves immediate recognition for making the executive decision to outsource dinner. Pica's tacos, guacamole, watermelon, and Crumbl cookies? Flawless. May this officially relieve every future host of the imaginary obligation to prepare a four-course meal. Some of us have jobs. Some of us are "fun-employed." None of us need to be stress-cooking before trying to remember whether we can use a joker in a pair. And Shannon casually pulled off a 50-point closed Singles & Pairs hand, proving once again that the Mahjong gods reward hospitality. Now... did she attempt to call for a pair? Yes. Did she also try to use a joker for a single? Also yes. Did she learn both lessons the hard way? Twice. But true champions don't let a couple of minor rule violations stand in the way of greatness.

🧙‍♀️ THE WITCHES HAVE RETURNED (AND THEY CAN BLEED): Abbey and Ellen returned from gallivanting around Ireland doing what we can only assume were deeply witchy activities. Much to everyone's delight, they were actually beatable!

Ellen either misplaced her witch powers somewhere between Dublin and DIA or she's already suffering from the end-of-summer teacher scaries, because she lost to Kari... and then her own sister. She managed to recover a few points with a wall game later in the evening, but by then the spell had already been broken.

Abbey, meanwhile, suffered a loss in her opening game to Alyssa (cue league-wide celebration). Naturally, Abbey responded by winning the next two games because apparently witches regenerate. Alyssa even deployed baby Scottie as a strategic distraction by handing her over for cuddles, but Abbey simply cast whatever enchanted baby-sleep spell she's been hiding; Scottie melted into her arms and never woke up again. Honestly... respect.

👑 LONG LIVE THE QUEEN: Last week's reigning champion, Zoe, suffered the unthinkable in the opening round when Kari dethroned her in what can only be described as a Cinderella story. Naturally, Zoe took that personally. She then proceeded to win every remaining game she played—three, to be exact—earning herself the crown for the night again. Apparently, the first-round loss was less of a defeat and more of a warm-up. At this point, she's quietly—but also not quietly at all—closing the gap between herself and our resident witch, Abbey, in the standings. Honestly, are we sure Zoe isn't a witch too?

📈 KARI HAS ENTERED HER VILLAIN ERA: When Michelle's "totally random" seating assignments were announced, Kari looked personally victimized by the algorithm. Opening against Ellen and Zoe? Sure, Michelle. Totally random. Then Kari went out and beat them both. The expression on her face afterward was equal parts disbelief and revenge. A huge loss for the Reigning Queen and the Witches.

👶 ALYSSA: CHAOS, BUT MAKE IT POSTPARTUM: Alyssa continues to prove that postpartum Mahjong deserves its own division. She started by beating Abbey with a beautiful 30-point hand. Later, she unknowingly sat on Mahjong for what felt like half the game because she forgot to discard and had convinced herself an all-joker pung couldn't possibly count. Then—in perhaps the most statistically improbable accomplishment of the evening—she somehow managed to lose another game while holding SIX JOKERS. Honestly, that feels harder than winning. Fortunately, sweet Scottie spent the entire evening being the easiest baby in America, so Alyssa has earned unlimited postpartum mulligans.

🌿 ERICA VS. THE ENTIRE 2026 CARD: Erica remains one of the greatest personalities in the league. The rule book, however, remains her greatest adversary. She proudly exposed a kong of 4s... for the 2026 section. Thankfully, Zoe intervened before the Mahjong police had to be called. Completely unfazed, Erica pivoted to an "Any Like Numbers" hand featuring a kong of 4s and a kong of 6s. Again, Zoe gently explained that this was, in fact, still illegal. Some people memorize the card. Erica prefers to color outside the lines.

🏊 ALEXA DESERVED THOSE WINS: Alexa battled back from being sick, which she caught from caring for her sweet little croup patient all weekend, and still managed to pick up two wins. She also somehow maintained her composure while receiving live (and some in-person) updates from her husband and Shannon's husbands, who were apparently leading the dads' pool expedition. An expedition that didn't actually reach the pool until 7:00 p.m. because someone couldn't find the pool key (it was in the pool bag the whole time, Jon). Then came the update no one requested: Carl's Jr. explosive diarrhea at the pool. Honestly, after surviving that level of secondhand parenting stress, the Mahjong gods owed Alexa a couple of victories.

📊 DIXIE'S PUBLIC SERVICE ANNOUNCEMENT: Throughout the evening, I repeatedly insisted I was "just here for the vibes." This became progressively less believable as the night went on, especially after I dramatically launched my tiles following the final wall game. So, I'd like to formally clarify: the vibes I was referring to were apparently rage. I'd also like to address the growing concern surrounding my Mahjong career. I lost. Every. Single. Game. No, the wall game doesn't count. No, I don't want to talk about it. For those keeping score at home, I have now spent the entire summer playing Mahjong. I play online. I play AquaMahj. I seek strategy from Southern Mahjong ladies. I've started keeping spreadsheets and notes on my wins and losses like some sort of tile-obsessed statistician. And yet, I simply cannot win. So, I'd like to end with one final request: Please tell my husband not to buy me nice Mahjong tiles for my birthday anymore. I've done absolutely nothing to deserve them.

May the jokers be with the rest of you. Clearly, they're busy avoiding me.

Lastly, please don't ask me to do this again... It took me all day. 
`;

const SYSTEM_PROMPT = `You write the weekly recap for a women's American mahjong league group chat.

VOICE: witty, roast-heavy but warm. Roasts land softly for anyone who had a bad night at the
table — nobody should feel actually bad reading this. Roasts can land harder for Charlie (Zoe's
husband, a peripheral figure who shows up in recaps even though he doesn't play).

FORMAT: title in the style "The One Where..." or "The One With...". Section headers are short,
ALL-CAPS, paired with an emoji — match the structure and callback-joke style of the examples below.

MVP: there is no fixed formula. Use the game stats, the stories, and the overall vibe of the night
to decide who earns it — it does not have to be the highest scorer.

PHOTOS: some players attach a photo to their story. Only describe or reference what's actually in
a photo if that player's own story text explicitly points you to it (phrases like "see photo",
"check the pic", "the picture says it all", etc). If their text doesn't reference the photo, ignore
the image entirely and write from the text alone — don't describe photos nobody mentioned.

Here are examples of past recaps — match their tone, structure, and callback-joke style:

${STYLE_EXAMPLES}

Write only the recap itself. No preamble, no notes about what you're doing, no "Here's the recap:".`;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Bad JSON" }), { status: 400 }); }

  const { mode, weekStats, stories, currentDraft, instruction } = body;
  if (!weekStats || !Array.isArray(stories)) {
    return new Response(JSON.stringify({ error: "Missing weekStats or stories" }), { status: 400 });
  }

  // Fetch each referenced photo and convert to base64 — the Claude API needs
  // image bytes, not just a URL, so this function fetches from the public
  // Supabase Storage URL server-side before building the request.
  const imageBlocks = [];
  for (const s of stories) {
    if (!s.noteImageUrl) continue;
    try {
      const imgRes = await fetch(s.noteImageUrl);
      if (!imgRes.ok) continue;
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const contentType = imgRes.headers.get("content-type") || "image/jpeg";
      imageBlocks.push({ type: "image", source: { type: "base64", media_type: contentType, data: buf.toString("base64") } });
      imageBlocks.push({ type: "text", text: `(photo attached by ${s.player})` });
    } catch (e) {
      console.error("Failed to fetch photo for", s.player, e);
    }
  }

  const statsText   = `THIS WEEK'S GAME RESULTS:\n${JSON.stringify(weekStats, null, 2)}`;
  const storiesText = "PLAYER STORIES:\n" + stories.map(s => `${s.player}: ${s.text || "(no story submitted)"}`).join("\n\n");

  const userContent = mode === "revise"
    ? [
        { type: "text", text: `Here is the current draft recap:\n\n${currentDraft}\n\nRevise it based on this feedback: ${instruction}\n\nOriginal context, for reference:\n\n${statsText}\n\n${storiesText}` },
        ...imageBlocks,
      ]
    : [
        { type: "text", text: `${statsText}\n\n${storiesText}` },
        ...imageBlocks,
      ];

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("Anthropic API error", data);
      return new Response(JSON.stringify({ error: "Recap generation failed" }), { status: 500 });
    }
    const text = data.content?.find(b => b.type === "text")?.text || "";
    return new Response(JSON.stringify({ text }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (e) {
    console.error("generate-recap error", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
