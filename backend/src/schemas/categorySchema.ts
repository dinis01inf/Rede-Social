import { z } from 'zod';


export const categoryCreateSchema = z.object({
nome: z.string().min(1),
});

export const categoryDeleteSchema = z.object({
id: z.number().min(1, "É preciso um id")
});

export const categorySearchSchema = z.object({
keyword: z.string()
});