import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ProductFilters } from '../types';
import {
  productService,
  CreateProductDto,
  UpdateProductDto,
  PatchProductDto,
} from '../services/product.service';

export const productController = {
  async create(
    req: AuthenticatedRequest<{}, {}, CreateProductDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },

  async list(
    req: AuthenticatedRequest<{}, {}, {}, any>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const filters = req.query;
      const result = await productService.list(filters);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const product = await productService.getById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: AuthenticatedRequest<{ id: string }, {}, UpdateProductDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  async patch(
    req: AuthenticatedRequest<{ id: string }, {}, PatchProductDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const product = await productService.patch(req.params.id, req.body);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  async delete(
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await productService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
