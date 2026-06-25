import express from 'express';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import eventFollowRoutes from './routes/eventFollowRoutes.js';
import userFollowRoutes from './routes/userFollowRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/authRoutes.js';
import { specs } from './lib/swagger.js';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler.js';
import weatherRoutes from './routes/weatherRoutes.js';

// 1. Criar a aplicação na raiz do ficheiro
const app = express();

// 2. Ocultar metadados do servidor e mitigar XSS
app.use(helmet());

// 3. Permitir apenas pedidos de origens confiáveis (ex: o frontend)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// 4. Limitar o número de pedidos
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de 15 minutos
    max: 1000, // Limite de 1000 pedidos por IP
    message: { error: "Demasiados pedidos a partir deste IP, tente novamente mais tarde." }
});
app.use(limiter);

app.use(express.json());

// 5. Ligar as Rotas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/userFollows', userFollowRoutes);
app.use('/api/eventFollows', eventFollowRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/weather', weatherRoutes);

// Catch-all 404
app.use((_req, _res, next) => {
    const err: any = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(errorHandler);

// 6. O 'listen' fica no 'if'
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log("Server running on http://127.0.0.1:3000"));
}


export default app;