import { type Request, type Response, type NextFunction } from 'express';
import * as categoryService from '../services/categoryServices.js';
import { categoryCreateSchema, categoryDeleteSchema, categorySearchSchema } from '../schemas/categorySchema.js';


export const getCategories = async (req: Request, res: Response) => {
    const users = await categoryService.findAllCategories();
    res.json(users);
};

export const createCategoryController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result= categoryCreateSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),})
        }
        const {nome} = result.data;
        const newCategory = await categoryService.createCategory(nome);
        res.status(201).json(newCategory);
    } catch (error: any) {
        const err = new Error("Nome de categoria já existente");
        (err as any).status = 409;
        next(err);
    }
};

export const deleteCategoryController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result= categoryDeleteSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),})
        }
        const { id } = result.data;
        await categoryService.deleteCategory(Number(id));
    
        res.status(204).send(); 

    } catch (error: any) {
        if (error.message === "CategoryNotFound") {
            const err = new Error("Categoria não encontrada");
            (err as any).status = 404;
            return next(err);
        }
        next(error);
    }
};

export const searchCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result= categorySearchSchema.safeParse(req.query);
        if(!result.success){
            return res.status(400).json({errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),})
        }
        const { keyword } = result.data;

        if (!keyword) {
            const error = new Error("Falta de keyword");
            (error as any).status = 400;
            throw error;
        }
        
        const users = await categoryService.searchCategory(String(keyword));
        
        if (users.length === 0) {
            const error = new Error("Nenhuma Categoria encontrada com esse nome");
            (error as any).status = 404;
            throw error;
        }

        res.json(users);

    } catch (error) {
        next(error);
    }
};

