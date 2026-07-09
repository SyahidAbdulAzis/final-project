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
categoryRouter.post('/categories', verifyToken, requireRole('TENANT'), createCategoryHandler);
categoryRouter.patch('/categories/:id', verifyToken, requireRole('TENANT'), updateCategoryHandler);
categoryRouter.delete('/categories/:id', verifyToken, requireRole('TENANT'), deleteCategoryHandler);

export { categoryRouter };
