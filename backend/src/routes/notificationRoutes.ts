import { Router } from 'express';
import { createNotification, getNotifications, readNotifById,deleteNotification} from '../controllers/notificationController.js';

const router = Router();

router.post('/:userId', createNotification);
router.get('/:userId', getNotifications);
router.put('/read/:id', readNotifById); 
router.delete('/:id', deleteNotification);

export default router;