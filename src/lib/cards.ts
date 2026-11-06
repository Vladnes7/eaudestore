import type { Product } from './catalog/parse';
import type { ShowcaseItem } from './catalog';
import type { CardData } from '@/components/ProductCard';
import { heroBySlug } from './hero';

export function productCard(p: Product): CardData {
  const vols = [...new Set(p.variants.filter((v) => !v.sample && !v.decant && v.volume).map((v) => v.volume!))].sort((a, b) => a - b);
  const concs = [...new Set(p.variants.map((v) => v.conc).filter(Boolean))];
  const hero = heroBySlug(p.slug);
  return {
    href: `/perfume/${p.slug}`, brand: p.brand, name: p.name, priceFrom: p.priceFrom,
    image: hero?.image ?? null, fit: hero ? 'bottle' : undefined,
    meta: [concs.join(' / '), vols.length ? vols.slice(0, 4).join(' · ') + ' мл' : ''].filter(Boolean).join(' — ') || null,
    badge: p.variants.some((v) => v.decant) ? 'Распив' : null,
  };
}

export function showcaseCard(s: ShowcaseItem): CardData {
  const prices = s.variants.map((v) => v.price);
  return {
    href: `/niche/${s.slug}`, brand: s.brand, name: s.title, image: s.image,
    priceFrom: prices.length ? Math.min(...prices) : null, meta: s.notes.slice(0, 3).join(' · ') || null,
    badge: s.collections.includes('new') ? 'Новинка' : null,
  };
}

/** Порядок «популярности» внутри бренда: больше вариантов в прайсе — чаще берут. */
export const byWeight = (a: Product, b: Product) => b.variants.length - a.variants.length;
