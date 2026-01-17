import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import express, { Request, Response } from 'express';

import { server } from './mcp.js';



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



app.all('/mcp', async (req: Request, res: Response) => {
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