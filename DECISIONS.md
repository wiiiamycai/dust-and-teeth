# Decisions made without Will

Will said "just do all the steps", so these are the design calls I made on my own while building v3. Each one is a starting point, not a final answer: overturn anything by number.

## Step 3: hidden checks (plan agreed with Will)

1. Read People is earned after 15 conversations (one per person per day counts).
2. Bess: three flirt tries, shared across both lines. Hector in earshot costs -10. Charm 8+ is a bonus (+15), no longer an automatic yes.
3. Haggling with Jeb: three tries, each failure adds 10% to the caravan price.
4. Failed checks reopen on a new fact about that person or an opinion swing of 15 or more. "Week" locks also reopen after 7 days.

## Step 4: gossip that makes people act

5. **Moe never refuses to talk.** Below -20 opinion he stops giving rumours. Below -40 he lies to you once: Krug is "away", so tonight is the night for the pens. Krug is waiting, and the pens check is much harder.
6. **Doc won't sell Buzz** once he has heard you eat people, or if his opinion of you is -25 or lower. You can still steal it.
7. **Opal**, once she has heard you emptied Chainfield, tells you about a drainage door into Silo 9 (big bonus to sneaking in), gives you 50 teeth, and company is on the house.
8. **Jeb**, once he has heard you saved Pete, gives you the caravan at half price.
9. **Ma Thistle**, once she has heard of two good deeds, gives you a knife (or Gut Glue if you have one).
10. **Hector warns Bert** the day after Hector turns hostile. Bert becomes hostile, two levels stronger and carries Hector's rifle.
11. **Betrayal:** if anyone in Scrapwell hates you (-50), they tell Krug where you sleep. Two days later slavers net you in your shack. Once per game.
12. **Vouching:** when Sheriff Crane hears you got the Mayor hanged or the pump opened, two days later everyone in Rustwater likes you more (+15).
13. **Revenge on the road:** Hector, Bert, Junior and Lou can all hunt you, if they are hostile and you hurt their family. Each has their own line.
14. **Lies spread:** a lie that gets caught (to Gus about the well, to Hector about being married to a toaster) becomes gossip. Anyone who has heard you lie is harder to talk round (-10).
15. Prices already rise and fall with opinion from v2, so I did not add a separate price system.

## Step 5: fixed character, growth by doing

16. **The player is called Nobody.** All stats 5, skills 30 to 35 (melee and speech 35, the rest 30), 35 HP, 25 teeth, a rusty knife and 2 Gut Glue.
17. **No levels and no XP bar.** XP still counts quietly in the save but does nothing. Toughness grows instead: +1 max HP for each of your first 20 fights survived.
18. **Skill growth:** a successful check gives 1.5 practice, a failed one 0.75, a weapon hit 1 and a miss 0.4, a new conversation 0.3 speech. Gains shrink as a skill rises (roughly a third as fast at 85 as at 30).
19. **Skill words** (under 25 / 25 to 39 / 40 to 59 / 60 to 79 / 80+), for example Speech: Mumbling, Clumsy, Decent, Smooth, Silver. Stats: feeble, below average, average, strong, exceptional. Keen Eye shows the numbers.
20. **New story stat changes:** Doc's Meat Tonic (+3 Brawn, or -5 max HP), a bad Brain Juice now costs 2 Brains (so dumb dialogue is reachable), selling a kidney costs 1 Guts, Buzz addiction costs 1 Charm, the Molar tooth tax costs 1 Charm, the Smiling Few's drink can give 1 Charm, and ending a fight on 3 HP or less once costs 1 Twitch (a bad knee).
21. **Lou's "hold Junior over the pot" now needs Brawn 8, not 9**, so the Meat Tonic can unlock it.
22. **How each perk is earned:** Read People 15 conversations, Silver Tongue 8 speech wins, Sticky Fingers 8 steals, Bloody Hands 10 melee kills, Eagle Eye 10 aimed hits, Keen Eye 8 fights and 6 aimed hits, Bad Hombre 15 kills, Thick Skin 150 damage taken, Lucky Bastard 8 crits, Second Wind 3 fights ended near death, Messy Eater 5 corpses eaten, Iron Gut beating Buzz addiction at Doc's, Tax Exempt getting the taxman to quit, Butcher's Pal selling flesh to Lou or Krug twice.
23. **Without Keen Eye** people and enemies show as harmless / can handle themselves / dangerous / very dangerous / deadly, and in a fight as unhurt / scratched / wounded / badly hurt / barely standing, with no health bar. With it you see level, armour, gear and the health bar.
24. Combat hit chances like "Hit Raider (62%)" are still on screen. They go in step 6.

## Step 6: melee vs guns

25. **Range.** Road fights start at range. Fights you pick with someone in the room, and kitchen/pen/throne fights, start up close. Melee at range must "close in" first: a round with no attack where enemies get +20 to hit you.
26. **Guns** use one bullet per shot, -10 to hit up close. Bullets: Moe sells 6 for about 12 teeth, enemies drop 1 to 3 sometimes, the Sky-Bus rifle comes with 5, Hector's shotgun with 4. Moe also sells a zip gun (40, with 3 bullets). You start with no gun.
27. **Noise.** The first shot of a fight is announced ("That will be heard for miles"). A killing with gunfire is witnessed by people one road away too, and that news spreads faster. A melee killing with nobody else present stays secret.
28. **Melee** gets +10 to hit, harder weapons (knife 4-9, pipe 6-11, sledge 9-18, cleaver 6-13, drill 12-24, fists 2-5), and a knockdown chance on a normal hit (better with Brawn and heavy weapons) that costs the enemy their next turn.
29. **Swap weapons mid-fight for free**, to the best weapon of the other kind. Shoot them on the way in, then switch to the pipe.
30. **No numbers on fight options.** "Hit for the eyes (hard, but it can end it)" instead of "(38%, big crit)".
31. **Balance check** (`tests/balance.js`): against a mid raider, the knife and pipe now beat the zip gun clearly, and the sledge and cleaver roughly match the rifle and shotgun. Guns still win on range, groups and safety, and pay for it in bullets and noise.

## Step 7: fixed-strength enemies, the Gutmaw, readable danger

32. **Every enemy type has one fixed strength** (`data/enemies.js`): raider 2, raider boss 5, mole-dog 1, Molar 4, Molar veteran 5, slaver 5, Krug's tracker 7, deputy 3, bounty hunter 5 and 7. v2 made raiders, Molars and mole-dogs stronger the further you went. That is gone.
33. **Mixed danger:** a new raider gang (a boss and two raiders) can turn up anywhere, but is four times likelier far from home. Mole-dogs and two-headed cows are likelier near home, Molars likelier far away.
34. **Story makes it worse:** from day 12 Molar packs include a veteran, and from day 17 there are three of them.
35. **Notoriety** = kills plus how far your karma is below zero. From 12, bounty hunters can appear; from 25 they send three, one of them stronger. From 20, the Sheriff's posse brings an extra deputy and Krug's hunters bring his tracker.
36. **The Gutmaw** starts near the Sky-Bus and wanders one road every other day or so. Meet it on roads into or out of its location (40%), or anywhere by bad luck (2%). Options: run (hard), hide in a ditch (a sneak check), throw it meat, throw it Bacon Prime, shove your spouse at it, or fight. It has 110 health, hits for 9 to 20 and has 3 armour: in rags you last about four rounds. With a riot suit and a shotgun it is beatable. Killing it pays 120 teeth, gives the title Gutmaw Slayer, and everyone hears.
37. **Signs of it:** the map marks its location "tremors", that place's description says the ground is churned, and Moe sometimes tells you where it's been seen.
38. **Place danger is words** (quiet, rough, dangerous, deadly, hell) instead of "danger 3" on the map and in the header.

## Step 8: seduction, jealousy, ending slides

39. **Gloria is a new character** at the Velvet Rad in Rustwater (Opal's friend).
40. **Becoming lovers is gossip**, so jealousy arrives through the gossip engine, usually days later. Marrying Bess counts too. Multiple lovers at once are fine until someone hears.
41. **Bess:** won as in step 3. Jealous: she goes to wherever the other woman is. Turn up there within 3 days and you must stand with Bess, stand with the other woman, or stay out of it. If you don't turn up, it settles itself and the other woman drops you. Stay out with Lou, and Bess becomes the Thursday special.
42. **Opal:** only offered when you have 100 teeth, which she takes. Hard: honesty (+15 if she's never heard you lie, -25 if she has), being rich (+10 at 250 teeth), and freeing Chainfield (+15). Doesn't care about other women.
43. **Crane:** only offered once she has heard of two good deeds (the pump, the hanging, Pete, and so on), each worth more. Jealous: she dumps you, likes you less, and three days later re-opens every quiet killing she can tie to you.
44. **Lou:** only offered once you've eaten her stew. Knowing what's in it and loving it anyway (+30), being in on it (+15), eating it often (up to +15). Jealous: she smiles and says nothing. Seven days later the other woman is dead, and the diner board names her as the Thursday special.
45. **Gloria:** very easy to bed (three tries). Winning her heart is a single, nearly hopeless line. Doesn't care.
46. **Fade to black** always, with one short line.
47. **Ending slides:** the headline, then the fates three at a time, then a summary slide. Every lover, ex, jealous murder and catfight gets a line.

## After step 8: getting Krug killed by someone else

48. **Old Teo** tells you the guard rota (+15 to opening the pens, +20 to stealing Krug's notebook or killing him quietly, +25 to Hector's chances) and agrees to testify if he doesn't dislike you.
49. **Krug's notebook** can be lifted (a hard steal, easier with the rota). It's proof for Crane and the King.
50. **Crane's raid:** with Teo's word or the notebook, talk her into it. Ride with her (be at the Chainfield gate from day 3, within 5 days, and you fight Krug with her at your side), or let her go alone (55% base, better with the rota, or if Rustwater beat the Molar raid). If she fails she dies, and so does Teo if he testified. You can also sell her plan to Krug for 100 teeth: she dies in his ambush, and if it gets out Rustwater never forgives you.
51. **The Dentist King:** show him the notebook (sure) or lie that Krug mocks him (hard, one try), at his throne or via a Molar tax gang on the road. Two days later the Molars burn Chainfield. Krug dies, everyone in the pens is marched east (Bess then becomes the Raider Queen, as in v2), and the King's gangs gain an extra raider for the rest of the game.
52. **Hector:** if Krug has his child and he knows you sold them, talk him into going in himself (better with the rota). Next day he either shoots Krug and brings everyone home (35%, 60% with the rota) or dies, and his family blames you.
53. Each outcome gets its own ending slide.

## Bigger rewards for killing

54. **Every armed enemy type carries real gear, and drops it:**
    - raider: pipe
    - raider boss: sledge and spikes
    - Molar: repeater
    - Molar veteran and guard: repeater and spikes
    - Molar elite: repeater and car-door plate
    - slaver: shotgun and jacket
    - Krug's tracker: rifle and plate
    - deputy: rifle and jacket
    - bounty hunters: rifle and jacket, or repeater and plate
55. **Teeth roughly tripled:** generic enemies now carry 4 to 6 per level and pay double that when killed (a raider is worth about 16 to 24). Named people pay double their purse.
56. **Gunmen always drop 3 to 6 bullets.**
57. **Better armour goes straight on** when you take it. Gear you already own is stripped and sold for half its scrap value on the spot.
58. Enemies still hit by type, not by weapon, so a slaver with a shotgun hurts the same as before. Making their weapons matter in their hands would make fights harder again: your call.

## Combat rework: gear is strength (v3.2)

Will: "health should more or less be static and armor is what dictates strength."

59. **Everyone is the same flesh.** Every human has 30 HP, you included, and it never grows. Animals have less. The Gutmaw is still a monster. This replaces #58: an enemy's weapon is now its damage, and its armour is its DR.
60. **Level only means training:** +2% to hit per level, plus more teeth and XP. A level 7 man with a pipe is a pipe.
61. **Named fighters carry their gear:** Gus a pipe, Pell a knife, Jeb a rifle and jacket, Hector a shotgun and jacket, Bess a zip gun, Bert a pipe, Junior a sledge and jacket, Krug a sledge and plate, the King his drill and a riot suit.
62. **Healing is strong:** Gut Glue puts you back to full (you start with three), food heals about double, and sleep still heals fully.
63. **Slavers want you alive.** The first time slavers (or Krug) beat you, you wake in the Chainfield pens with no teeth instead of dying. The second time is death.
64. **Jeb's wagons** (talk to Caravan Jeb) sell guns, armour and bullets. Best on sale: the riot suit at 300 teeth.
65. **The godlike gear is not for sale.** Mayor Fenwick keeps a Plasma Rifle (24 to 38 damage, self-charging, never needs bullets) and a suit of Power Armour (stops 16 a hit) in his parlour. Ask him about it, then lift the rifle (Steal), or bring a fusion core from the Sky-Bus cargo hold and walk out in the suit (Sneak). Get caught and two of his guards attack, and the town hears you robbed the Mayor. Kill Fenwick and both are just lying there.
66. **Rough odds now** (1,500 simulated fights each, with three Gut Glues and starting skills):
    - two slavers: 3% with the starting knife, 26% with a shotgun and jacket, 56% with a repeater and vest, 99% for a seasoned fighter in a riot suit;
    - two Molars: 23% with the knife, 55% with a shotgun and jacket, 82% with a repeater and vest;
    - with the plasma rifle and power armour you win everything.

## The web: everyone knows everyone (v3.3)

Will: "every single character in the game should be linked", "the characters should have depth and layers". The readable version is `CAST.md`.

67. **Ask anyone about anyone.** Every conversation has "Ask about someone": pick a place, then a person. 64 strong bonds have their own line from each side (family, friends, lovers, exes, debts, secret allies, enemies, rivals). Every other pair gets what the valley says about that person, coloured by who's talking.
68. **Bonds feed the gossip web.** All 64 count as family, friend or enemy links for gossip, up from 23, so news now travels much further and hits harder. Example: kill Krug and the Mayor, Lou, Moe and the King all hear it as a friend's death.
69. **A secret for every person,** known by two or three others. They tell you when you ask about that person, once they like you (opinion 25 or more, or three good chats). Before that, they let you see there's more.
70. **Using a secret:** tell its owner you know. Lean on them for teeth (they hate you, karma drops), or promise to keep it (they warm to you). The ending counts both.
71. **Five plots on their own clocks:**
    - day 9: Lou takes Bacon Prime;
    - day 10: Doc poisons the Mayor;
    - day 11: Krug hits Jeb's caravan, the day before the Molars;
    - day 16: Opal catches Gloria skimming;
    - day 18: Lou finds Junior's cabbages.

    Each can be learned, warned against, helped or sold, and each gets an ending slide. Ignored, it happens without you.
72. **Junior can leave home.** Talk him into it and he opens Junior's Greens in Rustwater (cabbage soup, +15 HP). Lou does not take it well.
73. **The King's secret** (he's terrified of dentists) can be learned, but there's nothing to do with it yet. That's a hook for later.

## The web, reworked (v3.4)

Will: "not in a literal sense... certain people knowing about certain people, that affects their lives if you done something." And: "no point letting the audience know about it unless the player can affect things, and everything can be affected."

74. **"Ask about someone" is gone**, along with the generic "what the valley says" lines. This replaces #67. People only talk about the people they're tied to: with no news, "Any news?" gives one of their bond lines.
75. **Secrets come out by themselves.** This replaces #69. When someone who knows a secret trusts you (opinion 25 or more, or three days of chats), they tell you unprompted when you next talk. One secret a day.
76. **Plots leave signs.** Four days before each one, there's something to see in one place (the specials board, Doc's window, Krug's men at Moe's, Opal's ledger, the cabbages), and seeing it means you know. The people tied to it mention it too, in the last five days.
77. **No news you couldn't have acted on.** If you didn't know about a plot and weren't there, it happens silently and you find the aftermath on arrival: the empty sty, the black bunting, the burnt wagons, Gloria on the steps, the salt.
78. **Three or more ways to change every plot**, listed in `CAST.md`. Waiting at the sty or riding guard skips the days in between.
79. **Ripples:** when someone dies, the people tied to them change. Some changes are in the game's rules: water goes up when Krug or Crane dies, the pump goes free when Fenwick dies (unless Doc took it), Pete leaves when Jeb dies, Junior opens Junior's Greens when Lou dies, Gloria takes the Velvet Rad when Opal dies, and the farm road gets worse when Hector dies. The rest come out in what the bonded people say when you next talk to them.

## Snake Eyes, the gambling town (v3.5)

Will said "just build" it before bed, so I made his three open calls myself. Overturn any of them by number.

80. **Name: Snake Eyes.** It's north between the farm and Chainfield, with roads to both.
81. **Five people, tied into the cast:**
    - **Mister Pips** owns it and banks for the Dentist King.
    - **Dice** is Marigold, Opal's sister.
    - **Big Tam**, the pit champion, is Gus's brother. He isn't dead; the teeth Gus got weren't his.
    - **Sweet Nan**, the loan shark, is Ma Thistle's sister. She has secretly sent Ma money for forty years.
    - **Rook**, the bouncer, is the King's old doorman and knows Silo 9's back-door code.

    All five have secrets and bonds, and all five have ripples when they die.
82. **Four games, each using a skill, with the house always cheating:**
    - **Bones:** loaded dice, where Luck helps a little. Know the secret and you can call it out (refund, then thrown out) or swap in your own dice (Steal).
    - **Cards with Dice:** Speech reads her. Cheat with Steal for double, or get banned for three days.
    - **Rat races:** three to one. Dope your rat with Buzz for much better odds.
    - **The pit:** see 83.
83. **The pit is non-lethal (Will's call b).** You fight to the yield: lose and you're dragged out on 1 HP, alive. It's fists and blades only, one fight a day, nothing is looted and it doesn't count as a kill. There's a ladder of four: Gutterpup (40), Sister Splint (80), Molar Mick (150), Big Tam (300 and the title Champion of the Pit).
84. **The house bank limit:** once you're 400 teeth up overall, Pips closes the tables to you. The pit stays open.
85. **Debt goes to Krug (Will's call c).** Sweet Nan lends 100 for 150 back within 7 days. Don't pay and your debt is sold to Krug, and two slavers jump you at the next place you arrive. Losing to them means the pens, or death if you've already been penned once. If Krug is gone, Pips's housemen come instead.
86. **Fight night (day 14):** Big Tam against the Incisor, to the death. You can:
    - bet on Tam (three to one);
    - bring Gus to the rail (Tam wins);
    - poison the Incisor's water (Tam wins);
    - fight the Incisor yourself, for real.

    Ignored, Tam dies.
87. **Dice's escape (day 20).** You can:
    - help her rob the vault (Steal, much easier if Rook agrees to look away);
    - sell her out to Pips (100 teeth, and she's sold on);
    - tell Opal her sister is alive, so Opal buys her out and brings her home.

    Ignored, she's caught and sold.
88. **Rook's code** opens Silo 9's back door, a way in without fighting the gate guards.

## The 2D view (v3.6)

Will picked option 2 (turn-based 2D, Fallout 2 style) and asked for all 8 places in one go.

89. **Every place is a tile map you walk around**, 9 in all (the 8 towns plus the well). Click a tile to walk there (it finds the path), or use the arrow keys or WASD. Walk into a person to talk, into an object to use it, and onto an exit arrow to leave. A clickable list of who's here sits under the map.
90. **Nothing about the game itself changed.** Talking, checks, plots, shops and fights are the same screens. Each place's options are claimed by the objects they belong to (the well, the pump, the tables, the pen gate, the cockpit) and show up when you stand next to them. Anything no object claims is always listed, so nothing can get lost.
91. **The map view is the default in the browser.** "📜 List view" switches back to the old list, and "🗺️ Walk around" switches to the map again. Your choice is saved.
92. **Walking takes no time.** Days still pass only by travelling and sleeping.
93. **Combat is still the fight screen, not a tactical grid.** Grid combat means rebuilding range, movement and enemy behaviour, and rebalancing everything. I'd do it as its own step once you've walked the towns. It's your call.
94. **Objects can come and go:** Junior's Greens appears only once it exists, and the cabbage patch only once you could know about it. The silo gate opens into the inside once you're in.
95. **The art is emoji on an amber grid,** in the same style as the rest of the game. Real tiles or sprites can replace them later without touching the logic.

## The isometric look, part 1 (v3.7)

Will approved `ART_STYLE.md` as written, with the day number driving the light (option 1). Part 2 (pixel sprites) and part 3 (frame and portraits) come later, after he plays this.

96. **The look is set by `ART_STYLE.md`:** sun-bleached and desaturated, with amber only for things you can use and green for you. Everything is original and drawn in code. Nothing comes from Fallout: no Pip-Boy, no bottom panel, no logo.
97. **The towns are drawn isometrically on a canvas** (`scenes/iso.js`): 2:1 diamond tiles scaled to fit, buildings as 28 px blocks, the outer wall as a low 8 px kerb, fences as posts and rails. Light comes from the upper left, so buildings cast a short shadow down and to the right. People, objects and you are still emoji, depth sorted. Objects set into a wall (doors, shop signs) are drawn as part of the building, with a doorway and the sign on the roof.
98. **It's looks only.** Walking, paths, claiming options and every rule are the same code as the flat map. Clicking the canvas picks the front-most thing under the mouse (people first, even behind a wall) and walks there. The arrow keys and WASD walk along the grid as before, so "up" goes up and to the right on screen.
99. **Three views, cycled by one option:** isometric, flat map, list. Isometric is the default in the browser. If the browser has no canvas, the map option opens the flat map, as before.
100. **Fog of war:** you see 7 tiles round you (5 at night), and walls block sight. A wall shows when you can see the ground beside it. Tiles you've seen stay greyed, and people aren't drawn there, but the list under the map still names everyone. What you've seen is saved per place in `S.seen`, and only the isometric view adds to it.
101. **Day and night follow the day number, in a five-step cycle:** dawn, noon, afternoon, dusk, night (day 1 is noon). The game has no hours, so this is looks only. At dusk and night there's a soft warm light round you.
102. **A wall in front of you, or of anyone in sight, turns see-through,** so nobody is hidden behind a building.
103. **Atmosphere:** light dust drifts across the map with the odd gust, and the CRT is stronger (heavier scanlines, a dark edge, an amber glow on text, a faint flicker). The dust and flicker switch off if the browser asks for reduced motion.
104. **Tests:** `tests/walk.js` now also runs the isometric view with a fake canvas. It checks every place draws, every tile centre maps back to its tile, a click never lands on something behind, people and exits in sight can be clicked, the views cycle, night is night, and the fog survives a reload. The other tests have no canvas, so they play exactly as before and the golden fingerprint didn't change.

## Pixel sprites, part 2 (v3.8)

Will agreed my picks (two facings by mirroring, a breathing idle and a walk step for you, your sprite following your armour, props and signs, corpses) and then said to build all of it in one go, without the sample.

105. **Every person and thing in the towns is a pixel sprite now:** 27 people, you, 16 things standing in the open and 20 shop signs. They're 16 x 32 letter grids in `data/sprites.js`, drawn in code by `scenes/sprite.js`. Nothing is copied from anywhere.
106. **People are built from parts:** three bodies (man, woman, big), then layers and what they hold. For example: Bess wears a straw hat and carries a hoe, Krug has chains and a beard, and Lou has a bloody apron and a ladle. This keeps them consistent and makes new people cheap. Bacon Prime is the one drawn whole.
107. **Outline and light are added in code,** so the grids are flat colour: a dark 1 px outline, lit top and left edges, a darker right edge. Pixels are snapped to the screen, so sprites stay crisp at any tile size.
108. **Two facings by mirroring.** People turn to face you, and you face the way you last walked on screen.
109. **People breathe** with a slow two-frame bob, out of step with each other. You step on alternate feet as you walk. Both switch off for reduced motion.
110. **You wear what you wear.** Rags, jacket, spikes, the sheriff's vest, the car-door plate and the riot suit each look different. Power armour makes you big and grey. Your weapon is in your hand (knife, pipe, sledge, drill, pistol, rifle, shotgun, the plasma rifle).
111. **Things in a wall get a sign on the roof:** a small board with a picture, like a mug for Moe's, a heart for the Velvet Rad, a star for the Sheriff and a toaster for the chapel. Things in the open stand on their tile: the well, the pump, the scarecrow (in a good hat), the tables, the pit, the throne.
112. **A body lies where someone has just died,** on a free tile, until the day turns. It's looks only.
113. **Nigel glows.** His scalp is lit green and he throws a green light that shows at night.
114. **Anything without a sprite falls back to its emoji,** so new content can't break the view. The flat map stays emoji.
115. **Tests:** `tests/sprites.js` (run by `all.js`) checks every grid uses palette letters and fits its box. It also checks that every person, armour, weapon and map object has a sprite of the right kind (a sign if it's in a wall, a prop if it's in the open), and that every sprite builds in every frame and facing.

## The frame and portraits, part 3 (v3.9)

Will said to do everything and keep going while he was away, so I built part 3 on my own picks too. Every pick is listed below so he can overrule any of them.

116. **A steel frame round the screen:** scratched metal with rivets in the corners and a stamped DUST & TEETH plate on the top edge. It's pure CSS. The layout doesn't change: the HUD stays at the top. There's no bottom panel and no wrist computer, so it doesn't borrow Fallout's interface.
117. **Portraits when you talk to someone:** their head and shoulders, cut from their sprite and drawn big in the header where the emoji was, with scanlines and a faint glow. They blink every few seconds (off for reduced motion).
118. **Portraits find themselves:** `show()` spots a person from the screen's title and icon, so no scene had to change. Without a canvas (the tests, an old browser), or if drawing fails, the emoji is shown as before.
119. **What I left out of part 3:** portraits on the fight cards and the list view's cards. They're still emoji, which keeps the list view as the plain, safe one. The fight cards are an easy next step if he wants them.

## The fight arena (v4.0)

Will said to keep going until the game is fully polished. Grid combat was next, but I pushed back on one point: real tactical grid combat changes the rules. Movement, cover and range in tiles would mean rebalancing every fight, against pillar 7 ("combat is hard") and the balance test. That's a design call for Will, not polish. So I built the visual half, and the rules are untouched.

120. **Fights are drawn now:** a strip of isometric ground above the options. You're on the left with your spouse or allies; they're on the right. At range they stand well off, and up close they're right in front of you, so the "at range / up close" rule is something you can see. Your target has an amber ring, you have the green one.
121. **Every enemy has a sprite.** A named person uses their own. A kind of enemy has a look (raiders have red mohawks and war paint, Molars a necklace of teeth, slavers chains, deputies a blue cap and star, bounty hunters a long coat), with their real armour and weapon on top, so what they carry is what you see and what you'll loot. Mole-dogs, rad-moles and the two-headed cow are drawn as animals. The Gutmaw is drawn twice the size of anything else, all mouth.
122. **Click an enemy to target them,** the same as clicking their card. The dead lie down and can't be clicked. When you get hurt, the arena flashes red and shakes (off for reduced motion).
123. **No canvas, no arena:** the fight screen is exactly as before, so the tests and the list view are unchanged. A bug in the arena is caught and can't block a fight.

## The painted map, title and ending (v4.1)

124. **The world map is painted:** sand that darkens to the edges, dunes, three patches of cracked mud, a dry riverbed, flat-topped mesas, scraps of ruins, a faint survey grid and a compass. The land is the same every game. The roads are bolder so they read on it. A nuked town leaves a scorched crater on the map, and the ground cracks round wherever the Gutmaw is. The place buttons and travel are untouched.
125. **The title screen has a picture:** a wasteland at sundown, mesas against a hazy sun, a lone figure on the road, and DUST & TEETH in fat amber pixels.
126. **The ending slides have pictures too:** the same land in a darker light, a mushroom cloud if the slide is about a nuke, and a row of portraits of the people the slide names. If Lou is mentioned, you see Lou.
127. **All of it is looks only and found from the screen itself,** so no scene changed. Without a canvas the screens are text, as before. Any drawing error is caught.

## Sound (v4.2)

128. **Sound is quiet, optional and made in code,** with no audio files. It's off until you click the speaker in the footer, and the choice is remembered in your browser, not in the save.
129. **It only reacts to what's on screen:** a soft step when you walk, a thud when you hit someone, a bang when you shoot, a sting when you're hurt, a low note at The End, and wind under everything. The game never waits for a sound, and a browser without sound just doesn't show the speaker.

## The final browser pass (v4.2)

130. **Drawing code is fuzzed in a real browser,** because the headless tests have no canvas. The pass ran 40 random games and about 4,000 steps across all three views, with travel, encounters, fights and the gambling games. It also covered all 27 portraits, all 9 places at all five times of day, and every armour with every weapon. It found one thing: walking could be asked for on a map that was no longer on screen (a stale map left over from an earlier game, in the list view). A real click couldn't get there, but walking now only happens on a map that's actually showing.

## Text and portraits only (v4.3)

Will, part way through the city build: "i dont think walking around or the iso does add any value to the game, just work on text and portraits", then "remove all the 3d stuff".

131. **Gone:** the isometric towns (`scenes/iso.js`), the walking tile maps (`scenes/walk.js`, `data/maps.js`), the isometric fight strip (`scenes/arena.js`) and `tests/walk.js`. Every place plays in the list view, the way it did before v3.6. This takes back #89 to #104 and #120 to #123.
132. **Kept:** talk portraits, the painted world map, the title and ending art, and sound. The fight sounds used to come from the fight strip; a small watcher in `scenes/sound.js` makes them now.
133. **The sprite data is cut to what portraits need:** bodies, layers, held items and people. Props, shop signs, corpses, your own sprite and the enemy looks are gone. `tests/sprites.js` checks portraits now.
134. **Old saves** drop their view, position and fog fields when they load.

## The Drowned Mall (v4.3)

Will approved the plan: two cities, the Green late-game only, weapon upgrades as a new mechanic at the Mall.

135. **Where:** south-east, with roads to Mama Lou's and the Sky-Bus. Dangerous (level 4).
136. **Five people:** Queen Margie (the food court, by the staff handbook), Sprocket (the gunsmith; I made her a woman, the cast leaned male), Eel (Sal's widow, a salvage diver), Dr. Vane (Doc Ratchet's old apprentice, now his rival) and Gums (a toothless Molar fence). Each has bonds into the valley and a secret that someone already in the game can tell: Lou and Gums know Margie's, the King and Rook know Sprocket's, Jeb and Sprocket know Eel's, Doc and Opal know Vane's, Bess and Hector know Gums's.
137. **Mods (Sprocket's bench).** Each costs teeth plus one part, one of each per weapon or armour, saved in `S.mods`:
    - scope (guns): +10 to hit, a lens;
    - long barrel (guns): +3 damage, a steel tube;
    - honed edge or studs (melee): +3 damage, a file;
    - grip (melee): +8 to hit, rubber;
    - plates (armour): +2 damage stopped, sheet steel;
    - new straps (the car-door plate): no more twitch penalty, rubber.

    They're in `hit()`, the damage roll in `atk()`, `pdr()` and `ptw()`. Not on the plasma rifle, power armour or rags. The balance test still fights without mods, so modded gear is simply better; the price is parts and teeth.
138. **Parts** come from diving, from Gums (20 to 50 teeth), from the drowned bank vault, and from the gut of whatever lives in the water. Gums also buys gear you aren't using, at 60% of its value plus 15 for each mod on it.
139. **Diving, once a day:**
    - the shallows: Sneak, easy; a miss costs 3 to 7 HP;
    - the deep end: Sneak, hard, much easier with Eel's tips; a miss nearly drowns you (8 to 14 HP) or starts a fight with something in the water. It can turn up a fusion core, once, for the Mayor's power armour;
    - the bank vault: Science, only once you know Eel's secret, once.

    Guts helps the dives. You can die down there.
140. **Margie:** learn what Customer Service means, then apply. Get in and you're Associate of the Month, with free meals.
141. **Eel's plot (day 13):** she goes to Lou's herself and is the special that week. You can:
    - tell her Lou cooked Sal (only if you know it). Go with her and fight Lou side by side, or let her go alone: 30%, or 65% if Sprocket built her a harpoon gun;
    - tell her Pete gave Sal up. She kills Pete and Crane hangs her, unless you warn Pete first;
    - give her Sal's badge from Lou's kitchen. She stops, and tells you where the vault is;
    - lie that Sal went east with a girl (Speech);
    - sell her to Lou for 30 teeth.
142. **The drug war (day 17):** Vane's grey Buzz, stamped RATCHET, hits Rustwater. Two people die, Crane runs Doc out of town (or the town hangs him if Crane is dead), and Vane becomes Rustwater's doctor. You can warn Doc, help Vane (120 teeth, a day early), swap it for flour (Sneak), tell Margie (she throws him out) or tell Crane (she burns the bags).
143. **Smaller threads:** tell Jeb that Gums sells him his own gin (his prices drop, Gums and Bess sulk); Sprocket's secret jams the King's drill, so in his fight he hits like a lead pipe; Gums tells you where the silo is.

## The Green (v4.3)

144. **Late game only.** It isn't on the map until you find the pass:
    - Jeb's cave, once you know his secret;
    - the pilot's charts in the Sky-Bus cockpit (Science);
    - riding with Jeb himself, from day 15 (Speech, much easier if you know his secret).

    Before day 15 the pass is a wall of dust: trying costs a day and drops you at the Sky-Bus. The pass takes two days each way. Jeb's "ride east forever" ending is still there.
145. **The gate.** The Warden won't take teeth ("What would we buy, a smile?"). Ways in:
    - fix something for her (Science);
    - call her Corporal Grit (her secret);
    - have Dice vouch for you;
    - arrive with Jeb;
    - climb the outflow pipe (Sneak), which puts you in the vat room first;
    - kill her, and the gate is just a gate.
146. **Four people:** the Gardener (Doc Ratchet's father: he put Doc out at sixteen for a tomato), the Warden (an ex-Molar), Moss (chained to the algae vats that light the dome) and Fern (the Gardener's daughter, who leaves seed packets in the pass; Junior's cabbages came from one). Doc, Nigel, Junior, Gums and the King know their secrets.
147. **The big choice.** Seeds come from the seed house (Steal, once), the Gardener (a hard Speech check, easier if you know about the outer beds) or Fern. Then plant them:
    - with Hector: the farm grows and sells corn;
    - with Junior: real vegetables;
    - with Ma Thistle: corn by the well;
    - or sell them to Fenwick for 150 teeth, and he sells carrots at 20 teeth each.

    Three days after the first planting, the Gardener hears. The Green stops being the only green, Fern walks west to teach Hector, and the Warden shuts you out. If you'd sworn to keep the secret, the Warden comes down the pass after you.
148. **Keep it secret:** swear to the Gardener and you get a basket of vegetables, the title Friend of the Green and a bed. "Stay. Never go back down the pass" is a new ending.
149. **Hector's farm fails on day 22 without seeds.** This is new to every game, even one that never finds the Green, so keeping the secret has a cost in the valley. It's small: a line from Hector and Bert, and the farm's text.
150. **Moss:** free him (Steal) and he walks to Nigel's well; two days later the Green goes dark. Or stand on the long table and tell everyone (Speech): the Gardener is just an old man after that, Fern runs it, Moss works shifts, and you can stay.
151. **Fern's plot (day 21):** she opens the gate at midnight and the Warden shoots her. You can:
    - hold the lamp, then talk the Warden down or fight her, and the gate opens and the valley comes over the pass;
    - talk Fern into giving you seeds instead;
    - tell the Gardener, and he walks her to the outer beds;
    - tell the Warden, and Fern is locked in the seed house.
152. **Threads paid off:**
    - Gloria (gone east, or told it's real) camps at the gate until you get her in;
    - Dice, after the vault, has paid her way in with the King's teeth, ground into bone meal;
    - Junior cooks a basket of real vegetables;
    - Jeb finally sees the east.
153. **Ripples:**
    - the Gardener dies: Fern runs the Green;
    - the Warden dies: the gate is open;
    - Moss dies: the lights go out;
    - Margie dies: the food court closes;
    - Sprocket dies: no more mods, and Jeb's prices rise;
    - Gums dies: Bess's raiders have nobody to sell to.

    Everyone tied to them says so.
154. **Ending slides:** a slide group for the Mall (`mallLines`) and one for the Green (`greenLines`). The Green's lines only show if you found the pass.
