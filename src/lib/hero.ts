// Шесть флаконов главного экрана. Ноты — общеизвестные пирамиды (сверить с Fragrantica перед запуском).
export interface HeroBottle {
  slug: string; // slug товара в прайсе
  brand: string;
  name: string;
  gender: 'man' | 'woman';
  image: string;
  w: number; // размеры обрезанной картинки
  h: number;
  scale: number; // реальная высота флакона относительно самого высокого
  glow: string; // цвет свечения = цвет аромата
  tier: 0 | 1 | 2; // 0 — передний ряд
  side: 'left' | 'right';
  accords: string[];
  notes: { top: string[]; heart: string[]; base: string[] };
  line: string; // одна строка о характере аромата
}

export const HERO: HeroBottle[] = [
  {
    slug: 'parfums-de-marly-layton', brand: 'Parfums de Marly', name: 'Layton', gender: 'man', image: '/hero/01-layton.png', w: 806, h: 1599, scale: 1.0,
    glow: '#4d6bc4', tier: 0, side: 'left', accords: ['Пряный', 'Ванильный', 'Свежий'],
    notes: { top: ['Яблоко', 'Лаванда', 'Бергамот', 'Мандарин'], heart: ['Герань', 'Фиалка', 'Жасмин'], base: ['Ваниль', 'Кардамон', 'Сандал', 'Пачули', 'Гваяк'] },
    line: 'Яблоко и лаванда на тёплой ванили. Самый узнаваемый аромат дома Marly.',
  },
  {
    slug: 'creed-aventus', brand: 'Creed', name: 'Aventus', gender: 'man', image: '/hero/02-aventus.png', w: 875, h: 1600, scale: 0.93,
    glow: '#d9c38f', tier: 1, side: 'left', accords: ['Фруктовый', 'Древесный', 'Дымный'],
    notes: { top: ['Ананас', 'Бергамот', 'Чёрная смородина', 'Яблоко'], heart: ['Берёза', 'Пачули', 'Жасмин', 'Роза'], base: ['Мускус', 'Дубовый мох', 'Амбра', 'Ваниль'] },
    line: 'Ананас и дымная берёза. Эталон мужской нишевой парфюмерии.',
  },
  {
    slug: 'chanel-bleu-de-chanel', brand: 'Chanel', name: 'Bleu de Chanel', gender: 'man', image: '/hero/03-bleu-de-chanel.png', w: 1078, h: 1600, scale: 0.82,
    glow: '#3f63b8', tier: 2, side: 'left', accords: ['Цитрусовый', 'Древесный', 'Ладанный'],
    notes: { top: ['Грейпфрут', 'Лимон', 'Мята', 'Розовый перец'], heart: ['Имбирь', 'Мускатный орех', 'Жасмин'], base: ['Ладан', 'Кедр', 'Сандал', 'Пачули', 'Лабданум'] },
    line: 'Цитрусы и ладан на кедре. Чистый, собранный, на каждый день.',
  },
  {
    slug: 'parfums-de-marly-delina', brand: 'Parfums de Marly', name: 'Delina', gender: 'woman', image: '/hero/04-delina.png', w: 793, h: 1600, scale: 1.0,
    glow: '#f2a2b6', tier: 0, side: 'right', accords: ['Цветочный', 'Фруктовый', 'Мускусный'],
    notes: { top: ['Личи', 'Ревень', 'Бергамот', 'Мускатный орех'], heart: ['Турецкая роза', 'Пион', 'Ваниль'], base: ['Кашмеран', 'Ладан', 'Кедр', 'Ветивер'] },
    line: 'Турецкая роза с личи и ревенем. Розовый флакон, который узнают все.',
  },
  {
    slug: 'ysl-libre', brand: 'YSL', name: 'Libre', gender: 'woman', image: '/hero/05-libre.png', w: 723, h: 1601, scale: 0.94,
    glow: '#e3a63c', tier: 1, side: 'right', accords: ['Лавандовый', 'Цветочный', 'Ванильный'],
    notes: { top: ['Лаванда', 'Мандарин', 'Чёрная смородина', 'Петитгрейн'], heart: ['Цветок апельсина', 'Жасмин', 'Лаванда'], base: ['Мадагаскарская ваниль', 'Мускус', 'Кедр', 'Амбра'] },
    line: 'Лаванда и цветок апельсина на ванили. Смелая классика YSL.',
  },
  {
    slug: 'lancome-la-vie-est-belle', brand: 'Lancôme', name: 'La Vie Est Belle', gender: 'woman', image: '/hero/06-la-vie-est-belle.png', w: 1220, h: 1601, scale: 0.85,
    glow: '#f0876d', tier: 2, side: 'right', accords: ['Сладкий', 'Ирисовый', 'Гурманский'],
    notes: { top: ['Чёрная смородина', 'Груша'], heart: ['Ирис', 'Жасмин', 'Цветок апельсина'], base: ['Пралине', 'Ваниль', 'Пачули', 'Бобы тонка'] },
    line: 'Ирис и пралине. Самый сладкий и тёплый аромат из шести.',
  },
];

export const heroBySlug = (slug: string) => HERO.find((h) => h.slug === slug) ?? null;
