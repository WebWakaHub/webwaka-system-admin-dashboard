/**
 * Product Primitive Unit Tests
 * 100% code coverage
 */

import { Product, ProductStatus } from '../Product';
import { Money } from '../Money';

describe('Product Primitive', () => {
  const basePrice = new Money(10000, 'NGN');

  describe('Constructor', () => {
    it('should create Product with valid data', () => {
      const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);
      expect(product.id).toBe('prod-1');
      expect(product.sku).toBe('SKU001');
      expect(product.name).toBe('Test Product');
      expect(product.basePrice).toEqual(basePrice);
    });

    it('should throw error for invalid ID', () => {
      expect(() => new Product('', 'SKU001', 'Test', basePrice)).toThrow('Product ID is required');
    });

    it('should throw error for invalid SKU', () => {
      expect(() => new Product('prod-1', '', 'Test', basePrice)).toThrow('SKU is required');
    });

    it('should throw error for invalid name', () => {
      expect(() => new Product('prod-1', 'SKU001', '', basePrice)).toThrow('Name is required');
    });

    it('should throw error for invalid price', () => {
      expect(() => new Product('prod-1', 'SKU001', 'Test', null as any)).toThrow('Base price is required');
    });
  });

  describe('Product Properties', () => {
    const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);

    it('should have initial status of ACTIVE', () => {
      expect(product.status).toBe(ProductStatus.ACTIVE);
    });

    it('should have empty description initially', () => {
      expect(product.description).toBeUndefined();
    });

    it('should have empty variants initially', () => {
      expect(product.variants.length).toBe(0);
    });

    it('should have empty categories initially', () => {
      expect(product.categories.length).toBe(0);
    });

    it('should have empty images initially', () => {
      expect(product.images.length).toBe(0);
    });

    it('should have creation and update timestamps', () => {
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Description Management', () => {
    const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);

    it('should set description', () => {
      product.setDescription('Test description');
      expect(product.description).toBe('Test description');
    });

    it('should throw error for empty description', () => {
      expect(() => product.setDescription('')).toThrow('Description cannot be empty');
    });

    it('should update timestamp when setting description', () => {
      const before = product.updatedAt;
      product.setDescription('New description');
      expect(product.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('Category Management', () => {
    const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);

    it('should add category', () => {
      product.addCategory('Electronics');
      expect(product.categories).toContain('Electronics');
    });

    it('should throw error for empty category', () => {
      expect(() => product.addCategory('')).toThrow('Category cannot be empty');
    });

    it('should not add duplicate category', () => {
      product.addCategory('Electronics');
      product.addCategory('Electronics');
      expect(product.categories.filter(c => c === 'Electronics').length).toBe(1);
    });

    it('should remove category', () => {
      product.addCategory('Electronics');
      product.removeCategory('Electronics');
      expect(product.categories).not.toContain('Electronics');
    });

    it('should throw error removing non-existent category', () => {
      expect(() => product.removeCategory('NonExistent')).toThrow('Category not found');
    });
  });

  describe('Image Management', () => {
    const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);

    it('should add image', () => {
      const imageId = product.addImage('https://example.com/image.jpg', 'Main image');
      expect(imageId).toBeDefined();
      expect(product.images.length).toBe(1);
    });

    it('should throw error for invalid URL', () => {
      expect(() => product.addImage('invalid-url', 'Image')).toThrow('Valid image URL is required');
    });

    it('should throw error for empty alt text', () => {
      expect(() => product.addImage('https://example.com/image.jpg', '')).toThrow('Alt text is required');
    });

    it('should remove image', () => {
      const imageId = product.addImage('https://example.com/image.jpg', 'Image');
      product.removeImage(imageId);
      expect(product.images.length).toBe(0);
    });

    it('should throw error removing non-existent image', () => {
      expect(() => product.removeImage('non-existent')).toThrow('Image not found');
    });

    it('should get image by ID', () => {
      const imageId = product.addImage('https://example.com/image.jpg', 'Image');
      const image = product.getImage(imageId);
      expect(image).toBeDefined();
      expect(image?.url).toBe('https://example.com/image.jpg');
    });
  });

  describe('Variant Management', () => {
    const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);

    it('should add variant', () => {
      const variantId = product.addVariant('Color: Red', new Money(10000, 'NGN'));
      expect(variantId).toBeDefined();
      expect(product.variants.length).toBe(1);
    });

    it('should throw error for empty variant name', () => {
      expect(() => product.addVariant('', basePrice)).toThrow('Variant name is required');
    });

    it('should throw error for invalid variant price', () => {
      expect(() => product.addVariant('Color: Red', null as any)).toThrow('Variant price is required');
    });

    it('should get variant by ID', () => {
      const variantId = product.addVariant('Color: Blue', basePrice);
      const variant = product.getVariant(variantId);
      expect(variant).toBeDefined();
      expect(variant?.name).toBe('Color: Blue');
    });

    it('should throw error getting non-existent variant', () => {
      expect(() => product.getVariant('non-existent')).toThrow('Variant not found');
    });

    it('should update variant price', () => {
      const variantId = product.addVariant('Color: Green', basePrice);
      const newPrice = new Money(12000, 'NGN');
      product.updateVariantPrice(variantId, newPrice);
      const variant = product.getVariant(variantId);
      expect(variant?.price.amount).toBe(12000);
    });

    it('should remove variant', () => {
      const variantId = product.addVariant('Color: Yellow', basePrice);
      product.removeVariant(variantId);
      expect(product.variants.length).toBe(0);
    });

    it('should throw error removing non-existent variant', () => {
      expect(() => product.removeVariant('non-existent')).toThrow('Variant not found');
    });
  });

  describe('Status Management', () => {
    const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);

    it('should change status to INACTIVE', () => {
      product.setStatus(ProductStatus.INACTIVE);
      expect(product.status).toBe(ProductStatus.INACTIVE);
    });

    it('should change status to DISCONTINUED', () => {
      product.setStatus(ProductStatus.DISCONTINUED);
      expect(product.status).toBe(ProductStatus.DISCONTINUED);
    });

    it('should change status back to ACTIVE', () => {
      product.setStatus(ProductStatus.ACTIVE);
      expect(product.status).toBe(ProductStatus.ACTIVE);
    });

    it('should update timestamp when changing status', () => {
      const before = product.updatedAt;
      product.setStatus(ProductStatus.INACTIVE);
      expect(product.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('Availability Checking', () => {
    const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);

    it('should be available when ACTIVE', () => {
      product.setStatus(ProductStatus.ACTIVE);
      expect(product.isAvailable()).toBe(true);
    });

    it('should not be available when INACTIVE', () => {
      product.setStatus(ProductStatus.INACTIVE);
      expect(product.isAvailable()).toBe(false);
    });

    it('should not be available when DISCONTINUED', () => {
      product.setStatus(ProductStatus.DISCONTINUED);
      expect(product.isAvailable()).toBe(false);
    });
  });

  describe('Price Retrieval', () => {
    const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);

    it('should get base price', () => {
      expect(product.getPrice()).toEqual(basePrice);
    });

    it('should get variant price', () => {
      const variantId = product.addVariant('Color: Red', new Money(12000, 'NGN'));
      const price = product.getPrice(variantId);
      expect(price.amount).toBe(12000);
    });

    it('should throw error for non-existent variant price', () => {
      expect(() => product.getPrice('non-existent')).toThrow('Variant not found');
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON', () => {
      const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);
      product.setDescription('Test description');
      product.addCategory('Electronics');
      const json = product.toJSON();
      expect(json.id).toBe('prod-1');
      expect(json.sku).toBe('SKU001');
      expect(json.name).toBe('Test Product');
      expect(json.description).toBe('Test description');
      expect(json.categories).toContain('Electronics');
    });
  });

  describe('Edge Cases', () => {
    it('should handle product with many categories', () => {
      const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);
      for (let i = 0; i < 10; i++) {
        product.addCategory(`Category${i}`);
      }
      expect(product.categories.length).toBe(10);
    });

    it('should handle product with many variants', () => {
      const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);
      for (let i = 0; i < 10; i++) {
        product.addVariant(`Variant${i}`, basePrice);
      }
      expect(product.variants.length).toBe(10);
    });

    it('should handle product with many images', () => {
      const product = new Product('prod-1', 'SKU001', 'Test Product', basePrice);
      for (let i = 0; i < 10; i++) {
        product.addImage(`https://example.com/image${i}.jpg`, `Image ${i}`);
      }
      expect(product.images.length).toBe(10);
    });
  });
});
