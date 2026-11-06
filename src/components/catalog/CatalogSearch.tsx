'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '../ProductCard';
import { SearchIcon } from '../icons';
import type { IndexItem } from '@/lib/catalog';

const norm = (s: string) => {
  const map: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '' };
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[а-яё]/g, (c) => map[c] ?? '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
};

type Sort = 'rel' | 'asc' | 'desc';
const GENDERS = [{ k: '', l: 'Все' }, { k: 'w', l: 'Женские' }, { k: 'm', l: 'Мужские' }, { k: 'u', l: 'Унисекс' }] as const;
const PAGE = 48;

export function CatalogSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const [data, setData] = useState<{ items: IndexItem[]; checkedAt: string } | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [g, setG] = useState(sp.get('g') ?? '');
  const [niche, setNiche] = useState(sp.get('niche') === '1');
  const [tester, setTester] = useState(sp.get('tester') === '1');
  const [sort, setSort] = useState<Sort>((sp.get('sort') as Sort) ?? 'rel');
  const [limit, setLimit] = useState(PAGE);
  const input = useRef<HTMLInputElement>(null);
  const dq = useDeferredValue(q);

  useEffect(() => {
    let alive = true;
    fetch('/api/catalog').then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { items: IndexItem[]; checkedAt: string }) => {
        for (const it of d.items) it.q = norm(it.b + ' ' + it.n) + (it.q ? ' ' + it.q : '');
        if (alive) setData(d);
      }).catch(() => alive && setError(true));
    if (location.hash === '#search') input.current?.focus();
    return () => { alive = false; };
  }, []);

  // состояние фильтров — в адресе, чтобы ссылкой можно было поделиться
  useEffect(() => {
    const p = new URLSearchParams();
    if (dq) p.set('q', dq); if (g) p.set('g', g); if (niche) p.set('niche', '1'); if (tester) p.set('tester', '1'); if (sort !== 'rel') p.set('sort', sort);
    router.replace(p.size ? `/catalog?${p}` : '/catalog', { scroll: false });
  }, [dq, g, niche, tester, sort, router]);
  // новая выдача — снова первая страница
  const filterKey = [dq, g, niche, tester, sort].join('|');
  const [seenKey, setSeenKey] = useState(filterKey);
  if (seenKey !== filterKey) { setSeenKey(filterKey); setLimit(PAGE); }

  const results = useMemo(() => {
    if (!data) return [];
    const terms = norm(dq).split(' ').filter(Boolean);
    let list = data.items.filter((it) =>
      (!g || it.g === g) && (!niche || it.w === 1) && (!tester || it.t === 1) && terms.every((t) => it.q!.includes(t)));
    if (terms.length && sort === 'rel') {
      const first = terms[0];
      list = [...list].sort((a, b) => Number(!b.q!.startsWith(first)) - Number(!a.q!.startsWith(first)) || b.w - a.w);
    }
    if (sort === 'asc') list = [...list].sort((a, b) => a.p - b.p);
    if (sort === 'desc') list = [...list].sort((a, b) => b.p - a.p);
    return list;
  }, [data, dq, g, niche, tester, sort]);

  return (
    <div>
      <div className="sticky top-[var(--header-h)] z-30 -mx-4 border-b border-champagne/10 bg-cocoa-950/90 px-4 pb-4 pt-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <label className="relative block">
          <span className="sr-only">Поиск по бренду, названию или ноте</span>
          <SearchIcon className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-taupe" />
          <input
            ref={input} id="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" enterKeyHint="search"
            placeholder="Бренд, аромат или нота: Aventus, Baccarat, ваниль…"
            className="display w-full border-b border-champagne/20 bg-transparent py-3 pl-9 text-2xl text-ivory placeholder:text-mocha focus:border-champagne focus:outline-none sm:text-3xl"
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {GENDERS.map((x) => (
            <Chip key={x.k} on={g === x.k} onClick={() => setG(x.k)}>{x.l}</Chip>
          ))}
          <span className="mx-1 h-5 w-px bg-champagne/15" aria-hidden />
          <Chip on={niche} onClick={() => setNiche((v) => !v)}>Нишевая витрина</Chip>
          <Chip on={tester} onClick={() => setTester((v) => !v)}>Есть тестер</Chip>
          <label className="ml-auto flex items-center gap-2 text-xs text-taupe">
            <span className="sr-only sm:not-sr-only">Сортировка</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full border border-champagne/15 bg-cocoa-950 px-3 py-2 text-base text-ivory sm:text-xs">
              <option value="rel">По умолчанию</option>
              <option value="asc">Сначала дешевле</option>
              <option value="desc">Сначала дороже</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mt-6 text-sm text-taupe" aria-live="polite">
        {error ? 'Каталог не загрузился. Обновите страницу или напишите продавцу в Telegram.'
          : !data ? 'Загружаем каталог…'
          : results.length ? `Найдено: ${new Intl.NumberFormat('ru-RU').format(results.length)}`
          : 'Ничего не нашлось. Попробуйте другое написание или напишите продавцу: найдём под заказ.'}
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {!data && !error && Array.from({ length: 12 }, (_, i) => <li key={i} className="aspect-[4/6.4] animate-pulse rounded-[6px] bg-cocoa-900/60" />)}
        {results.slice(0, limit).map((it) => (
          <li key={it.h}>
            <ProductCard d={{ href: it.h, brand: it.b, name: it.n, priceFrom: it.p || null, meta: it.v.length ? it.v.slice(0, 4).join(' · ') + ' мл' : it.w ? 'Нишевая витрина' : null, badge: it.w ? 'Ниша' : null, image: it.i ?? null, fit: it.f }} />
          </li>
        ))}
      </ul>
      {results.length > limit && (
        <div className="mt-12 flex justify-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE * 2)} className="btn btn-line">Показать ещё</button>
        </div>
      )}
      {data && <p className="mt-10 text-xs text-mocha">Цены обновляются из прайса продавца. Последняя сверка: {new Date(data.checkedAt).toLocaleDateString('ru-RU')}.</p>}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" aria-pressed={on} onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300 active:scale-[0.97] ${on ? 'border-champagne bg-champagne text-cocoa-950' : 'border-champagne/15 text-taupe hover:border-champagne/40 hover:text-ivory'}`}
    >
      {children}
    </button>
  );
}
