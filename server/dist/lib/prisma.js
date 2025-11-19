"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_neon_1 = require("@prisma/adapter-neon");
const serverless_1 = require("@neondatabase/serverless");
const ws_1 = __importDefault(require("ws"));
// Configure WebSocket for local development and non-Edge environments
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    // Create Neon connection pool
    const pool = new serverless_1.Pool({ connectionString });
    // Create Neon adapter
    // Cast pool to any to avoid type mismatch between @neondatabase/serverless and @prisma/adapter-neon
    const adapter = new adapter_neon_1.PrismaNeon(pool);
    // Return PrismaClient with adapter
    return new client_1.PrismaClient({ adapter });
};
// Use global singleton in development/serverless, create new instance if not cached
const prisma = (_a = global.prisma) !== null && _a !== void 0 ? _a : prismaClientSingleton();
exports.default = prisma;
// Cache the client in global scope to maintain singleton across hot-reloads and serverless invocations
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
