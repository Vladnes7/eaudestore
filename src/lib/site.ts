export const SITE = {
  name: 'Eaudestore',
  tagline: 'Niche decants & full bottles',
  seller: 'hhellbound', // Telegram продавца (из мини-приложения каталога)
  channel: 'https://t.me/eaudestore',
  tiktok: 'https://tiktok.com/@eaudestore',
  phone: '+375299891589',
  phoneLabel: '+375 29 989-15-89',
  warehouses: 'Москва и Минск',
};

export const rub = (n: number) => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';

/** Ссылка в Telegram продавцу с готовым текстом заказа. */
export function orderLink(text?: string) {
  const base = `https://t.me/${SITE.seller}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const GENDER: Record<string, string> = { man: 'Мужской', woman: 'Женский', unisex: 'Унисекс' };
export const CONC_LABEL: Record<string, string> = {
  EDP: 'Eau de Parfum', EDT: 'Eau de Toilette', EDC: 'Eau de Cologne', Parfum: 'Parfum', Extrait: 'Extrait de Parfum', Elixir: 'Elixir',
};
