import { z } from 'zod';


export const eventCreateSchema = z.object({
startDate: z.coerce.date("Data Inválida"),
endDate: z.coerce.date("Data Inválida"),
categoria: z.number(),
local: z.string().optional(),
createdBy: z.number(),
description : z.string(),
name: z.string().min(1, "Mínimo 1 caracteres"),
objectives: z.array(z.string()), //https://zod.dev/api?id=arrays
imageUrl: z.string()
});

export const eventDeleteSchema = z.object({
id: z.number().min(1, "É preciso um id")
});

export const eventSearchSchema = z.object({
keyword: z.string()
});

export const progressSchema = z.object({
    objectiveId: z.number({
        message: "O ID do objetivo tem de ser um número."
    }).int().positive("O ID do objetivo tem de ser válido."),
    
    message: z.string()
    .min(1, "A mensagem não pode estar vazia.")
    .max(500, "A mensagem é demasiado longa (máximo 500 caracteres).")
});

export const progressCreateSchema = z.object({
  objectiveId: z.number({ message: "O ID do objetivo é obrigatório" }),
  message: z.string().min(1, "A mensagem de progresso não pode estar vazia")
});
