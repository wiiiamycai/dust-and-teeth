// Packs the game into a few files for a review in Claude chat. Usage: node tools/pack.js
// Writes review/ (not committed):
//   dust-and-teeth.html    the whole game in one file, playable by opening it
//   1-design.md            the design docs: brief, care audit, cast, decisions, art style
//   2-engine-and-data.md   engine/ and data/ source
//   3-scenes.md            scenes/ source (the looks-only files last)
// Upload the .md files to a Claude Project (or attach them to a chat) and ask for a review.
const fs = require('fs'),
  path = require('path');
const root = path.join(__dirname, '..'),
  out = path.join(root, 'review');
fs.mkdirSync(out, { recursive: true });
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('index.html');
const scripts = [...html.matchAll(/<script src="([^"?]+)[^"]*"><\/script>/g)].map(m => m[1]);
// 1. one playable file: the stylesheet and every script inlined, in load order
let one = html.replace(/<link rel="stylesheet" href="([^"?]+)[^"]*">/, (_, f) => `<style>\n${read(f)}\n</style>`);
one = one.replace(/<script src="([^"?]+)[^"]*"><\/script>/g, (_, f) => `<script>\n${read(f).replace(/<\/script/gi, '<\\/script')}\n</script>`);
fs.writeFileSync(path.join(out, 'dust-and-teeth.html'), one);
// 2. readable bundles
const block = f => `\n\n## ${f}\n\n\`\`\`${f.endsWith('.css') ? 'css' : f.endsWith('.html') ? 'html' : 'js'}\n${read(f)}\n\`\`\``;
const LOOKS = ['data/sprites.js', 'scenes/sprite.js', 'scenes/mapart.js', 'scenes/art.js', 'scenes/sound.js'];
const intro = t =>
  `# Dust & Teeth: ${t}\n\nA Fallout 2 style text RPG in plain browser JavaScript, no build step. Classic scripts share one global scope, so the load order in index.html matters. Later files extend earlier ones by wrapping (\`const _x = TALK.x; TALK.x = () => {...}\`).`;
const docs = ['CLAUDE.md', 'DESIGN_BRIEF.md', 'CARE.md', 'CAST.md', 'DECISIONS.md', 'ART_STYLE.md'].filter(f => fs.existsSync(path.join(root, f)));
fs.writeFileSync(path.join(out, '1-design.md'), intro('design docs') + docs.map(f => `\n\n---\n\n# ${f}\n\n${read(f)}`).join(''));
const eng = ['index.html', 'main.js', ...scripts.filter(f => /^(engine|data)\//.test(f) && !LOOKS.includes(f))];
fs.writeFileSync(path.join(out, '2-engine-and-data.md'), intro('engine and data, in load order') + eng.map(block).join(''));
const sc = scripts.filter(f => f.startsWith('scenes/') && !LOOKS.includes(f));
fs.writeFileSync(
  path.join(out, '3-scenes.md'),
  intro('scenes, in load order') + sc.map(block).join('') + '\n\n# Looks only (portraits, map art, sound)' + LOOKS.map(block).join(''),
);
for (const f of fs.readdirSync(out)) {
  const n = fs.statSync(path.join(out, f)).size;
  console.log(`${f.padEnd(24)} ${String(Math.round(n / 1024)).padStart(4)} KB  about ${Math.round(n / 4 / 1000)}k tokens`);
}
