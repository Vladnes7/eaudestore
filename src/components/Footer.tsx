import Link from 'next/link';
import { SITE, orderLink } from '@/lib/site';
import { TelegramIcon, TikTokIcon } from './icons';
import { Wordmark } from './Header';

export function Footer() {
  return (
    <footer className="relative border-t border-champagne/10 bg-noir">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="eyebrow mt-4 text-taupe">{SITE.tagline}</p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-taupe">
              Нишевая и селективная парфюмерия: полные флаконы и распив. Отправляем со складов в Москве и Минске.
            </p>
          </div>
          <nav aria-label="Разделы" className="flex flex-col gap-3 text-sm">
            <span className="eyebrow mb-2 text-mocha">Разделы</span>
            <Link href="/catalog" className="link-u w-fit text-ivory/85">Каталог</Link>
            <Link href="/brands" className="link-u w-fit text-ivory/85">Бренды</Link>
            <Link href="/niche" className="link-u w-fit text-ivory/85">Нишевая витрина</Link>
          </nav>
          <div className="flex flex-col gap-3 text-sm">
            <span className="eyebrow mb-2 text-mocha">Связь</span>
            <a href={orderLink()} target="_blank" rel="noopener" className="link-u flex w-fit items-center gap-2 text-ivory/85"><TelegramIcon className="h-4 w-4" />Продавец в Telegram</a>
            <a href={SITE.channel} target="_blank" rel="noopener" className="link-u flex w-fit items-center gap-2 text-ivory/85"><TelegramIcon className="h-4 w-4" />Канал @eaudestore</a>
            <a href={SITE.tiktok} target="_blank" rel="noopener" className="link-u flex w-fit items-center gap-2 text-ivory/85"><TikTokIcon className="h-4 w-4" />TikTok</a>
            <a href={`tel:${SITE.phone}`} className="link-u w-fit tnum text-ivory/85">{SITE.phoneLabel}</a>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-2 border-t border-champagne/10 pt-6 text-xs text-mocha sm:flex-row sm:justify-between">
          <span>© {2026} Eaudestore</span>
          <span>Цены в рублях. Наличие уточняйте у продавца.</span>
        </div>
      </div>
    </footer>
  );
}
