import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { CategoryId } from '../types/store';
import { toBengaliDigits } from '../utils/storeLogic';

interface HeaderProps {
  storeName: string;
  cartCount: number;
  onOpenCart: () => void;
  onOpenCustomizer: () => void;
  onSelectCategoryAndScroll: (category: CategoryId) => void;
}

export function Header({
  storeName,
  cartCount,
  onOpenCart,
  onOpenCustomizer,
  onSelectCategoryAndScroll,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (category: CategoryId) => {
    setMobileMenuOpen(false);
    onSelectCategoryAndScroll(category);
  };

  const handleCustomizerClick = () => {
    setMobileMenuOpen(false);
    onOpenCustomizer();
  };

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-sm border-b border-stone-200/80"
      style={{ backgroundColor: 'color-mix(in srgb, var(--brand-canvas) 95%, transparent)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 max-w-[200px] truncate focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-accent)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {storeName}
        </a>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav
          aria-label="প্রধান নেভিগেশন"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700"
        >
          <button
            type="button"
            onClick={() => handleCategoryClick('all')}
            className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1.5"
          >
            নতুন সংগ্রহ
          </button>
          <button
            type="button"
            onClick={() => handleCategoryClick('apparel')}
            className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1.5"
          >
            পোশাক
          </button>
          <button
            type="button"
            onClick={() => handleCategoryClick('home')}
            className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1.5"
          >
            গৃহসজ্জা
          </button>
          <button
            type="button"
            onClick={handleCustomizerClick}
            className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1.5"
          >
            দোকান সাজান
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-stone-300 text-zinc-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`শপিং ব্যাগ, ${toBengaliDigits(cartCount)}টি পণ্য`}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)]"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span className="tabular-nums">
              ব্যাগ ({toBengaliDigits(cartCount)})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="মোবাইল নেভিগেশন"
          className="md:hidden border-t border-stone-200 px-4 py-3 flex flex-col gap-1"
          style={{ backgroundColor: 'var(--brand-canvas)' }}
        >
          <button
            type="button"
            onClick={() => handleCategoryClick('all')}
            className="text-left px-3 py-2.5 text-sm font-medium text-zinc-800 hover:bg-stone-200/60 rounded-lg cursor-pointer"
          >
            নতুন সংগ্রহ
          </button>
          <button
            type="button"
            onClick={() => handleCategoryClick('apparel')}
            className="text-left px-3 py-2.5 text-sm font-medium text-zinc-800 hover:bg-stone-200/60 rounded-lg cursor-pointer"
          >
            পোশাক
          </button>
          <button
            type="button"
            onClick={() => handleCategoryClick('home')}
            className="text-left px-3 py-2.5 text-sm font-medium text-zinc-800 hover:bg-stone-200/60 rounded-lg cursor-pointer"
          >
            গৃহসজ্জা
          </button>
          <button
            type="button"
            onClick={handleCustomizerClick}
            className="text-left px-3 py-2.5 text-sm font-medium text-zinc-800 hover:bg-stone-200/60 rounded-lg cursor-pointer"
          >
            দোকান সাজান
          </button>
        </nav>
      )}
    </header>
  );
}
