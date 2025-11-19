var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
const VAULT_API_URL = "http://localhost:3000/api/v1";
const server = new McpServer({
    name: "Context Vault",
    version: "1.0.0",
});
server.tool("cv_create_run", "Create a new run for a specific play in a workspace", {
    play_name: z.string().describe("The name of the play to run"),
    workspace_id: z.string().describe("The ID of the workspace"),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ play_name, workspace_id }) {
    var _b, _c;
    try {
        const response = yield axios.post(`${VAULT_API_URL}/runs`, { play_name }, {
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
    run_id: z.string().describe("The ID of the run to assemble"),
    workspace_id: z.string().describe("The ID of the workspace"),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ run_id, workspace_id }) {
    var _b, _c;
    try {
        const response = yield axios.get(`${VAULT_API_URL}/runs/${run_id}/assemble`, {
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = new StdioServerTransport();
        yield server.connect(transport);
        console.error("Context Vault MCP Server running on stdio");
    });
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
