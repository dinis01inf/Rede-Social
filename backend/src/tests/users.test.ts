import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js'; 

// Importa a instância do Express a partir de src/server.ts
describe('Suite de Testes - Endpoints de Users', () => {
    
    // Cenário 1: Sucesso na listagem
    it('Deve retornar status 200 e uma lista de users no GET /api/users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
    
    // Cenário Limite 2: Validação de criação de user
    it('Deve retornar status 201 ao criar um user POST /api/users', async () => {
        const response = await request(app)
        .post('/api/users')
        .send({
            fullName: 'Nome7',
            email : 'email7l@gmail.com',
            password : 'Senha2!',
        });;

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.fullName).toBe('Nome7');
    });

    // Cenário Limite 3: Validação de dados em falta
    it('Deve retornar status 400 ao tentar apagar um user sem enviar dados DELETE /api/users', async () => {
        const response = await request(app)
        .delete('/api/users')
        .send({});;

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
    });
});