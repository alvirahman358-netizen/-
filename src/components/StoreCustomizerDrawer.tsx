import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Download,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { CATEGORIES } from '../data/catalog';
import {
  CanvasToneId,
  CategoryId,
  Product,
  StoreConfig,
  ThemeAccentId,
} from '../types/store';
import {
  ACCENT_THEMES,
  buildProductFromDraft,
  CANVAS_TONES,
  mergeWithDefaultStoreConfig,
  ProductDraftErrors,
  ProductDraftInput,
  validateProductDraft,
} from '../utils/customizerLogic';
import { formatBdtPrice, toBengaliDigits } from '../utils/storeLogic';

type CustomizerTab = 'brand' | 'products' | 'settings';

interface StoreCustomizerDrawerProps {
  isOpen: boolean;
  config: StoreConfig;
  onClose: () => void;
  onUpdateConfig: (updater: (prev: StoreConfig) => StoreConfig) => void;
  onResetDefaults: () => void;
}

const EMPTY_PRODUCT_DRAFT: ProductDraftInput = {
  name: '',
  category: 'home',
  priceText: '',
  availabilityLabel: 'স্টকে আছে',
  origin: 'বাংলাদেশ',
  shortDescription: '',
  description: '',
  craftNote: '',
  variantsText: 'স্ট্যান্ডার্ড',
  imageUrl: '',
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawUrl = String(reader.result ?? '');
      if (!file.type.startsWith('image/') || file.size <= 180_000) {
        resolve(rawUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1000;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => resolve(rawUrl);
      img.src = rawUrl;
    };
    reader.onerror = () => reject(new Error('ফাইল পড়া যায়নি'));
    reader.readAsDataURL(file);
  });
}

export function StoreCustomizerDrawer({
  isOpen,
  config,
  onClose,
  onUpdateConfig,
  onResetDefaults,
}: StoreCustomizerDrawerProps) {
  const [activeTab, setActiveTab] = useState<CustomizerTab>('brand');
  const [draft, setDraft] = useState<ProductDraftInput>(EMPTY_PRODUCT_DRAFT);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [draftErrors, setDraftErrors] = useState<ProductDraftErrors>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmReset(false);
      setStatusMessage(null);
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    window.setTimeout(() => {
      setStatusMessage((curr) => (curr === msg ? null : curr));
    }, 2600);
  };

  const handleHeroFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onUpdateConfig((prev) => ({ ...prev, heroImageOverride: dataUrl }));
      showStatus('হিরো ছবি আপডেট হয়েছে');
    } catch {
      showStatus('ছবিটি লোড করা যায়নি');
    }
  };

  const handleProductFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDraft((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch {
      showStatus('ছবিটি লোড করা যায়নি');
    }
  };

  const handleStartEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setDraftErrors({});
    setDraft({
      name: product.name,
      category: product.category,
      priceText: String(product.price),
      availabilityLabel: product.availabilityLabel,
      origin: product.origin,
      shortDescription: product.shortDescription,
      description: product.description,
      craftNote: product.craftNote,
      variantsText: product.variants.join(', '),
      imageUrl: config.productImageOverrides[product.id] ?? '',
    });
  };

  const handleCancelEditProduct = () => {
    setEditingProductId(null);
    setDraft(EMPTY_PRODUCT_DRAFT);
    setDraftErrors({});
  };

  const handleSaveProductDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProductDraft(draft);
    if (Object.keys(errors).length > 0) {
      setDraftErrors(errors);
      return;
    }

    const existingOrder = editingProductId
      ? config.products.find((p) => p.id === editingProductId)?.featuredOrder ??
        99
      : config.products.length + 1;

    const savedProduct = buildProductFromDraft(
      draft,
      editingProductId ?? undefined,
      existingOrder
    );

    onUpdateConfig((prev) => {
      const exists = prev.products.some((p) => p.id === savedProduct.id);
      const nextProducts = exists
        ? prev.products.map((p) =>
            p.id === savedProduct.id ? savedProduct : p
          )
        : [savedProduct, ...prev.products];

      const nextOverrides = { ...prev.productImageOverrides };
      if (draft.imageUrl.trim()) {
        nextOverrides[savedProduct.id] = draft.imageUrl.trim();
      } else if (editingProductId) {
        delete nextOverrides[savedProduct.id];
      }

      return {
        ...prev,
        products: nextProducts,
        productImageOverrides: nextOverrides,
      };
    });

    showStatus(
      editingProductId ? 'পণ্যটি আপডেট করা হয়েছে' : 'নতুন পণ্য যোগ হয়েছে'
    );
    setEditingProductId(null);
    setDraft(EMPTY_PRODUCT_DRAFT);
    setDraftErrors({});
  };

  const handleDeleteProduct = (productId: string) => {
    onUpdateConfig((prev) => {
      const nextOverrides = { ...prev.productImageOverrides };
      delete nextOverrides[productId];
      return {
        ...prev,
        products: prev.products.filter((p) => p.id !== productId),
        productImageOverrides: nextOverrides,
      };
    });
    if (editingProductId === productId) {
      handleCancelEditProduct();
    }
    showStatus('পণ্যটি মুছে ফেলা হয়েছে');
  };

  const handleExportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'amar-dokan-config.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showStatus('কনফিগ ডাউনলোড হয়েছে');
  };

  const handleImportConfig = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validated = mergeWithDefaultStoreConfig(parsed);
      onUpdateConfig(() => validated);
      showStatus('কনফিগ রিস্টোর হয়েছে');
    } catch {
      showStatus('সঠিক JSON কনফিগ ফাইল দিন');
    } finally {
      e.target.value = '';
    }
  };

  const categoryChoices = CATEGORIES.filter(
    (c): c is { id: Exclude<CategoryId, 'all'>; label: string } =>
      c.id !== 'all'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-zinc-950/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg h-full bg-[#FAF9F6] border-l border-stone-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-stone-200 flex items-center justify-between gap-4">
          <div>
            <h2
              id="customizer-title"
              className="text-lg font-bold text-zinc-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              দোকান কাস্টমাইজার
            </h2>
            <p className="text-xs text-stone-600">
              সব পরিবর্তন স্বয়ংক্রিয়ভাবে ব্রাউজারে সংরক্ষিত হয়
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="কাস্টমাইজার বন্ধ করুন"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-100 text-zinc-700 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="কাস্টমাইজার বিভাগ"
          className="px-6 pt-3 pb-2 bg-white border-b border-stone-200 flex items-center gap-2 overflow-x-auto"
        >
          {(
            [
              { id: 'brand', label: 'ব্র্যান্ড ও থিম' },
              { id: 'products', label: `পণ্যসমূহ (${toBengaliDigits(config.products.length)})` },
              { id: 'settings', label: 'ডেলিভারি ও তথ্য' },
            ] as { id: CustomizerTab; label: string }[]
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[var(--brand-accent)] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {statusMessage && (
          <div
            role="status"
            className="mx-6 mt-3 px-3.5 py-2 rounded-lg bg-emerald-950 text-white text-xs font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {activeTab === 'brand' && (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="custom-store-name"
                  className="block text-sm font-medium text-zinc-900 mb-1.5"
                >
                  দোকানের নাম
                </label>
                <input
                  id="custom-store-name"
                  type="text"
                  value={config.storeName}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      storeName: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                />
              </div>

              {/* Theme Accent */}
              <div>
                <p className="text-sm font-medium text-zinc-900 mb-2">
                  প্রধান অ্যাকসেন্ট রঙ
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {(Object.keys(ACCENT_THEMES) as ThemeAccentId[]).map(
                    (key) => {
                      const theme = ACCENT_THEMES[key];
                      const selected = config.accentId === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            onUpdateConfig((prev) => ({
                              ...prev,
                              accentId: key,
                            }))
                          }
                          className={`flex items-center gap-2.5 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                            selected
                              ? 'border-zinc-900 bg-white text-zinc-900 ring-1 ring-zinc-900'
                              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: theme.primary }}
                            aria-hidden="true"
                          />
                          <span className="truncate">{theme.label}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Canvas Tone */}
              <div>
                <p className="text-sm font-medium text-zinc-900 mb-2">
                  পৃষ্ঠের ব্যাকগ্রাউন্ড টোন
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CANVAS_TONES) as CanvasToneId[]).map((key) => {
                    const tone = CANVAS_TONES[key];
                    const selected = config.canvasToneId === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            canvasToneId: key,
                          }))
                        }
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          selected
                            ? 'border-zinc-900 bg-white text-zinc-900 ring-1 ring-zinc-900'
                            : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'
                        }`}
                      >
                        {tone.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 space-y-4">
                <div>
                  <label
                    htmlFor="custom-hero-eyebrow"
                    className="block text-sm font-medium text-zinc-900 mb-1.5"
                  >
                    হিরো উপ-শিরোনাম
                  </label>
                  <input
                    id="custom-hero-eyebrow"
                    type="text"
                    value={config.heroEyebrow}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        heroEyebrow: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="custom-hero-headline"
                    className="block text-sm font-medium text-zinc-900 mb-1.5"
                  >
                    মূল শিরোনাম (হিরো)
                  </label>
                  <input
                    id="custom-hero-headline"
                    type="text"
                    value={config.heroHeadline}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        heroHeadline: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="custom-hero-desc"
                    className="block text-sm font-medium text-zinc-900 mb-1.5"
                  >
                    হিরো পরিচিতি লেখা
                  </label>
                  <textarea
                    id="custom-hero-desc"
                    rows={3}
                    value={config.heroDescription}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        heroDescription: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="custom-hero-cta"
                    className="block text-sm font-medium text-zinc-900 mb-1.5"
                  >
                    প্রধান বাটনের লেখা
                  </label>
                  <input
                    id="custom-hero-cta"
                    type="text"
                    value={config.heroCtaLabel}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        heroCtaLabel: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="custom-hero-image-url"
                    className="block text-sm font-medium text-zinc-900 mb-1.5"
                  >
                    হিরো ছবির লিংক অথবা আপলোড
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="custom-hero-image-url"
                      type="url"
                      value={
                        config.heroImageOverride.startsWith('data:')
                          ? ''
                          : config.heroImageOverride
                      }
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          heroImageOverride: e.target.value,
                        }))
                      }
                      placeholder="https://... অথবা পাশ থেকে ছবি আপলোড করুন"
                      className="flex-1 px-3 py-2 min-h-[40px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                    />
                    <label className="px-3 py-2 min-h-[40px] inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-stone-300 hover:bg-stone-100 rounded-lg cursor-pointer whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroFileUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {config.heroImageOverride && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          heroImageOverride: '',
                        }))
                      }
                      className="mt-1.5 text-xs text-stone-600 hover:text-zinc-900 underline cursor-pointer"
                    >
                      মূল হিরো ছবিতে ফিরে যান
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Add / Edit Product Form */}
              <form
                onSubmit={handleSaveProductDraft}
                noValidate
                className="bg-white p-4 rounded-xl border border-stone-200 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900">
                    {editingProductId
                      ? 'পণ্য সম্পাদনা করুন'
                      : 'নতুন পণ্য যোগ করুন'}
                  </h3>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={handleCancelEditProduct}
                      className="text-xs text-stone-600 hover:text-zinc-900 underline cursor-pointer"
                    >
                      বাতিল
                    </button>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="draft-name"
                    className="block text-xs font-medium text-zinc-800 mb-1"
                  >
                    পণ্যের নাম *
                  </label>
                  <input
                    id="draft-name"
                    type="text"
                    value={draft.name}
                    onChange={(e) => {
                      setDraft((prev) => ({ ...prev, name: e.target.value }));
                      if (draftErrors.name) {
                        setDraftErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    placeholder="যেমন: হাতে বোনা নকশিকাঁথা"
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                  />
                  {draftErrors.name && (
                    <p role="alert" className="mt-1 text-xs text-red-700">
                      {draftErrors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="draft-category"
                      className="block text-xs font-medium text-zinc-800 mb-1"
                    >
                      বিভাগ
                    </label>
                    <select
                      id="draft-category"
                      value={draft.category}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          category: e.target.value as Exclude<CategoryId, 'all'>,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                    >
                      {categoryChoices.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="draft-price"
                      className="block text-xs font-medium text-zinc-800 mb-1"
                    >
                      মূল্য (৳) *
                    </label>
                    <input
                      id="draft-price"
                      type="number"
                      min={1}
                      value={draft.priceText}
                      onChange={(e) => {
                        setDraft((prev) => ({
                          ...prev,
                          priceText: e.target.value,
                        }));
                        if (draftErrors.priceText) {
                          setDraftErrors((prev) => ({
                            ...prev,
                            priceText: undefined,
                          }));
                        }
                      }}
                      placeholder="1500"
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                    />
                    {draftErrors.priceText && (
                      <p role="alert" className="mt-1 text-xs text-red-700">
                        {draftErrors.priceText}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="draft-short-desc"
                    className="block text-xs font-medium text-zinc-800 mb-1"
                  >
                    সংক্ষিপ্ত বিবরণ *
                  </label>
                  <input
                    id="draft-short-desc"
                    type="text"
                    value={draft.shortDescription}
                    onChange={(e) => {
                      setDraft((prev) => ({
                        ...prev,
                        shortDescription: e.target.value,
                      }));
                      if (draftErrors.shortDescription) {
                        setDraftErrors((prev) => ({
                          ...prev,
                          shortDescription: undefined,
                        }));
                      }
                    }}
                    placeholder="পণ্যের মূল বৈশিষ্ট্য এক লাইনে লিখুন"
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                  />
                  {draftErrors.shortDescription && (
                    <p role="alert" className="mt-1 text-xs text-red-700">
                      {draftErrors.shortDescription}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="draft-origin"
                      className="block text-xs font-medium text-zinc-800 mb-1"
                    >
                      উৎপত্তি / এলাকা
                    </label>
                    <input
                      id="draft-origin"
                      type="text"
                      value={draft.origin}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, origin: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="draft-variants"
                      className="block text-xs font-medium text-zinc-800 mb-1"
                    >
                      ভ্যারিয়েন্ট (কমা দিয়ে)
                    </label>
                    <input
                      id="draft-variants"
                      type="text"
                      value={draft.variantsText}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          variantsText: e.target.value,
                        }))
                      }
                      placeholder="M, L, XL"
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="draft-image-url"
                    className="block text-xs font-medium text-zinc-800 mb-1"
                  >
                    পণ্যের ছবির লিংক অথবা আপলোড (ঐচ্ছিক)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="draft-image-url"
                      type="url"
                      value={
                        draft.imageUrl.startsWith('data:') ? '' : draft.imageUrl
                      }
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                    />
                    <label className="px-3 py-2 inline-flex items-center gap-1.5 text-xs font-medium bg-[#FAF9F6] border border-stone-300 hover:bg-stone-100 rounded-lg cursor-pointer whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>ফাইল</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductFileUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-semibold text-white bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {editingProductId ? 'পরিবর্তন সংরক্ষণ করুন' : 'পণ্য যোগ করুন'}
                  </span>
                </button>
              </form>

              {/* Existing Products List */}
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-stone-600">
                  বর্তমান পণ্য তালিকা ({toBengaliDigits(config.products.length)})
                </p>
                <ul className="space-y-2">
                  {config.products.map((product) => (
                    <li
                      key={product.id}
                      className="bg-white px-3.5 py-3 rounded-lg border border-stone-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-stone-600 tabular-nums">
                          {product.categoryLabel} · {formatBdtPrice(product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditProduct(product)}
                          aria-label={`পণ্য সম্পাদনা: ${product.name}`}
                          className="p-2 text-stone-600 hover:text-zinc-900 hover:bg-stone-100 rounded-md cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          aria-label={`পণ্য মুছুন: ${product.name}`}
                          className="p-2 text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3.5">
                <h3 className="text-sm font-bold text-zinc-900">
                  ডেলিভারি চার্জ ও ফ্রি ডেলিভারি সীমা
                </h3>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label
                      htmlFor="ship-free"
                      className="block text-xs font-medium text-zinc-800 mb-1"
                    >
                      ফ্রি সীমা (৳)
                    </label>
                    <input
                      id="ship-free"
                      type="number"
                      min={0}
                      value={config.shipping.freeThreshold}
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            freeThreshold: Math.max(0, Number(e.target.value) || 0),
                          },
                        }))
                      }
                      className="w-full px-2.5 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ship-dhaka"
                      className="block text-xs font-medium text-zinc-800 mb-1"
                    >
                      ঢাকা (৳)
                    </label>
                    <input
                      id="ship-dhaka"
                      type="number"
                      min={0}
                      value={config.shipping.dhakaFee}
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            dhakaFee: Math.max(0, Number(e.target.value) || 0),
                          },
                        }))
                      }
                      className="w-full px-2.5 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ship-outside"
                      className="block text-xs font-medium text-zinc-800 mb-1"
                    >
                      বাইরে (৳)
                    </label>
                    <input
                      id="ship-outside"
                      type="number"
                      min={0}
                      value={config.shipping.outsideFee}
                      onChange={(e) =>
                        onUpdateConfig((prev) => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping,
                            outsideFee: Math.max(0, Number(e.target.value) || 0),
                          },
                        }))
                      }
                      className="w-full px-2.5 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3.5">
                <h3 className="text-sm font-bold text-zinc-900">
                  আমাদের গল্প সেকশন
                </h3>
                <div>
                  <label
                    htmlFor="story-headline"
                    className="block text-xs font-medium text-zinc-800 mb-1"
                  >
                    শিরোনাম
                  </label>
                  <input
                    id="story-headline"
                    type="text"
                    value={config.storyHeadline}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        storyHeadline: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="story-desc"
                    className="block text-xs font-medium text-zinc-800 mb-1"
                  >
                    বিবরণ
                  </label>
                  <textarea
                    id="story-desc"
                    rows={3}
                    value={config.storyDescription}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        storyDescription: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3.5">
                <h3 className="text-sm font-bold text-zinc-900">
                  যোগাযোগ ও ঠিকানা (ফুটার)
                </h3>
                <div>
                  <label
                    htmlFor="contact-addr"
                    className="block text-xs font-medium text-zinc-800 mb-1"
                  >
                    দোকানের ঠিকানা
                  </label>
                  <input
                    id="contact-addr"
                    type="text"
                    value={config.contactAddress}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        contactAddress: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-hotline"
                    className="block text-xs font-medium text-zinc-800 mb-1"
                  >
                    হটলাইন নম্বর
                  </label>
                  <input
                    id="contact-hotline"
                    type="text"
                    value={config.contactHotline}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        contactHotline: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-zinc-800 mb-1"
                  >
                    ইমেইল
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({
                        ...prev,
                        contactEmail: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Export / Import / Reset */}
        <div className="px-6 py-4 bg-white border-t border-stone-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportConfig}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-zinc-900 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>কনফিগ সেভ (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-zinc-900 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>রিস্টোর (JSON)</span>
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportConfig}
              className="sr-only"
              aria-label="JSON কনফিগ ফাইল আপলোড করুন"
            />
          </div>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>মূল ডিফল্টে রিসেট করুন</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs">
              <span className="text-red-900 font-medium">
                সব পরিবর্তন মুছে ডিফল্টে ফিরবেন?
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 bg-white border border-stone-300 rounded text-zinc-800 cursor-pointer"
                >
                  না
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetDefaults();
                    setConfirmReset(false);
                    showStatus('ডিফল্ট সেটিংস ফিরিয়ে আনা হয়েছে');
                  }}
                  className="px-2.5 py-1 bg-red-700 text-white rounded font-medium cursor-pointer"
                >
                  হ্যাঁ, রিসেট
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
