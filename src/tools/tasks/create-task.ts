import { z } from 'zod';

import { ToolDefinition, ToolContext } from '../types.js';
import { createSuccessResponse } from '../utils/response-builders.js';
import { withErrorHandling } from '../utils/with-error-handling.js';
import { Task } from '../../google-tasks/types.js';



interface CreateTaskInput {
    title: string;
    notes?: string;
    due?: string;
}

const inputSchema = {
    title: z.string().describe('Title of the new task.'),
    notes: z.string().optional().describe('Notes/description for the task.'),
    due: z.string().optional().describe('Due date in RFC 3339 format (e.g., 2024-12-25T00:00:00Z).')
};



async function handler(ctx: ToolContext, input: CreateTaskInput) {
    const listId = await ctx.getDefaultTaskListId();

    const newTask: Task = { title: input.title };
    if (input.notes) newTask.notes = input.notes;
    if (input.due) newTask.due = input.due;

    const response = await ctx.tasksApi.tasks.insert({
        tasklist: listId,
        requestBody: newTask
    });

    return createSuccessResponse({
        success: true,
        message: `Task "${response.data.title}" created successfully.`,
        task: ctx.formatTask(response.data)
    });
}



export const createTask: ToolDefinition<CreateTaskInput> = {
    name: 'create_task',
    config: {
        title: 'Create Task',
        description: 'Create a new task in Google Tasks.',
        inputSchema
    },
    handler: withErrorHandling('create task', handler)
};