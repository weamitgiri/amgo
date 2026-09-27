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

// Socket.IO rooms, presence and the game/timer loops live IN THIS PROCESS (there is
// no Redis adapter). Run under PM2 cluster mode (or any multi-instance setup) and an
// HTTP request handled by worker A broadcasts only to the sockets connected to worker
// A — so players see questions, answers and Lie Detector state only after a refresh —
// and every worker also runs the timer loop. Run ONE instance
// (`pm2 start dist/server.js --name zoventro-api -i 1`, i.e. fork mode) until a Redis
// adapter is added.
if (process.env.exec_mode === 'cluster_mode' || Number(process.env.NODE_APP_INSTANCE) > 0) {
    logger.error(
        '[Server] Running in multi-instance / PM2 cluster mode, but Socket.IO has no shared adapter — ' +
            'realtime events will only reach sockets on the same worker. Use a single instance (fork mode).'
    );
}

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
app.use(
    express.json({
        // Gateway webhooks are signed over the exact bytes sent. Re-serialising
        // the parsed body changes key order and unicode escaping, so the HMAC
        // would never match — keep the original buffer for those routes only,
        // rather than paying the memory cost on every request.
        verify: (req, _res, buf) => {
            if (req.url?.startsWith('/v1/webhooks/')) {
                (req as any).rawBody = buf;
            }
        },
    })
);
app.use(express.urlencoded({ extended: true }));

// Import Routes
import gameRoutes from './routes/gameRoutes';
import organizerRoutes from './routes/organizerRoutes';
import publicRoutes from './routes/publicRoutes';
import participantRoutes from './routes/participantRoutes';
import resultsRoutes from './routes/resultsRoutes';
import cookandcreateRoutes from './routes/cookandcreate';
import webhookRoutes from './routes/webhookRoutes';

// Use Routes
app.use('/v1/game', gameRoutes);
app.use('/v1/organizer', organizerRoutes);
app.use('/v1/public', publicRoutes);
app.use('/v1/participant', participantRoutes);
app.use('/v1/results', resultsRoutes);
app.use('/v1/cookandcreate', cookandcreateRoutes);
app.use('/v1/webhooks', webhookRoutes);

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
