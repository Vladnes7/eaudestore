// Готовит данные сайта из материалов парсинга (запускается вручную: node scripts/prepare-data.mjs)
// 1) Витрина: 343 нишевых аромата со старого сайта -> data/showcase.json + главное фото в public/showcase
// 2) Снимок прайса Тимофея -> data/price-snapshot.json (запасной источник, если Google-таблица недоступна)
// 3) Флаконы hero -> public/hero
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HOME = os.homedir();
const SRC = path.join(HOME, 'Desktop/eaudestore');
const MAT = path.join(HOME, 'Sites/eaudestore/_материалы');
const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'data');
const PUB = path.join(ROOT, 'public');
fs.mkdirSync(DATA, { recursive: true });
fs.mkdirSync(path.join(PUB, 'showcase'), { recursive: true });
fs.mkdirSync(path.join(PUB, 'hero'), { recursive: true });

function parseCSV(text) {
  const rows = []; let row = [], v = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (q && text[i + 1] === '"') { v += '"'; i++; } else q = !q; }
    else if (!q && (c === ',' || c === '\n' || c === '\r')) {
      row.push(v); v = '';
      if (c !== ',') { rows.push(row); row = []; if (c === '\r' && text[i + 1] === '\n') i++; }
    } else v += c;
  }
  if (v || row.length) { row.push(v); rows.push(row); }
  return rows;
}

const stripHtml = (h) => (h || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/[ \t]+/g, ' ').trim();

function parseNotes(text) {
  const m = text.match(/Ноты\s*:\s*([^\n]+)/i);
  if (!m) return [];
  return m[1].replace(/\.$/, '').replace(/\s+и\s+(?=[^,]+$)/, ', ').split(',')
    .map((s) => s.trim().replace(/\.$/, '')).filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

const BRAND_FIX = { 'Filippo Sorchinelli': 'Filippo Sorcinelli' };

// ---------- витрина ----------
const csv = parseCSV(fs.readFileSync(path.join(SRC, '03-каталог-товаров/каталог.csv'), 'utf8'));
const head = csv[0];
const idx = Object.fromEntries(head.map((h, i) => [h, i]));
const showcase = [];
for (const r of csv.slice(1)) {
  if (!r[idx.slug]) continue;
  const slug = r[idx.slug];
  const rawFile = path.join(SRC, '03-каталог-товаров/json-raw', slug + '.json');
  if (!fs.existsSync(rawFile)) continue;
  const raw = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
  const p = raw.product || raw;
  let brand = (r[idx['бренд']] || '').trim();
  brand = BRAND_FIX[brand] || brand;
  let title = p.title.trim();
  if (brand && title.toLowerCase().startsWith(brand.toLowerCase())) title = title.slice(brand.length).trim();
  if (!brand) { brand = 'Eaudestore'; }
  const desc = stripHtml(p.description);
  const notes = parseNotes(desc);
  const variants = (p.variants || []).map((v) => ({
    label: v.title, price: Math.round(Number(v.price)), oldPrice: v.old_price ? Math.round(Number(v.old_price)) : null, available: !!v.available,
  })).filter((v) => v.price > 0);
  // главное фото
  let image = null;
  const main = r[idx['главное_фото']];
  if (main) {
    const from = path.join(SRC, main);
    if (fs.existsSync(from)) {
      const ext = path.extname(from).toLowerCase();
      const to = path.join(PUB, 'showcase', slug + ext);
      if (!fs.existsSync(to)) fs.copyFileSync(from, to);
      image = '/showcase/' + slug + ext;
    }
  }
  const availability = (r[idx['наличие']] || '').trim();
  showcase.push({
    slug, brand, title, availability, available: r[idx.available] === 'да',
    collections: (r[idx['коллекции']] || '').split(';').map((s) => s.trim()).filter(Boolean),
    variants, notes,
    description: desc.replace(/Ноты\s*:[^\n]+/i, '').trim() || null,
    image,
  });
}
fs.writeFileSync(path.join(DATA, 'showcase.json'), JSON.stringify(showcase));
console.log('showcase', showcase.length, 'with notes', showcase.filter((s) => s.notes.length).length, 'with image', showcase.filter((s) => s.image).length);

// ---------- снимок прайса ----------
const snap = JSON.parse(fs.readFileSync(path.join(MAT, 'mini-app-ref/catalog.json'), 'utf8'));
fs.writeFileSync(path.join(DATA, 'price-snapshot.json'), JSON.stringify({ checkedAt: snap.checkedAt, rows: snap.rows }));
console.log('price rows', snap.rows.length, snap.checkedAt);

// ---------- hero ----------
for (const f of fs.readdirSync(path.join(MAT, 'фото/hero'))) {
  if (f.endsWith('.png')) fs.copyFileSync(path.join(MAT, 'фото/hero', f), path.join(PUB, 'hero', f));
}
console.log('hero copied');
