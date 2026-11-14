import {
  CartItem,
  CartTotals,
  CategoryId,
  CheckoutErrors,
  CheckoutFormData,
  DeliveryZone,
  OrderReceipt,
  Product,
  SortOption,
} from '../types/store';

export const FREE_DELIVERY_THRESHOLD = 1500;
export const DELIVERY_FEE_DHAKA = 60;
export const DELIVERY_FEE_OUTSIDE = 120;

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)] ?? digit);
}

export function formatBdtPrice(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
  return `৳${toBengaliDigits(formatted)}`;
}

export function filterAndSortProducts(
  products: Product[],
  options: { category: CategoryId; query: string; sort: SortOption }
): Product[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const matchesCategory =
      options.category === 'all' || product.category === options.category;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      product.name,
      product.categoryLabel,
      product.shortDescription,
      product.origin,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  return [...filtered].sort((a, b) => {
    if (options.sort === 'price-asc') {
      return a.price - b.price;
    }
    if (options.sort === 'price-desc') {
      return b.price - a.price;
    }
    return a.featuredOrder - b.featuredOrder;
  });
}

export function calculateCartTotals(
  items: CartItem[],
  zone: DeliveryZone,
  shipping?: {
    freeThreshold: number;
    dhakaFee: number;
    outsideFee: number;
  }
): CartTotals {
  const freeThreshold = shipping?.freeThreshold ?? FREE_DELIVERY_THRESHOLD;
  const dhakaFee = shipping?.dhakaFee ?? DELIVERY_FEE_DHAKA;
  const outsideFee = shipping?.outsideFee ?? DELIVERY_FEE_OUTSIDE;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0 || subtotal === 0) {
    return {
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      totalQuantity: 0,
      freeDeliveryRemaining: freeThreshold,
      qualifiesForFreeDelivery: false,
    };
  }

  const qualifiesForFreeDelivery = subtotal >= freeThreshold;
  const deliveryFee = qualifiesForFreeDelivery
    ? 0
    : zone === 'dhaka'
      ? dhakaFee
      : outsideFee;

  const freeDeliveryRemaining = Math.max(0, freeThreshold - subtotal);

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    totalQuantity,
    freeDeliveryRemaining,
    qualifiesForFreeDelivery,
  };
}

export function addOrUpdateCartItem(
  items: CartItem[],
  product: Product,
  variant: string,
  quantityDelta: number
): CartItem[] {
  const existingIndex = items.findIndex(
    (item) => item.productId === product.id && item.variant === variant
  );

  if (existingIndex === -1) {
    if (quantityDelta <= 0) {
      return items;
    }
    return [
      ...items,
      {
        productId: product.id,
        name: product.name,
        categoryLabel: product.categoryLabel,
        variant,
        price: product.price,
        quantity: quantityDelta,
      },
    ];
  }

  const nextQuantity = items[existingIndex].quantity + quantityDelta;
  if (nextQuantity <= 0) {
    return items.filter((_, idx) => idx !== existingIndex);
  }

  return items.map((item, idx) =>
    idx === existingIndex ? { ...item, quantity: nextQuantity } : item
  );
}

export function updateCartItemQuantity(
  items: CartItem[],
  productId: string,
  variant: string,
  nextQuantity: number
): CartItem[] {
  if (nextQuantity <= 0) {
    return items.filter(
      (item) => !(item.productId === productId && item.variant === variant)
    );
  }
  return items.map((item) =>
    item.productId === productId && item.variant === variant
      ? { ...item, quantity: nextQuantity }
      : item
  );
}

export function normalizeBangladeshPhone(raw: string): string {
  const westernDigits = raw.replace(/[০-৯]/g, (char) => {
    const idx = BENGALI_DIGITS.indexOf(char);
    return idx >= 0 ? String(idx) : char;
  });
  return westernDigits.replace(/[\s-]/g, '').replace(/^\+?88/, '');
}

export function validateCheckoutForm(data: CheckoutFormData): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (data.fullName.trim().length < 2) {
    errors.fullName = 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।';
  }

  const normalizedPhone = normalizeBangladeshPhone(data.phone);
  if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
    errors.phone = 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 01712345678)।';
  }

  if (data.address.trim().length < 8) {
    errors.address = 'বিস্তারিত ডেলিভারি ঠিকানা (বাড়ি, রাস্তা ও এলাকা) লিখুন।';
  }

  return errors;
}

export function createOrderReceipt(
  items: CartItem[],
  form: CheckoutFormData,
  totals: CartTotals,
  seedNumber?: number
): OrderReceipt {
  const randomCode = seedNumber ?? Math.floor(1000 + Math.random() * 9000);
  return {
    orderNumber: `AD-${randomCode}`,
    createdAt: new Date().toISOString(),
    customerName: form.fullName.trim(),
    phone: normalizeBangladeshPhone(form.phone),
    address: form.address.trim(),
    zone: form.zone,
    items: items.map((item) => ({ ...item })),
    totals,
  };
}
