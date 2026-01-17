import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import express, { Request, Response, NextFunction } from 'express';

import { server } from './mcp.js';



const MCP_API_KEY = process.env.MCP_API_KEY;

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!MCP_API_KEY) {
        console.warn('MCP_API_KEY not set (anyone is able to access this MCP) - authentication disabled.');
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header.' });
        return;
    }

    const token = authHeader.slice(7);
    if (token !== MCP_API_KEY) {
        res.status(401).json({ error: 'Invalid API key.' });
        return;
    }

    next();
}

export const app = express();
app.use(express.json());



// Health check endpoint.
app.get('/', (_req: Request, res: Response) => {
    res.json({
        name: 'google-tasks',
        version: '1.0.0',
        status: 'healthy',
        transport: 'streamable-http',
        mcpEndpoint: '/mcp'
    });
});



app.all('/mcp', authMiddleware, async (req: Request, res: Response) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });

    res.on('close', () => {
        transport.close();
    });

    try {
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('MCP error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
});