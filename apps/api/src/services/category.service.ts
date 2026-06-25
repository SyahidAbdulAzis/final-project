import prisma from '../lib/prisma.js';

export async function createCategory(name: string) {
  return await prisma.propertyCategory.create({ data: { name } });
}

export async function getAllCategories(page = 1, take = 10) {
  const skip = (page - 1) * take;
  const [data, total] = await Promise.all([
    prisma.propertyCategory.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.propertyCategory.count(),
  ]);
  return { data, meta: { page, take, total, totalPages: Math.max(1, Math.ceil(total / take)) } };
}

export async function updateCategory(id: string, name: string) {
  return await prisma.propertyCategory.update({
    where: { id },
    data: { name },
  });
}

export async function deleteCategory(id: string) {
  return await prisma.propertyCategory.delete({ where: { id } });
}
