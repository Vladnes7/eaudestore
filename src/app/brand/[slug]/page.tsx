import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BrandGrid, type GridItem } from '@/components/catalog/BrandGrid';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { getBrand, getTopBrands } from '@/lib/catalog';
import { productCard, showcaseCard, byWeight } from '@/lib/cards';

export async function generateStaticParams() {
  const top = await getTopBrands(30);
  return top.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<'/brand/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const d = await getBrand(slug);
  if (!d) return { title: 'Бренд не найден' };
  return {
    title: `${d.brand.name} — ароматы, флаконы и распив`,
    description: `${d.brand.name}: ${d.brand.count + d.brand.showcase} ароматов в прайсе Eaudestore. Флаконы, тестеры и распив, цены в рублях, заказ в Telegram.`,
  };
}

async function Content({ params }: { params: PageProps<'/brand/[slug]'>['params'] }) {
  const { slug } = await params;
  const d = await getBrand(slug);
  if (!d) notFound();
  const items: GridItem[] = [...d.products].sort(byWeight).map((p) => ({
    ...productCard(p), g: p.gender === 'man' ? 'm' : p.gender === 'woman' ? 'w' : p.gender === 'unisex' ? 'u' : '',
    tester: p.variants.some((v) => v.tester), decant: p.variants.some((v) => v.decant),
  }));
  const total = d.brand.count + d.brand.showcase;

  return (
    <>
      <header className="relative overflow-hidden bg-noir pt-[var(--header-h)] grain">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 70% at 50% 100%, rgba(166,139,91,0.16), transparent 70%)' }} />
        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center px-4 py-20 text-center sm:px-8 sm:py-28">
          <p className="eyebrow text-gold-bright">Парфюмерный дом</p>
          <Reveal>
            <h1 className="display mt-6 text-[3.4rem] uppercase leading-[0.95] tracking-[0.08em] text-ivory sm:text-8xl">{d.brand.name}</h1>
          </Reveal>
          <p className="tnum mt-6 text-taupe">
            {total} {plural(total, ['аромат', 'аромата', 'ароматов'])}
            {d.showcase.length ? ` · ${d.showcase.length} в нишевой витрине` : ''}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
        {d.showcase.length > 0 && (
          <section aria-labelledby="bn" className="mb-20">
            <h2 id="bn" className="display text-4xl text-ivory">В нишевой витрине</h2>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {d.showcase.map((s) => <li key={s.slug}><ProductCard tone="ivory" d={showcaseCard(s)} /></li>)}
            </ul>
          </section>
        )}
        {items.length > 0 && (
          <section aria-labelledby="bp">
            <h2 id="bp" className="display mb-6 text-4xl text-ivory">Из прайса</h2>
            <BrandGrid items={items} />
          </section>
        )}
      </div>
    </>
  );
}

function plural(n: number, f: [string, string, string]) {
  const a = n % 10, b = n % 100;
  return f[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? 1 : 2];
}

export default function Page({ params }: PageProps<'/brand/[slug]'>) {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-cocoa-950" />}>
      <Content params={params} />
    </Suspense>
  );
}
