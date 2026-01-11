import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/error.util';
import { Product } from '@prisma/client';
import { logger } from '../utils/logger.util';

export interface CreateProductDto {
  name: string;
  sku: string;
  description: string;
}

export interface UpdateProductDto {
  name: string;
  sku: string;
  description: string;
}

export interface PatchProductDto {
  name?: string;
  sku?: string;
  description?: string;
}

export interface ListProductsFilters {
  name?: string;
  sku?: string;
  limit?: number;
  offset?: number;
}

export const productService = {
  async create(data: CreateProductDto): Promise<Product> {
    logger.info({ msg: 'Creating product', name: data.name, sku: data.sku });

    try {
      const product = await prisma.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          description: data.description,
        },
      });

      logger.info({ msg: 'Product created', productId: product.id });
      return product;
    } catch (error: any) {
      // Prisma unique constraint violation error code
      if (error.code === 'P2002') {
        throw new ConflictError('Product with this SKU already exists');
      }
      throw error;
    }
  },

  async list(filters: ListProductsFilters = {}): Promise<{ products: Product[]; total: number }> {
    const {
      name,
      sku,
      limit = 50,
      offset = 0,
    } = filters;

    logger.debug({ msg: 'Listing products', filters });

    // Build where clause
    const where: any = {};

    if (name) {
      where.name = { contains: name };
    }

    if (sku) {
      where.sku = { contains: sku };
    }

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    logger.info({ msg: 'Products listed', count: products.length, total });
    return { products, total };
  },

  async getById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  },

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    logger.info({ msg: 'Updating product', productId: id });
    // Check if product exists
    await this.getById(id);

    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          sku: data.sku,
          description: data.description,
        },
      });

      logger.info({ msg: 'Product updated', productId: id });
      return product;
    } catch (error: any) {
      // Prisma unique constraint violation error code
      if (error.code === 'P2002') {
        throw new ConflictError('Product with this SKU already exists');
      }
      throw error;
    }
  },

  async patch(id: string, data: PatchProductDto): Promise<Product> {
    logger.info({ msg: 'Patching product', productId: id, fields: Object.keys(data) });
    // Check if product exists
    await this.getById(id);

    try {
      const product = await prisma.product.update({
        where: { id },
        data,
      });

      logger.info({ msg: 'Product patched', productId: id });
      return product;
    } catch (error: any) {
      // Prisma unique constraint violation error code
      if (error.code === 'P2002') {
        throw new ConflictError('Product with this SKU already exists');
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    logger.info({ msg: 'Deleting product', productId: id });
    // Check if product exists
    await this.getById(id);

    await prisma.product.delete({
      where: { id },
    });

    logger.info({ msg: 'Product deleted', productId: id });
  },
};
