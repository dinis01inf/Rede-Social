import { z } from 'zod';


export const userFollowSchema = z.object({
followerId: z.coerce.number().min(1, "É necessário um Id"),
followingId: z.coerce.number().min(1, "É necessário um Id"),
});

export const userUnfollowSchema = z.object({
followerId: z.coerce.number().min(1, "É necessário um Id"),
followingId: z.coerce.number().min(1, "É necessário um Id"),
});