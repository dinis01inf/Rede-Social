import { type Request, type Response, type NextFunction } from 'express';
import * as eventFollowService from '../services/eventFollowServices.js';
import { eventFollowSchema, eventUnfollowSchema } from '../schemas/eventFollowSchema.js';

export const followEventController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = eventFollowSchema.safeParse(req.body);
                if (!result.success) {
                    return res.status(400).json({
                        errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),});}
        const { userId, eventId } = result.data;
        const newFollow = await eventFollowService.followEvent(Number(userId), Number(eventId));
        res.status(201).json(newFollow);
    } catch (error) {
        next(error);
    }
};

export const unfollowEventController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = eventUnfollowSchema.safeParse(req.body);
                if (!result.success) {
                    return res.status(400).json({
                        errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),});}
        const { userId, eventId } = result.data;
        const dleted =  await eventFollowService.unfollowEvent(Number(userId), Number(eventId));
        res.status(201).json(dleted);
    } catch (error: any) {
        // if (error.message === "UserNotFound") {
        //     return res.status(404).json({ error: "User não encontrado" });
        // }
        res.status(500).json({ error: error.message });
    }
};

export const isFollowingController = async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    const eventId = Number(req.query.eventId);
    const result = await eventFollowService.checkEventFollow(userId, eventId);
    res.json({isFollowing: !!result});
}