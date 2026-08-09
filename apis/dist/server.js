"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
// Load environment variables
dotenv_1.default.config();
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
const isLocalDevelopmentOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const corsOptions = {
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
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Socket.IO setup
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
// Middleware — CORS must run before helmet
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Import Routes
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
const organizerRoutes_1 = __importDefault(require("./routes/organizerRoutes"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const participantRoutes_1 = __importDefault(require("./routes/participantRoutes"));
const resultsRoutes_1 = __importDefault(require("./routes/resultsRoutes"));
const cookandcreate_1 = __importDefault(require("./routes/cookandcreate"));
// Use Routes
app.use('/v1/game', gameRoutes_1.default);
app.use('/v1/organizer', organizerRoutes_1.default);
app.use('/v1/public', publicRoutes_1.default);
app.use('/v1/participant', participantRoutes_1.default);
app.use('/v1/results', resultsRoutes_1.default);
app.use('/v1/cookandcreate', cookandcreate_1.default);
// Socket.IO connection
const socketHandler_1 = require("./socket/socketHandler");
io.on('connection', (socket) => {
    (0, socketHandler_1.setupSocketHandlers)(io, socket);
});
// Global Error Handler
const errorHandler_1 = require("./middlewares/errorHandler");
app.use(errorHandler_1.globalErrorHandler);
// Ensure game-engine schema additions (retention columns, votes/group_accusations
// tables, etc.) exist before the timer service or any game routes start running.
const schemaHelpers_1 = require("./utils/schemaHelpers");
(0, schemaHelpers_1.ensureGameSchemaUpdates)().catch((err) => logger_1.default.error('[Server] Schema bootstrap failed:', err));
// Start Timer Service
const timerService_1 = require("./services/timerService");
(0, timerService_1.startTimerService)();
// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger_1.default.info(`[Server] Node.js API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
