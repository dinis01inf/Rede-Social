import { z } from 'zod';


export const eventFollowSchema = z.object({
userId: z.number().min(1, "É necessário um Id"),
eventId: z.number().min(1, "É necessário um Id"),
});

export const eventUnfollowSchema = z.object({
userId: z.number().min(1, "É necessário um Id"),
eventId: z.number().min(1, "É necessário um Id"),
});