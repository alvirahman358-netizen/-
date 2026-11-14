import { CategoryId, StoreConfig } from '../types/store';

interface FooterProps {
  config: StoreConfig;
  recentOrdersCount: number;
  onSelectCategoryAndScroll: (category: CategoryId) => void;
  onOpenRecentOrders: () => void;
  onOpenCustomizer: () => void;
}

export function Footer({
  config,
  recentOrdersCount,
  onSelectCategoryAndScroll,
  onOpenRecentOrders,
  onOpenCustomizer,
}: FooterProps) {
  return (
    <footer
      className="border-t border-stone-200 py-12"
      style={{ backgroundColor: 'var(--brand-canvas)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-stone-200">
          <div className="md:col-span-5">
            <p
              className="text-xl font-bold text-zinc-900 mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {config.storeName}
            </p>
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm mb-3">
              দেশীয় কারিগরের হাতে তৈরি ঐতিহ্যবাহী পোশাক, গৃহসজ্জা, চামড়াজাত
              পণ্য ও খাঁটি চায়ের নির্ভরযোগ্য অনলাইন ঠিকানা।
            </p>
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="text-sm font-medium text-[var(--brand-accent)] hover:underline underline-offset-4 cursor-pointer"
            >
              দোকান কাস্টমাইজ করুন
            </button>
          </div>

          <div className="md:col-span-3 space-y-2 text-sm">
            <p className="font-semibold text-zinc-900 mb-2">বিভাগসমূহ</p>
            <ul className="space-y-1.5 text-stone-600">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategoryAndScroll('apparel')}
                  className="hover:text-zinc-950 hover:underline underline-offset-4 cursor-pointer"
                >
                  পোশাক
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategoryAndScroll('home')}
                  className="hover:text-zinc-950 hover:underline underline-offset-4 cursor-pointer"
                >
                  গৃহসজ্জা
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategoryAndScroll('leather')}
                  className="hover:text-zinc-950 hover:underline underline-offset-4 cursor-pointer"
                >
                  চামড়াজাত
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategoryAndScroll('tea')}
                  className="hover:text-zinc-950 hover:underline underline-offset-4 cursor-pointer"
                >
                  খাবার ও চা
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2 text-sm">
            <p className="font-semibold text-zinc-900 mb-2">গ্রাহক সেবা ও ঠিকানা</p>
            <p className="text-stone-600">{config.contactAddress}</p>
            <p className="text-stone-600 tabular-nums">
              হটলাইন: {config.contactHotline}
            </p>
            <p className="text-stone-600">ইমেইল: {config.contactEmail}</p>
            {recentOrdersCount > 0 && (
              <button
                type="button"
                onClick={onOpenRecentOrders}
                className="pt-1 text-sm font-medium text-[var(--brand-accent)] hover:underline underline-offset-4 cursor-pointer"
              >
                আপনার সাম্প্রতিক অর্ডার দেখুন
              </button>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-500">
          <p>© ২০২৬ {config.storeName}। সর্বস্বত্ব সংরক্ষিত।</p>
          <p>ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে হোম ডেলিভারি</p>
        </div>
      </div>
    </footer>
  );
}
