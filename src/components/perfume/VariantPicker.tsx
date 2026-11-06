'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { rub, orderLink } from '@/lib/site';
import { TelegramIcon } from '../icons';

export interface PickVariant {
  id: string;
  group: string; // «Флаконы», «Тестеры», «Распив»…
  label: string;
  price: number;
  note?: string | null;
}

/** Выбор объёма + заказ в Telegram с готовым текстом. */
export function VariantPicker({ title, variants }: { title: string; variants: PickVariant[] }) {
  const groups = useMemo(() => {
    const m = new Map<string, PickVariant[]>();
    for (const v of variants) m.set(v.group, [...(m.get(v.group) ?? []), v]);
    return [...m.entries()];
  }, [variants]);
  const [group, setGroup] = useState(groups[0]?.[0] ?? '');
  const list = groups.find(([g]) => g === group)?.[1] ?? [];
  const [selId, setSelId] = useState(list[0]?.id ?? '');
  const sel = variants.find((v) => v.id === selId) ?? list[0];

  if (!variants.length) return null;
  const text = sel ? `Здравствуйте! Хочу заказать: ${title}, ${sel.label} — ${rub(sel.price)}. Есть в наличии?` : `Здравствуйте! Интересует ${title}.`;

  return (
    <div>
      {groups.length > 1 && (
        <div role="tablist" aria-label="Тип" className="mb-4 flex flex-wrap gap-1 rounded-full border border-champagne/12 p-1 w-fit">
          {groups.map(([g, l]) => (
            <button
              key={g} role="tab" aria-selected={g === group} type="button"
              onClick={() => { setGroup(g); setSelId(l[0].id); }}
              className={`relative isolate rounded-full px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${g === group ? 'text-cocoa-950' : 'text-taupe hover:text-ivory'}`}
            >
              {g === group && <motion.span layoutId="vp-tab" className="absolute inset-0 -z-10 rounded-full bg-champagne" transition={{ type: 'spring', bounce: 0, duration: 0.35 }} />}
              <span className="relative">{g}</span>
            </button>
          ))}
        </div>
      )}

      <ul role="listbox" aria-label="Варианты" className="max-h-[300px] overflow-y-auto pr-1 [scrollbar-width:thin]">
        {list.map((v) => {
          const on = v.id === sel?.id;
          return (
            <li key={v.id}>
              <button
                type="button" role="option" aria-selected={on} onClick={() => setSelId(v.id)}
                className={`group flex w-full items-center justify-between gap-4 border-b border-champagne/10 py-3.5 text-left transition-colors duration-300 ${on ? 'text-ivory' : 'text-ivory/70 hover:text-ivory'}`}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden className={`h-2 w-2 rounded-full border transition-colors duration-300 ${on ? 'border-champagne bg-champagne' : 'border-champagne/40'}`} />
                  <span>
                    <span className="text-[0.95rem]">{v.label}</span>
                    {v.note ? <span className="ml-2 text-xs text-mocha">{v.note}</span> : null}
                  </span>
                </span>
                <span className="tnum text-[0.95rem]">{rub(v.price)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a href={orderLink(text)} target="_blank" rel="noopener" className="btn btn-gold w-full sm:w-auto">
          <TelegramIcon className="h-4 w-4" />Заказать в Telegram{sel ? <span className="tnum normal-case tracking-normal opacity-70">· {rub(sel.price)}</span> : null}
        </a>
      </div>
      <p className="mt-3 text-xs text-mocha">Откроется чат с продавцом, сообщение с выбранным вариантом уже будет вписано.</p>
    </div>
  );
}
