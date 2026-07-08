import express, { Application } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const defaultOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://3.25.202.185',
    'http://3.25.202.185:3000',
    'http://3.25.202.185:5173',
];

const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isLocalDevelopmentOrigin = (origin: string) =>
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const corsOptions: cors.CorsOptions = {
    origin(origin, callback) {
        // Allow non-browser clients (curl, Postman), configured origins,
        // and any localhost/loopback dev origin so the frontend can be served
        // from a different port without CORS failures during development.
        if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const app: Application = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Middleware — CORS must run before helmet
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
import gameRoutes from './routes/gameRoutes';
import organizerRoutes from './routes/organizerRoutes';
import publicRoutes from './routes/publicRoutes';
import participantRoutes from './routes/participantRoutes';
import resultsRoutes from './routes/resultsRoutes';

// Use Routes
app.use('/v1/game', gameRoutes);
app.use('/v1/organizer', organizerRoutes);
app.use('/v1/public', publicRoutes);
app.use('/v1/participant', participantRoutes);
app.use('/v1/results', resultsRoutes);

// Socket.IO connection
import { setupSocketHandlers } from './socket/socketHandler';
io.on('connection', (socket) => {
    setupSocketHandlers(io, socket);
});

// Global Error Handler
import { globalErrorHandler } from './middlewares/errorHandler';
app.use(globalErrorHandler);

// Ensure game-engine schema additions (retention columns, votes/group_accusations
// tables, etc.) exist before the timer service or any game routes start running.
import { ensureGameSchemaUpdates } from './utils/schemaHelpers';
ensureGameSchemaUpdates().catch((err) => logger.error('[Server] Schema bootstrap failed:', err));

// Start Timer Service
import { startTimerService } from './services/timerService';
startTimerService();

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`[Server] Node.js API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export { io };
