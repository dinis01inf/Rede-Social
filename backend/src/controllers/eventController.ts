import { type Request, type Response, type NextFunction } from 'express';
import * as eventService from '../services/eventServices.js';
import { eventCreateSchema, eventSearchSchema, progressSchema } from '../schemas/eventSchema.js';
import { z } from 'zod';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';
import { GenericAPIProvider } from '../services/llm/GenericAPIProvider.js';

const eventIdParamSchema = z.object({
    id: z.coerce.number({ message: "O ID deve ser um número válido" }).int()
});

const eventUpdateSchema = z.object({
  name: z.string().min(1, "O nome não pode estar vazio"),
  description: z.string().min(1, "A descrição não pode estar vazia"),
  local: z.string().optional(),
  imageUrl: z.string().url("Deve ser um URL válido de imagem").optional().or(z.string().max(0))
});

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
    const result = eventIdParamSchema.safeParse(req.params);
    if (!result.success) return res.status(400).json({ errors: result.error.issues.map(i => `${i.path}: ${i.message}`) });
    try {
        const event = await eventService.getEventById(result.data.id);
        if (!event) {
            const error = new Error("Evento não encontrado");
            (error as any).status = 404;
            throw error;
        }
        return res.json(event);
    } catch (error) {
        next(error);
    }
};


export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await eventService.findAllEvents();
        return res.status(200).json(events);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao carregar os eventos" });
    }
};

export const createEventController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = eventCreateSchema.safeParse(req.body);
        if (!result.success) {
            console.log("ERRO DE VALIDAÇÃO DO ZOD:", result.error.format());
            return res.status(400).json({
                errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`)
            });
        }

        const authUser = (req as AuthenticatedRequest).user;
        if (!authUser) {
            const error = new Error("Não autorizado.");
            (error as any).status = 401;
            throw error;
        }

        const { categoria, name, local, description, startDate, endDate, objectives, imageUrl } = result.data;
        const newEvent = await eventService.createEvent(
            authUser.id,
            categoria,
            name,
            local,
            description,
            startDate,
            endDate,
            objectives,
            imageUrl
        );

        res.status(201).json(newEvent);
    } catch (error) {
        console.log("ERRO REAL NO CATCH:", error);
        next(error);
    }
};

export const deleteEventController = async (req: Request, res: Response, next: NextFunction) => {
    const result = eventIdParamSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues.map(i => `${i.path}: ${i.message}`) });
    }

    try {
        await eventService.deleteEvent(result.data.id);
        return res.status(204).send();
    } catch (error: any) {
        if (error.message === "EventNotFound") {
            const err = new Error("Evento não encontrado");
            (err as any).status = 404;
            return next(err);
        }
        next(error);
    }
};

export const searchEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result= eventSearchSchema.safeParse(req.query);
        if(!result.success){
            return res.status(400).json({errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`,),})
        }
        const { keyword } = result.data;

        if (!keyword) {
            const error = new Error("Falta de keyword");
            (error as any).status = 400;
            throw error;
        }
        
        const users = await eventService.searchEvent(String(keyword));
        
        if (users.length === 0) {
            const error = new Error("Nenhum evento encontrado com esse nome");
            (error as any).status = 404;
            throw error;
        }

        res.json(users);

    } catch (error) {
        next(error);
    }
};

export const getEventsByUserIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    
    if (isNaN(userId)) {
      const error = new Error("Invalid User ID");
      (error as any).status = 400;
      throw error;
    }

    const events = await eventService.getEventsByUserId(userId);
    return res.status(200).json(events);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateProgressController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1. Garantir que o utilizador está logado
    if (!req.user) {
        const error = new Error("Não autorizado.");
        (error as any).status = 401;
        return next(error);
    }

    try {
        // 2. Validar o body com o Zod
        const result = progressSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues.map((issue) => `${issue.path}: ${issue.message}`)
            });
        }
        // 3. Extrair os dados necessários
        const eventId = Number(req.params.eventId);
        const userId = req.user.id;
        const { objectiveId, message } = req.body;

        // 4. Chamar o serviço para registar o progresso
        const progress = await eventService.logProgress(userId, eventId, objectiveId, message);
        
        res.status(201).json({ message: "Progresso atualizado com sucesso!", progress });

    } catch (error) {
        next(error);
    }
};

// Controlador para ler o progresso
export const getProgressController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventId = Number(req.params.eventId);
        const updates = await eventService.getEventProgress(eventId);
        res.status(200).json(updates);
    } catch (error) {
        next(error);
    }
};

//controller para dar update a eventos
export const updateEventController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        const error = new Error("Não autorizado.");
        (error as any).status = 401;
        return next(error);
    }

    const paramsResult = eventIdParamSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ errors: paramsResult.error.issues.map((i) => `${i.path}: ${i.message}`) });
    }

    try {
        const event = await eventService.getEventById(paramsResult.data.id);
        if (!event) {
            const error = new Error("Evento não encontrado.");
            (error as any).status = 404;
            throw error;
        }
        if (event.createdBy !== req.user.id) {
            const error = new Error("Sem permissão.");
            (error as any).status = 403;
            throw error;
        }

        const bodyResult = eventUpdateSchema.safeParse(req.body);
        if (!bodyResult.success) {
            return res.status(400).json({
                errors: bodyResult.error.issues.map((issue) => `${issue.path}: ${issue.message}`)
            });
        }

        const { name, description } = bodyResult.data;
        const updatedEvent = await eventService.updateEvent(paramsResult.data.id, name, description);
        return res.json(updatedEvent);
    } catch (error) {
        next(error);
    }
};

export const generateEventController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { draftDescription } = req.body;

        if (!draftDescription || draftDescription.trim() === "") {
            const error = new Error("Tens de fornecer uma descrição.");
            (error as any).status = 400;
            throw error;
        }

        const llm = new GenericAPIProvider(
            'http://localhost:11434/api/generate',
            'llama3.2:1b',
            undefined,
            'prompt'
        );

    
        const aiExpandedData = await eventService.PreencheEvent(draftDescription, llm);

        return res.json(aiExpandedData);
    } catch (error) {
        next(error);
    }
};