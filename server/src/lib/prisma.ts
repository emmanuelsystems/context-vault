import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

// Declare global types for caching
declare global {
    var prisma: PrismaClient | undefined;
    var pool: Pool | undefined;
}

const getPool = () => {
    if (!global.pool) {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        global.pool = new Pool({ connectionString });
    }

    return global.pool;
};

const prismaClientSingleton = () => {
    const pool = getPool();
    const adapter = new PrismaNeon(pool);

    return new PrismaClient({ adapter } as any);
};

const prisma = global.prisma ?? prismaClientSingleton();

export default prisma;

// Cache the client in development to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
