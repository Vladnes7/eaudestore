'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SITE, orderLink } from '@/lib/site';
import { TelegramIcon, SearchIcon } from './icons';

const NAV = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/brands', label: 'Бренды' },
  { href: '/niche', label: 'Ниша' },
];

export function Header() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === path; // меню само закрывается при переходе на другую страницу
  const setOpen = (fn: (o: boolean) => boolean) => setOpenAt(fn(open) ? path : null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const solid = scrolled || path !== '/';

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500"
      style={{
        height: 'var(--header-h)',
        paddingTop: 'env(safe-area-inset-top)',
        backgroundColor: solid ? 'color-mix(in oklab, #1d130e 72%, transparent)' : 'transparent',
        backdropFilter: solid ? 'blur(18px) saturate(140%)' : 'none',
        WebkitBackdropFilter: solid ? 'blur(18px) saturate(140%)' : 'none',
        borderBottom: `1px solid ${solid ? 'rgba(216,197,165,0.10)' : 'transparent'}`,
      }}
    >
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8">
        <nav aria-label="Основная навигация" className="hidden md:flex items-center gap-8">
          {NAV.map((n) => {
            const active = path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`eyebrow link-u pb-1 transition-colors duration-300 ${active ? 'text-champagne' : 'text-ivory/75 hover:text-ivory'}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu"
          className="md:hidden -ml-2 flex h-11 w-11 items-center justify-center" aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        >
          <span className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-ivory transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 h-px w-6 bg-ivory transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
          </span>
        </button>

        <Link href="/" aria-label="Eaudestore — на главную" className="justify-self-center">
          <Wordmark />
        </Link>

        <div className="flex items-center justify-end gap-1 sm:gap-3">
          <Link href="/catalog#search" aria-label="Поиск аромата" className="flex h-11 w-11 items-center justify-center text-ivory/80 hover:text-ivory transition-colors">
            <SearchIcon />
          </Link>
          <a href={orderLink()} target="_blank" rel="noopener" className="btn btn-line hidden sm:inline-flex h-10 px-5">
            <TelegramIcon className="h-4 w-4" />
            Заказать
          </a>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="md:hidden fixed inset-x-0 bottom-0 top-[var(--header-h)] bg-cocoa-950/96 backdrop-blur-xl px-6 pt-10"
          >
            <nav aria-label="Мобильная навигация" className="flex flex-col">
              {NAV.map((n, i) => (
                <motion.div key={n.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i + 0.05, type: 'spring', bounce: 0, duration: 0.4 }}>
                  <Link href={n.href} className="display block border-b border-champagne/10 py-5 text-4xl text-ivory">{n.label}</Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-10 flex flex-col gap-3">
              <a href={orderLink()} target="_blank" rel="noopener" className="btn btn-gold"><TelegramIcon className="h-4 w-4" />Написать продавцу</a>
              <a href={SITE.channel} target="_blank" rel="noopener" className="btn btn-line">Канал Eaudestore</a>
              <a href={`tel:${SITE.phone}`} className="mt-4 text-center text-taupe tnum">{SITE.phoneLabel}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`display block text-[1.35rem] sm:text-[1.6rem] font-normal leading-none tracking-[0.32em] text-ivory ${className}`} style={{ marginRight: '-0.32em' }}>
      EAUDESTORE
    </span>
  );
}
