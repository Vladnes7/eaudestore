import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/hero/Hero';
import { TurnBottle } from '@/components/home/TurnBottle';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { ArrowIcon, TelegramIcon } from '@/components/icons';
import { HERO } from '@/lib/hero';
import { getProducts, getShowcase, getTopBrands, getBrands } from '@/lib/catalog';
import { orderLink } from '@/lib/site';

const REVIEWS = [
  { n: 2, text: 'Я всё забрала, это просто бомба, спасибо огромное и отдельное спасибо за пробнички! Обязательно буду ещё приобретать парфюм у вас.' },
  { n: 4, text: 'Вышло в разы дешевле, чем через сетевые магазы, все продукты оригинальные. Доставка быстрая.' },
  { n: 3, text: 'Всё шикарно, за рекомендацию отдельное спасибо — фордовская лаванда очень понравилась, рекомендация 12/10.' },
  { n: 9, text: 'Забрала духи, всё отлично, спасибо большое, ещё обращусь.' },
];

export default async function Home() {
  const [heroProducts, showcase, topBrands, brands] = await Promise.all([
    getProducts(HERO.map((h) => h.slug)), getShowcase(), getTopBrands(24), getBrands(),
  ]);
  const total = brands.reduce((s, b) => s + b.count + b.showcase, 0);
  const items = HERO.map((h, i) => ({ ...h, priceFrom: heroProducts[i]?.priceFrom ?? null }));

  const picks = [...showcase]
    .filter((s) => s.available && s.image && s.notes.length >= 3)
    .sort((a, b) => Number(b.collections.includes('new')) - Number(a.collections.includes('new')))
    .slice(0, 8);

  return (
    <>
      <Hero items={items} total={total} />

      {/* Нишевая витрина */}
      <section aria-labelledby="niche-title" className="relative bg-cocoa-900 py-24 sm:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-gold-bright">Нишевая витрина</p>
              <h2 id="niche-title" className="display mt-4 text-5xl text-ivory sm:text-6xl">Новое в распиве</h2>
              <p className="mt-4 max-w-md text-taupe">Редкие нишевые ароматы на распив и во флаконах: Zoologist, Kerosene, Strangers Parfumerie и ещё двадцать с лишним домов.</p>
            </div>
            <Link href="/niche" className="eyebrow link-u flex w-fit items-center gap-2 pb-1 text-champagne">Вся витрина <ArrowIcon /></Link>
          </Reveal>
          <ul className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
            {picks.map((s, i) => (
              <li key={s.slug} className="w-[64vw] shrink-0 snap-start sm:w-[40vw] md:w-auto">
                <Reveal delay={(i % 4) * 0.06} className="h-full">
                  <ProductCard tone="ivory" d={{ href: `/niche/${s.slug}`, brand: s.brand, name: s.title, image: s.image, priceFrom: Math.min(...s.variants.map((v) => v.price)), meta: s.notes.slice(0, 3).join(' · ') }} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TurnBottle />

      {/* Бренды */}
      <section aria-labelledby="brands-title" className="relative bg-cocoa-900 py-24 sm:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-gold-bright">{new Intl.NumberFormat('ru-RU').format(brands.length)} брендов</p>
              <h2 id="brands-title" className="display mt-4 text-5xl text-ivory sm:text-6xl">Выберите дом</h2>
            </div>
            <Link href="/brands" className="eyebrow link-u flex w-fit items-center gap-2 pb-1 text-champagne">Все бренды от A до Z <ArrowIcon /></Link>
          </Reveal>
          <ul className="mt-12 grid grid-cols-2 border-l border-t border-champagne/10 sm:grid-cols-3 lg:grid-cols-6">
            {topBrands.map((b) => (
              <li key={b.slug} className="border-b border-r border-champagne/10">
                <Link href={`/brand/${b.slug}`} className="group flex h-28 flex-col items-center justify-center gap-2 px-3 text-center transition-colors duration-500 hover:bg-cocoa-950/50 sm:h-36">
                  <span className="display text-[1.35rem] leading-tight text-ivory transition-colors duration-500 group-hover:text-champagne sm:text-2xl">{b.name}</span>
                  <span className="tnum text-[0.7rem] text-mocha">{b.count + b.showcase} ароматов</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Как заказать — настоящая последовательность, поэтому с номерами */}
      <section aria-labelledby="order-title" className="relative overflow-hidden bg-noir py-24 sm:py-28 grain">
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-8">
          <Reveal>
            <p className="eyebrow text-gold-bright">Заказ</p>
            <h2 id="order-title" className="display mt-4 max-w-2xl text-5xl text-ivory sm:text-6xl">Три шага до флакона</h2>
          </Reveal>
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              ['Выберите аромат', 'Найдите его в каталоге или по бренду, выберите объём: распив, полный флакон или тестер.'],
              ['Нажмите «Заказать»', 'Откроется Telegram с готовым сообщением: аромат, объём и цена уже вписаны.'],
              ['Получите подтверждение', 'Продавец ответит, уточнит наличие и способ доставки из Москвы или Минска.'],
            ].map(([t, d], i) => (
              <li key={t}>
                <Reveal delay={i * 0.08} className="border-t border-champagne/15 pt-6">
                  <span className="display text-6xl text-gold/70 tnum">{i + 1}</span>
                  <h3 className="display mt-4 text-3xl text-ivory">{t}</h3>
                  <p className="mt-3 max-w-xs leading-relaxed text-taupe">{d}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal className="mt-14">
            <a href={orderLink()} target="_blank" rel="noopener" className="btn btn-gold"><TelegramIcon className="h-4 w-4" />Написать продавцу</a>
          </Reveal>
        </div>
      </section>

      {/* Отзывы */}
      <section aria-labelledby="reviews-title" className="relative bg-ivory py-24 text-cocoa-950 sm:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <Reveal>
            <p className="eyebrow text-mocha">Отзывы из Telegram</p>
            <h2 id="reviews-title" className="display mt-4 text-5xl sm:text-6xl">Что пишут покупатели</h2>
          </Reveal>
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <ul className="flex flex-col">
              {REVIEWS.map((r, i) => (
                <li key={r.n} className="border-t border-cocoa-950/12 py-7">
                  <Reveal delay={i * 0.05}>
                    <blockquote className="display text-[1.65rem] italic leading-snug text-cocoa-900">«{r.text}»</blockquote>
                  </Reveal>
                </li>
              ))}
            </ul>
            <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
              {[1, 2, 3, 4, 6, 9].map((n) => (
                <li key={n} className="w-[44vw] shrink-0 snap-start sm:w-[30vw] lg:w-auto">
                  <Image src={`/reviews/${String(n).padStart(2, '0')}.jpg`} alt="Скриншот отзыва покупателя в Telegram" width={1050} height={1500} sizes="(max-width: 1024px) 44vw, 15vw" className="aspect-[7/10] w-full rounded-[6px] object-cover" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
