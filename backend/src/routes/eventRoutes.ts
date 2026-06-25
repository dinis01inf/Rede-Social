import { Router } from 'express';
import { getEventById, getEvents, createEventController, deleteEventController, searchEvents, getEventsByUserIdController, updateProgressController, getProgressController, updateEventController, generateEventController} from '../controllers/eventController.js';
import { authGuard } from '../middlewares/authGuard.js';



const router = Router();
router.post('/ai/generate', authGuard, generateEventController);
router.get('/', authGuard, getEvents);
router.post('/', authGuard, createEventController);
router.delete('/:id', authGuard, deleteEventController);
router.get('/search/', authGuard, searchEvents);
router.get('/:id/', authGuard, getEventById);
router.get('/user/:id/', authGuard, getEventsByUserIdController );
router.post('/:eventId/progress', authGuard, updateProgressController);
router.get('/:eventId/progress', getProgressController);
router.put('/:id', authGuard, updateEventController);

export default router;