'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ViewTransition, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { HeroBottle } from '@/lib/hero';
import { rub, orderLink } from '@/lib/site';
import { ArrowIcon, TelegramIcon } from '../icons';

export type HeroItem = HeroBottle & { priceFrom: number | null };

// Расстановка «воронкой» в глубину: передний ряд у краёв и крупнее, дальний — у центра и мельче.
// x — центр флакона в % ширины; b — нижняя кромка в % высоты; hd/hm — высота картинки на десктопе / телефоне.
const TIERS = [
  { x: 13, xm: 16, b: 7, bm: 5, hd: 'min(56svh, 31vw)', hm: 'min(74vw, 44svh)', z: 30, dim: 1 },
  { x: 26.5, xm: 32, b: 14, bm: 12, hd: 'min(41svh, 23vw)', hm: 'min(55vw, 33svh)', z: 20, dim: 0.86 },
  { x: 40, xm: 41, b: 20, bm: 18, hd: 'min(30svh, 17vw)', hm: 'min(41vw, 24svh)', z: 10, dim: 0.72 },
] as const;

const spring = { type: 'spring', bounce: 0, duration: 0.5 } as const;

export function Hero({ items, total }: { items: HeroItem[]; total: number }) {
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const current = items.find((i) => i.slug === active) ?? null;

  return (
    <section aria-label="Главные ароматы" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-noir grain" onPointerLeave={() => setActive(null)}>
      {/* тёплый свет сверху и линия «пола» */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 45% at 50% 0%, rgba(166,139,91,0.13), transparent 70%)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%]" style={{ background: 'linear-gradient(to top, rgba(42,28,21,0.55), transparent)' }} />

      {/* заголовок */}
      <div className="relative z-40 mx-auto flex max-w-3xl flex-col items-center px-6 pt-[calc(var(--header-h)+4svh)] text-center md:pt-[calc(var(--header-h)+5svh)]">
        <motion.p
          className="eyebrow text-champagne/80"
          initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, duration: 0.9, delay: 1.1 }}
        >
          Niche decants &amp; full bottles
        </motion.p>
        <motion.h1
          className="display mt-4 text-[2.5rem] leading-[0.98] text-ivory sm:text-6xl lg:text-[4.6rem]"
          initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ ...spring, duration: 1.1, delay: 1.2 }}
        >
          Мировые хиты<br /><span className="italic text-champagne">и&nbsp;редкая</span> ниша
        </motion.h1>
        <motion.p
          className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-taupe sm:mt-5 sm:text-[0.95rem]"
          initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.45 }}
        >
          Полные флаконы и распив от&nbsp;1&nbsp;мл. Более {Math.floor(total / 1000) * 1000 > 0 ? new Intl.NumberFormat('ru-RU').format(Math.floor(total / 1000) * 1000) : 'тысячи'} ароматов, цены в&nbsp;рублях, заказ в&nbsp;Telegram.
        </motion.p>
        <motion.div
          className="mt-7 flex flex-wrap justify-center gap-2 sm:gap-3"
          initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, duration: 0.8, delay: 1.6 }}
        >
          <Link href="/catalog" className="btn btn-gold max-sm:h-11 max-sm:px-5">Открыть каталог</Link>
          <a href={orderLink()} target="_blank" rel="noopener" className="btn btn-line max-sm:h-11 max-sm:px-5"><TelegramIcon className="h-4 w-4" /><span className="sm:hidden">Telegram</span><span className="max-sm:hidden">Написать продавцу</span></a>
        </motion.div>
      </div>

      {/* флаконы */}
      <div className="absolute inset-0">
        {items.map((item) => {
          const t = TIERS[item.tier];
          const x = item.side === 'left' ? t.x : 100 - t.x;
          const xm = item.side === 'left' ? t.xm : 100 - t.xm;
          const isActive = active === item.slug;
          const dimmed = active !== null && !isActive;
          return (
            <motion.div
              key={item.slug}
              className="absolute left-[var(--xm)] bottom-[var(--bm)] md:left-[var(--x)] md:bottom-[var(--b)]"
              style={{ ['--x' as string]: `${x}%`, ['--xm' as string]: `${xm}%`, ['--b' as string]: `${t.b}%`, ['--bm' as string]: `${t.bm}%`, zIndex: t.z, translateX: '-50%' }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: item.side === 'left' ? '-55vw' : '55vw', filter: 'blur(16px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={reduce ? { duration: 0.6 } : { type: 'spring', bounce: 0, duration: 1.7, delay: 0.15 + item.tier * 0.22 + (item.side === 'right' ? 0.06 : 0) }}
            >
              <Link
                href={`/perfume/${item.slug}`}
                aria-label={`${item.brand} ${item.name}${item.priceFrom ? `, от ${rub(item.priceFrom)}` : ''}`}
                className="group relative block focus-visible:outline-none"
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(item.slug)}
                onFocus={() => setActive(item.slug)}
                onBlur={() => setActive(null)}
                style={{ ['--hd' as string]: `calc(${t.hd} * ${item.scale})`, ['--hm' as string]: `calc(${t.hm} * ${item.scale})` }}
              >
                {/* свечение снизу — цветом аромата */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 bottom-[4%] h-[22%] w-[115%] -translate-x-1/2 rounded-[50%]"
                  style={{ background: `radial-gradient(closest-side, ${item.glow}, transparent)`, filter: 'blur(26px)' }}
                  animate={{ opacity: isActive ? 0.95 : 0, scale: isActive ? 1 : 0.7 }}
                  transition={spring}
                />
                {/* мягкий свет сверху */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[2%] h-[26%] w-[70%] -translate-x-1/2 rounded-[50%]"
                  style={{ background: `radial-gradient(closest-side, ${item.glow}66, transparent)`, filter: 'blur(30px)' }}
                  animate={{ opacity: isActive ? 0.7 : 0 }}
                  transition={spring}
                />
                <motion.div
                  className="relative"
                  animate={{ y: isActive ? -8 : 0, filter: `brightness(${dimmed ? t.dim * 0.55 : isActive ? 1.08 : t.dim})` }}
                  transition={spring}
                >
                  <ViewTransition name={`bottle-${item.slug}`} share="bottle" default="none">
                    <Image
                      src={item.image} alt="" width={item.w} height={item.h} priority={item.tier === 0}
                      sizes="(max-width: 768px) 40vw, 28vw"
                      className="block h-[var(--hm)] w-auto select-none md:h-[var(--hd)]"
                      draggable={false}
                    />
                  </ViewTransition>
                </motion.div>
                {/* отражение на глянцевом полу */}
                <Image
                  src={item.image} alt="" width={item.w} height={item.h} aria-hidden sizes="(max-width: 768px) 40vw, 28vw"
                  className="pointer-events-none absolute left-0 top-full block h-[var(--hm)] w-auto -scale-y-100 select-none opacity-[0.22] md:h-[var(--hd)]"
                  style={{ maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 42%)', WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 42%)', marginTop: '2px' }}
                  draggable={false}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* подпись к выбранному флакону */}
      <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-[5%] z-40 hidden justify-center md:flex">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="max-w-[22rem] text-center"
            >
              <p className="eyebrow" style={{ color: current.glow }}>{current.brand}</p>
              <p className="display mt-2 text-4xl text-ivory">{current.name}</p>
              <p className="mt-2 text-sm text-taupe">{current.notes.top.slice(0, 2).join(' · ')} · {current.notes.base.slice(0, 2).join(' · ')}</p>
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-champagne">
                {current.priceFrom ? <span className="tnum">от {rub(current.priceFrom)}</span> : null}
                <ArrowIcon className="h-3.5 w-3.5" />
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="hint" className="eyebrow text-mocha"
              initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.4, delay: reduce ? 0 : 2.2 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              Наведите на флакон
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
