import { createErrorResponse } from './response-builders.js';

import { ToolContext, ToolResult } from '../types.js';



export function withErrorHandling<TInput>(actionName: string, handler: (ctx: ToolContext, input: TInput) => Promise<ToolResult>) {
    return async (ctx: ToolContext, input: TInput): Promise<ToolResult> => {
        try {
            return await handler(ctx, input);
        } catch (error) {
            return createErrorResponse(`Failed to ${actionName}: ${String(error)}`);
        }
    };
}