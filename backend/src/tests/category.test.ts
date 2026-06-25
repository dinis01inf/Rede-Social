import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js'; 

//Importa a instância do Express a partir de src/server.ts
describe('Suite de Testes - Endpoints de Categorias', () => {
    
    // Cenário 1: Sucesso na listagem
    it('Deve retornar status 200 e uma lista de categorias no GET /api/category', async () => {
    const response = await request(app).get('/api/category');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
    
    // Cenário Limite 2: Validação de dados em falta
    it('Deve retornar status 400 ao tentar criar uma categoria sem enviar dados POST /api/category', async () => {
    const response = await request(app)
      .post('/api/category')
      .send({});

    expect(response.status).toBe(400);
  });
});