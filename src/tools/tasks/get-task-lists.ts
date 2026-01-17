import { ToolDefinition, ToolContext } from '../types.js';
import { createSuccessResponse } from '../utils/response-builders.js';
import { withErrorHandling } from '../utils/with-error-handling.js';



async function handler(ctx: ToolContext) {
    const taskLists = await ctx.getTaskLists();

    const formattedLists = taskLists.map(list => ({
        id: list.id,
        title: list.title,
        updated: list.updated
    }));

    return createSuccessResponse({
        task_lists: formattedLists,
        total: formattedLists.length
    });
}



export const getTaskLists: ToolDefinition = {
    name: 'get_task_lists',
    config: {
        title: 'Get Task Lists',
        description: 'Retrieve all task lists for the user. Use this to get task list IDs for use with other tools.'
    },
    handler: withErrorHandling('get task lists', handler)
};
