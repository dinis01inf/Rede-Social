import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;

    const mensagens : Record<number, string> = {
        400: 'Pedido Inválido',
        401: 'Não autenticado',
        403: 'Sem permissão',
        404:'Recurso não encontrado',
        500: 'Erro interno do servidor'
    }

    console.error(`${req.method} ${req.url} → ${statusCode}: ${err.message}`);
    
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        error: err.message || mensagens[statusCode] || 'Erro interno do servidor.',
    });
};