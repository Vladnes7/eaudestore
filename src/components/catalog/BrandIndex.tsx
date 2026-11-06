'use client';

import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';
import type { Brand } from '@/lib/catalog';

const letterOf = (n: string) => {
  const c = n.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
};

export function BrandIndex({ brands, featured }: { brands: Brand[]; featured: string[] }) {
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q.trim().toLowerCase());
  const groups = useMemo(() => {
    const list = dq ? brands.filter((b) => b.name.toLowerCase().includes(dq)) : brands;
    const m = new Map<string, Brand[]>();
    for (const b of list) { const l = letterOf(b.name); m.set(l, [...(m.get(l) ?? []), b]); }
    return [...m.entries()].sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)));
  }, [brands, dq]);
  const feat = new Set(featured);

  return (
    <div>
      <div className="sticky top-[var(--header-h)] z-30 -mx-4 border-b border-champagne/10 bg-cocoa-950/90 px-4 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти бренд" aria-label="Найти бренд"
          className="display w-full border-b border-champagne/20 bg-transparent py-2 text-2xl text-ivory placeholder:text-mocha focus:border-champagne focus:outline-none"
        />
        <nav aria-label="Буквы" className="no-scrollbar mt-3 flex gap-1 overflow-x-auto">
          {groups.map(([l]) => (
            <a key={l} href={`#l-${l}`} className="flex h-8 min-w-8 items-center justify-center rounded-full text-sm text-taupe transition-colors hover:bg-cocoa-900 hover:text-ivory">{l}</a>
          ))}
        </nav>
      </div>
      <div className="mt-10 flex flex-col gap-14">
        {groups.map(([l, list]) => (
          <section key={l} id={`l-${l}`} aria-label={`Бренды на ${l}`} className="scroll-mt-[calc(var(--header-h)+140px)]">
            <h2 className="display border-b border-champagne/10 pb-3 text-5xl text-gold">{l}</h2>
            <ul className="mt-5 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((b) => (
                <li key={b.slug}>
                  <Link href={`/brand/${b.slug}`} className="group flex items-baseline justify-between gap-3 border-b border-champagne/5 py-2.5">
                    <span className={`transition-colors duration-300 group-hover:text-champagne ${feat.has(b.slug) ? 'display text-xl text-ivory' : 'text-[0.95rem] text-ivory/80'}`}>{b.name}</span>
                    <span className="tnum text-xs text-mocha">{b.count + b.showcase}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!groups.length && <p className="text-taupe">Такого бренда нет в прайсе. Напишите продавцу — возможно, привезём под заказ.</p>}
      </div>
    </div>
  );
}
