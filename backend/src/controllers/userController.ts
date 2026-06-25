import type { Request, Response,  NextFunction} from 'express';
import * as userService from '../services/userServices.js';
import { userCreateSchema, userDeleteSchema, userSearchSchema} from '../schemas/userSchema.js';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import { z } from 'zod';


const userIdParamSchema = z.object({
    id: z.coerce.number({ message: "O ID deve ser um número válido" }).int()
});

export const getUsers = async (req: Request, res: Response) => {
    const users = await userService.findAllUsers();
    res.json(users);
};

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = userCreateSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),});}
        const { fullName, email, password } = result.data;
        const newUser = await userService.createUser(fullName, email, password);
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = userDeleteSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),});}
        const { id } = result.data;
        const thiss = await userService.deleteUser(Number(id));
    
        res.status(204).json(thiss); 

    } catch (error: any) {
        if (error.message === "UserNotFound") {
            const err = new Error("User não encontrado");
            (err as any).status = 404;
            return next(err);
        }
        next(error);
    }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = userSearchSchema.safeParse(req.query);
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),});}
        const { keyword } = result.data;

        if (!keyword) {
            const error = new Error("Palavra-chave obrigatória");
            (error as any).status = 400;
            throw error;
        }
        
        const users = await userService.searchUser(String(keyword));
        
        if (users.length === 0) {
            const error = new Error("Nenhum utilizador encontrado");
            (error as any).status = 404;
            throw error;
        }

        res.json(users);

    } catch (error) {
        next(error);
    }
};

export const getPublicUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const user = await userService.getPublicUserById(id);
    if (!user) {
        const error = new Error("Utilizador não encontrado.");
        (error as any).status = 404;
        return next(error);
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
};


export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
    // 1. Validação Sintática (Zod)
    const result = userIdParamSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`),
        });
    }

    // 2. Garantia de Autenticação
    if (!req.user) {
        const error = new Error("Utilizador não autenticado.");
        (error as any).status = 401;
        return next(error);
    }

    // 3. Autorização
    const requestedId = result.data.id;
    if (req.user.id !== requestedId) {
        const error = new Error("Acesso negado. Apenas pode consultar o seu próprio perfil.");
        (error as any).status = 403;
        return next(error);
    }
    try {
        const user = await userService.getUserById(requestedId);

        if (!user) {
            const error = new Error("Utilizador não encontrado.");
            (error as any).status = 404;
            throw error;
        }
        // Projeção de Dados: Ocultar a Password
        const { password, ...safeUser } = user;
        res.status(200).json(safeUser);

        } catch (error) {
        next(error);
    }
};



export const followingByIdController = async(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const following = await userService.getUserFollowing(id);
    
    res.json(following);
}


export const followersByIdController = async(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const followers = await userService.getUserFollowers(id);
    
    res.json(followers);
}

export const userEventsByIdController = async(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const events = await userService.getUserEvents(id);
    
    res.json(events)

}
