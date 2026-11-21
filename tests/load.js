// Shared loader for the headless tests. Returns the game's JS as one string.
// Reads every <script> in index.html in order: inline scripts as written,
// <script src="..."> by reading the file next to index.html. A plain .js path is returned as is.
const fs = require('fs'), path = require('path');
module.exports = function loadGame(file) {
  const src = fs.readFileSync(file, 'utf8');
  if (!/<script/i.test(src)) return src;
  const dir = path.dirname(file), parts = [];
  const re = /<script(?:\s+src="([^"]+)")?\s*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(src))) parts.push(m[1] ? fs.readFileSync(path.join(dir, m[1]), 'utf8') : m[2]);
  return parts.join('\n');
};
