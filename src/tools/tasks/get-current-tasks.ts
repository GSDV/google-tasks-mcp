import { z } from 'zod';

import { ToolDefinition, ToolContext } from '../types.js';
import { createSuccessResponse } from '../utils/response-builders.js';
import { withErrorHandling } from '../utils/with-error-handling.js';
import { Task } from '../../google-tasks/types.js';



interface GetCurrentTasksInput {
    task_list_id?: string;
}

const inputSchema = {
    task_list_id: z.string().optional().describe('The ID of the task list to retrieve tasks from. If not provided, uses the default task list.')
};



async function handler(ctx: ToolContext, input: GetCurrentTasksInput) {
    const listId = input.task_list_id || await ctx.getDefaultTaskListId();
    const allTasks = await ctx.getTasks(listId, false);

    const relevantTasks = allTasks.filter((task) => {
        if (task.status === 'completed') return false;
        return ctx.isDueTodayOrOverdue(task.due);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: Task[] = [];
    const dueToday: Task[] = [];
    const noDueDate: Task[] = [];

    for (const task of relevantTasks) {
        if (!task.due) {
            noDueDate.push(task);
            continue;
        }

        const dueDate = new Date(task.due);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
            overdue.push(task);
        } else {
            dueToday.push(task);
        }
    }

    return createSuccessResponse({
        task_list_id: listId,
        overdue: overdue.map(ctx.formatTask),
        due_today: dueToday.map(ctx.formatTask),
        no_due_date: noDueDate.map(ctx.formatTask),
        summary: {
            overdue_count: overdue.length,
            due_today_count: dueToday.length,
            no_due_date_count: noDueDate.length,
            total: relevantTasks.length
        }
    });
}



export const getCurrentTasks: ToolDefinition<GetCurrentTasksInput> = {
    name: 'get_current_tasks',
    config: {
        title: 'Get Current Tasks',
        description: 'Retrieve all tasks that are due today or overdue, as well as tasks with no due date.',
        inputSchema
    },
    handler: withErrorHandling('get current tasks', handler)
};