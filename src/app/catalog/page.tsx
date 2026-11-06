import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CatalogSearch } from '@/components/catalog/CatalogSearch';

export const metadata: Metadata = {
  title: 'Каталог ароматов',
  description: 'Поиск по всему прайсу Eaudestore: более 17 000 ароматов, флаконы, тестеры и распив. Фильтры по полу и тестерам, цены в рублях.',
};

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-[calc(var(--header-h)+40px)] sm:px-8">
      <p className="eyebrow text-gold-bright">Каталог</p>
      <h1 className="display mt-4 text-5xl text-ivory sm:text-7xl">Все ароматы</h1>
      <p className="mt-4 max-w-xl text-taupe">Весь прайс продавца в одном поиске. Ищите по бренду, названию или ноте, латиницей или кириллицей.</p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <CatalogSearch />
        </Suspense>
      </div>
    </div>
  );
}
