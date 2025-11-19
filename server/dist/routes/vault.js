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
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply middleware to all routes in this router
router.use(auth_1.requireWorkspaceId);
router.get('/plays', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workspaceId = req.headers['x-workspace-id'];
    try {
        const plays = yield prisma_1.default.play.findMany({
            where: {
                workspaceId: workspaceId,
            },
        });
        res.json(plays);
    }
    catch (error) {
        console.error('Error fetching plays:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.post('/runs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workspaceId = req.headers['x-workspace-id'];
    const { play_name } = req.body;
    if (!play_name) {
        return res.status(400).json({ error: 'play_name is required' });
    }
    try {
        const play = yield prisma_1.default.play.findUnique({
            where: { name: play_name },
        });
        if (!play) {
            return res.status(404).json({ error: `Play '${play_name}' not found` });
        }
        if (play.workspaceId !== workspaceId) {
            return res.status(403).json({ error: `Play '${play_name}' does not belong to this workspace` });
        }
        const run = yield prisma_1.default.run.create({
            data: {
                playId: play.id,
                status: 'queued',
            },
        });
        res.json({ run_id: run.id });
    }
    catch (error) {
        console.error('Error creating run:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.get('/runs/:id/assemble', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const workspaceId = req.headers['x-workspace-id'];
    try {
        const run = yield prisma_1.default.run.findUnique({
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
    }
    catch (error) {
        console.error('Error assembling asset:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = router;
