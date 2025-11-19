import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireWorkspaceId } from '../middleware/auth';

const router = Router();

// Apply middleware to all routes in this router
router.use(requireWorkspaceId);

router.get('/plays', async (req: Request, res: Response) => {
    const workspaceId = req.headers['x-workspace-id'] as string;

    try {
        const plays = await prisma.play.findMany({
            where: {
                workspaceId: workspaceId,
            },
        });
        res.json(plays);
    } catch (error) {
        console.error('Error fetching plays:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/runs', async (req: Request, res: Response) => {
    const workspaceId = req.headers['x-workspace-id'] as string;
    const { play_name } = req.body;

    if (!play_name) {
        return res.status(400).json({ error: 'play_name is required' });
    }

    try {
        const play = await prisma.play.findUnique({
            where: { name: play_name },
        });

        if (!play) {
            return res.status(404).json({ error: `Play '${play_name}' not found` });
        }

        if (play.workspaceId !== workspaceId) {
            return res.status(403).json({ error: `Play '${play_name}' does not belong to this workspace` });
        }

        const run = await prisma.run.create({
            data: {
                playId: play.id,
                status: 'queued',
            },
        });

        res.json({ run_id: run.id });
    } catch (error) {
        console.error('Error creating run:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/runs/:id/assemble', async (req: Request, res: Response) => {
    const { id } = req.params;
    const workspaceId = req.headers['x-workspace-id'] as string;

    try {
        const run = await prisma.run.findUnique({
            where: { id },
            include: {
                play: {
                    include: {
                        blocks: true,
                    },
                },
            },
        });

        if (!run) {
            return res.status(404).json({ error: 'Run not found' });
        }

        if (run.play.workspaceId !== workspaceId) {
            return res.status(403).json({ error: 'Run does not belong to this workspace' });
        }

        // Assemble logic: Concatenate Play name and Block names
        const parts = [`Play: ${run.play.name}`];
        if (run.play.blocks.length > 0) {
            parts.push('Blocks:');
            run.play.blocks.forEach(block => {
                parts.push(`- ${block.name}`);
            });
        }

        const asset = parts.join('\n');
        res.json({ asset });

    } catch (error) {
        console.error('Error assembling asset:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
