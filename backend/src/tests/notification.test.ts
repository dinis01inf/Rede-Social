import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js'; 

// Importa a instância do Express a partir de src/server.ts
describe('Suite de Testes - Endpoints de Notificações', () => {
    let notifId : number;

    // Cenário Limite 1: Validação de criação de notificacao
    it('Deve retornar status 201 ao criar um user POST /api/notification/:userId', async () => {
        const response = await request(app)
        .post('/api/notification/1')
        .send({
            userId: 1,
            message: 'notificaçao',
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        notifId = response.body.id;
    });

    //Cenário Limite 2: Sucesso na alteração duma notificação
    it('Deve retornar status 200 ao criar um user PUT /api/notification/read/:id', async () => {
        expect(notifId).toBeDefined();

        const response = await request(app)
        .put(`/api/notification/read/${notifId}`)

        expect(response.status).toBe(200);
        expect(response.body.read).toBe(true);
    });

    // Cenário Limite 3: Sucesso ao apagar a notificação
    it('Deve apagar uma notificação no DELETE /api/notification/:id', async () => {
        expect(notifId).toBeDefined();

        const response = await request(app)
        .delete(`/api/notification/${notifId}`);

        expect(response.status).toBe(204);
    });
    
});