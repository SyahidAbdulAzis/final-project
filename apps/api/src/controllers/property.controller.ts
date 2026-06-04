import { Request, Response } from 'express';
import { propertyQuerySchema } from '../validations/property.validation.js';
import { listProperties } from '../services/property.service.js';

export function getProperties(req: Request, res: Response) {
  const parsed = propertyQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Query tidak valid', errors: parsed.error.flatten() });
  }
  const payload = listProperties(parsed.data);
  return res.json(payload);
}
