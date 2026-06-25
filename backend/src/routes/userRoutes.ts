import { Router } from 'express';
import { getUsers, createUserController, deleteUserController, searchUsers, getUserById, followingByIdController, followersByIdController, userEventsByIdController, getPublicUserByIdController } from '../controllers/userController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();
router.get('/', getUsers);
router.post('/', createUserController);
router.delete('/', deleteUserController);
router.get('/search', searchUsers);
router.get('/:id', authGuard, getUserById);
router.get('/public/:id', getPublicUserByIdController);
router.get('/:id/followers', authGuard, followersByIdController);
router.get('/:id/following', authGuard, followingByIdController);
router.get('/:id/events', authGuard, userEventsByIdController);
// router.get("/")

export default router;
