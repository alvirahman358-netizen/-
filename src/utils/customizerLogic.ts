import { CATALOG_PRODUCTS, CATEGORIES } from '../data/catalog';
import {
  CanvasToneId,
  CategoryId,
  Product,
  StoreConfig,
  ThemeAccentId,
} from '../types/store';
import {
  DELIVERY_FEE_DHAKA,
  DELIVERY_FEE_OUTSIDE,
  FREE_DELIVERY_THRESHOLD,
} from './storeLogic';

export const ACCENT_THEMES: Record<
  ThemeAccentId,
  { id: ThemeAccentId; label: string; primary: string; hover: string }
> = {
  forest: {
    id: 'forest',
    label: 'বনাঞ্চল সবুজ',
    primary: '#1B4332',
    hover: '#143326',
  },
  terracotta: {
    id: 'terracotta',
    label: 'পোড়ামাটি',
    primary: '#8C3B2B',
    hover: '#702D20',
  },
  indigo: {
    id: 'indigo',
    label: 'জামদানি নীল',
    primary: '#1E3A5F',
    hover: '#152A45',
  },
  charcoal: {
    id: 'charcoal',
    label: 'চারকোল',
    primary: '#27272A',
    hover: '#18181B',
  },
};

export const CANVAS_TONES: Record<
  CanvasToneId,
  { id: CanvasToneId; label: string; bg: string; surface: string }
> = {
  alabaster: {
    id: 'alabaster',
    label: 'উষ্ণ অ্যালাবাস্টার',
    bg: '#F8F7F4',
    surface: '#EFECE6',
  },
  chalk: {
    id: 'chalk',
    label: 'পরিচ্ছন্ন শাদা',
    bg: '#FFFFFF',
    surface: '#F4F4F5',
  },
  sand: {
    id: 'sand',
    label: 'নরম বালুকা',
    bg: '#F4F0E8',
    surface: '#E9E2D5',
  },
};

export function createDefaultStoreConfig(): StoreConfig {
  return {
    storeName: 'আমার দোকান',
    heroEyebrow: 'হস্তশিল্প ও দৈনন্দিন ঐতিহ্য · ঢাকা ও সারা বাংলাদেশ',
    heroHeadline: 'বাংলার কারুশিল্প ও আধুনিক রুচির পরিমিত সংগ্রহ',
    heroDescription:
      'রূপগঞ্জের জামদানি, রংপুরের শতরঞ্জি, ধামরাইয়ের পোড়ামাটি এবং সিলেটের বাগান থেকে সরাসরি সংগৃহীত খাঁটি পাতা চা—সব এক ছাদের নিচে।',
    heroCtaLabel: 'সংগ্রহ দেখুন',
    heroImageOverride: '',
    storyEyebrow: 'আমাদের গল্প',
    storyHeadline: 'স্থানীয় কারিগরের হাতের ছোঁয়া সরাসরি আপনার ঘরে',
    storyDescription:
      'আমার দোকানের প্রতিটি পণ্য দেশের বিভিন্ন অঞ্চলের দক্ষ তাঁতি, মৃৎশিল্পী ও কারিগরদের কাছ থেকে সরাসরি সংগ্রহ করা হয়। মধ্যস্বত্বভোগী ছাড়াই ন্যায্য মূল্য নিশ্চিত করে আমরা প্রতিটি পণ্যের মান ও মৌলিকত্ব যাচাই করে আপনার দোরগোড়ায় পৌঁছে দিই।',
    contactAddress: 'বাড়ি ২৪, রোড ৬, বনানী, ঢাকা-১২১৩',
    contactHotline: '০৯৬১২-০০৪৪৫৫ (সকাল ১০টা – রাত ৮টা)',
    contactEmail: 'support@amardokan.bd',
    accentId: 'forest',
    canvasToneId: 'alabaster',
    shipping: {
      freeThreshold: FREE_DELIVERY_THRESHOLD,
      dhakaFee: DELIVERY_FEE_DHAKA,
      outsideFee: DELIVERY_FEE_OUTSIDE,
    },
    products: CATALOG_PRODUCTS.map((p) => ({
      ...p,
      variants: [...p.variants],
    })),
    productImageOverrides: {},
  };
}

export function getCategoryLabel(category: Exclude<CategoryId, 'all'>): string {
  return CATEGORIES.find((c) => c.id === category)?.label ?? 'অন্যান্য';
}

export interface ProductDraftInput {
  name: string;
  category: Exclude<CategoryId, 'all'>;
  priceText: string;
  availabilityLabel: string;
  origin: string;
  shortDescription: string;
  description: string;
  craftNote: string;
  variantsText: string;
  imageUrl: string;
}

export interface ProductDraftErrors {
  name?: string;
  priceText?: string;
  shortDescription?: string;
}

export function validateProductDraft(
  draft: ProductDraftInput
): ProductDraftErrors {
  const errors: ProductDraftErrors = {};
  if (draft.name.trim().length < 2) {
    errors.name = 'পণ্যের নাম অন্তত ২ অক্ষরের হতে হবে।';
  }
  const numericPrice = Number(draft.priceText);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    errors.priceText = 'সঠিক মূল্য (৳) লিখুন, যা ০-এর বেশি।';
  }
  if (draft.shortDescription.trim().length < 5) {
    errors.shortDescription = 'সংক্ষিপ্ত বিবরণ লিখুন।';
  }
  return errors;
}

export function buildProductFromDraft(
  draft: ProductDraftInput,
  existingId?: string,
  nextOrder = 99
): Product {
  const id =
    existingId ??
    `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const variants = draft.variantsText
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  return {
    id,
    name: draft.name.trim(),
    category: draft.category,
    categoryLabel: getCategoryLabel(draft.category),
    price: Math.round(Number(draft.priceText)),
    availabilityLabel: draft.availabilityLabel.trim() || 'স্টকে আছে',
    origin: draft.origin.trim() || 'বাংলাদেশ',
    shortDescription: draft.shortDescription.trim(),
    description:
      draft.description.trim() || draft.shortDescription.trim(),
    craftNote:
      draft.craftNote.trim() || 'কারিগরের হাতে যত্নে তৈরি পণ্য।',
    variants: variants.length > 0 ? variants : ['স্ট্যান্ডার্ড'],
    featuredOrder: nextOrder,
  };
}

export function mergeWithDefaultStoreConfig(raw: unknown): StoreConfig {
  const defaults = createDefaultStoreConfig();
  if (!raw || typeof raw !== 'object') {
    return defaults;
  }
  const obj = raw as Partial<StoreConfig>;

  const accentId: ThemeAccentId =
    obj.accentId && obj.accentId in ACCENT_THEMES ? obj.accentId : defaults.accentId;
  const canvasToneId: CanvasToneId =
    obj.canvasToneId && obj.canvasToneId in CANVAS_TONES
      ? obj.canvasToneId
      : defaults.canvasToneId;

  const products =
    Array.isArray(obj.products) && obj.products.length > 0
      ? obj.products.filter(
          (p): p is Product =>
            Boolean(p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.price === 'number')
        )
      : defaults.products;

  return {
    storeName:
      typeof obj.storeName === 'string' && obj.storeName.trim()
        ? obj.storeName.trim()
        : defaults.storeName,
    heroEyebrow:
      typeof obj.heroEyebrow === 'string'
        ? obj.heroEyebrow
        : defaults.heroEyebrow,
    heroHeadline:
      typeof obj.heroHeadline === 'string' && obj.heroHeadline.trim()
        ? obj.heroHeadline
        : defaults.heroHeadline,
    heroDescription:
      typeof obj.heroDescription === 'string'
        ? obj.heroDescription
        : defaults.heroDescription,
    heroCtaLabel:
      typeof obj.heroCtaLabel === 'string' && obj.heroCtaLabel.trim()
        ? obj.heroCtaLabel
        : defaults.heroCtaLabel,
    heroImageOverride:
      typeof obj.heroImageOverride === 'string' ? obj.heroImageOverride : '',
    storyEyebrow:
      typeof obj.storyEyebrow === 'string'
        ? obj.storyEyebrow
        : defaults.storyEyebrow,
    storyHeadline:
      typeof obj.storyHeadline === 'string' && obj.storyHeadline.trim()
        ? obj.storyHeadline
        : defaults.storyHeadline,
    storyDescription:
      typeof obj.storyDescription === 'string'
        ? obj.storyDescription
        : defaults.storyDescription,
    contactAddress:
      typeof obj.contactAddress === 'string'
        ? obj.contactAddress
        : defaults.contactAddress,
    contactHotline:
      typeof obj.contactHotline === 'string'
        ? obj.contactHotline
        : defaults.contactHotline,
    contactEmail:
      typeof obj.contactEmail === 'string'
        ? obj.contactEmail
        : defaults.contactEmail,
    accentId,
    canvasToneId,
    shipping: {
      freeThreshold:
        typeof obj.shipping?.freeThreshold === 'number' &&
        obj.shipping.freeThreshold >= 0
          ? obj.shipping.freeThreshold
          : defaults.shipping.freeThreshold,
      dhakaFee:
        typeof obj.shipping?.dhakaFee === 'number' &&
        obj.shipping.dhakaFee >= 0
          ? obj.shipping.dhakaFee
          : defaults.shipping.dhakaFee,
      outsideFee:
        typeof obj.shipping?.outsideFee === 'number' &&
        obj.shipping.outsideFee >= 0
          ? obj.shipping.outsideFee
          : defaults.shipping.outsideFee,
    },
    products: products.length > 0 ? products : defaults.products,
    productImageOverrides:
      obj.productImageOverrides && typeof obj.productImageOverrides === 'object'
        ? obj.productImageOverrides
        : {},
  };
}
