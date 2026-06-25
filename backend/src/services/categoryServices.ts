import { prisma } from '../lib/prisma.js';

export const findAllCategories = async () => {
    return await prisma.categoria.findMany();
};

export const createCategory = async (nome: string) => {
    return await prisma.categoria.create({
        data: { nome}
    });
};

export const deleteCategory = async (id: number) => {
    const category = await prisma.categoria.findUnique({
        where: { id }
    });

    if (!category) {
        throw new Error("CategoryNotFound");
    }

    return await prisma.categoria.delete({
        where: { id }
    });
};

export const searchCategory = async (keyword: string) => {
    return await prisma.categoria.findMany({
        where: {
            nome: {
                contains: keyword,
                mode: 'insensitive'
            }
        }
    });
};

