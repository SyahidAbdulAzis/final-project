import { Request, Response } from 'express';
import {
  propertyQuerySchema,
  propertyCreateSchema,
  propertyUpdateSchema,
} from '../validations/property.validation.js';
import {
  listProperties,
  createProperty,
  getPropertyById,
  getTenantProperties,
  updateProperty,
  deleteProperty,
} from '../services/property.service.js';
import { getPropertyWithReviews } from '../services/review.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { badRequest, pickParam, notFound } from '../utils/controller.utils.js';

export async function getProperties(req: Request, res: Response) {
  const parsed = propertyQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Query tidak valid', errors: parsed.error.flatten() });
  }
  const payload = await listProperties(parsed.data);
  return res.json(payload);
}

export async function getPropertyDetail(req: Request, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  try {
    const property = await getPropertyWithReviews(id);
    if (!property) return notFound(res, 'Properti tidak ditemukan');
    return res.json(property);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function createPropertyHandler(req: AuthRequest, res: Response) {
  const parsed = propertyCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Input tidak valid', errors: parsed.error.flatten() });
  }
  try {
    const property = await createProperty({
      ...parsed.data,
      tenantId: req.user!.id,
    });
    return res.status(201).json(property);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getTenantPropertiesHandler(req: AuthRequest, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const take = Math.max(1, Math.min(100, Number(req.query.take) || 10));
    const result = await getTenantProperties(req.user!.id, page, take);
    return res.json(result);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function updatePropertyHandler(req: AuthRequest, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  const parsed = propertyUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Input tidak valid', errors: parsed.error.flatten() });
  }
  try {
    const property = await updateProperty(id, req.user!.id, parsed.data);
    return res.json(property);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function deletePropertyHandler(req: AuthRequest, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  try {
    await deleteProperty(id, req.user!.id);
    return res.json({ message: 'Properti berhasil dihapus' });
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
