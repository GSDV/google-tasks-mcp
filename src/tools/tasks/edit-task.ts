import { z } from 'zod';

import { ToolDefinition, ToolContext } from '../types.js';
import { createSuccessResponse, createErrorResponse } from '../utils/response-builders.js';
import { withErrorHandling } from '../utils/with-error-handling.js';
import { Task } from '../../google-tasks/types.js';



interface EditTaskInput {
    task_id: string;
    title?: string;
    notes?: string;
    due?: string;
    status?: 'needsAction' | 'completed';
}

const inputSchema = {
    task_id: z.string().describe('The ID of the task to edit.'),
    title: z.string().optional().describe('New title for the task.'),
    notes: z.string().optional().describe('New notes/description for the task.'),
    due: z.string().optional().describe('New due date in RFC 3339 format (e.g., 2024-12-25T00:00:00Z).'),
    status: z.enum(['needsAction', 'completed']).optional().describe('New status: "needsAction" or "completed".')
};



async function handler(ctx: ToolContext, input: EditTaskInput) {
    const listId = await ctx.getDefaultTaskListId();

    const updateBody: Task = {};
    if (input.title !== undefined) updateBody.title = input.title;
    if (input.notes !== undefined) updateBody.notes = input.notes;
    if (input.due !== undefined) updateBody.due = input.due;
    if (input.status !== undefined) updateBody.status = input.status;

    if (Object.keys(updateBody).length === 0) {
        return createErrorResponse('No fields provided to update.');
    }

    const response = await ctx.tasksApi.tasks.patch({
        tasklist: listId,
        task: input.task_id,
        requestBody: updateBody
    });

    return createSuccessResponse({
        success: true,
        message: `Task "${response.data.title}" updated successfully.`,
        task: ctx.formatTask(response.data)
    });
}



export const editTask: ToolDefinition<EditTaskInput> = {
    name: 'edit_task',
    config: {
        title: 'Edit Task',
        description: 'Edit an existing task. You can update the title, notes, due date, or status.',
        inputSchema
    },
    handler: withErrorHandling('edit task', handler)
};