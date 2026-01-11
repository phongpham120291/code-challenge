import { z } from 'zod';

// Base product schema
export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be at most 200 characters'),
  sku: z.string().min(1, 'SKU is required').max(100, 'SKU must be at most 100 characters'),
  description: z.string().min(0, 'Description is required').max(2000, 'Description must be at most 2000 characters'),
});

// Create product validation
export const createProductSchema = z.object({
  body: productSchema,
});

// Update product validation (PUT - all fields required)
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID format'),
  }),
  body: productSchema,
});

// Partial update product validation (PATCH - all fields optional)
export const patchProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID format'),
  }),
  body: productSchema.partial(),
});

// Get product by ID validation
export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID format'),
  }),
});

// Delete product validation
export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID format'),
  }),
});

// List products with filters validation
export const listProductsSchema = z.object({
  query: z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    limit: z.string().regex(/^\d+$/, 'limit must be a number').optional().transform(val => {
      if (!val) return 50;
      const num = parseInt(val, 10);
      return Math.min(num, 100); // Max 100
    }),
    offset: z.string().regex(/^\d+$/, 'offset must be a number').optional().transform(val => val ? parseInt(val, 10) : 0),
  }).optional(),
});
