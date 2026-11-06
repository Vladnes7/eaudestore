// Разбор прайса Тимофея: строка «HERMES EAU D HERMES edt 100ml TESTER» -> бренд, аромат, вариант.
// Прайс отсортирован по алфавиту, бренд нигде не указан явно, поэтому бренд вычисляется
// по статистике префиксов (см. detectBrands) + ручные поправки.

export type Row = [name: string, price: number];

export type Kind = 'perfume' | 'other';
export type Gender = 'man' | 'woman' | 'unisex';

export interface Variant {
  raw: string;
  price: number;
  conc: string | null; // EDP / EDT / EDC / Parfum / Extrait
  volume: number | null; // мл
  tester: boolean;
  sample: boolean; // пробник / мини
  decant: boolean; // отливант
  damaged: boolean; // подмятая упаковка и т.п.
  set: boolean;
  extra: string | null; // хвост, который не распознан (refill, travel, LIMITED…)
}

export interface Product {
  slug: string;
  brand: string;
  brandSlug: string;
  name: string;
  kind: Kind;
  gender: Gender | null;
  variants: Variant[];
  priceFrom: number;
}

const CONC: Record<string, string> = {
  edp: 'EDP', edt: 'EDT', edc: 'EDC', parfume: 'Parfum', parfum: 'Parfum', perfume: 'Parfum', extrait: 'Extrait', 'elixir': 'Elixir',
};

const STOP = /^(edp|edt|edc|parfume?|perfume|extrait|MAN|WOMAN|UNISEX|MEN|LADY)$/;
const VOL = /^(\d+(?:[.,]\d+)?)(ml|мл|gr|g|гр)$/i;
const OTHER = /\b(b\/l|sh\/g|b\/oil|b\/spray|b\/cream|a\/sh|hair|mist|deo|stick|candle|soap|lotion|cream|gel|shower|bath|body|scrub|diffuser|sachet|pouch|case|milk|micellar|cleanser|balm|mascara|lipstick|serum)\b|чехол|крем|гель|лосьон|мыло|свеч|шампун|пена|скраб|дезодор|диффуз|масло|бальзам|пудр|помад|тушь|крышк|атомайз|сумк|косметичк|ароматизат|пакет|коробк/i;

const GENERIC_FIRST = new Set([
  'MAISON', 'THE', 'LES', 'LE', 'LA', 'L', 'ATELIER', 'MARC', 'JACQUES', 'RAMON', 'ARABIAN', 'JEAN', 'PIERRE', 'HOUSE', 'PARFUMS',
  'PARFUM', 'ACQUA', 'ETAT', 'EAU', 'DE', 'DR.', 'DR', 'MAX', 'BY', 'ST', 'SAINT', 'MAD', 'NEW', 'MR', 'MISS', 'LORD', 'ROYAL', 'AL',
  'ARD', 'ART', 'LAB', 'DUA', 'ESSENTIAL', 'FRAGRANCE', 'FRENCH', 'GIORGIO', 'CAROLINA', 'CHRISTIAN', 'SALVATORE', 'RALPH', 'MICHAEL',
  'KARL', 'ELIZABETH', 'ESTEE', 'JIMMY', 'ROBERTO', 'NINA', 'NARCISO', 'ISSEY', 'VAN', 'VIKTOR', 'YVES', 'ZADIG', 'ABERCROMBIE',
]);

// Итоговое имя бренда для префиксов, которые эвристика режет неверно.
const BRAND_OVERRIDE: [prefix: string, brand: string][] = [
  ['HUGO BOSS', 'HUGO BOSS'], ['ISSEY MIYAKE', 'ISSEY MIYAKE'], ['MAISON MARGIELA', 'MAISON MARGIELA'],
  ['MAISON FRANCIS KURKDJIAN', 'MAISON FRANCIS KURKDJIAN'], ['MARC JACOBS', 'MARC JACOBS'], ['MARC ANTOINE BARROIS', 'MARC-ANTOINE BARROIS'],
  ['JEAN PAUL GAULTIER', 'JEAN PAUL GAULTIER'], ['GIORGIO ARMANI', 'GIORGIO ARMANI'], ['CHRISTIAN DIOR', 'DIOR'],
  ['YVES SAINT LAURENT', 'YSL'], ['YSL', 'YSL'], ['ETAT LIBRE D ORANGE', 'ETAT LIBRE D\'ORANGE'], ['LE LABO', 'LE LABO'],
  ['THE HOUSE OF OUD', 'THE HOUSE OF OUD'], ['THE MERCHANT OF VENICE', 'THE MERCHANT OF VENICE'], ['THE DIFFERENT COMPANY', 'THE DIFFERENT COMPANY'],
  ['ACQUA DI PARMA', 'ACQUA DI PARMA'], ['PARFUMS DE MARLY', 'PARFUMS DE MARLY'], ['CAROLINA HERRERA', 'CAROLINA HERRERA'],
  ['DOLCE & GABBANA', 'DOLCE & GABBANA'], ['LOUIS VUITTON', 'LOUIS VUITTON'], ['TOM FORD', 'TOM FORD'], ['JO MALONE', 'JO MALONE'],
  ['HAUTE FRAGRANCE COMPANY', 'HAUTE FRAGRANCE COMPANY'], ['BORNTOSTANDOUT', 'BORNTOSTANDOUT'], ['STEPHANE HUMBERT LUCAS', 'STEPHANE HUMBERT LUCAS 777'],
  ['INITIO', 'INITIO PARFUMS PRIVES'], ['VAN CLEEF', 'VAN CLEEF & ARPELS'], ['VIKTOR & ROLF', 'VIKTOR & ROLF'], ['ZADIG & VOLTAIRE', 'ZADIG & VOLTAIRE'],
  ['ABERCROMBIE & FITCH', 'ABERCROMBIE & FITCH'], ['PACO RABANNE', 'PACO RABANNE'], ['RABANNE', 'PACO RABANNE'],
];

const KEEP_UPPER = new Set(['YSL', 'DKNY', 'HFC', 'BDK', 'CK', 'MFK', 'BTSO', 'EX', 'LM', 'II', 'III', 'IV', 'XX', 'NYC', 'USA', 'UK', 'EDP', 'EDT', 'N5', 'L\'EAU']);

// Как бренды пишутся на самом деле (с диакритикой)
const DISPLAY: Record<string, string> = {
  Lancome: 'Lancôme', Hermes: 'Hermès', Chloe: 'Chloé', 'Etat Libre D\'orange': 'Etat Libre d\'Orange', 'Penhaligons': 'Penhaligon\'s',
  'Thierry Mugler': 'Mugler', 'Estee Lauder': 'Estée Lauder', 'Maison Francis Kurkdjian': 'Maison Francis Kurkdjian', 'Comme des Garcons': 'Comme des Garçons',
  'Van Cleef & Arpels': 'Van Cleef & Arpels', 'M.micallef': 'M. Micallef', 'EX Nihilo': 'Ex Nihilo', 'Dior': 'Dior',
};
export const displayBrand = (b: string) => DISPLAY[b] ?? b;

export function titleCase(s: string) {
  return s.split(' ').map((w) => {
    if (KEEP_UPPER.has(w) || /\d/.test(w) && w.length <= 4) return w;
    if (w.length <= 1) return w.toUpperCase();
    return w.charAt(0) + w.slice(1).toLowerCase();
  }).join(' ').replace(/\b(De|Du|Di|Da|Of|The|And|La|Le|Les|D|L|Des|By|En|Et|A|Au|Aux)\b/g, (m, _p, off) => (off === 0 ? m : m.toLowerCase()))
    .replace(/\b(d|l) /g, "$1'");
}

export function slugify(s: string) {
  const map: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '' };
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[а-яё]/g, (c) => map[c] ?? '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function normalizeSearch(s: string) {
  return slugify(s).replace(/-/g, ' ');
}

/** Слова до первого «служебного» токена (концентрация, пол, объём, кириллица). */
function headWords(name: string): string[] {
  const out: string[] = [];
  for (const w of name.split(/\s+/)) {
    if (!w) continue;
    if (STOP.test(w) || VOL.test(w) || /[а-яё]/i.test(w) || /^\d+\*\d/.test(w) || /^[a-z]/.test(w)) break;
    out.push(w);
  }
  return out;
}

/** Определяет бренд для каждой строки по статистике префиксов. */
export function detectBrands(names: string[]): string[] {
  const heads = names.map(headWords);
  const pre = new Map<string, number>();
  const next = new Map<string, Map<string, number>>();
  for (const t of heads) {
    for (let k = 1; k <= Math.min(5, t.length); k++) {
      const p = t.slice(0, k).join(' ');
      pre.set(p, (pre.get(p) ?? 0) + 1);
      if (k < t.length) {
        let m = next.get(p); if (!m) next.set(p, (m = new Map()));
        m.set(t[k], (m.get(t[k]) ?? 0) + 1);
      }
    }
  }
  return heads.map((t, i) => {
    if (!t.length) return names[i].split(/\s+/)[0] || '—';
    const joined = t.join(' ');
    for (const [p, b] of BRAND_OVERRIDE) if (joined === p || joined.startsWith(p + ' ')) return b;
    let k = 1;
    while (k < t.length) {
      const p = t.slice(0, k).join(' ');
      const m = next.get(p);
      if (!m) break;
      let top = 0; for (const v of m.values()) if (v > top) top = v;
      const share = top / (pre.get(p) ?? 1);
      if (share >= 0.6 || (k === 1 && GENERIC_FIRST.has(t[0])) || t[k - 1].length <= 2) k++;
      else break;
    }
    // бренд не должен съедать всё название
    if (k >= t.length && t.length > 1) k = t.length - 1;
    return t.slice(0, k).join(' ');
  });
}

export function parseVariant(raw: string, price: number, brand: string): { name: string; v: Variant; kind: Kind; gender: Gender | null } {
  let rest = raw.startsWith(brand) ? raw.slice(brand.length).trim() : raw;
  // CHRISTIAN DIOR -> DIOR и др. переименования: срезаем исходный префикс
  for (const [p, b] of BRAND_OVERRIDE) if (b === brand && raw.startsWith(p)) { rest = raw.slice(p.length).trim(); break; }
  const words = rest.split(/\s+/).filter(Boolean);
  const nameParts: string[] = []; const tail: string[] = [];
  let conc: string | null = null, volume: number | null = null, gender: Gender | null = null;
  let inTail = false;
  for (const w of words) {
    const lw = w.toLowerCase();
    if (CONC[lw] && /^[a-z]/.test(w)) { conc = CONC[lw]; inTail = true; continue; }
    if (w === 'MAN' || w === 'MEN') { gender = 'man'; inTail = true; continue; }
    if (w === 'WOMAN' || w === 'LADY') { gender = 'woman'; inTail = true; continue; }
    if (w === 'UNISEX') { gender = 'unisex'; inTail = true; continue; }
    const vm = w.match(VOL);
    if (vm) { volume = Number(vm[1].replace(',', '.')); inTail = true; continue; }
    if (inTail || /[а-яё]/i.test(w) || /^[a-z]/.test(w) || /^\d+[*xх]\d/i.test(w) || w === 'TESTER' || w === '+') { inTail = true; tail.push(w); continue; }
    nameParts.push(w);
  }
  const t = tail.join(' ');
  const v: Variant = {
    raw, price, conc, volume,
    tester: /\bTESTER\b|тестер/i.test(raw),
    sample: /пробник|\bmini\b|miniature|vial/i.test(raw),
    decant: /отливант/i.test(raw),
    damaged: /подмят|без короб|без крыш|дефект|повреж|vintage/i.test(raw),
    set: /\bset\b|набор|\d+\s*[*xх]\s*\d+\s*ml|\s\+\s/i.test(raw),
    extra: t.replace(/\b(TESTER|ОТЛИВАНТ|пробник|подмят)\b/gi, '').replace(/\s+/g, ' ').trim() || null,
  };
  const isOther = (OTHER.test(raw) && !conc) || /^[а-яё-]/i.test(raw.trim());
  return { name: nameParts.join(' ') || rest.split(/\s+/)[0] || raw, v, kind: isOther ? 'other' : 'perfume', gender };
}

export function buildProducts(rows: Row[]): Product[] {
  const brands = detectBrands(rows.map((r) => r[0]));
  const map = new Map<string, Product & { _g: Record<string, number> }>();
  rows.forEach(([raw, price], i) => {
    const brand = brands[i];
    const { name, v, kind, gender } = parseVariant(raw, price, brand);
    const key = brand + '|' + name + '|' + kind;
    let p = map.get(key);
    if (!p) {
      const brandName = displayBrand(titleCase(brand));
      p = { slug: '', brand: brandName, brandSlug: slugify(brand), name: titleCase(name), kind, gender: null, variants: [], priceFrom: 0, _g: {} };
      map.set(key, p);
    }
    p.variants.push(v);
    if (gender) p._g[gender] = (p._g[gender] ?? 0) + 1;
  });
  const used = new Set<string>();
  const out: Product[] = [];
  for (const p of map.values()) {
    const g = Object.entries(p._g).sort((a, b) => b[1] - a[1])[0];
    p.gender = (g?.[0] as Gender) ?? null;
    p.variants.sort((a, b) => Number(a.tester) - Number(b.tester) || Number(a.sample) - Number(b.sample) || (a.volume ?? 0) - (b.volume ?? 0) || a.price - b.price);
    // «от» — самая низкая цена среди обычных позиций (без наборов и дефектных упаковок)
    const plain = p.variants.filter((v) => !v.set && !v.damaged);
    p.priceFrom = Math.min(...(plain.length ? plain : p.variants).map((v) => v.price));
    let s = slugify(p.brand + ' ' + p.name + (p.kind === 'other' ? ' cosmetics' : ''));
    let n = 2; const base = s; while (used.has(s)) s = base + '-' + n++;
    used.add(s); p.slug = s;
    const { _g, ...clean } = p; void _g;
    out.push(clean);
  }
  return out;
}

/** Цена «3 374 ₽» -> 3374 */
export function parsePrice(raw: string) {
  const n = Number(String(raw).replace(/[\s ₽]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}
