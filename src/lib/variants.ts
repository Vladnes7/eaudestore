import type { Variant } from './catalog/parse';
import type { PickVariant } from '@/components/perfume/VariantPicker';

const vol = (v: number | null) => (v ? `${String(v).replace('.', ',')} мл` : null);

function group(v: Variant) {
  if (v.decant) return 'Распив';
  if (v.sample) return 'Пробники';
  if (v.set) return 'Наборы';
  if (v.tester) return 'Тестеры';
  return 'Флаконы';
}

const ORDER = ['Флаконы', 'Тестеры', 'Распив', 'Пробники', 'Наборы'];

/** Варианты из прайса -> пункты для выбора с понятными подписями. */
export function toPick(variants: Variant[]): PickVariant[] {
  return variants
    .map((v, i) => {
      const g = group(v);
      const parts = [v.conc, vol(v.volume)].filter(Boolean);
      const extra = (v.extra ?? '').replace(/\b(MAN|WOMAN|TESTER)\b/g, '').replace(/\s+/g, ' ').trim();
      let label = parts.join(' · ') || extra || 'Вариант';
      if (!parts.length) label = extra || 'Вариант';
      const note = [v.damaged ? 'упаковка с дефектом' : null, parts.length && extra ? extra.toLowerCase() : null].filter(Boolean).join(', ') || null;
      return { id: String(i), group: g, label, price: v.price, note };
    })
    .sort((a, b) => ORDER.indexOf(a.group) - ORDER.indexOf(b.group))
    // одинаковые строки прайса с разной ценой: оставляем самую выгодную
    .filter((v, i, all) => all.findIndex((x) => x.group === v.group && x.label === v.label && x.note === v.note && x.price <= v.price) === i
      && !all.some((x) => x !== v && x.group === v.group && x.label === v.label && x.note === v.note && x.price < v.price));
}
