import { z } from 'zod';


export const createNotificationSchema = z.object({
    userId: z.coerce.number().min(1, "É necessário um Id"),
    message: z.string().min(1, "A mensagem não pode estar vazia"),
});
