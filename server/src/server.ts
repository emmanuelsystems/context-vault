import express from 'express';
import vaultRouter from './routes/vault';
import mcpRouter from './mcp-server';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Context Vault API Operational',
        version: '2.0'
    });
});

// Mount API routes
app.use('/api/v1', vaultRouter);

// IMPORTANT: MCP router must be mounted last to prevent route conflicts
app.use('/mcp', mcpRouter);

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default app;
