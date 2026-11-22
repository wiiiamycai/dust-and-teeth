# Dust & Teeth

Will's text RPG in the style of Fallout 2. `index.html` is the current playable version (v2).

Live build: https://beautiful-valkyrie-9f63d9.netlify.app (Netlify deploys from `main`).

Before doing anything, read `DESIGN_BRIEF.md` in full. It holds the design pillars, the agreed v3 plan, content limits and how to test.

Rules:
- Discuss and agree the plan with Will before building. Confirm before any task likely to take more than about 3 minutes.
- Never use em dashes, in game text or in replies.
- After every change, run the tests in `tests/` (see section 13 of the brief). All must pass.
- Commit to git after each working step.
- After a full `node tests/all.js` prints ALL PASS, merge to `main` and push, so the live build updates (Will, 23 Nov 2026).
