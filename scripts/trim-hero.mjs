import sharp from 'sharp';
import fs from 'node:fs';
const src='/Users/vladislav/Sites/eaudestore/_материалы/фото/hero', out='/Users/vladislav/Sites/eaudestore/site/public/hero';
for (const f of fs.readdirSync(src).filter(f=>/^0\d-.*\.png$/.test(f))) {
  const img = sharp(`${src}/${f}`).trim({ threshold: 8 });
  const { data, info } = await img.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(`${out}/${f}`, data);
  console.log(f, info.width+'x'+info.height, (info.width/info.height).toFixed(3));
}
