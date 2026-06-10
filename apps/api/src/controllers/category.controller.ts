import { Request, Response } from 'express';
import { categoryCreateSchema, categoryUpdateSchema } from '../validations/category.validation.js';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from '../services/category.service.js';
import { badRequest, pickParam, parseOrBad } from '../utils/controller.utils.js';

export async function createCategoryHandler(req: Request, res: Response) {
  const parsed = parseOrBad(res, categoryCreateSchema, req.body);
  if (!parsed) return;
  try {
    const category = await createCategory(parsed.name);
    return res.status(201).json(category);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function getAllCategoriesHandler(_req: Request, res: Response) {
  try {
    const categories = await getAllCategories();
    return res.json(categories);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function updateCategoryHandler(req: Request, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  const parsed = parseOrBad(res, categoryUpdateSchema, req.body);
  if (!parsed) return;
  try {
    const category = await updateCategory(id, parsed.name!);
    return res.json(category);
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}

export async function deleteCategoryHandler(req: Request, res: Response) {
  const id = pickParam(req.params.id);
  if (!id) return badRequest(res, 'Id wajib diisi');
  try {
    await deleteCategory(id);
    return res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    return badRequest(res, (error as Error).message);
  }
}
