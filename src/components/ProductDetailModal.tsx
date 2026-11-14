import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { PRODUCT_IMAGES } from '../data/productImages';
import { Product } from '../types/store';
import { formatBdtPrice, toBengaliDigits } from '../utils/storeLogic';
import { ProductImage } from './ProductImage';

interface ProductDetailModalProps {
  product: Product | null;
  imageOverride?: string;
  onClose: () => void;
  onAddToCart: (product: Product, variant: string, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  imageOverride,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0] ?? '');
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  const activeVariant = selectedVariant || product.variants[0] || '';
  const imageSrc = imageOverride || PRODUCT_IMAGES[product.id];

  const handleSubmit = () => {
    onAddToCart(product, activeVariant, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FAF9F6] rounded-xl border border-stone-200 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="পণ্যের বিবরণ বন্ধ করুন"
          className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/90 hover:bg-white text-zinc-800 border border-stone-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-6 bg-[var(--brand-surface)] min-h-[260px] md:min-h-[440px]">
            <ProductImage
              src={imageSrc}
              alt={product.name}
              title={product.name}
              priority
              className="w-full h-full object-cover"
            />
          </div>

          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-600 mb-2">
                <span>{product.categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{product.origin}</span>
                <span aria-hidden="true">·</span>
                <span>{product.availabilityLabel}</span>
              </div>

              <h2
                id="pdp-title"
                className="text-2xl font-bold text-zinc-900 leading-snug mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {product.name}
              </h2>

              <p className="text-xl font-bold text-[var(--brand-accent)] tabular-nums mb-5">
                {formatBdtPrice(product.price)}
              </p>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed mb-5">
                {product.description}
              </p>

              <div className="py-3.5 border-y border-stone-200/80 mb-5">
                <p className="text-xs font-medium text-stone-500 mb-1">
                  কারুশিল্পের তথ্য
                </p>
                <p className="text-sm text-zinc-800">{product.craftNote}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-zinc-900 mb-2.5">
                  বিকল্প নির্বাচন করুন
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = variant === activeVariant;
                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3.5 py-2 min-h-[40px] text-xs sm:text-sm font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white'
                            : 'border-stone-300 bg-white text-zinc-800 hover:border-zinc-500'
                        }`}
                      >
                        {variant}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center border border-stone-300 bg-white rounded-lg">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="পরিমাণ কমান"
                  className="w-10 h-11 inline-flex items-center justify-center text-zinc-700 hover:bg-stone-100 rounded-l-lg cursor-pointer"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-zinc-900 tabular-nums">
                  {toBengaliDigits(quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="পরিমাণ বাড়ান"
                  className="w-10 h-11 inline-flex items-center justify-center text-zinc-700 hover:bg-stone-100 rounded-r-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-sm sm:text-base font-semibold text-white bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>
                  ব্যাগে যোগ করুন · {formatBdtPrice(product.price * quantity)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
