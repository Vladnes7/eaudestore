import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant', subsets: ['latin', 'cyrillic'], weight: ['300', '400', '500'], style: ['normal', 'italic'], display: 'swap',
});
const jost = Jost({ variable: '--font-jost', subsets: ['latin', 'cyrillic'], weight: ['300', '400', '500'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://eaudestore.shop'),
  title: { default: 'Eaudestore — нишевая и селективная парфюмерия, распив и флаконы', template: '%s — Eaudestore' },
  description: 'Нишевая и селективная парфюмерия: полные флаконы и распив от 1 мл. Более 17 000 ароматов, цены в рублях, заказ в Telegram. Склады в Москве и Минске.',
  openGraph: { type: 'website', locale: 'ru_RU', siteName: 'Eaudestore', images: ['/hero/scene-og.jpg'] },
};

export const viewport: Viewport = { themeColor: '#050403', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-ivory focus:text-cocoa-950 focus:px-4 focus:py-2">
          К содержимому
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
