import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PerfumeView } from '@/components/perfume/PerfumeView';
import { getProduct, getBrand } from '@/lib/catalog';
import { HERO, heroBySlug } from '@/lib/hero';
import { productCard, byWeight } from '@/lib/cards';
import { toPick } from '@/lib/variants';
import { CONC_LABEL, GENDER, rub } from '@/lib/site';

export function generateStaticParams() {
  return HERO.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: PageProps<'/perfume/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: 'Аромат не найден' };
  return {
    title: `${p.brand} ${p.name} — купить от ${rub(p.priceFrom)}`,
    description: `${p.brand} ${p.name}: ${p.variants.length} вариантов в наличии и под заказ, флаконы, тестеры и распив. Цены в рублях, заказ в Telegram.`,
  };
}

async function Content({ params }: { params: PageProps<'/perfume/[slug]'>['params'] }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p || p.kind !== 'perfume') notFound();
  const hero = heroBySlug(slug);
  const brand = await getBrand(p.brandSlug);
  const more = (brand?.products ?? []).filter((x) => x.slug !== slug).sort(byWeight).slice(0, 6).map(productCard);

  const concs = [...new Set(p.variants.map((v) => v.conc).filter((c): c is string => !!c))];
  const vols = [...new Set(p.variants.filter((v) => v.volume && !v.sample && !v.decant).map((v) => v.volume!))].sort((a, b) => a - b);
  const meta = [
    concs.length ? { k: 'Концентрация', v: concs.map((c) => CONC_LABEL[c] ?? c).join(', ') } : null,
    p.gender ? { k: 'Для кого', v: GENDER[p.gender] } : hero ? { k: 'Для кого', v: GENDER[hero.gender] } : null,
    vols.length ? { k: 'Объёмы', v: vols.slice(0, 5).join(' · ') + ' мл' } : null,
    p.variants.some((v) => v.tester) ? { k: 'Тестеры', v: 'Есть' } : null,
    p.variants.some((v) => v.decant || v.sample) ? { k: 'Распив и пробники', v: 'Есть' } : null,
  ].filter((x): x is { k: string; v: string } => !!x);

  return (
    <PerfumeView
      slug={slug} brand={hero?.brand ?? p.brand} brandSlug={p.brandSlug} name={p.name}
      image={hero?.image ?? null} imageSize={hero ? { w: hero.w, h: hero.h } : undefined} glow={hero?.glow ?? '#a68b5b'}
      meta={meta} line={hero?.line} accords={hero?.accords} pyramid={hero?.notes ?? null}
      priceFrom={p.priceFrom} variants={toPick(p.variants)} more={more}
    />
  );
}

export default function Page({ params }: PageProps<'/perfume/[slug]'>) {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-cocoa-950" />}>
      <Content params={params} />
    </Suspense>
  );
}
