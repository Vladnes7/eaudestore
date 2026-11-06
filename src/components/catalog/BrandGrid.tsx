'use client';

import { useMemo, useState } from 'react';
import { ProductCard, type CardData } from '../ProductCard';

export type GridItem = CardData & { g: string; tester: boolean; decant: boolean };
const PAGE = 36;

export function BrandGrid({ items }: { items: GridItem[] }) {
  const [g, setG] = useState('');
  const [only, setOnly] = useState<'' | 'tester' | 'decant'>('');
  const [limit, setLimit] = useState(PAGE);
  const list = useMemo(() => items.filter((i) => (!g || i.g === g) && (!only || (only === 'tester' ? i.tester : i.decant))), [items, g, only]);
  const has = (k: string) => items.some((i) => i.g === k);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[['', 'Все'], ['w', 'Женские'], ['m', 'Мужские'], ['u', 'Унисекс']].filter(([k]) => !k || has(k)).map(([k, l]) => (
          <Chip key={k} on={g === k} onClick={() => { setG(k); setLimit(PAGE); }}>{l}</Chip>
        ))}
        {items.some((i) => i.tester) && <Chip on={only === 'tester'} onClick={() => setOnly((o) => (o === 'tester' ? '' : 'tester'))}>Тестеры</Chip>}
        {items.some((i) => i.decant) && <Chip on={only === 'decant'} onClick={() => setOnly((o) => (o === 'decant' ? '' : 'decant'))}>Распив</Chip>}
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {list.slice(0, limit).map((d) => <li key={d.href}><ProductCard d={d} /></li>)}
      </ul>
      {list.length > limit && (
        <div className="mt-10 flex justify-center"><button type="button" className="btn btn-line" onClick={() => setLimit((l) => l + PAGE * 2)}>Показать ещё {list.length - limit}</button></div>
      )}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300 active:scale-[0.97] ${on ? 'border-champagne bg-champagne text-cocoa-950' : 'border-champagne/15 text-taupe hover:border-champagne/40 hover:text-ivory'}`}>
      {children}
    </button>
  );
}
