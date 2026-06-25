import { Router } from 'express';
import { followEventController, unfollowEventController, isFollowingController} from '../controllers/eventFollowController.js';


const router = Router();
router.post('/', followEventController);
router.delete('/', unfollowEventController);
router.get('/', isFollowingController);

export default router;