"use client";

import { ArrowUpRightIcon } from '@/components/CinemaIcons';

const footerLinks = [
  {
    title: 'コンテンツ',
    links: [
      { label: '車種一覧', href: '/cars' },
      { label: '実用ガイド', href: '/guide' },
      { label: '考察コラム', href: '/column' },
      { label: '系譜特集', href: '/heritage' },
    ],
  },
  {
    title: 'サイト',
    links: [
      { label: 'About', href: '/legal/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Terms', href: '/legal' },
    ],
  },
];

export default function FooterSection() {
  return (
    <footer className="relative bg-[#0A0A0A] border-t border-white/5">
      <div className="px-6 lg:px-12 py-14 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div className="lg:col-span-2">
              <a href="/" className="inline-block mb-5">
                <span className="font-serif text-2xl tracking-[0.15em] text-white uppercase">
                  CAR BOUTIQUE
                </span>
                <span className="block text-[9px] tracking-[0.4em] text-white/40 uppercase mt-1">
                  JOURNAL
                </span>
              </a>
              <p className="text-sm text-white/40 leading-relaxed max-w-sm mb-6">
                自動車という芸術を、もっと深く。
                <br />
                エディトリアルの視点で車文化を読み解くメディア。
              </p>
              <div className="flex gap-0 max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30"
                />
                <button className="bg-white text-black px-4 py-3 rounded-r-lg text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-colors flex items-center gap-2">
                  <span className="hidden sm:inline">Subscribe</span>
                  <ArrowUpRightIcon size={14} />
                </button>
              </div>
            </div>
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-5">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-6 lg:px-12 py-5 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-white/25 tracking-wider">
            &copy; 2026 CAR BOUTIQUE JOURNAL. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Twitter', 'Instagram', 'YouTube'].map((s) => (
              <a
                key={s}
                href="#"
                className="text-[10px] text-white/25 hover:text-white/50 transition-colors tracking-wider"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
