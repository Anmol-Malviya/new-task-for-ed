const fs = require('fs');
const content = fs.readFileSync('bundle.js', 'utf-8');
const regex = /(["'])([^"']*\.(jpg|jpeg|png|webp|svg))(["'])/ig;
const matches = new Set();
let m;
while ((m = regex.exec(content))) {
  matches.add(m[2]);
}
console.log(Array.from(matches).join('\n'));
