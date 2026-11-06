import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PerfumeView } from '@/components/perfume/PerfumeView';
import { getShowcase, getShowcaseItem } from '@/lib/catalog';
import { showcaseCard } from '@/lib/cards';
import { slugify } from '@/lib/catalog/parse';
import { rub } from '@/lib/site';

export async function generateStaticParams() {
  const s = await getShowcase();
  return s.slice(0, 40).map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: PageProps<'/niche/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const s = await getShowcaseItem(slug);
  if (!s) return { title: 'Аромат не найден' };
  const from = Math.min(...s.variants.map((v) => v.price));
  return {
    title: `${s.brand} ${s.title} — распив и флакон от ${rub(from)}`,
    description: `${s.brand} ${s.title}${s.notes.length ? `: ${s.notes.slice(0, 5).join(', ')}` : ''}. Распив от 1 мл и флаконы, заказ в Telegram.`,
  };
}

async function Content({ params }: { params: PageProps<'/niche/[slug]'>['params'] }) {
  const { slug } = await params;
  const s = await getShowcaseItem(slug);
  if (!s) notFound();
  const all = await getShowcase();
  const more = all.filter((x) => x.brand === s.brand && x.slug !== s.slug).slice(0, 6).map(showcaseCard);
  const variants = s.variants.map((v, i) => ({
    id: String(i), group: /флакон|нов/i.test(v.label) || /\d{2,}\s*мл\s+\S/.test(v.label) ? 'Флаконы' : 'Распив',
    label: v.label, price: v.price, note: v.available ? null : 'нет в наличии',
  }));
  const meta = [
    { k: 'Наличие', v: s.availability || (s.available ? 'В наличии' : 'Под заказ') },
    s.variants.length ? { k: 'Объёмы', v: s.variants.map((v) => v.label.replace(' новые', '')).slice(0, 6).join(' · ') } : null,
  ].filter((x): x is { k: string; v: string } => !!x);

  return (
    <PerfumeView
      slug={'n-' + s.slug} brand={s.brand} brandSlug={slugify(s.brand)} name={s.title}
      image={s.image} imageFit="photo" glow="#a68b5b" meta={meta}
      description={s.description} notes={s.notes} priceFrom={Math.min(...s.variants.map((v) => v.price))}
      variants={variants} more={more}
    />
  );
}

export default function Page({ params }: PageProps<'/niche/[slug]'>) {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-cocoa-950" />}>
      <Content params={params} />
    </Suspense>
  );
}
