# Why should I care? A first-meeting audit of every character

Will's rule: "every single character in this game should have a reason why I should care about them."
The test, all on a FIRST meeting with no gossip and no secret needed:
1. **Want**: something they are trying to get or escape, offered as a talk option or job.
2. **Payoff**: gear, teeth, a check, a route, an ally, or information found nowhere else (or a threat to handle).
3. **Consequence**: helping or hurting them moves at least one other person.

Count = real first-meeting options, from `node tests/care.js index.html --list` (excludes "Any news?", attack, murder, back).
**Everyone passes as of v5.7.** The table below is the v5.1 audit that started the pass; "After the pass" at the bottom says what was built. The jobs are in `scenes/jobs.js`.

| Who | Count at v5.1 | Want | Payoff | Consequence | Status at v5.1 | Fix |
|---|---|---|---|---|---|---|
| Ma Thistle (elder) | 1 | none offered | 2 Gut Glue | none | FAIL | Job: "Somebody's sent me money for forty years. Find out who." Leads to Crumb, then Nan. Tell her it's Nan, say it's the Toaster, or pocket the next envelope. |
| Gus | 1 | the well (chickens) | 40 teeth | Nigel | pass | Finishing the well reveals his secret (Ma's ring). |
| Brother Crumb | 2 | the Toaster to speak (not offered until you hold a coil) | Gut Glue, title | gossip | weak | Ask "What would make it speak?" pointing at the coil (Doc, the plane). |
| Old Pell | 1 | flavour only | none | none | FAIL | Job: "Somebody sniffs round my sty at night." Opens the pork plot early; stopping it pays and reveals his secret. |
| Bacon Prime (pig) | 2 | animal | steal and sell | Pell, Lou | pass (animal) | none |
| Nigel | 2 | to be left alone (the plane) | check, route | Gus, Ma | pass | none |
| Moe | 6 | none offered (shop only) | shop, rumours | Krug (sells your face) | weak | Job: Gus's tab. Moe holds Ma's ring as surety: buy it, then give it to Ma, Gus, or Gums. |
| Mayor Fenwick | 5 | work | teeth, heist | many | pass | Target of Nan's debt job. |
| Sheriff Crane | 2 | bounties | teeth | many | pass | Pete's deputy job lands on her. |
| Doc Ratchet | 8 | test subjects | shop, stats | Mayor (poison) | pass | none |
| Madame Opal | 2 | work | teeth | many | pass | Receives Dice's letter. |
| Gloria | 1 | romance only | romance | none | FAIL | Job: "Get Jeb to take me east." A Jeb check; success earns her trust, reveals the skim, and opens the skim plot. |
| Caravan Jeb | 5 | work | shop, route | many | pass | Target of Gloria's ask. |
| Hector | 3 | farm dying, no job | shotgun | Bess, Bert | weak | Points at Bert's tractor job and pays for it. |
| Bess | 3 | leave the farm | romance | Hector | pass | none |
| Bert | 1 | flavour only | none | none | FAIL | Job: the tractor's carburettor. Carry it to Sprocket and back (Hector pays), or sell it to Gums. |
| Mama Lou | 2 | not offered | info | Pete, Sal | weak | Ask "What's the special this week?" opens the pork plot from her side. |
| Junior | 0 | none | none | none | FAIL | He slides you a bowl of greens. Eat it and praise it: trust, his secret, the cabbage plot. Tell Lou: she salts the earth now and pays you. |
| Pete (freed) | 0 | none | none | none | FAIL | Job: "Put a word in with Crane. I want to be a deputy." Trust reveals what he said in the cage, which opens Eel's plot. |
| Krug | 4 | slaves | teeth, tattoo | many | pass | none |
| Old Teo | 4 | freedom | info | Krug, Sheriff | pass | none |
| Mister Pips | 0 | none | none | none | FAIL | Job: "Somebody's beating my tables." It's Dice, saving to escape. Turn her in, cover for her (check), or take a cut. |
| Dice | 0 | none | none | none | FAIL | "Deal me in." Win at her table and she asks you to carry a letter to Opal: deliver it (the sisters), read it (Opal's secret), or sell it to Pips. |
| Big Tam | 0 | none | none | none | FAIL | Pips wants him down in fight night. Talk him into winning (the bet pays), fix it for Pips (he dies), or swap in. Opens the fightnight plot early. Fallback: "Teach me to fight." |
| Sweet Nan | 1 | a loan | 100 teeth | Krug, Pips | weak | Job: collect 100 from Fenwick. Collect (water goes up), pay it yourself (her secret), or tip him off (Nan sells his paper to Krug). Keep the money and her collectors come for you. |
| Rook | 0 | none | none | none | FAIL | Job: "Does the King still want my head?" Ask Gums. Tell the truth (trust, then the back-door code), sell his location, or lie that he's free (he leaves the door). |
| Queen Margie | 3 | an associate | free meals | weak | weak | The job becomes three shifts: a shoplifter, a Vane dealer at the tables (opens the drug war), a riot over the last Value Meal. Promotion reveals the handbook's last page. |
| Sprocket | 2 | none offered | mods | none | weak | Job: a pre-war barrel from the gun shop at the bottom. A risky dive. Give it to her for a unique mod (trust reveals the drill jam), or sell it to Gums. |
| Eel | 1 | Sal (not a job) | tips | Lou, Pete | weak | Hires you on day 1 to ask about Sal: Jeb, Pete and Lou each give a clue. That opens her existing outcomes before day 13. |
| Dr. Vane | 3 | customers | shop | Doc | weak | Job: runner for the grey under Doc's name. Leave it on Moe's bar, hand it to Doc, or swap it for flour. Feeds the day 17 plot. |
| Gums | 3 | not offered | shop, silo | Jeb, Bess | weak | Job: his teeth back from the King's tax vault in the Silo. Return them (surplus gift, trust reveals the gin) or spend them. |
| The Gardener | 3 | keep the Green small | seeds | valley | pass | none |
| The Warden | 0 | none | none | none | FAIL | Job: a Molar scout on the ridge. Bring his tags (trust, a way in), or let him go for teeth (the King hears of the Green). |
| Moss | 3 | freedom | info | Green, Nigel | pass (special) | none |
| Fern | 2 | the sea, the gate | vegetables | Junior | pass | none |
| The Dentist King | n/a | the launch | the endgame | everyone | pass (special) | The Silo scenes are his talk. Excluded from the guard. |

## Cross-cutting

- **Secrets by trust, not just gossip.** Finishing someone's job raises their opinion and has them tell you their own secret (`know(id + '.secret')`). Many secrets already open content: the loaded dice, the back-door code, Tam and Gus, Dice and Opal, Eel's vault, the King's drill, Jeb's gin, the last page, the skim, the cabbages.
- **Guard test.** `tests/care.js` fails if any non-animal character offers nothing on a first meeting. It needs special cases for the King (no `TALK.king`) and Pete (talked to once freed). Add it to `tests/all.js` once everyone passes.
- **Don't touch**: the King's day 25 countdown, combat balance, the removed 3D views.

## After the pass (v5.7): every character passes

`tests/care.js` runs in `tests/all.js` and passes for all 35 people it checks. Each job is offered on a first meeting, pays the player, moves at least one other person, and ends in `confide()`, which tells you that person's secret directly. The path tests named "Jobs, ..." in `tests/paths.json` cover every outcome.

| Who | Status | What you can do now |
|---|---|---|
| Ma Thistle | pass | Find who sends her money (Crumb tells you: Nan). Tell her it's Nan (she writes to her sister) or say it's the Toaster (Crumb is grateful). 30 teeth either way. |
| Crumb | pass | Tells you a coil would make the Toaster speak. Gives up Nan's secret for Ma's job. |
| Old Pell | pass | Find what sniffs round his sty. Opens the pork plot. Saving the pig pays 30. |
| Moe | pass | Sells you Ma's ring, held against Gus's tab. Give it to Ma (Gut Glue, Gus grateful), to Gus (he pays all he has and confesses to Ma), or sell it to Gums (Gus turns on you). |
| Gloria | pass | Wants a ride east. Talk Jeb round and she trusts you with the skim (the skim plot opens). Or tell Opal, who counts the takings now. |
| Pete | pass | Wants to be a deputy. Talk Crane round. A deputy Pete dies stopping the Mayor's cheap Molar, and Crane lives. |
| Hector | pass | Points you at Bert's tractor. |
| Bert | pass | His carburettor: Sprocket fixes it, the tractor runs, Hector pays 60, and the farm no longer fails on day 22. Or sell it to Gums. |
| Mama Lou | pass | "What's the special?" opens the pork plot from her side. |
| Junior | pass | Eat his greens and he trusts you (the cabbage plot opens). Then you can sell him out to Lou, who salts the earth. |
| Mister Pips | pass | The table cheat is Dice. Turn her in (80 teeth, she tries the vault sooner), cover for her (a check), or let Dice cut you in. |
| Dice | pass | Deal cards. Win, and she gives you a letter for Opal: deliver it (the sisters reunite), read it (both secrets), or sell it to Pips (Dice is sold). |
| Big Tam | pass | Pips wants him down on fight night. Talk him into winning, sell Pips the fix (Tam dies), or sell the fix and warn him (Tam wins and Pips turns on you). Lessons for 20 teeth. |
| Sweet Nan | pass | Collect Fenwick's hundred (water goes up two), cover it yourself, or tip him off (Nan sells his paper to Krug). Keep the money and her collectors come. |
| Rook | pass | Ask Gums if the King still wants him. Tell him the truth (the back-door code opens), lie that he's free (he stops watching the door), or sell him through Gums (Molars kill him unless you warn him). |
| Queen Margie | pass | Three shifts: a shoplifter (Gums's runner), a Vane dealer (opens the drug war), the last Value Meal. Then Shift Manager, 60 teeth and the handbook's last page. |
| Sprocket | pass | Dive the gun shop for a match barrel and she fits a unique mod free. Or sell it to Gums and it goes to the Molars. |
| Eel | pass | Hires you on day 1 to ask about Sal. Jeb, Lou and Pete each give a clue, which opens her outcomes before day 13. |
| Dr. Vane | pass | Run his grey: leave it on Moe's bar (the plot fires next day), swap it for flour (he finds out), or hand it to Doc (Doc confides). |
| Gums | pass | His teeth from the Silo's tax jar: he gives you a car-door plate. Or sell him his own teeth. |
| The Warden | pass | A Molar scout on the ridge. Bring his tags and she opens the gate. Let him go for 30 teeth and the King hears about the Green. |
| Everyone else | pass | Unchanged: they already passed. |

Pushback and open points:
- The match barrel is new gear: a little more power for one gun. The balance test doesn't cover modded gear.
- Bert's tractor now saves Hector's farm from failing on day 22 without seeds. There is no ending slide for it yet: the farm just doesn't fail.
- Jobs are first-meeting hooks. Once done, a few people (Junior, Pete, Rook) have little left to say on later visits.
