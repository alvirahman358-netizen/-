import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG_PRODUCTS } from '../data/catalog';
import {
  addOrUpdateCartItem,
  calculateCartTotals,
  createOrderReceipt,
  filterAndSortProducts,
  formatBdtPrice,
  toBengaliDigits,
  updateCartItemQuantity,
  validateCheckoutForm,
} from './storeLogic';

test('toBengaliDigits and formatBdtPrice format BDT cleanly', () => {
  assert.equal(toBengaliDigits(1042), '১০৪২');
  assert.equal(formatBdtPrice(6800), '৳৬,৮০০');
  assert.equal(formatBdtPrice(0), '৳০');
});

test('filterAndSortProducts filters by category, search query, and sorts by price', () => {
  const apparel = filterAndSortProducts(CATALOG_PRODUCTS, {
    category: 'apparel',
    query: '',
    sort: 'featured',
  });
  assert.equal(apparel.length, 2);
  assert.ok(apparel.every((p) => p.category === 'apparel'));

  const teaSearch = filterAndSortProducts(CATALOG_PRODUCTS, {
    category: 'all',
    query: 'সাতকরা',
    sort: 'featured',
  });
  assert.equal(teaSearch.length, 1);
  assert.equal(teaSearch[0].id, 'sylhet-tea-tin');

  const ascending = filterAndSortProducts(CATALOG_PRODUCTS, {
    category: 'all',
    query: '',
    sort: 'price-asc',
  });
  assert.equal(ascending[0].price, 680);
  assert.equal(ascending[ascending.length - 1].price, 6800);
});

test('calculateCartTotals handles empty cart, below-threshold delivery, and free delivery', () => {
  const emptyTotals = calculateCartTotals([], 'dhaka');
  assert.equal(emptyTotals.total, 0);
  assert.equal(emptyTotals.deliveryFee, 0);

  const teaProduct = CATALOG_PRODUCTS.find((p) => p.id === 'sylhet-tea-tin')!;
  const oneTea = addOrUpdateCartItem([], teaProduct, teaProduct.variants[0], 1);
  const dhakaBelow = calculateCartTotals(oneTea, 'dhaka');
  assert.equal(dhakaBelow.subtotal, 680);
  assert.equal(dhakaBelow.deliveryFee, 60);
  assert.equal(dhakaBelow.total, 740);
  assert.equal(dhakaBelow.freeDeliveryRemaining, 820);
  assert.equal(dhakaBelow.qualifiesForFreeDelivery, false);

  const threeTeas = updateCartItemQuantity(oneTea, teaProduct.id, teaProduct.variants[0], 3);
  const freeTotals = calculateCartTotals(threeTeas, 'outside');
  assert.equal(freeTotals.subtotal, 2040);
  assert.equal(freeTotals.deliveryFee, 0);
  assert.equal(freeTotals.total, 2040);
  assert.equal(freeTotals.qualifiesForFreeDelivery, true);
});

test('validateCheckoutForm rejects empty/invalid inputs and accepts valid Bangladeshi phone', () => {
  const invalid = validateCheckoutForm({
    fullName: ' ',
    phone: '12345',
    address: 'ঢাকা',
    zone: 'dhaka',
    note: '',
  });
  assert.ok(invalid.fullName);
  assert.ok(invalid.phone);
  assert.ok(invalid.address);

  const valid = validateCheckoutForm({
    fullName: 'তানভীর আহমেদ',
    phone: '০১৭১২৩৪৫৬৭৮',
    address: 'বাড়ি ১২, রোড ৪, ধানমন্ডি, ঢাকা',
    zone: 'dhaka',
    note: '',
  });
  assert.deepEqual(valid, {});
});

test('createOrderReceipt generates deterministic receipt structure', () => {
  const teaProduct = CATALOG_PRODUCTS.find((p) => p.id === 'sylhet-tea-tin')!;
  const items = addOrUpdateCartItem([], teaProduct, teaProduct.variants[0], 2);
  const totals = calculateCartTotals(items, 'dhaka');
  const receipt = createOrderReceipt(
    items,
    {
      fullName: 'তানভীর আহমেদ',
      phone: '01712345678',
      address: 'বাড়ি ১২, রোড ৪, ধানমন্ডি, ঢাকা',
      zone: 'dhaka',
      note: '',
    },
    totals,
    1042
  );

  assert.equal(receipt.orderNumber, 'AD-1042');
  assert.equal(receipt.phone, '01712345678');
  assert.equal(receipt.items.length, 1);
  assert.equal(receipt.totals.total, 1420);
});
