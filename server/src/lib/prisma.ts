import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for local development and non-Edge environments
neonConfig.webSocketConstructor = ws;

// Declare global types for caching
declare global {
    var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create Neon connection pool
    const pool = new Pool({ connectionString });

    // Create Neon adapter
    // Cast pool to any to avoid type mismatch between @neondatabase/serverless and @prisma/adapter-neon
    const adapter = new PrismaNeon(pool as any);

    // Return PrismaClient with adapter
    return new PrismaClient({ adapter } as any);
};

// Use global singleton in development/serverless, create new instance if not cached
const prisma = global.prisma ?? prismaClientSingleton();

export default prisma;

// Cache the client in global scope to maintain singleton across hot-reloads and serverless invocations
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
