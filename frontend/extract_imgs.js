const fs = require('fs');
const content = fs.readFileSync('ed_bundle.js', 'utf8');
const regex = /\/assets\/([a-zA-Z0-9_\-]+\.(webp|png|jpg|jpeg))/g;
const found = new Set();
let m;
while ((m = regex.exec(content))) found.add('/assets/' + m[1]);
[...found].sort().forEach(p => console.log('https://eventdhara.in' + p));
