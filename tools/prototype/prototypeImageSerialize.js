// Make a prototype for retrieving an image, serializing it, storing it, and then displaying it
const axios = require('axios');
const Database = require('better-sqlite3');
const fs = require('fs');

const url = 'https://www3.scottcountyiowa.gov/sheriff/images/inmates/215603.jpg';
async function main() {
  const resp = await axios.get(url, { responseType: 'arraybuffer', responseEncoding: 'binary' });

  fs.writeFileSync('testPreSerialize.jpg', resp.data, 'binary');
  const db = new Database(':memory:', { verbose: console.log });
  db.prepare(`
    CREATE TABLE IF NOT EXISTS img (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      img BLOB
    )
  `).run();

  db.prepare(`
    INSERT INTO img
    VALUES
    (null, @img)
  `).run({ img: resp.data });

  const postSerialize = db.prepare(`
    SELECT img
    FROM img
    WHERE id = 1`).get();
  console.log(postSerialize.img);
  fs.writeFileSync('testPostSerialize.jpg', postSerialize.img, 'binary');

  db.close();
}

main();