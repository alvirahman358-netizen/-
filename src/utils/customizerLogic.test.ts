import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildProductFromDraft,
  createDefaultStoreConfig,
  mergeWithDefaultStoreConfig,
  validateProductDraft,
} from './customizerLogic';
import { calculateCartTotals } from './storeLogic';

test('createDefaultStoreConfig returns complete defaults with 6 products', () => {
  const cfg = createDefaultStoreConfig();
  assert.equal(cfg.storeName, 'আমার দোকান');
  assert.equal(cfg.products.length, 6);
  assert.equal(cfg.accentId, 'forest');
  assert.equal(cfg.shipping.dhakaFee, 60);
});

test('validateProductDraft rejects invalid price and short names', () => {
  const errors = validateProductDraft({
    name: 'ক',
    category: 'home',
    priceText: '-10',
    availabilityLabel: 'স্টকে আছে',
    origin: 'ঢাকা',
    shortDescription: 'অল্প',
    description: '',
    craftNote: '',
    variantsText: '',
    imageUrl: '',
  });
  assert.ok(errors.name);
  assert.ok(errors.priceText);
  assert.ok(errors.shortDescription);
});

test('buildProductFromDraft creates structured product with parsed variants', () => {
  const product = buildProductFromDraft({
    name: 'নকশিকাঁথা কুশন কভার',
    category: 'home',
    priceText: '1250',
    availabilityLabel: 'স্টকে আছে',
    origin: 'জামালপুর',
    shortDescription: 'হাতে সেলাই করা সুতির নকশিকাঁথা কুশন কভার।',
    description: '',
    craftNote: '',
    variantsText: '১৬×১৬ ইঞ্চি, ১৮×১৮ ইঞ্চি',
    imageUrl: '',
  });
  assert.equal(product.categoryLabel, 'গৃহসজ্জা');
  assert.equal(product.price, 1250);
  assert.deepEqual(product.variants, ['১৬×১৬ ইঞ্চি', '১৮×১৮ ইঞ্চি']);
});

test('mergeWithDefaultStoreConfig falls back safely on malformed input', () => {
  const merged = mergeWithDefaultStoreConfig({
    storeName: '  সোনালী বুটিক  ',
    accentId: 'invalid-color',
    shipping: { dhakaFee: 100, outsideFee: 150, freeThreshold: 2000 },
  });
  assert.equal(merged.storeName, 'সোনালী বুটিক');
  assert.equal(merged.accentId, 'forest');
  assert.equal(merged.shipping.dhakaFee, 100);
  assert.equal(merged.products.length, 6);
});

test('calculateCartTotals respects custom shipping rates', () => {
  const product = buildProductFromDraft({
    name: 'টেস্ট পণ্য',
    category: 'tea',
    priceText: '500',
    availabilityLabel: 'স্টকে আছে',
    origin: 'সিলেট',
    shortDescription: 'পরীক্ষামূলক বিবরণ এখানে',
    description: '',
    craftNote: '',
    variantsText: '',
    imageUrl: '',
  });

  const totals = calculateCartTotals(
    [
      {
        productId: product.id,
        name: product.name,
        categoryLabel: product.categoryLabel,
        variant: 'স্ট্যান্ডার্ড',
        price: 500,
        quantity: 1,
      },
    ],
    'dhaka',
    { freeThreshold: 2000, dhakaFee: 100, outsideFee: 180 }
  );

  assert.equal(totals.deliveryFee, 100);
  assert.equal(totals.total, 600);
  assert.equal(totals.freeDeliveryRemaining, 1500);
});
