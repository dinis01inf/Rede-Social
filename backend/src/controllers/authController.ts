import { type Request, type Response, type NextFunction } from "express";
//isto ta vermelho ns pq, eu so fiz copy paste da tp7
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userService from "../services/userServices.js";

const JWT_SECRET = process.env.JWT_SECRET || "chave_super_secreta_aw";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // 1. Delegar a consulta à base de dados para a camada de Serviço
        const user = await userService.findUserByEmail(email);

        // 2. Verificar se o utilizador existe e se a senha coincide com o Hash armazenado
        if (!user || !(await bcrypt.compare(password, user.password))) {
            const error = new Error("Credenciais inválidas");
            (error as any).status = 401;
            throw error;
        }

        // 3. Gerar o JWT com o ID do utilizador no Payload
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, userId: user.id});
    } catch (error) {
        next(error);
    }
};

export const register = async (req :Request, res:Response, next: NextFunction) => {
    try {
        const{ fullName, email, password} = req.body;
        
        //verificar se n ha nenhum user c o mail
        const existing = await userService.findUserByEmail(email);
        if(existing){
            const error = new Error("Email já registado");
            (error as any).status = 409;
            throw error;
        }

        //fazer hash da pass antes de guardar
        const hashedPassword = await bcrypt.hash(password, 10);

        //criar o user novo
        const user = await userService.createUser(fullName, email, password);

        const token = jwt.sign({ id: user.id}, JWT_SECRET, { expiresIn: "1h"});
        res.status(201).json({ token, userId: user.id});
    } catch (error) {
        next(error);
    }
}