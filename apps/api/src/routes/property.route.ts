import { Router } from 'express';
import { getProperties } from '../controllers/property.controller.js';

export const propertyRouter = Router();

propertyRouter.get('/properties', getProperties);
