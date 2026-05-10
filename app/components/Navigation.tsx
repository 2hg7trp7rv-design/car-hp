"use client";

import { useState, useEffect } from 'react';
import { MenuIcon, CloseIcon } from '@/components/CinemaIcons';

const navLinks = [
  { label: '車種一覧', labelEn: 'CARS', href: '/cars' },
  { label: '実用ガイド', labelEn: 'GUIDE', href: '/guide' },
  { label: '考察コラム', labelEn: 'COLUMN', href: '/column' },
  { label: '系譜特集', labelEn: 'HERITAGE', href: '/heritage' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0A0A0A]/80 backdrop-blur-xl' : 'bg-transparent'
      }`}>
        <div className="w-full px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <a href="/" className="font-serif text-base sm:text-lg tracking-[0.2em] text-white uppercase">
              CAR BOUTIQUE
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white/70 hover:text-white transition-colors p-1">
              {menuOpen ? <CloseIcon size={22} strokeWidth={1.5} /> : <MenuIcon size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </nav>
      <div className={`fixed inset-0 z-40 bg-[#0A0A0A]/98 backdrop-blur-2xl transition-all duration-500 ${
        menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}>
        <div className="flex flex-col items-center justify-center h-full gap-10">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-center group">
              <span className="font-serif text-4xl sm:text-5xl tracking-[0.1em] text-white/60 group-hover:text-white transition-colors duration-300 block">
                {link.labelEn}
              </span>
              <span className="text-xs text-white/30 tracking-[0.3em] uppercase mt-2 block">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
