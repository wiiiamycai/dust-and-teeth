# Dust & Teeth: Design Brief for v3

A text RPG in the spirit of Fallout 2, built as a single-page browser game. This brief is the handover from the first two versions. Read it fully before changing code. `index.html` is the current playable v2.

## 1. What the game is

- Post-apocalyptic wasteland, 200 years after the bombs. Currency is teeth.
- The player is a nobody from a village called Scrapwell. There is no main quest. The point is to explore and do whatever you want. Side quests ARE the game.
- Dark humour, turned up to max. Fallout 2 level of dark: murder anyone, slavery, cannibalism, drugs, betrayal, selling your spouse.
- Permadeath. The game autosaves to localStorage, and dying deletes the save.
- Ending: Fallout-style slides that summarise the fate of each place and person based on what the player did.

## 2. Design pillars (do not break these)

1. **Depth over size.** Keep the current map size. Go deeper in every place and person. It will get big later, but depth comes first.
2. **Every action has consequences 2 to 3 layers deep.** Example: sell Bess to slavers, then Hector hears through gossip, then Bert goes after her and gets taken too, then Bess comes back months later as a raider queen.
3. **Gossip must change behaviour, not just a hidden opinion number.** See section 5.
4. **No visible checks.** No percentages on dialogue or actions. Real life has no "Speech 62%". Use soft cues instead ("she's warming to you", "he's not buying it").
5. **Information drives success.** Hidden checks are modified by what the player has learned and done (see section 4). Spam-clicking should be a bad strategy.
6. **Enemies never scale with the player.** Each enemy type has fixed strength. Early game can have huge, deadly monsters. Late game can still have weak rats. The world gets more dangerous only because of story (the Dentist King recruiting) or the player's own notoriety (bigger hunters because you made bigger enemies).
7. **Combat is hard.** Avoiding fights (talking, sneaking, paying, running) must be a real choice.
8. **One fixed character.** No character creation and no presets. The player is a man of average ability in everything. The character is built through play.
9. **Learn by doing.** No points to allocate. Skills grow by use. Perks are earned from actions.
10. **Short text.** One or two lines per scene. The player found v1 too wordy. Dialogue options are short lines the player actually says.

## 3. Writing rules

- Never use em dashes or dash-style punctuation in any game text. Use commas, full stops or colons.
- Short, punchy, darkly funny. Each line should earn its place.
- Dialogue options are real lines ("Ever thought about leaving this farm?"), never labels like "Flirt" or "Persuade".
- NPC replies are real replies in their own voice.

## 4. Checks (v6.2: logical, and hidden until you can pass)

- **Hidden.** The player never sees a percentage. No `[Speech 62%]` style tags on option labels.
- **Story checks are logical: know X, pass Y** (Will, v6.1). Any check that touches the story passes if the player holds its key and fails if they don't. No dice. A key is one of:
  - something learned from dialogue or gossip (a "known fact" in `S.know`). Example: Bess told you she dreams of leaving the farm, so "Ever thought about leaving this farm?" works. Without it, it doesn't.
  - something carried (Krug's notebook, the Mayor's ledger, a badge).
  - something done (fixed the tractor, fought in the pit, freed the pens).
  - someone's trust (their opinion of you, gossip-driven).
- **A story line is hidden until you hold its key** (Will, v6.2). So a line you can see always works, and nothing on screen is a guess. Gate every story option with `canTry(key)` or `chkOpt(key, ...)` for its own key, so it hides with it.
- Keys live in `LOGIC` in `scenes/logic.js`. Every new story check needs a `LOGIC` entry.
- **Context still counts, as logic:**
  - Someone who has heard you lie won't take your word, unless they trust you anyway (opinion 30 or more).
  - Who is in earshot (with Hector listening, only Bess's dream will move her; away from him, her trust is enough).
  - The right line, not just the right fact ("Jeb was drunk" works if you know Jeb drinks; "Jeb's lying" doesn't).
- **Dice only for the trivial:** the road, gambling, haggling, dives, petty theft, flings, a quiet murder (`DICE` in `scenes/logic.js`). These keep the hidden context modifiers in `data/checks.js` (rapport, opinion, known facts, gear, earshot, titles).
- **Soft cues after each dice attempt.** Never a number.
- **Mostly one-shot.** A failed check usually closes that option until something changes (new info about the person, or their opinion swings). A few low-stakes checks can repeat, but each failure raises suspicion. Flirting can be retried a small number of times, then that person shuts you out for good.
- **Read People perk** (earned by having many conversations) gives vague hints on dice checks ("she might go for it") but never numbers. Story lines need no hint: if you can see one, it works.

## 5. Gossip that makes people act (v3)

The v2 gossip engine already works (events, witnesses, spread over days through relationships and carriers like Moe and Jeb, opinion deltas, reaction lines). v3 must turn knowledge into behaviour. Every significant piece of gossip should change at least one thing someone does. Examples to implement:

- Service changes: Moe stops sharing rumours, Doc refuses to sell Buzz, prices rise or fall.
- New doors: Opal hears you freed the Chainfield slaves and offers a job she would never offer a stranger. Someone vouches for you, gives a gift, or shares a secret.
- Warnings: Hector warns Bert before you arrive, so Bert is armed and hostile.
- Traps and betrayal: someone who hates you lies to you, sends you into an ambush, or tips off Krug where you sleep.
- Revenge: family members of victims hunt you (already partly in v2 via hunter encounters).
- Delayed effects: news can take days to arrive, so consequences land when the player least expects them.

## 6. Character growth (v3)

- Fixed male character, average stats (all 5 on a 1 to 10 scale), average skills (around 30 to 35).
- Remove the three presets and the skill-point allocation UI.
- Skills improve by use: melee by melee fighting, guns by shooting, speech by successful (and failed) conversations, sneak by sneaking, steal by stealing, science by fixing things. Diminishing returns as skills get higher.
- Stats change only through story events: Doc's Brain Juice, selling a kidney, addiction, the Smiling Few cult, injuries, and so on.
- Show skills as words, not numbers ("Speech: Clumsy / Decent / Smooth / Silver"), unless the player has Keen Eye.
- Perks are earned from actions, not chosen. Examples: Silver Tongue after many successful talk-downs, Bloody Hands after many melee kills, Messy Eater after eating enough corpses, Iron Gut after surviving addiction.
- **Keen Eye perk:** earned after surviving enough fights and landing enough aimed shots. Without it, enemies are described in words only ("big", "wounded", "barely standing") with no level, HP number or stats. With it, the player sees health bars, strength, armour and what they carry. This replaces the level numbers currently shown on cards.

## 7. Combat (v3)

Keep the current combat loop (hit, aim for eyes, aim for groin, Gut Glue, Buzz, run). Focus on two styles with real trade-offs:

- **Guns:** strong from range, use ammo (bought with teeth), loud. Gunfire is heard: it adds witnesses and spreads gossip faster.
- **Melee:** no ammo, quiet (murders more likely to stay secret), hits harder up close, can knock an enemy down (skip their turn). The player takes more hits closing the distance.
- Fix the v2 balance problem: melee is currently strictly worse than guns.
- Combat stays hard. A few hits can kill an average character.

## 8. Enemies (v3)

- Every enemy type has a fixed strength that never changes with the player's level or progress.
- Danger is mixed everywhere: near home is mostly weak, but strong things can appear anywhere at any time.
- Add at least one roaming apex monster, the **Gutmaw**: huge burrowing beast with a big health bar and heavy attacks. Early game the only options are run, hide or distract it (throw meat, sacrifice something). Late game it can be killed and it should feel earned.
- Descriptions make danger readable ("It's the size of a car. The ground shakes when it moves.") so the player can choose to back off.
- The world worsens only through story (the Dentist King's army grows over time) and notoriety (hunters are stronger because the player made bigger enemies).

## 9. Seduction and jealousy (v3)

The player is a man. Most adult women can be seduced, each in her own way. Content stays fade-to-black. Remove the option to flirt with Bert (he stays as Bess's brother).

| Woman | What wins her | Jealousy when she hears about another woman |
|---|---|---|
| Bess | Talk of adventure and leaving the farm | Goes after the other woman herself. Player must pick a side or stay out of it |
| Madame Opal | Honesty and money. Hard to truly win | Doesn't care |
| Sheriff Crane | Respect. Do good things in Rustwater first | Dumps you and treats you as a suspect |
| Mama Lou | Loving her cooking (yes, that cooking) | Smiles, says nothing. A week later the other woman is the Thursday special |
| Gloria (Velvet Rad) | Easy to sleep with, nearly impossible to win | Doesn't care |

- Multiple lovers at once are allowed. Some are happy as a side piece, others start trouble.
- Jealousy triggers through the gossip engine, so it can land days later.
- Ending slides should cover each relationship.

## 10. Content limits (keep these)

- No sexual violence of any kind.
- Children: Will lifted the "no children in the world" rule on 23 Nov 2026, for Crane's pregnancy. A child may exist, offstage. Children are never harmed, killed, endangered or sexualised, and a pregnant woman can't be killed, sold or harmed by the game's own systems.
- Sex is always fade-to-black.
- Everything else at Fallout 2 darkness is fine.

## 11. Current state (v2) for reference

Vanilla JS, no build step. `index.html` loads `css/style.css` and a list of plain `<script src>` files in a fixed order: `engine/` (core, state, gossip, world clock, combat), `data/` (items, npcs, world, gossip tables), `scenes/` (map, locations, talk, silo, character, intro) and `main.js` (boot). They are classic scripts sharing one global scope, so load order matters and the game still opens straight from the file. A new file must be added to the script list in `index.html`. Code is formatted with Prettier (pinned in `package.json`, settings in `.prettierrc.json`): run `npm run format` before committing. Call it through npm or `node node_modules/prettier/bin/prettier.cjs`, because `npx` breaks on the `&` in the folder path. Key systems already working:

- `S` is the whole game state, saved to localStorage key `dust_teeth_v2`.
- `NPC` table with per-NPC runtime state in `S.n[id]` (loc, op = opinion, k = known event ids, rx = pending reaction lines, lvl, st).
- `event(type, victim, opts)` records an event with witnesses. `learn(id, ev)` applies opinion change and queues a reaction line. `spread()` runs once per day and moves news through same-location contacts, relationships (`REL`), and carriers (Moe, Jeb).
- `EV` table defines opinion changes per relationship (self, family, friend, enemy, other, witness). `RXG` and `RXS` hold reaction lines.
- `world()` runs once per day: Pete is eaten on day 6 if not rescued, people in Krug's pens are sold on after 4 days, Bert goes after Bess, the Mayor's hit on the Sheriff, the Dentist King timeline (omens on days 8, 17, 22, Rustwater raid on day 12, launch on day 25 unless stopped).
- Hostility: opinion -60 or lower on a fighter means they attack on sight or ambush you at their location.
- Endgame: Silo 9 (find it via Old Teo, Krug, Moe, Ma Thistle or a Molar survivor). Ways in: fight, sneak, slaver tattoo, bribe. Ways to stop the King: fight, talk down, steal the launch key, sabotage via the maintenance shaft. Or join him and nuke a town.
- Scenes are functions in `SC`, called through `go(scene, ...args)`. `show({title, icon, sub, text, cards, map, opts})` renders everything.

### Graphics (v3.7 to v4.3)

The look is set by `ART_STYLE.md`. All of it is looks only, drawn in code, and skipped when there's no canvas (`canDraw()` in `engine/core.js`; the headless tests have none), so it can never change how the game plays. Will's call in v4.3: text and portraits only. The isometric towns, the walking tile maps and the isometric fight strip were removed, and every place plays as text.
- `data/sprites.js` and `scenes/sprite.js`: the talk portraits, built from parts (body, layers, what they hold). Every person needs an `SNPC` entry.
- `scenes/mapart.js`: the painted world map. `scenes/art.js`: title and ending art, with portraits of the people a slide names.
- `scenes/sound.js`: optional sound made in code, off by default, toggled in the footer.
- `engine/core.js` `show()` calls the portrait, sound and art hooks, each inside a try/catch.

## 12. Suggested build order for v3

1. (Done) Split `index.html` into modules (for example `data/npcs.js`, `data/dialogue.js`, `engine/gossip.js`, `engine/combat.js`, `engine/checks.js`, `scenes/*.js`) with a simple bundling step, or keep one file but cleanly sectioned. Keep it playable by opening a file in a browser.
2. (Done) Set up git. Commit v2 as the baseline before any change.
3. (Done) Hidden checks with context modifiers, real dialogue lines, soft cues, one-shot checks. Engine in `engine/checks.js`, every check's spec in `data/checks.js`, facts the player has learned in `S.know`, failed checks in `S.tried`. New checks go through `attempt(key)`, `canTry(key)` and `hint(key)`, never a raw roll.
4. (Done) Gossip that makes people act (section 5). Hooks in `engine/react.js`: `heard()`, `onLearn()`, `later()`, `reactions()`. Decisions in `DECISIONS.md`.
5. (Done) Fixed character and learn-by-doing growth, earned perks, Keen Eye. Engine in `engine/growth.js`: `practice()`, `statAdd()`, `count()` and `PERK_RULES`.
6. (Done) Melee vs guns trade-offs, ammo, noise. `tests/balance.js` guards the balance.
7. (Done) Fixed-strength enemies, the Gutmaw, readable danger descriptions. Enemy table in `data/enemies.js`, Gutmaw in `scenes/gutmaw.js`.
8. (Done) Seduction and jealousy. In `scenes/romance.js`. Ending is now slides, with a line for every relationship.
9. After each step: run the bot tests (section 13) and play it.

## 13. Testing

`tests/` has headless Node scripts that run the game without a browser by stubbing the DOM. They load the game through `tests/load.js`, which reads every script `index.html` lists, in order:

- **`node tests/all.js` runs everything below and prints PASS/FAIL per test.** It takes about 4 minutes. `--quick` uses 300 fuzz games instead of 1500 for fast iteration; always do a full run before committing.
- `node tests/fuzz.js index.html 1500 rand` plays 1500 random games. `survive` mode avoids instant-ending options and tops up HP to reach deeper content. `late` mode starts each game on day 15 at the Drowned Mall or the Green, to play the late content. Reports crashes, dead ends (screens with no options), any "undefined", "NaN" or "null" text on screen, and any visible check (`[Speech 62%]`, `[Brains]`, `Run (40%)`).
- `node tests/reload.js index.html` plays random games while reloading mid-game to check saves.
- `node tests/path.js index.html '[...steps]'` runs a scripted playthrough by clicking options whose text contains each step string. God mode tops up HP and maxes skills before each step. Special steps: `TRAVEL:<place>`, `FIGHT`, `EVAL:<js>` (inspect state), `WAIT:<days>`, `REAL` (restore real skills, so checks can be measured), `RAND:<0..1>` / `RAND:off` (fix every dice roll: 0.99 fails almost any check; a logical story check ignores dice, so a test gives it its key instead, e.g. `EVAL:know('krug.rota')`), `EXPECT:<js>` (fail unless truthy), `SAY:<text>` (fail unless the text is on screen).
- `tests/paths.json` holds the scripted consequence tests that `all.js` runs. Add one for each new consequence chain.
- `node tests/sprites.js index.html` checks the portraits: every grid uses palette letters and fits its box, every person has a portrait, it is found from their talk screen, and it draws both open-eyed and blinking.
- `node tests/golden.js index.html` replays 300 fixed-seed games (with reloads) and compares a fingerprint of every screen and save against `tests/golden.json`. It must match after any refactor. When a change is meant to alter gameplay it will mismatch: re-record with `node tests/golden.js index.html record` and commit the new `golden.json` with that change.
- The live build is at https://beautiful-valkyrie-9f63d9.netlify.app. Netlify deploys it from `main`, so a push to `main` updates it.
- For a browser check, `.claude/launch.json` serves the folder at `http://localhost:8137` (`python -m http.server`). The browser caches the scripts: force fresh copies before checking a change.

`node tests/all.js` must pass after every change.

## 14. Working with Will

- Discuss and agree a plan before building anything big. Confirm before any run that will take more than about 3 minutes.
- Challenge his ideas when you think he's wrong. He likes being pushed back on. Hold your position unless his argument changes your mind.
- Number lists of options so he can reply by number.
- No em dashes, in game text or in replies.
