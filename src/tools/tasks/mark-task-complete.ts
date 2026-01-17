import { z } from 'zod';

import { ToolDefinition, ToolContext } from '../types.js';
import { createSuccessResponse } from '../utils/response-builders.js';
import { withErrorHandling } from '../utils/with-error-handling.js';



interface MarkTaskCompleteInput {
    task_id: string;
}

const inputSchema = {
    task_id: z.string().describe('The ID of the task to mark as complete.')
};



async function handler(ctx: ToolContext, input: MarkTaskCompleteInput) {
    const listId = await ctx.getDefaultTaskListId();

    const response = await ctx.tasksApi.tasks.patch({
        tasklist: listId,
        task: input.task_id,
        requestBody: {
            status: 'completed'
        }
    });

    return createSuccessResponse({
        success: true,
        message: `Task "${response.data.title}" marked as complete`,
        task: ctx.formatTask(response.data)
    });
}



export const markTaskComplete: ToolDefinition<MarkTaskCompleteInput> = {
    name: 'mark_task_complete',
    config: {
        title: 'Mark Task Complete',
        description: 'Mark a specific task as completed.',
        inputSchema
    },
    handler: withErrorHandling('mark task complete', handler)
};