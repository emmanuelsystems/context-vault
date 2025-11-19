export const requireWorkspaceId = (req, res, next) => {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) {
        return res.status(400).json({ error: 'X-Workspace-ID header is required' });
    }
    // Attach workspaceId to request object if needed, or just pass through
    // For now, we just validate its presence
    next();
};
