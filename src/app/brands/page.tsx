import type { Metadata } from 'next';
import { BrandIndex } from '@/components/catalog/BrandIndex';
import { getBrands, getTopBrands } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Бренды парфюмерии от A до Z',
  description: 'Все парфюмерные дома в прайсе Eaudestore: от Acqua di Parma и Creed до Zoologist. Флаконы, тестеры и распив.',
};

export default async function BrandsPage() {
  const [brands, top] = await Promise.all([getBrands(), getTopBrands(60)]);
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-[calc(var(--header-h)+40px)] sm:px-8">
      <p className="eyebrow text-gold-bright">{new Intl.NumberFormat('ru-RU').format(brands.length)} брендов</p>
      <h1 className="display mt-4 text-5xl text-ivory sm:text-7xl">Бренды от A до Z</h1>
      <div className="mt-8">
        <BrandIndex brands={brands} featured={top.map((b) => b.slug)} />
      </div>
    </div>
  );
}
