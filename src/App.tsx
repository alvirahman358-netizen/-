import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StoreCustomizerDrawer } from './components/StoreCustomizerDrawer';
import { StorySection } from './components/StorySection';
import { CATEGORIES } from './data/catalog';
import {
  CartItem,
  CategoryId,
  OrderReceipt,
  Product,
  SortOption,
  StoreConfig,
} from './types/store';
import {
  ACCENT_THEMES,
  CANVAS_TONES,
  createDefaultStoreConfig,
  mergeWithDefaultStoreConfig,
} from './utils/customizerLogic';
import {
  addOrUpdateCartItem,
  filterAndSortProducts,
  toBengaliDigits,
  updateCartItemQuantity,
} from './utils/storeLogic';

const CART_STORAGE_KEY = 'amar_dokan_cart_v1';
const ORDERS_STORAGE_KEY = 'amar_dokan_orders_v1';
const CONFIG_STORAGE_KEY = 'amar_dokan_config_v1';

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredOrders(): OrderReceipt[] {
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredConfig(): StoreConfig {
  try {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return createDefaultStoreConfig();
    return mergeWithDefaultStoreConfig(JSON.parse(raw));
  } catch {
    return createDefaultStoreConfig();
  }
}

export default function App() {
  const [storeConfig, setStoreConfig] =
    useState<StoreConfig>(readStoredConfig);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [cartItems, setCartItems] = useState<CartItem[]>(readStoredCart);
  const [recentOrders, setRecentOrders] =
    useState<OrderReceipt[]>(readStoredOrders);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerInitialView, setDrawerInitialView] = useState<'cart' | 'orders'>(
    'cart'
  );
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const activeAccent =
    ACCENT_THEMES[storeConfig.accentId] ?? ACCENT_THEMES.forest;
  const activeCanvas =
    CANVAS_TONES[storeConfig.canvasToneId] ?? CANVAS_TONES.alabaster;

  useEffect(() => {
    document.title = `${storeConfig.storeName} — দেশীয় ঐতিহ্য ও আধুনিক জীবনযাত্রার অনলাইন স্টোর`;
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--brand-accent', activeAccent.primary);
    rootStyle.setProperty('--brand-accent-hover', activeAccent.hover);
    rootStyle.setProperty('--brand-canvas', activeCanvas.bg);
    rootStyle.setProperty('--brand-surface', activeCanvas.surface);
  }, [storeConfig.storeName, activeAccent, activeCanvas]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CONFIG_STORAGE_KEY,
        JSON.stringify(storeConfig)
      );
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [storeConfig]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ORDERS_STORAGE_KEY,
        JSON.stringify(recentOrders)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [recentOrders]);

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(storeConfig.products, {
        category: selectedCategory,
        query: deferredSearchQuery,
        sort: sortBy,
      }),
    [storeConfig.products, selectedCategory, deferredSearchQuery, sortBy]
  );

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const scrollToElement = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategoryAndScroll = (category: CategoryId) => {
    setSelectedCategory(category);
    scrollToElement('catalog');
  };

  const handleAddToCart = (
    product: Product,
    variant: string,
    quantity: number
  ) => {
    setCartItems((prev) =>
      addOrUpdateCartItem(prev, product, variant, quantity)
    );
    setJustAddedId(product.id);
    window.setTimeout(() => {
      setJustAddedId((curr) => (curr === product.id ? null : curr));
    }, 1400);
  };

  const handleQuickAdd = (product: Product) => {
    const defaultVariant = product.variants[0] ?? 'স্ট্যান্ডার্ড';
    handleAddToCart(product, defaultVariant, 1);
  };

  const handleUpdateQuantity = (
    productId: string,
    variant: string,
    nextQty: number
  ) => {
    setCartItems((prev) =>
      updateCartItemQuantity(prev, productId, variant, nextQty)
    );
  };

  const handleRemoveItem = (productId: string, variant: string) => {
    setCartItems((prev) =>
      updateCartItemQuantity(prev, productId, variant, 0)
    );
  };

  const handleOrderConfirmed = (receipt: OrderReceipt) => {
    setCartItems([]);
    setRecentOrders((prev) => [receipt, ...prev].slice(0, 10));
  };

  const handleOpenCart = () => {
    setDrawerInitialView('cart');
    setDrawerOpen(true);
  };

  const handleOpenRecentOrders = () => {
    setDrawerInitialView('orders');
    setDrawerOpen(true);
  };

  const handleResetDefaults = () => {
    setStoreConfig(createDefaultStoreConfig());
  };

  return (
    <div
      className="min-h-screen flex flex-col text-zinc-900 transition-colors duration-200"
      style={{ backgroundColor: 'var(--brand-canvas)' }}
    >
      <Header
        storeName={storeConfig.storeName}
        cartCount={totalCartCount}
        onOpenCart={handleOpenCart}
        onOpenCustomizer={() => setCustomizerOpen(true)}
        onSelectCategoryAndScroll={handleSelectCategoryAndScroll}
      />

      <main className="flex-1">
        <Hero
          config={storeConfig}
          onExploreCatalog={() => scrollToElement('catalog')}
        />

        {/* Catalog Section */}
        <section
          id="catalog"
          aria-labelledby="catalog-heading"
          className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2
                id="catalog-heading"
                className="text-2xl sm:text-3xl font-bold text-zinc-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                বাছাইকৃত পণ্যসমূহ
              </h2>
              <p className="text-sm text-stone-600 mt-1 tabular-nums">
                মোট {toBengaliDigits(filteredProducts.length)}টি পণ্য প্রদর্শিত
                হচ্ছে
              </p>
            </div>

            {/* Search, Sort & Store Customizer Trigger */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-60">
                <label htmlFor="catalog-search" className="sr-only">
                  পণ্য খুঁজুন
                </label>
                <Search
                  className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="catalog-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="পণ্য বা এলাকা খুঁজুন..."
                  className="w-full pl-9 pr-8 py-2 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="খোঁজার লেখা মুছুন"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-zinc-900 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="catalog-sort" className="sr-only">
                  পণ্য সাজান
                </label>
                <select
                  id="catalog-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full sm:w-auto px-3 py-2 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)] cursor-pointer"
                >
                  <option value="featured">সাজান: জনপ্রিয়</option>
                  <option value="price-asc">দাম: কম থেকে বেশি</option>
                  <option value="price-desc">দাম: বেশি থেকে কম</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setCustomizerOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 min-h-[40px] text-sm font-medium text-zinc-900 bg-white border border-stone-300 hover:border-zinc-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                <span>কাস্টমাইজ করুন</span>
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="পণ্যের ধরন"
            className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8"
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 min-h-[40px] text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)] ${
                    isActive
                      ? 'bg-[var(--brand-accent)] text-white'
                      : 'bg-[var(--brand-surface)] text-stone-700 hover:bg-stone-200 hover:text-zinc-900'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Product Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-10 text-center">
              <p className="text-base font-semibold text-zinc-900 mb-1">
                কোনো পণ্য পাওয়া যায়নি
              </p>
              <p className="text-sm text-stone-600 mb-5">
                আপনার খোঁজা শব্দ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSortBy('featured');
                }}
                className="px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] rounded-lg transition-colors cursor-pointer"
              >
                সব পণ্য দেখুন
              </button>
            </div>
          ) : (
            <div
              data-testid="product-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imageOverride={storeConfig.productImageOverrides[product.id]}
                  justAdded={justAddedId === product.id}
                  onOpenDetail={(p) => setActiveProduct(p)}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          )}
        </section>

        <StorySection
          eyebrow={storeConfig.storyEyebrow}
          headline={storeConfig.storyHeadline}
          description={storeConfig.storyDescription}
        />
      </main>

      <Footer
        config={storeConfig}
        recentOrdersCount={recentOrders.length}
        onSelectCategoryAndScroll={handleSelectCategoryAndScroll}
        onOpenRecentOrders={handleOpenRecentOrders}
        onOpenCustomizer={() => setCustomizerOpen(true)}
      />

      <ProductDetailModal
        product={activeProduct}
        imageOverride={
          activeProduct
            ? storeConfig.productImageOverrides[activeProduct.id]
            : undefined
        }
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={drawerOpen}
        initialView={drawerInitialView}
        items={cartItems}
        recentOrders={recentOrders}
        shippingConfig={storeConfig.shipping}
        productImageOverrides={storeConfig.productImageOverrides}
        onClose={() => setDrawerOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderConfirmed={handleOrderConfirmed}
      />

      <StoreCustomizerDrawer
        isOpen={customizerOpen}
        config={storeConfig}
        onClose={() => setCustomizerOpen(false)}
        onUpdateConfig={setStoreConfig}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
