const fs = require('fs');
fetch('https://eventdhara.in/')
  .then(res => res.text())
  .then(html => {
    const urls = [];
    const regex = /<img[^>]+src="(https?:\/\/[^"]+)"/ig;
    let m;
    while((m = regex.exec(html))) {
      urls.push(m[1]);
    }
    const regex2 = /url\(['"]?(https?:\/\/[^'"\)]+)['"]?\)/ig;
    let m2;
    while((m2 = regex2.exec(html))) {
      urls.push(m2[1]);
    }
    console.log(Array.from(new Set(urls)).join('\n'));
  });