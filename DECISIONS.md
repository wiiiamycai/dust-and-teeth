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
