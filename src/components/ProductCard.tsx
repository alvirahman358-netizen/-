import { Check, Plus } from 'lucide-react';
import { PRODUCT_IMAGES } from '../data/productImages';
import { Product } from '../types/store';
import { formatBdtPrice } from '../utils/storeLogic';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  imageOverride?: string;
  justAdded: boolean;
  onOpenDetail: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export function ProductCard({
  product,
  imageOverride,
  justAdded,
  onOpenDetail,
  onQuickAdd,
}: ProductCardProps) {
  const imageSrc = imageOverride || PRODUCT_IMAGES[product.id];

  return (
    <article className="group flex flex-col bg-white rounded-xl border border-stone-200/90 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => onOpenDetail(product)}
        aria-label={`${product.name} বিস্তারিত দেখুন`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--brand-surface)] cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[var(--brand-accent)]"
      >
        <ProductImage
          src={imageSrc}
          alt={product.name}
          title={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </button>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-xs text-stone-600 mb-1.5">
          <span>{product.categoryLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{product.availabilityLabel}</span>
        </div>

        <h3 className="text-base font-semibold text-zinc-900 leading-snug mb-1.5">
          <button
            type="button"
            onClick={() => onOpenDetail(product)}
            className="text-left hover:text-[var(--brand-accent)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)]"
          >
            {product.name}
          </button>
        </h3>

        <p className="text-sm text-stone-600 leading-relaxed line-clamp-2 mb-5">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-zinc-900 tabular-nums">
            {formatBdtPrice(product.price)}
          </span>

          <button
            type="button"
            onClick={() => onQuickAdd(product)}
            aria-label={`${product.name} ব্যাগে যোগ করুন`}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)] ${
              justAdded
                ? 'bg-[var(--brand-accent)] text-white'
                : 'bg-stone-100 text-zinc-900 hover:bg-[var(--brand-accent)] hover:text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>যোগ হয়েছে</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>ব্যাগে যোগ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
