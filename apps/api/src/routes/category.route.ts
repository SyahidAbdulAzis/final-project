import { Router } from 'express';
import {
  createCategoryHandler,
  getAllCategoriesHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/category.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const categoryRouter = Router();

categoryRouter.get('/categories', getAllCategoriesHandler);
categoryRouter.post('/categories', verifyToken as any, requireRole('TENANT') as any, createCategoryHandler as any);
categoryRouter.patch('/categories/:id', verifyToken as any, requireRole('TENANT') as any, updateCategoryHandler as any);
categoryRouter.delete('/categories/:id', verifyToken as any, requireRole('TENANT') as any, deleteCategoryHandler as any);

export { categoryRouter };
