import { type Request, type Response, type NextFunction } from 'express';
import * as userFollowService from '../services/userFollowServices.js';
import { userFollowSchema, userUnfollowSchema } from '../schemas/userFollowSchema.js';

export const followUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = userFollowSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),});}
        const { followerId, followingId } = result.data;
        const newFollow = await userFollowService.followUser(Number(followerId), Number(followingId));
        res.status(201).json(newFollow);
    } catch (error) {
        next(error);
    }
};

export const unfollowUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = userUnfollowSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),});}
        const { followerId, followingId } = result.data;
        const dleted = await userFollowService.unfollowUser(Number(followerId), Number(followingId));
        res.status(201).json(dleted);
    } catch (error: any) {
        next(error);
    }
};

export const isFollowingController = async (req: Request, res: Response) => {
    const followingId = Number(req.query.followingId);
    const followerId = Number(req.query.followerId);
    const result = await userFollowService.checkUserFollow(followerId, followingId);
    res.json({isFollowing: !!result});
}