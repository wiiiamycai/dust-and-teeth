# Why should I care? A first-meeting audit of every character

Will's rule: "every single character in this game should have a reason why I should care about them."
The test, all on a FIRST meeting with no gossip and no secret needed:
1. **Want**: something they are trying to get or escape, offered as a talk option or job.
2. **Payoff**: gear, teeth, a check, a route, an ally, or information found nowhere else (or a threat to handle).
3. **Consequence**: helping or hurting them moves at least one other person.

Count = real first-meeting options, from `node tests/care.js index.html --list` (excludes "Any news?", attack, murder, back).
Status is the audit as of v5.1. Nothing below "Planned fix" is built yet.

| Who | Count | Want | Payoff | Consequence | Status | Planned fix |
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
