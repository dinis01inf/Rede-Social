# Evently
Plataforma de gestão e descoberta de eventos sociais.

## Contribuições do Grupo
- Dinis Maia - 33%, testes, erros, uma parte do frontend, notificações, userDetails, userCards, e parte do backend.
- João Ribeiro - 33%, operações CRUD seguras, ficheiro seed, API meteorologia
- Ana Almeida - 33%, frontend, LLM, alguns ajustes do backend.

## ------- Instalação e Arranque--------
### Pré-requisitos
- Node.js
- PostgreSQL
- Ollama, llama3.2:1b (para funcionalidades de IA)

### /backend
cd backend //
npm install //
npx prisma migrate dev //
npx tsx prisma/seed.ts //
npm run dev

### /frontend
cd frontend //
npm install //
npm run dev

### LLM - /ASW
(download do LLM Ollama)
ollama serve //
ollama run llama3.2:1b

### Testes - /backend
(é preciso mudar o mail e nome no teste do POST user)
npm run test
