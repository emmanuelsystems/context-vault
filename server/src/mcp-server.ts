import { Router, Request, Response } from 'express';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import axios from "axios";

const router = Router();

// Create MCP server instance
const createMcpServer = () => {
    const VAULT_API_URL = process.env.VAULT_API_URL || "http://localhost:3000/api/v1";

    const server = new McpServer({
        name: "Context Vault",
        version: "2.0.0",
    });

    server.tool(
        "cv_create_run",
        "Create a new run for a specific play in a workspace",
        {
            play_name: z.string().describe("The name of the play to run"),
            workspace_id: z.string().describe("The ID of the workspace"),
        },
        async ({ play_name, workspace_id }) => {
            try {
                const response = await axios.post(
                    `${VAULT_API_URL}/runs`,
                    { play_name },
                    {
                        headers: {
                            "X-Workspace-ID": workspace_id,
                        },
                    }
                );
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ run_id: response.data.run_id }),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error creating run: ${error.response?.data?.error || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    server.tool(
        "cv_assemble_asset",
        "Assemble the asset prompt for a specific run",
        {
            run_id: z.string().describe("The ID of the run to assemble"),
            workspace_id: z.string().describe("The ID of the workspace"),
        },
        async ({ run_id, workspace_id }) => {
            try {
                const response = await axios.get(
                    `${VAULT_API_URL}/runs/${run_id}/assemble`,
                    {
                        headers: {
                            "X-Workspace-ID": workspace_id,
                        },
                    }
                );
                return {
                    content: [
                        {
                            type: "text",
                            text: response.data.asset,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error assembling asset: ${error.response?.data?.error || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    return server;
};

// SSE endpoint for MCP
router.get('/sse', async (req: Request, res: Response) => {
    const server = createMcpServer();
    const transport = new SSEServerTransport('/mcp/message', res);
    await server.connect(transport);
});

// Message endpoint for MCP
router.post('/message', async (req: Request, res: Response) => {
    // This will be handled by the SSE transport
    res.status(200).json({ status: 'ok' });
});

export default router;
