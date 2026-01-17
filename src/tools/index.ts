import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { ToolDefinition, ToolContext } from './types.js';

// Import all tool categories
import * as taskTools from './tasks/index.js';



// Collect all tools into a single array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allTools: ToolDefinition<any>[] = [
    ...Object.values(taskTools)
];



/**
 * Registers all tools with the MCP server.
 */
export function registerAllTools(server: McpServer, ctx: ToolContext): void {
    for (const tool of allTools) {
        if (tool.config.inputSchema) {
            server.registerTool(
                tool.name,
                {
                    title: tool.config.title,
                    description: tool.config.description,
                    inputSchema: tool.config.inputSchema
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                async (input: any) => tool.handler(ctx, input)
            );
        } else {
            server.registerTool(
                tool.name,
                {
                    title: tool.config.title,
                    description: tool.config.description
                },
                async () => tool.handler(ctx, undefined as void)
            );
        }
    }
}



// Re-export types for external use
export type { ToolDefinition, ToolContext, ToolResult } from './types.js';

// Re-export individual tools for selective use or testing
export * from './tasks/index.js';
