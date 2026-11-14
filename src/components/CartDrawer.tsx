import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { PRODUCT_IMAGES } from '../data/productImages';
import {
  CartItem,
  CheckoutErrors,
  CheckoutFormData,
  DeliveryZone,
  OrderReceipt,
  ShippingConfig,
} from '../types/store';
import {
  calculateCartTotals,
  createOrderReceipt,
  formatBdtPrice,
  toBengaliDigits,
  validateCheckoutForm,
} from '../utils/storeLogic';
import { ProductImage } from './ProductImage';

type DrawerView = 'cart' | 'checkout' | 'confirmation' | 'orders';

interface CartDrawerProps {
  isOpen: boolean;
  initialView?: DrawerView;
  items: CartItem[];
  recentOrders: OrderReceipt[];
  shippingConfig: ShippingConfig;
  productImageOverrides: Record<string, string>;
  onClose: () => void;
  onUpdateQuantity: (productId: string, variant: string, nextQty: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onOrderConfirmed: (receipt: OrderReceipt) => void;
}

const EMPTY_FORM: CheckoutFormData = {
  fullName: '',
  phone: '',
  address: '',
  zone: 'dhaka',
  note: '',
};

export function CartDrawer({
  isOpen,
  initialView = 'cart',
  items,
  recentOrders,
  shippingConfig,
  productImageOverrides,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOrderConfirmed,
}: CartDrawerProps) {
  const [view, setView] = useState<DrawerView>(initialView);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('dhaka');
  const [formData, setFormData] = useState<CheckoutFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [latestReceipt, setLatestReceipt] = useState<OrderReceipt | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  useEffect(() => {
    if (!isOpen) return;
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

  const totals = calculateCartTotals(items, deliveryZone, shippingConfig);

  const handleZoneChange = (zone: DeliveryZone) => {
    setDeliveryZone(zone);
    setFormData((prev) => ({ ...prev, zone }));
  };

  const handleSubmitCheckout = (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateCheckoutForm({
      ...formData,
      zone: deliveryZone,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const receipt = createOrderReceipt(
      items,
      { ...formData, zone: deliveryZone },
      totals
    );
    setLatestReceipt(receipt);
    setErrors({});
    setFormData(EMPTY_FORM);
    onOrderConfirmed(receipt);
    setView('confirmation');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-zinc-950/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md h-full bg-[#FAF9F6] border-l border-stone-200 shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2.5">
            {view === 'checkout' && (
              <button
                type="button"
                onClick={() => setView('cart')}
                aria-label="ব্যাগে ফিরে যান"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-stone-100 text-zinc-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <h2
              id="drawer-title"
              className="text-lg font-bold text-zinc-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {view === 'cart' && `আপনার শপিং ব্যাগ (${toBengaliDigits(totals.totalQuantity)})`}
              {view === 'checkout' && 'ডেলিভারি তথ্য ও ক্যাশ অন ডেলিভারি'}
              {view === 'confirmation' && 'অর্ডার নিশ্চিত হয়েছে'}
              {view === 'orders' && 'পূর্ববর্তী অর্ডারসমূহ'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ব্যাগ বন্ধ করুন"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-100 text-zinc-700 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {view === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-[var(--brand-surface)] flex items-center justify-center mb-4">
                    <ShoppingBag
                      className="w-6 h-6 text-[var(--brand-accent)]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-base font-semibold text-zinc-900 mb-1">
                    আপনার ব্যাগটি এখনো খালি
                  </p>
                  <p className="text-sm text-stone-600 max-w-xs mb-6">
                    আমাদের সংগ্রহ থেকে পছন্দের পোশাক, গৃহসজ্জা বা চা বেছে নিয়ে
                    ব্যাগে যোগ করুন।
                  </p>
                  {recentOrders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setView('orders')}
                      className="text-sm font-medium text-[var(--brand-accent)] hover:underline underline-offset-4 cursor-pointer"
                    >
                      পূর্ববর্তী অর্ডার দেখুন ({toBengaliDigits(recentOrders.length)})
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-lg bg-[var(--brand-surface)] border border-stone-200/80 text-xs sm:text-sm text-zinc-800">
                    {totals.qualifiesForFreeDelivery ? (
                      <p className="font-medium text-[var(--brand-accent)]">
                        অভিনন্দন! আপনার অর্ডারে ফ্রি ডেলিভারি প্রযোজ্য হয়েছে।
                      </p>
                    ) : (
                      <p className="tabular-nums">
                        আরও{' '}
                        <span className="font-semibold text-zinc-900">
                          {formatBdtPrice(totals.freeDeliveryRemaining)}
                        </span>{' '}
                        যোগ করলে সারা দেশে ফ্রি ডেলিভারি পাবেন (শর্ত:{' '}
                        {formatBdtPrice(shippingConfig.freeThreshold)}+)।
                      </p>
                    )}
                  </div>

                  <ul className="divide-y divide-stone-200">
                    {items.map((item) => (
                      <li
                        key={`${item.productId}-${item.variant}`}
                        className="py-4 flex gap-4"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--brand-surface)] border border-stone-200 shrink-0">
                          <ProductImage
                            src={
                              productImageOverrides[item.productId] ||
                              PRODUCT_IMAGES[item.productId]
                            }
                            alt={item.name}
                            title={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-zinc-900 leading-snug">
                              {item.name}
                            </h3>
                            <button
                              type="button"
                              onClick={() =>
                                onRemoveItem(item.productId, item.variant)
                              }
                              aria-label={`${item.name} (${item.variant}) ব্যাগ থেকে সরান`}
                              className="p-1.5 text-stone-500 hover:text-red-700 rounded-md transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>

                          <p className="text-xs text-stone-600 mt-0.5">
                            {item.variant}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center border border-stone-300 bg-white rounded-lg">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.productId,
                                    item.variant,
                                    item.quantity - 1
                                  )
                                }
                                aria-label={`${item.name} পরিমাণ কমান`}
                                className="w-8 h-8 inline-flex items-center justify-center text-zinc-700 hover:bg-stone-100 rounded-l-lg cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                              <span className="w-8 text-center text-xs font-semibold text-zinc-900 tabular-nums">
                                {toBengaliDigits(item.quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.productId,
                                    item.variant,
                                    item.quantity + 1
                                  )
                                }
                                aria-label={`${item.name} পরিমাণ বাড়ান`}
                                className="w-8 h-8 inline-flex items-center justify-center text-zinc-700 hover:bg-stone-100 rounded-r-lg cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </div>

                            <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                              {formatBdtPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <p className="text-xs font-medium text-stone-600 mb-2">
                      ডেলিভারি এলাকা নির্বাচন করুন
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleZoneChange('dhaka')}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          deliveryZone === 'dhaka'
                            ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white'
                            : 'border-stone-300 bg-white text-zinc-800 hover:border-zinc-500'
                        }`}
                      >
                        ঢাকা শহর ({formatBdtPrice(shippingConfig.dhakaFee)})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleZoneChange('outside')}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          deliveryZone === 'outside'
                            ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white'
                            : 'border-stone-300 bg-white text-zinc-800 hover:border-zinc-500'
                        }`}
                      >
                        ঢাকার বাইরে ({formatBdtPrice(shippingConfig.outsideFee)})
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {view === 'checkout' && (
            <form
              id="cod-checkout-form"
              onSubmit={handleSubmitCheckout}
              noValidate
              className="space-y-4"
            >
              <div className="p-3.5 rounded-lg bg-[var(--brand-surface)] border border-stone-200/80 text-xs text-stone-700 leading-relaxed">
                পেমেন্ট মাধ্যম: <strong className="text-zinc-900">ক্যাশ অন ডেলিভারি</strong>।
                পণ্য বুঝে পাওয়ার পর ডেলিভারি প্রতিনিধির কাছে মোট{' '}
                <strong className="text-zinc-900 tabular-nums">
                  {formatBdtPrice(totals.total)}
                </strong>{' '}
                পরিশোধ করবেন।
              </div>

              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-sm font-medium text-zinc-900 mb-1.5"
                >
                  আপনার পূর্ণ নাম <span className="text-red-700">*</span>
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                />
                {errors.fullName && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-sm font-medium text-zinc-900 mb-1.5"
                >
                  মোবাইল নম্বর <span className="text-red-700">*</span>
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="01712345678"
                  className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                />
                {errors.phone && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-zone"
                  className="block text-sm font-medium text-zinc-900 mb-1.5"
                >
                  ডেলিভারি এলাকা
                </label>
                <select
                  id="checkout-zone"
                  value={deliveryZone}
                  onChange={(e) => handleZoneChange(e.target.value as DeliveryZone)}
                  className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                >
                  <option value="dhaka">ঢাকা শহর</option>
                  <option value="outside">ঢাকার বাইরে (সারা বাংলাদেশ)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-sm font-medium text-zinc-900 mb-1.5"
                >
                  বিস্তারিত ঠিকানা <span className="text-red-700">*</span>
                </label>
                <textarea
                  id="checkout-address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, address: e.target.value }));
                    if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  placeholder="বাড়ি নম্বর, রাস্তা, ফ্ল্যাট ও এলাকার নাম লিখুন"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                />
                {errors.address && (
                  <p role="alert" className="mt-1 text-xs text-red-700">
                    {errors.address}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-note"
                  className="block text-sm font-medium text-zinc-900 mb-1.5"
                >
                  অতিরিক্ত নির্দেশনা (ঐচ্ছিক)
                </label>
                <input
                  id="checkout-note"
                  type="text"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="যেমন: বিকাল ৪টার পর ডেলিভারি দিলে ভালো হয়"
                  className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[var(--brand-accent)]"
                />
              </div>
            </form>
          )}

          {view === 'confirmation' && latestReceipt && (
            <div className="py-4 space-y-5">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-stone-200">
                <CheckCircle2
                  className="w-6 h-6 text-[var(--brand-accent)] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-base font-bold text-zinc-900">
                    অর্ডার #{latestReceipt.orderNumber} নিশ্চিত হয়েছে
                  </p>
                  <p className="text-sm text-stone-600 mt-1">
                    ধন্যবাদ, {latestReceipt.customerName}। আপনার পণ্য প্যাকিংয়ের
                    প্রস্তুতি চলছে। শীঘ্রই আমাদের প্রতিনিধি{' '}
                    <span className="tabular-nums">{latestReceipt.phone}</span>{' '}
                    নম্বরে যোগাযোগ করবেন।
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3 text-sm">
                <p className="font-semibold text-zinc-900 border-b border-stone-100 pb-2">
                  অর্ডার রসিদ
                </p>
                <div className="text-xs text-stone-600 space-y-1">
                  <p>
                    <span className="text-stone-500">ঠিকানা:</span>{' '}
                    {latestReceipt.address}
                  </p>
                  <p>
                    <span className="text-stone-500">এলাকা:</span>{' '}
                    {latestReceipt.zone === 'dhaka' ? 'ঢাকা শহর' : 'ঢাকার বাইরে'}
                  </p>
                </div>

                <ul className="divide-y divide-stone-100 pt-1">
                  {latestReceipt.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.variant}`}
                      className="py-2 flex items-center justify-between gap-2 text-xs sm:text-sm"
                    >
                      <span className="text-zinc-800">
                        {item.name} ({item.variant}) ×{' '}
                        <span className="tabular-nums">
                          {toBengaliDigits(item.quantity)}
                        </span>
                      </span>
                      <span className="font-medium text-zinc-900 tabular-nums shrink-0">
                        {formatBdtPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-stone-200 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="tabular-nums">
                      {latestReceipt.totals.deliveryFee === 0
                        ? 'ফ্রি'
                        : formatBdtPrice(latestReceipt.totals.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-zinc-900 text-base">
                    <span>সর্বমোট (ক্যাশ অন ডেলিভারি)</span>
                    <span className="tabular-nums">
                      {formatBdtPrice(latestReceipt.totals.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'orders' && (
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-stone-600 py-8 text-center">
                  এখনো কোনো অর্ডার সম্পন্ন হয়নি।
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="bg-white rounded-xl border border-stone-200 p-4 text-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900">
                        অর্ডার #{order.orderNumber}
                      </span>
                      <span className="text-xs font-medium text-[var(--brand-accent)]">
                        নিশ্চিত হয়েছে
                      </span>
                    </div>
                    <p className="text-xs text-stone-600">
                      {order.customerName} · {order.address}
                    </p>
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between font-semibold text-zinc-900">
                      <span className="text-xs text-stone-600 tabular-nums">
                        মোট পণ্য: {toBengaliDigits(order.totals.totalQuantity)}টি
                      </span>
                      <span className="tabular-nums">
                        {formatBdtPrice(order.totals.total)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {view === 'cart' && items.length > 0 && (
          <div className="px-6 py-5 border-t border-stone-200 bg-white space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>পণ্যের মূল্য</span>
                <span className="tabular-nums font-medium text-zinc-900">
                  {formatBdtPrice(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>ডেলিভারি চার্জ</span>
                <span className="tabular-nums font-medium text-zinc-900">
                  {totals.deliveryFee === 0
                    ? 'ফ্রি'
                    : formatBdtPrice(totals.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-900 pt-2 border-t border-stone-100">
                <span>সর্বমোট</span>
                <span className="tabular-nums">
                  {formatBdtPrice(totals.total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setView('checkout')}
              className="w-full py-3 px-4 min-h-[44px] text-sm sm:text-base font-semibold text-white bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] rounded-lg transition-colors cursor-pointer"
            >
              অর্ডার সম্পন্ন করুন
            </button>
          </div>
        )}

        {view === 'checkout' && (
          <div className="px-6 py-4 border-t border-stone-200 bg-white">
            <button
              type="submit"
              form="cod-checkout-form"
              className="w-full py-3 px-4 min-h-[44px] text-sm sm:text-base font-semibold text-white bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] rounded-lg transition-colors cursor-pointer"
            >
              অর্ডার নিশ্চিত করুন · {formatBdtPrice(totals.total)}
            </button>
          </div>
        )}

        {(view === 'confirmation' || view === 'orders') && (
          <div className="px-6 py-4 border-t border-stone-200 bg-white flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 min-h-[44px] text-sm font-semibold text-white bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] rounded-lg transition-colors cursor-pointer"
            >
              কেনাকাটা চালিয়ে যান
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
