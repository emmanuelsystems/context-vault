import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
const prisma = new PrismaClient();

async function main() {
    // Clean up existing data
    await prisma.run.deleteMany();
    await prisma.play.deleteMany();
    await prisma.coreBlock.deleteMany();

    const play = await prisma.play.create({
        data: {
            name: 'Test Play',
            workspaceId: '123',
            blocks: {
                create: [
                    { name: 'Block A' },
                    { name: 'Block B' },
                ],
            },
        },
    });

    console.log('Seeded database with Play:', play);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
