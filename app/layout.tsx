import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP, Cinzel } from 'next/font/google';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '700'], 
  variable: '--font-noto-sans-jp' 
});
const cinzel = Cinzel({ 
  subsets: ['latin'], 
  weight: ['400', '700'], 
  variable: '--font-cinzel' 
});

export const metadata: Metadata = {
  title: 'CAR BOUTIQUE',
  description: '車のある豊かなライフスタイルを提案する、新しい形のカーメディア。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable} ${cinzel.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-tiffany-gradient">
        <main className="flex-grow">
          {children}
        </main>
        <footer className="py-8 text-center text-sm text-muted-foreground/60 bg-white/40 backdrop-blur-md">
          <div className="container">
            <p className="font-serif tracking-wider">© {new Date().getFullYear()} CAR BOUTIQUE. All Rights Reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
