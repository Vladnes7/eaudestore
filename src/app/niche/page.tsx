import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { getShowcase } from '@/lib/catalog';
import { showcaseCard } from '@/lib/cards';
import { slugify } from '@/lib/catalog/parse';

export const metadata: Metadata = {
  title: 'Нишевая витрина: распив и флаконы',
  description: 'Нишевые ароматы Eaudestore с нотами и фото: Zoologist, Kerosene, Strangers Parfumerie, Pineward, Toskovat и другие. Распив от 1 мл.',
};

export default async function NichePage() {
  const all = await getShowcase();
  const items = all.filter((s) => s.variants.length);
  const brands = [...new Map(items.map((s) => [s.brand, slugify(s.brand)])).entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-[calc(var(--header-h)+40px)] sm:px-8">
      <p className="eyebrow text-gold-bright">Нишевая витрина · {items.length} ароматов</p>
      <h1 className="display mt-4 text-5xl text-ivory sm:text-7xl">Ниша на распив</h1>
      <p className="mt-4 max-w-xl text-taupe">Ароматы со старой витрины Eaudestore: ноты, фото и объёмы от 1 мл до полного флакона.</p>
      <nav aria-label="Бренды витрины" className="mt-8 flex flex-wrap gap-2">
        {brands.map(([name, slug]) => (
          <Link key={slug} href={`/brand/${slug}`} className="rounded-full border border-champagne/15 px-3.5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-taupe transition-colors hover:border-champagne/40 hover:text-ivory">{name}</Link>
        ))}
      </nav>
      <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((s) => <li key={s.slug}><ProductCard tone="ivory" d={showcaseCard(s)} /></li>)}
      </ul>
    </div>
  );
}
