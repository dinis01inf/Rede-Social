import { Router } from 'express';
import { followUserController, unfollowUserController, isFollowingController } from '../controllers/userFollowController.js';


const router = Router();
router.post('/', followUserController);
router.delete('/', unfollowUserController);
router.get('/', isFollowingController);

export default router;