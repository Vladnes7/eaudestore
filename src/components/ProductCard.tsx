import Link from 'next/link';
import Image from 'next/image';
import { rub } from '@/lib/site';

export interface CardData {
  href: string;
  brand: string;
  name: string;
  priceFrom: number | null;
  image?: string | null;
  meta?: string | null; // ноты или объёмы
  badge?: string | null;
  fit?: 'cover' | 'bottle'; // bottle — вырезанный флакон на прозрачном фоне
}

/** Карточка аромата. Без фото — типографская «этикетка» вместо заглушки-картинки. */
export function ProductCard({ d, tone = 'dark' }: { d: CardData; tone?: 'dark' | 'ivory' }) {
  const ivory = tone === 'ivory';
  return (
    <Link
      href={d.href}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[6px] transition-[transform,background-color] duration-500 ease-[var(--ease-out-soft)] active:scale-[0.985] ${ivory ? 'bg-ivory text-cocoa-950' : 'bg-cocoa-900/70 text-ivory ring-1 ring-champagne/8 hover:bg-cocoa-900'}`}
    >
      <div className={`relative aspect-[4/5] overflow-hidden ${ivory ? 'bg-[#ebe3d6]' : 'bg-cocoa-950/60'}`}>
        {d.image ? (
          <Image
            src={d.image} alt={`${d.brand} ${d.name}`} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            className={`transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04] ${d.fit === 'bottle' ? 'object-contain p-[14%]' : 'object-cover'}`}
          />
        ) : (
          <Label brand={d.brand} name={d.name} ivory={ivory} />
        )}
        {d.badge ? (
          <span className={`eyebrow absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.6rem] ${ivory ? 'bg-cocoa-950 text-ivory' : 'bg-champagne text-cocoa-950'}`}>{d.badge}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className={`eyebrow text-[0.62rem] ${ivory ? 'text-mocha' : 'text-taupe'}`}>{d.brand}</p>
        <p className="display text-[1.45rem] leading-tight">{d.name}</p>
        {d.meta ? <p className={`line-clamp-1 text-[0.8rem] ${ivory ? 'text-mocha' : 'text-taupe'}`}>{d.meta}</p> : null}
        <div className="mt-auto flex items-end justify-between pt-3">
          {d.priceFrom ? <span className="tnum text-[0.95rem]">от {rub(d.priceFrom)}</span> : <span className="text-sm text-taupe">Цена по запросу</span>}
          <span aria-hidden className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 group-hover:translate-x-0.5 ${ivory ? 'bg-cocoa-950 text-ivory' : 'bg-champagne text-cocoa-950'}`}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h13m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

function Label({ brand, name, ivory }: { brand: string; name: string; ivory: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* силуэт флакона тонкой линией */}
      <svg viewBox="0 0 120 160" aria-hidden className={`absolute h-[78%] ${ivory ? 'text-cocoa-950/10' : 'text-champagne/12'}`} fill="none" stroke="currentColor" strokeWidth="0.8">
        <rect x="44" y="6" width="32" height="22" rx="2" />
        <rect x="52" y="28" width="16" height="10" />
        <rect x="16" y="38" width="88" height="116" rx="6" />
      </svg>
      <div className={`relative mx-6 mt-6 border px-4 py-5 text-center ${ivory ? 'border-cocoa-950/15 bg-ivory/60' : 'border-champagne/20 bg-cocoa-950/40'}`}>
        <p className={`eyebrow text-[0.55rem] ${ivory ? 'text-mocha' : 'text-taupe'}`}>{brand}</p>
        <p className="display mt-2 line-clamp-3 text-xl leading-tight">{name}</p>
      </div>
    </div>
  );
}
