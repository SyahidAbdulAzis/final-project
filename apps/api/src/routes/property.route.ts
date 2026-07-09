import { Router } from 'express';
import {
  getProperties,
  getPropertyDetail,
  createPropertyHandler,
  getTenantPropertiesHandler,
  updatePropertyHandler,
  deletePropertyHandler,
} from '../controllers/property.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

export const propertyRouter = Router();

propertyRouter.get('/properties', getProperties);
propertyRouter.get('/properties/:id', getPropertyDetail);
propertyRouter.post('/properties', verifyToken, requireRole('TENANT'), createPropertyHandler);
propertyRouter.get('/tenant/properties', verifyToken, requireRole('TENANT'), getTenantPropertiesHandler);
propertyRouter.patch('/properties/:id', verifyToken, requireRole('TENANT'), updatePropertyHandler);
propertyRouter.delete('/properties/:id', verifyToken, requireRole('TENANT'), deletePropertyHandler);
