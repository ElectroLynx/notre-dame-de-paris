import type {Metadata} from 'next';
import {Cinzel, Crimson_Pro} from 'next/font/google';
import './globals.css'; // Global styles

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
});

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
});

export const metadata: Metadata = {
  title: 'Notre-Dame Mystère',
  description: 'Fiche de révision interactive sur Notre-Dame de Paris',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr" className={`${cinzel.variable} ${crimsonPro.variable}`}>
      <body suppressHydrationWarning className="font-serif bg-stone-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}
