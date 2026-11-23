'use strict';
// ================= DATA: WALKING MAPS (phase 1: Scrapwell, Rustwater, and the valley) =================
// Will (v6.6): "Make it as close to Pokemon as possible, including the walking and the scrolling map, and finding
// the people." Our own art, in the style of a Game Boy Color RPG. Each map is rows of tiles, 16 x 16 pixels:
//   .  sand        ,  scrub (dry grass)   =  path        #  rock (blocks)     T  dead tree (blocks)
//   ~  water       f  fence (blocks)      x  junk pile   H  roof (blocks)     h  wall (blocks)
//   D  door        W  well                P  pump        s  mud               S  sign
//   C  chapel roof c  chapel wall         E  exit to the valley               p  a spot where a person stands
// Doors, wells, pumps and signs are things you can use: `use` names a place option (matched against the
// hub's option labels) or says something. People stand on `p` spots, in order, unless `spots` names theirs.
const MAPS = {
  scrapwell: {
    rows: [
      '##########################',
      '#,,,..T...........,,,,,,,#',
      '#,,HHHH.....CCCCC....,,,,#',
      '#,,hhDh.....CCCCC.....,,,#',
      '#....=......cccDc........#',
      '#....=..p......=.....p...#',
      '#,...=====p====.==.......#',
      '#,,.....=.......=........#',
      '#,,..x..=...W...=..HHH...#',
      '#,......=..p....=..hDh...#',
      '#..p....=========..=.....#',
      '#.......=...p...====...p.#',
      '#.ffff..=...........,,,..#',
      '#.fssf..=....HHH....,,,,.#',
      '#.fssf.p=....hDh..p..,,,.#',
      '#.ffff..=.....=.....,,,,,#',
      '#.......=======..........#',
      '#,,.....=..........x...,,#',
      '#,,,,...=..T........,,,,,#',
      '########E#################',
    ],
    spawn: [8, 18],
    use: {
      W: /well/i,
      // your shack is the house on the south side
      '14,14': /shack/i,
      S: 'SCRAPWELL. POP. 31. GOATS 11.',
    },
    spots: { pig: [3, 14], pell: [7, 14], elder: [8, 5], crumb: [15, 6], rind: [17, 5], gus: [12, 9] },
    sign: 'A sign says SCRAPWELL. Somebody has added: STILL.',
  },
  rustwater: {
    rows: [
      '############################',
      '#..HHHHH....HHHHHH....HHHH.#',
      '#..hhDhh....hhhDhh....hhDh.#',
      '#....=.........=.......=...#',
      '#.p..=...p.....=...p...=.p.#',
      '#....==========P=======....#',
      '#..............=...........#',
      '#.HHHH...p.....=.....p.HHH.#',
      '#.hDhh.........=.......hDh.#',
      '#..=.....p.....=.....p..=..#',
      '#..============.=========..#',
      '#..x...........=........x..#',
      '#.....p........=......p....#',
      '#,,,...........=.........,,#',
      '#,,,,,,........=.......,,,,#',
      '###############E############',
    ],
    spawn: [15, 14],
    use: { P: /water/i },
    spots: { moe: [5, 4], sheriff: [9, 4], opal: [19, 4], mayor: [16, 4], doc: [9, 7], jeb: [21, 7] },
    sign: 'RUSTWATER. The water is clean. The water is not free.',
  },
};
// The valley is drawn from the places on the map (LOC), so it stays true as places are found.
const VALLEY_W = 84,
  VALLEY_H = 70;
const vx = l => Math.round((l.x / 100) * (VALLEY_W - 10)) + 5,
  vy = l => Math.round((l.y / 100) * (VALLEY_H - 10)) + 5;
