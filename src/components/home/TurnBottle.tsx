'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

const VOLUMES = ['1 мл', '2 мл', '3 мл', '5 мл', '10 мл', '15 мл', 'флакон'];

/** Флакон поворачивается вслед за прокруткой, по стеклу проходит блик. Справа — о распиве. */
export function TurnBottle() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const rotateY = useTransform(p, [0, 1], [-28, 28]);
  const rotateZ = useTransform(p, [0, 1], [-2, 2]);
  const y = useTransform(p, [0, 1], [40, -40]);
  const sheen = useTransform(p, [0.15, 0.85], ['-60%', '160%']);
  const glow = useTransform(p, [0.2, 0.5, 0.8], [0.35, 0.9, 0.35]);

  const mask = { maskImage: 'url(/hero/05-libre.png)', WebkitMaskImage: 'url(/hero/05-libre.png)', maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' } as const;

  return (
    <section ref={ref} aria-labelledby="decant-title" className="relative overflow-hidden bg-cocoa-950 py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(40% 55% at 28% 50%, rgba(227,166,60,0.10), transparent 70%)' }} />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 px-4 sm:px-8 md:grid-cols-2 md:gap-8">
        <div className="relative mx-auto flex h-[80vw] max-h-[560px] w-full items-center justify-center md:h-[560px]" style={{ perspective: '1100px' }}>
          <motion.div aria-hidden className="absolute bottom-[6%] h-[14%] w-[55%] rounded-[50%]" style={{ background: 'radial-gradient(closest-side, #e3a63c, transparent)', filter: 'blur(28px)', opacity: reduce ? 0.6 : glow }} />
          <motion.div className="relative h-full" style={reduce ? undefined : { rotateY, rotateZ, y, transformStyle: 'preserve-3d' }}>
            <Image src="/hero/05-libre.png" alt="Флакон YSL Libre" width={723} height={1601} sizes="(max-width: 768px) 70vw, 420px" className="h-full w-auto select-none" draggable={false} />
            {!reduce && (
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={mask}>
                <motion.div className="absolute inset-y-0 w-[45%] -skew-x-12" style={{ left: sheen, background: 'linear-gradient(90deg, transparent, rgba(255,244,220,0.55), transparent)', mixBlendMode: 'soft-light' }} />
              </div>
            )}
          </motion.div>
        </div>

        <div className="max-w-lg">
          <p className="eyebrow text-gold-bright">Распив</p>
          <h2 id="decant-title" className="display mt-5 text-5xl leading-[1.02] text-ivory sm:text-6xl">
            Сначала <span className="italic text-champagne">поносите,</span> потом решайте
          </h2>
          <p className="mt-6 text-[1.02rem] leading-relaxed text-taupe">
            Аромат раскрывается на коже по-разному. Возьмите несколько миллилитров, проживите с ним пару дней, а флакон берите, когда точно влюбитесь.
          </p>
          <ul aria-label="Объёмы распива" className="mt-8 flex flex-wrap gap-2">
            {VOLUMES.map((v) => (
              <li key={v} className="tnum rounded-full border border-champagne/20 px-3.5 py-1.5 text-sm text-champagne">{v}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-mocha">Набор объёмов зависит от аромата.</p>
          <Link href="/niche" className="btn btn-line mt-10">Смотреть ароматы на распив</Link>
        </div>
      </div>
    </section>
  );
}
