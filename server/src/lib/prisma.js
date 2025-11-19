var _a;
import { PrismaClient } from '@prisma/client';
const prismaClientSingleton = () => {
    return new PrismaClient();
};
const globalForPrisma = globalThis;
const prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : prismaClientSingleton();
export default prisma;
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
