export type CategoryId =
  | 'all'
  | 'apparel'
  | 'home'
  | 'leather'
  | 'tea';

export type SortOption = 'featured' | 'price-asc' | 'price-desc';

export type DeliveryZone = 'dhaka' | 'outside';

export interface Product {
  id: string;
  name: string;
  category: Exclude<CategoryId, 'all'>;
  categoryLabel: string;
  price: number;
  availabilityLabel: string;
  shortDescription: string;
  description: string;
  craftNote: string;
  origin: string;
  variants: string[];
  featuredOrder: number;
}

export interface CartItem {
  productId: string;
  name: string;
  categoryLabel: string;
  variant: string;
  price: number;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalQuantity: number;
  freeDeliveryRemaining: number;
  qualifiesForFreeDelivery: boolean;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
  zone: DeliveryZone;
  note: string;
}

export interface CheckoutErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface OrderReceipt {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  zone: DeliveryZone;
  items: CartItem[];
  totals: CartTotals;
}

export type ThemeAccentId = 'forest' | 'terracotta' | 'indigo' | 'charcoal';
export type CanvasToneId = 'alabaster' | 'chalk' | 'sand';

export interface ShippingConfig {
  freeThreshold: number;
  dhakaFee: number;
  outsideFee: number;
}

export interface StoreConfig {
  storeName: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  heroCtaLabel: string;
  heroImageOverride: string;
  storyEyebrow: string;
  storyHeadline: string;
  storyDescription: string;
  contactAddress: string;
  contactHotline: string;
  contactEmail: string;
  accentId: ThemeAccentId;
  canvasToneId: CanvasToneId;
  shipping: ShippingConfig;
  products: Product[];
  productImageOverrides: Record<string, string>;
}

