# Dust & Teeth: Art Style

> v4.3: Will asked for text and portraits only, so the isometric towns, the walking maps, fog of war, town lighting and the fight strip are gone. Sections 3, 6, 7, 8 and 10 are kept for the record only. Section 5 (sprites) now covers portraits only.

One page. Every later art change (isometric view, sprites, frame, portraits) follows it. All art is original and drawn in code (canvas or SVG). Nothing is copied from Fallout: no assets, no Pip-Boy, no bottom panel, no logo, no characters. Inspired by the genre, not by one game.

## 1. Mood

Sun-bleached, dusty, tired. Colours look like they've sat in a window for 200 years. The only saturated colour is the amber of the screen itself, used for things you can act on. The game is still a terminal you're reading: the map sits inside the same amber CRT, it doesn't replace it.

## 2. Palette

Interface (unchanged from `css/style.css`): amber `#ffb000`, dim amber `#8a5f00`, near-black `#0c0904`, panel `#16110a`, red `#ff6a4d`, green `#a8e07c`, blue `#7cc4e0`.

World (lit top faces; side faces are the same hue, darker):

| Tile | Map char | Colour | Notes |
|---|---|---|---|
| Sand | `,` | `#8c7650` | a few lighter specks |
| Packed dirt (floor) | `.` | `#6e5a3c` | |
| Crops | `;` | `#6b6a2e` | dry olive, short stalk strokes |
| Road | `_` | `#4a4238` | cracked asphalt, faint crack lines |
| Rubble | `:` | `#5e5246` | lumpy, pale flecks |
| Water | `~` | `#2e4a48` | murky teal, slow glint |
| Fence | `=` | `#7a4a28` | rusty posts and wire, waist high |
| Door / gate | `+` | `#5a3a20` | planks, flush with the ground |
| Exit | `E` | sand, with an amber arrow | |
| Wall / building | `#` | top `#7a6650`, left `#57483a`, right `#3e3329` | |

Rules: no pure white, no pure black in the world. Saturation stays under about 35% except amber (interactive) and green (you). Red only for danger and blood.

## 3. Isometric grid

- Tiles are 2:1 diamonds: 64 x 32 px at full size, scaled to fit the view (never above full size).
- North of the map is up and to the right. Moving "up" with W or the arrow walks up-right on screen, the way the map data reads.
- Building walls are blocks 28 px tall (just under one tile's height). The outer border wall is a low kerb, 8 px, so it never hides the town.
- Fences are 12 px. Objects and people stand on the tile centre with a soft oval shadow.
- Draw order is back to front by `x + y`, then height. A wall block between you and the camera turns 35% see-through, so you're never hidden.

## 4. Light and outline

- Sun from the upper left of the screen. Top faces full colour, left faces x0.75, right faces x0.55.
- Each wall casts a short shadow onto the tile below-right, black at 25%.
- Blocks get a 1 px dark outline (`#120c06` at 60%). Ground tiles get none, only a faint darker seam, so the ground reads as one surface.
- Things you can use glow: a pulsing amber diamond on their tile. You stand on a green ring. Hover shows an amber diamond outline.

## 5. Sprites (part 2, built in v3.8)

- Every sprite is a 16 x 32 grid of letters in `data/sprites.js`, one letter per palette colour, drawn in code by `scenes/sprite.js`. Shop signs are 16 x 12 boards with an 8 x 6 picture.
- People are built from parts: a body (man, woman, big), then layers (hats, beards, aprons, coats, chains) and what they hold. Only Bacon Prime is drawn whole.
- Shown about as tall as a tile is wide, with every pixel snapped to the screen so it stays crisp.
- The 1 px dark outline and the light from the upper left (lit top and left edges, darker right edge) are added in code, so the grids hold flat colour only.
- People face right; facing left is the same sprite mirrored. People turn to face you, and you face the way you last walked.
- People breathe (a slow two-frame bob, out of step with each other). You step on alternate feet as you walk.
- Your sprite shows your armour and your weapon.
- Anything without a sprite falls back to its emoji. The flat map stays emoji.

## 6. Fog of war

- Unseen tiles are black.
- You see in a circle round you, 7 tiles by day and 5 at night, and walls block sight.
- Tiles you've seen but can't see now are drawn at 35% brightness, greyed. People aren't shown there; buildings and objects are. The "who's here" list under the map still names everyone, so nobody gets lost in the dark.
- What you've seen is saved per place, so a town you know stays mapped.

## 7. Day and night

The game counts days, not hours: one trip or one sleep is one day. So the light is picked from the day number, a five step cycle that changes every day and is the same after a reload: dawn (warm pink-orange, long shadows), noon (bleached, slightly washed out), afternoon (plain), dusk (orange-red, deep shadows), night (dark blue, sight shrinks to 5). Light is looks only. It changes nothing in the game.

## 8. Dust

Fine motes, 1 to 2 px, sand coloured, 15% to 40% opacity, drifting left to right with a slow bob. Now and then a gust thickens them for a few seconds. Fewer and bluer at night. Off if the browser asks for reduced motion.

## 9. CRT

Stronger scanlines than now (a dark line every 3 px at about 25%), a soft dark vignette at the screen edges, and a faint amber glow on text and on the map. A very slight flicker, which also switches off for reduced motion. No screen curve: it blurs text.

## 9b. The frame and portraits (part 3, built in v3.9)

- The whole screen sits in a riveted, scratched steel bezel: one plain frame round the outside, with a stamped plate on the top edge. Everything stays where it was: the HUD at the top, the map and the options underneath. There's no bottom panel and no wrist computer.
- Talking to someone shows their portrait in the header: head and shoulders from their sprite, five screen pixels per sprite pixel, on a dark panel with a faint amber glow and scanlines. They blink now and then. If the browser can't draw it, the emoji is used.

## 10. Views

Three views, cycled by one option: isometric, flat map (today's emoji grid), list. If the isometric view ever breaks, the flat map and the list still play the whole game.
