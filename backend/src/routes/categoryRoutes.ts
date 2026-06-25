import { Router } from 'express';
import { getCategories, createCategoryController, deleteCategoryController, searchCategories } from '../controllers/categoryController.js';


const router = Router();
router.get('/', getCategories);
router.post('/', createCategoryController);
router.delete('/', deleteCategoryController);
router.get('/search/', searchCategories);

export default router;