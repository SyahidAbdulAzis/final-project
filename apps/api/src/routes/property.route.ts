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
propertyRouter.post('/properties', verifyToken as any, requireRole('TENANT') as any, createPropertyHandler as any);
propertyRouter.get('/tenant/properties', verifyToken as any, requireRole('TENANT') as any, getTenantPropertiesHandler as any);
propertyRouter.patch('/properties/:id', verifyToken as any, requireRole('TENANT') as any, updatePropertyHandler as any);
propertyRouter.delete('/properties/:id', verifyToken as any, requireRole('TENANT') as any, deletePropertyHandler as any);
