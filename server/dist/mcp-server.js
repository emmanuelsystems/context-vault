"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
// Create MCP server instance
const createMcpServer = () => {
    const VAULT_API_URL = process.env.VAULT_API_URL || "http://localhost:3000/api/v1";
    const server = new mcp_js_1.McpServer({
        name: "Context Vault",
        version: "2.0.0",
    });
    server.tool("cv_create_run", "Create a new run for a specific play in a workspace", {
        play_name: zod_1.z.string().describe("The name of the play to run"),
        workspace_id: zod_1.z.string().describe("The ID of the workspace"),
    }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ play_name, workspace_id }) {
        var _b, _c;
        try {
            const response = yield axios_1.default.post(`${VAULT_API_URL}/runs`, { play_name }, {
                headers: {
                    "X-Workspace-ID": workspace_id,
                },
            });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({ run_id: response.data.run_id }),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error creating run: ${((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }));
    server.tool("cv_assemble_asset", "Assemble the asset prompt for a specific run", {
        run_id: zod_1.z.string().describe("The ID of the run to assemble"),
        workspace_id: zod_1.z.string().describe("The ID of the workspace"),
    }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ run_id, workspace_id }) {
        var _b, _c;
        try {
            const response = yield axios_1.default.get(`${VAULT_API_URL}/runs/${run_id}/assemble`, {
                headers: {
                    "X-Workspace-ID": workspace_id,
                },
            });
            return {
                content: [
                    {
                        type: "text",
                        text: response.data.asset,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error assembling asset: ${((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }));
    return server;
};
// Health check endpoint for MCP router
router.get('/', (req, res) => {
    res.status(200).json({ status: 'MCP Router Active' });
});
// SSE endpoint for MCP
router.get('/sse', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const server = createMcpServer();
    const transport = new sse_js_1.SSEServerTransport('/mcp/message', res);
    yield server.connect(transport);
}));
// Message endpoint for MCP
router.post('/message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This will be handled by the SSE transport
    res.status(200).json({ status: 'ok' });
}));
exports.default = router;
