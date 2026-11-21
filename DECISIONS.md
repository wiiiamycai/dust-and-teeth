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
