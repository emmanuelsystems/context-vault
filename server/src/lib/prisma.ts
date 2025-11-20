import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// Define global type for singleton pattern
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

const connectionString = `${process.env.DATABASE_URL}`;

// Initialize the adapter with the connection string directly
const adapter = new PrismaNeon({ connectionString });

// Implement the Singleton pattern
const prisma = global.prisma || new PrismaClient({
    adapter,
    log: ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export const db = prisma;
