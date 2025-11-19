import { Request, Response, NextFunction } from 'express';

export const requireWorkspaceId = (req: Request, res: Response, next: NextFunction) => {
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
        return res.status(400).json({ error: 'X-Workspace-ID header is required' });
    }

    // Attach workspaceId to request object if needed, or just pass through
    // For now, we just validate its presence
    next();
};
