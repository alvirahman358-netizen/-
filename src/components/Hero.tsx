import { ArrowDown } from 'lucide-react';
import { HERO_IMAGE_SRC } from '../data/productImages';
import { StoreConfig } from '../types/store';
import { formatBdtPrice } from '../utils/storeLogic';
import { ProductImage } from './ProductImage';

interface HeroProps {
  config: StoreConfig;
  onExploreCatalog: () => void;
}

export function Hero({ config, onExploreCatalog }: HeroProps) {
  const heroImage = config.heroImageOverride.trim() || HERO_IMAGE_SRC;

  return (
    <section
      id="top"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        <div className="lg:col-span-5 flex flex-col justify-center py-2">
          <p className="text-sm font-medium text-[var(--brand-accent)] mb-3">
            {config.heroEyebrow}
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-zinc-900 leading-[1.2] tracking-tight mb-5"
            style={{
              fontFamily: 'var(--font-display)',
              textWrap: 'balance',
            }}
          >
            {config.heroHeadline}
          </h1>
          <p className="text-base sm:text-lg text-stone-700 leading-relaxed mb-8 max-w-xl">
            {config.heroDescription}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onExploreCatalog}
              className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[44px] text-sm sm:text-base font-semibold text-white bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)]"
            >
              <span>{config.heroCtaLabel}</span>
              <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative w-full h-full min-h-[260px] sm:min-h-[340px] lg:min-h-[420px] rounded-xl overflow-hidden bg-[var(--brand-surface)] border border-stone-200/80">
            <ProductImage
              src={heroImage}
              alt={`${config.storeName} সংগ্রহের প্রদর্শনী`}
              title={config.storeName}
              className="w-full h-full lg:h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Full-width 3-column storefront assurance strip below hero split */}
      <div className="mt-10 pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        <div>
          <p className="font-semibold text-zinc-900">ক্যাশ অন ডেলিভারি</p>
          <p className="text-stone-600 mt-0.5">
            পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা
          </p>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">ফ্রি ডেলিভারি</p>
          <p className="text-stone-600 mt-0.5 tabular-nums">
            {formatBdtPrice(config.shipping.freeThreshold)} বা তার বেশি অর্ডারে সারা
            দেশে ফ্রি ডেলিভারি
          </p>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">৩ দিনের সহজ রিটার্ন</p>
          <p className="text-stone-600 mt-0.5">
            ত্রুটিযুক্ত বা অপছন্দ হলে ঝামেলামুক্ত বদল
          </p>
        </div>
      </div>
    </section>
  );
}
