import { ToolResult } from '../types.js';



export function createSuccessResponse(data: unknown): ToolResult {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data)
            }
        ]
    };
}



export function createErrorResponse(message: string): ToolResult {
    return {
        isError: true,
        content: [
            {
                type: 'text',
                text: JSON.stringify({ error: message })
            }
        ]
    };
}