import Link from 'next/link';
import Image from 'next/image';
import { ViewTransition } from 'react';
import { VariantPicker, type PickVariant } from './VariantPicker';
import { NotesPyramid, NotesFlat } from './Notes';
import { ProductCard, type CardData } from '../ProductCard';
import { Reveal } from '../Reveal';
import { rub } from '@/lib/site';

export interface PerfumeViewProps {
  slug: string;
  brand: string;
  brandSlug: string;
  name: string;
  image: string | null;
  imageSize?: { w: number; h: number };
  imageFit?: 'bottle' | 'photo';
  glow: string;
  meta: { k: string; v: string }[];
  line?: string | null;
  description?: string | null;
  accords?: string[];
  pyramid?: { top: string[]; heart: string[]; base: string[] } | null;
  notes?: string[];
  priceFrom: number | null;
  variants: PickVariant[];
  more: CardData[];
}

export function PerfumeView(p: PerfumeViewProps) {
  const title = `${p.brand} ${p.name}`;
  return (
    <article className="pt-[var(--header-h)]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pb-20 pt-6 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-10">
        {/* сцена с флаконом */}
        <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-[8px] bg-noir grain sm:aspect-[5/5] lg:aspect-[4/5]">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(55% 40% at 50% 92%, ${p.glow}55, transparent 70%), radial-gradient(45% 30% at 50% 0%, rgba(166,139,91,0.14), transparent 70%)` }} />
            {p.image && p.imageFit !== 'photo' ? (
              <ViewTransition name={`bottle-${p.slug}`} share="bottle" default="none">
                <Image src={p.image} alt={title} width={p.imageSize?.w ?? 800} height={p.imageSize?.h ?? 1600} priority sizes="(max-width: 1024px) 60vw, 30vw" className="relative mb-[9%] h-[78%] w-auto select-none" draggable={false} />
              </ViewTransition>
            ) : p.image ? (
              <Image src={p.image} alt={title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="relative mb-[18%] flex flex-col items-center text-center">
                <svg viewBox="0 0 120 160" aria-hidden className="h-[46vw] max-h-[340px] text-champagne/15" fill="none" stroke="currentColor" strokeWidth="0.6">
                  <rect x="44" y="6" width="32" height="22" rx="2" /><rect x="52" y="28" width="16" height="10" /><rect x="16" y="38" width="88" height="116" rx="6" />
                </svg>
                <p className="absolute inset-x-0 top-[55%] display px-10 text-2xl leading-tight text-champagne/80">{p.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* информация */}
        <div className="flex flex-col">
          <nav aria-label="Хлебные крошки" className="text-xs text-mocha">
            <Link href="/brands" className="link-u">Бренды</Link><span className="mx-2">/</span>
            <Link href={`/brand/${p.brandSlug}`} className="link-u">{p.brand}</Link>
          </nav>
          <Link href={`/brand/${p.brandSlug}`} className="eyebrow mt-8 w-fit text-champagne link-u pb-0.5">{p.brand}</Link>
          <h1 className="display mt-4 text-[3.2rem] leading-[0.98] text-ivory sm:text-7xl">{p.name}</h1>
          {p.line ? <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-taupe">{p.line}</p> : null}

          {p.meta.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-champagne/10 py-6 sm:grid-cols-3">
              {p.meta.map((m) => (
                <div key={m.k}>
                  <dt className="eyebrow text-[0.6rem] text-mocha">{m.k}</dt>
                  <dd className="mt-1.5 text-[0.95rem] text-ivory">{m.v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="eyebrow text-champagne">Объём и цена</h2>
              {p.priceFrom ? <p className="tnum text-sm text-taupe">от {rub(p.priceFrom)}</p> : null}
            </div>
            {p.variants.length ? <VariantPicker title={title} variants={p.variants} /> : <p className="text-taupe">Цену уточните у продавца.</p>}
          </div>

          {p.accords && p.accords.length > 0 && (
            <div className="mt-12">
              <h2 className="eyebrow text-champagne">Характер</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.accords.map((a, i) => (
                  <li key={a} className="rounded-full px-4 py-1.5 text-sm text-cocoa-950" style={{ background: `color-mix(in oklab, ${p.glow} ${70 - i * 18}%, #d8c5a5)` }}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {p.description ? (
            <div className="mt-12">
              <h2 className="eyebrow text-champagne">Описание</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-taupe">{p.description}</p>
            </div>
          ) : null}
        </div>
      </div>

      {(p.pyramid || (p.notes && p.notes.length > 0)) && (
        <section aria-labelledby="notes-title" className="border-t border-champagne/10 bg-cocoa-900 py-20 sm:py-24">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
            <Reveal className="mb-12 text-center">
              <p className="eyebrow text-gold-bright">Композиция</p>
              <h2 id="notes-title" className="display mt-4 text-5xl text-ivory">Ноты аромата</h2>
            </Reveal>
            {p.pyramid ? <NotesPyramid notes={p.pyramid} accent={p.glow} /> : <div className="flex justify-center"><NotesFlat notes={p.notes!} /></div>}
          </div>
        </section>
      )}

      {p.more.length > 0 && (
        <section aria-labelledby="more-title" className="border-t border-champagne/10 py-20 sm:py-24">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="flex items-end justify-between gap-6">
              <h2 id="more-title" className="display text-4xl text-ivory sm:text-5xl">Ещё от {p.brand}</h2>
              <Link href={`/brand/${p.brandSlug}`} className="eyebrow link-u shrink-0 pb-1 text-champagne">Все ароматы</Link>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
              {p.more.map((d) => <li key={d.href}><ProductCard d={d} /></li>)}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
