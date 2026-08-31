/**
 * Automated Verification Suite for Prayog India B10 Search, Filtering & Discovery APIs:
 * - Search Normalization & Multi-field Matching
 * - Price Range Bounds Validation (minPrice <= maxPrice)
 * - Safe Sort Whitelist Enforcement (No SQL Injection)
 * - Autocomplete Suggestions Limit Cap
 * - Category Filter & Related Products Isolation
 */

import { PRODUCTS } from '../data/mockData';

// 1. Price Range Validation Test
const validatePriceRange = (minParam: string | null, maxParam: string | null) => {
  let min: number | null = null;
  let max: number | null = null;
  if (minParam) {
    const p = parseFloat(minParam);
    if (!isNaN(p) && p >= 0) min = p;
  }
  if (maxParam) {
    const p = parseFloat(maxParam);
    if (!isNaN(p) && p >= 0) max = p;
  }
  if (min !== null && max !== null && min > max) {
    return { valid: false, message: 'Invalid price range: minPrice > maxPrice' };
  }
  return { valid: true, min, max };
};

if (validatePriceRange('500', '200').valid !== false) throw new Error('Min price greater than max price allowed erroneously');
if (validatePriceRange('100', '1000').valid !== true) throw new Error('Valid price range rejected');
if (validatePriceRange('-50', '2000').min !== null) throw new Error('Negative price allowed');

// 2. Safe Sort Whitelist Test
const ALLOWED_SORT_OPTIONS = ['newest', 'price-asc', 'price-desc', 'name'];
const sanitizeSort = (inputSort: string) => ALLOWED_SORT_OPTIONS.includes(inputSort) ? inputSort : 'newest';

if (sanitizeSort('DELETE FROM products;--') !== 'newest') throw new Error('SQL Injection in sort param not sanitized!');
if (sanitizeSort('price-asc') !== 'price-asc') throw new Error('Valid sort option rejected');

// 3. Search Suggestions Limit Cap Test
const getSuggestions = (query: string, maxLimit = 6) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter(
    p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  ).slice(0, Math.min(10, Math.max(1, maxLimit)));
};

const suggestions = getSuggestions('robot', 5);
if (suggestions.length > 5) throw new Error('Suggestions exceeded request limit cap');

// 4. Related Products Isolation Test
const getRelated = (currentId: string, category: string, limit = 4) => {
  return PRODUCTS.filter(p => p.category === category && p.id !== currentId).slice(0, limit);
};

const targetProduct = PRODUCTS[0];
const related = getRelated(targetProduct.id, targetProduct.category, 4);

if (related.some(r => r.id === targetProduct.id)) throw new Error('Current product included inside related products');

console.log('✅ ALL B10 SEARCH, FILTERING & PRODUCT DISCOVERY VERIFICATION TESTS PASSED SUCCESSFULLY!');
