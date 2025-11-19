"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vault_1 = __importDefault(require("./routes/vault"));
const mcp_server_1 = __importDefault(require("./mcp-server"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Context Vault API Operational',
        version: '2.0'
    });
});
// Mount API routes
app.use('/api/v1', vault_1.default);
// IMPORTANT: MCP router must be mounted last to prevent route conflicts
app.use('/mcp', mcp_server_1.default);
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
exports.default = app;
