# Evently
Plataforma de gestão e descoberta de eventos sociais.

## Contribuições do Grupo
A distribuição do trabalho no projeto foi equitativa (33% para cada membro), com as seguintes responsabilidades principais:

* **Dinis Maia (33%)**: Desenvolvimento de testes unitários/integração, correção de bugs, frontend (componentes *userDetails* e *userCards*), sistema de notificações e suporte no desenvolvimento do backend.
* **João Ribeiro (33%)**: Implementação de operações CRUD seguras, criação do script de seed e integração com a API de meteorologia.
* **Ana Almeida (33%)**: Desenvolvimento do frontend, integração com o LLM (Ollama) e ajustes na lógica de negócio do backend.

---

## Instalação e Arranque

### Pré-requisitos
* Node.js (versão LTS recomendada)
* PostgreSQL
* Ollama (com o modelo `llama3.2:1b` instalado)

### 1. Configuração do LLM (Ollama)
Inicie o serviço do Ollama e descarregue o modelo através do terminal:

```bash
ollama serve
ollama run llama3.2:1b
````
### 2. Backend
```
cd backend
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```
### 3. Frontend
```
cd frontend
npm install
npm run dev
```
### 4. Testes
```
cd backend
npm run test
```
