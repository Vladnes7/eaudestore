import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cacheLife } from 'next/cache';
import { buildProducts, parsePrice, slugify, normalizeSearch, type Product, type Row } from './parse';
import { HERO } from '../hero';

export type { Product, Variant } from './parse';

const SHEET_ID = '1oBChZo1L0iVX8IZy4ia8n74nJBjBrX0v099Q8Lpd5KI';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export interface ShowcaseItem {
  slug: string;
  brand: string;
  title: string;
  availability: string;
  available: boolean;
  collections: string[];
  variants: { label: string; price: number; oldPrice: number | null; available: boolean }[];
  notes: string[];
  description: string | null;
  image: string | null;
}

export interface Brand {
  slug: string;
  name: string;
  count: number; // ароматов в прайсе
  showcase: number; // ароматов в витрине
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], v = '', q = false;
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

/** Живой прайс из Google-таблицы Тимофея (обновляется раз в час); при ошибке — сохранённый снимок. */
async function getRows(): Promise<{ rows: Row[]; source: 'live' | 'snapshot'; checkedAt: string }> {
  'use cache';
  cacheLife('hours');
  try {
    const res = await fetch(CSV_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const table = parseCSV(await res.text());
    const head = table[0]?.map((s) => s.replace(/^﻿/, '').toUpperCase()) ?? [];
    if (!head[0]?.includes('НАИМЕНОВАНИЕ') || !head[1]?.includes('ЦЕНА')) throw new Error('Изменились колонки таблицы');
    const rows: Row[] = [];
    const seen = new Set<string>();
    for (const r of table.slice(1)) {
      const name = (r[0] ?? '').trim();
      const price = parsePrice(r[1] ?? '');
      if (!name || !(price > 0)) continue;
      const k = name + '|' + price; if (seen.has(k)) continue; seen.add(k);
      rows.push([name, price]);
    }
    if (rows.length < 1000) throw new Error('Подозрительно мало строк: ' + rows.length);
    return { rows, source: 'live', checkedAt: new Date().toISOString() };
  } catch {
    const s = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data/price-snapshot.json'), 'utf8'));
    return { rows: s.rows, source: 'snapshot', checkedAt: s.checkedAt };
  }
}

export async function getShowcase(): Promise<ShowcaseItem[]> {
  'use cache';
  cacheLife('max');
  return JSON.parse(await fs.readFile(path.join(process.cwd(), 'data/showcase.json'), 'utf8'));
}

// Разбор 45 тыс. строк занимает ~200 мс: держим результат в памяти процесса, пока не сменится прайс.
let memo: { key: string; value: Awaited<ReturnType<typeof compute>> } | null = null;

async function compute() {
  const { rows, source, checkedAt } = await getRows();
  const products = buildProducts(rows);
  const showcase = await getShowcase();
  const brandMap = new Map<string, Brand>();
  for (const p of products) {
    if (p.kind !== 'perfume') continue;
    const b = brandMap.get(p.brandSlug) ?? { slug: p.brandSlug, name: p.brand, count: 0, showcase: 0 };
    b.count++; brandMap.set(p.brandSlug, b);
  }
  for (const s of showcase) {
    const slug = slugify(s.brand);
    const b = brandMap.get(slug) ?? { slug, name: s.brand, count: 0, showcase: 0 };
    b.showcase++; brandMap.set(slug, b);
  }
  const brands = [...brandMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return { products, bySlug: new Map(products.map((p) => [p.slug, p])), showcase, brands, source, checkedAt };
}

async function catalog() {
  const { checkedAt } = await getRows();
  if (!memo || memo.key !== checkedAt) memo = { key: checkedAt, value: await compute() };
  return memo.value;
}

export async function getProduct(slug: string): Promise<Product | null> {
  'use cache';
  cacheLife('hours');
  return (await catalog()).bySlug.get(slug) ?? null;
}

export async function getProducts(slugs: string[]): Promise<(Product | null)[]> {
  'use cache';
  cacheLife('hours');
  const c = await catalog();
  return slugs.map((s) => c.bySlug.get(s) ?? null);
}

export async function getShowcaseItem(slug: string) {
  const s = await getShowcase();
  return s.find((x) => x.slug === slug) ?? null;
}

export async function getBrands(): Promise<Brand[]> {
  'use cache';
  cacheLife('hours');
  return (await catalog()).brands;
}

export async function getBrand(slug: string) {
  'use cache';
  cacheLife('hours');
  const c = await catalog();
  const brand = c.brands.find((b) => b.slug === slug);
  if (!brand) return null;
  const products = c.products.filter((p) => p.brandSlug === slug && p.kind === 'perfume');
  const showcase = c.showcase.filter((s) => slugify(s.brand) === slug);
  return { brand, products, showcase };
}

/** Самые «весомые» бренды для главной: бренды hero первыми, дальше по числу ароматов. */
export async function getTopBrands(n = 24): Promise<Brand[]> {
  'use cache';
  cacheLife('hours');
  const c = await catalog();
  const pinned = HERO.map((h) => slugify(h.brand === 'Lancôme' ? 'Lancome' : h.brand));
  const score = (b: Brand) => b.count + b.showcase * 3;
  const top = [...c.brands].sort((a, b) => score(b) - score(a));
  const head = pinned.map((s) => top.find((b) => b.slug === s)).filter((b): b is Brand => !!b);
  const rest = top.filter((b) => !pinned.includes(b.slug));
  return [...new Map([...head, ...rest].map((b) => [b.slug, b])).values()].slice(0, n);
}

/** Компактный индекс для поиска на клиенте. */
export interface IndexItem {
  h: string; // ссылка на страницу
  b: string; // бренд
  bs: string; // slug бренда
  n: string; // название
  g: 'm' | 'w' | 'u' | ''; // пол
  p: number; // цена от
  v: number[]; // объёмы
  c: string[]; // концентрации
  t: 0 | 1; // есть тестер
  w: 0 | 1; // витрина (нишевые со старого сайта)
  q?: string; // доп. строка поиска (ноты); бренд и название клиент нормализует сам
  i?: string; // фото
  f?: 'bottle'; // фото — вырезанный флакон
}

export async function getSearchIndex(): Promise<{ items: IndexItem[]; checkedAt: string; source: string }> {
  'use cache';
  cacheLife('hours');
  const c = await catalog();
  const items: IndexItem[] = [];
  const heroSlugs = new Set(HERO.map((h) => h.slug));
  // сначала шесть флаконов главной, затем ниша с фото, затем весь прайс
  for (const h of HERO) {
    const p = c.bySlug.get(h.slug); if (!p) continue;
    const vols = [...new Set(p.variants.map((v) => v.volume).filter((x): x is number => !!x))].sort((a, b) => a - b);
    items.push({ h: '/perfume/' + p.slug, b: h.brand, bs: p.brandSlug, n: p.name, g: h.gender === 'man' ? 'm' : 'w', p: p.priceFrom, v: vols, c: [], t: p.variants.some((v) => v.tester) ? 1 : 0, w: 0, q: normalizeSearch(h.brand + ' ' + p.name + ' ' + [...h.notes.top, ...h.notes.heart, ...h.notes.base].join(' ')), i: h.image, f: 'bottle' });
  }
  for (const s of [...c.showcase].sort((a, b) => Number(!!b.image) - Number(!!a.image))) {
    const prices = s.variants.map((v) => v.price);
    items.push({
      h: '/niche/' + s.slug, b: s.brand, bs: slugify(s.brand), n: s.title, g: '', p: prices.length ? Math.min(...prices) : 0,
      v: [], c: [], t: 0, w: 1, q: normalizeSearch(s.brand + ' ' + s.title + ' ' + s.notes.join(' ')), i: s.image ?? undefined,
    });
  }
  for (const p of c.products) {
    if (p.kind !== 'perfume' || heroSlugs.has(p.slug)) continue;
    const vols = [...new Set(p.variants.map((v) => v.volume).filter((x): x is number => !!x))].sort((a, b) => a - b);
    const concs = [...new Set(p.variants.map((v) => v.conc).filter((x): x is string => !!x))];
    items.push({
      h: '/perfume/' + p.slug, b: p.brand, bs: p.brandSlug, n: p.name,
      g: p.gender === 'man' ? 'm' : p.gender === 'woman' ? 'w' : p.gender === 'unisex' ? 'u' : '',
      p: p.priceFrom, v: vols, c: concs, t: p.variants.some((v) => v.tester) ? 1 : 0, w: 0,
    });
  }
  return { items, checkedAt: c.checkedAt, source: c.source };
}
