import prisma from '../lib/prisma.js';

export async function createCategory(name: string) {
  return await prisma.propertyCategory.create({ data: { name } });
}

export async function getAllCategories() {
  return await prisma.propertyCategory.findMany({
    orderBy: { createdAt: 'desc' },
  });
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
