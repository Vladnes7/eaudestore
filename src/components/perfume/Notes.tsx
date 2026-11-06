import { Reveal } from '../Reveal';

/** Пирамида нот: верх → сердце → база. Ширина ряда растёт к основанию, как у настоящей пирамиды. */
export function NotesPyramid({ notes, accent }: { notes: { top: string[]; heart: string[]; base: string[] }; accent: string }) {
  const rows = [
    { k: 'Верхние ноты', d: 'Первые 15 минут', v: notes.top, w: 'md:w-[62%]' },
    { k: 'Ноты сердца', d: 'Следующие часы', v: notes.heart, w: 'md:w-[81%]' },
    { k: 'Базовые ноты', d: 'Шлейф до конца дня', v: notes.base, w: 'md:w-full' },
  ];
  return (
    <div className="flex flex-col items-center gap-3">
      {rows.map((r, i) => (
        <Reveal key={r.k} delay={i * 0.08} className={`w-full ${r.w}`}>
          <div className="relative overflow-hidden rounded-[6px] border border-champagne/10 bg-cocoa-950/50 px-5 py-6 text-center">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-1/2 h-full" style={{ background: `radial-gradient(50% 60% at 50% 100%, ${accent}22, transparent)` }} />
            <p className="eyebrow text-[0.62rem] text-champagne">{r.k}</p>
            <p className="mt-1 text-[0.7rem] text-mocha">{r.d}</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-2 gap-y-2">
              {r.v.map((n) => (
                <li key={n} className="display rounded-full border border-champagne/15 px-3.5 py-1 text-lg text-ivory">{n}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** Ноты без деления на уровни (как в старом каталоге). */
export function NotesFlat({ notes }: { notes: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {notes.map((n) => (
        <li key={n} className="display rounded-full border border-champagne/15 bg-cocoa-950/40 px-4 py-1.5 text-xl text-ivory">{n}</li>
      ))}
    </ul>
  );
}
