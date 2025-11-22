// components/GlobalSearch.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Fuse from 'fuse.js'; 

type SearchItem = {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
};

// レイアウトファイルなどからこのコンポーネントを呼び出し、
// Server Componentで取得したsearchIndexを渡してください。
export default function GlobalSearch({ searchIndex }: { searchIndex: SearchItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fuse.jsの設定
  const fuse = new Fuse(searchIndex, {
    keys: ['title', 'category'],
    threshold: 0.3, // あいまい度
  });

  // Cmd+K ショートカットの監視
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // フォーカス制御
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // 検索実行
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    const res = fuse.search(query);
    setResults(res.map(r => r.item).slice(0, 5)); // 上位5件のみ表示
  }, [query, fuse]);

  // ページ遷移時に閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [router]); // pathname変更時に閉じる

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      ></div>

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
        
        {/* 検索入力エリア */}
        <div className="flex items-center border-b border-slate-100 p-5 bg-white">
          <svg className="w-5 h-5 text-slate-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-lg font-serif text-slate-700 placeholder:text-slate-300 focus:outline-none bg-transparent"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono text-slate-500 bg-slate-100 rounded border border-slate-200">ESC</kbd>
          </div>
        </div>

        {/* 検索結果エリア */}
        <div className="bg-slate-50/50 max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((item) => (
                <li key={item.id}>
                  <Link 
                    href={`/news/${item.id}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-6 py-3 hover:bg-[#E0F7FA]/50 transition-colors border-l-4 border-transparent hover:border-[#0ABAB5]"
                  >
                    <div className="text-sm font-medium text-slate-800 font-serif">{item.title}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#0ABAB5] font-bold">{item.category}</span>
                      <span className="text-[10px] text-slate-400">{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="p-8 text-center text-slate-400 text-sm font-serif">
              No stories found matching "{query}".
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 font-serif">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
