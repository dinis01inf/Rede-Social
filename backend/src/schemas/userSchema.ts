import { z } from 'zod';


export const userCreateSchema = z.object({
    fullName: z.string().min(1, "Mínimo 1 caracteres"),
    email: z.email("Email inválido").lowercase(),
    password: z.string()
    .min(6, "Mínimo 6 caracteres")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter pelo menos um número")
    .regex(/[^a-zA-Z0-9]/, "Deve conter pelo menos um símbolo")
});

export const userDeleteSchema = z.object({
    id: z.number().min(1, "É preciso um id")
});

export const userSearchSchema = z.object({
    keyword: z.string()
});