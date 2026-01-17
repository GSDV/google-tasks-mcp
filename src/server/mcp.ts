import packageJson from '../../package.json' with { type: 'json' };

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import {
    tasksApi,
    getDefaultTaskListId,
    getTasks,
    isDueTodayOrOverdue,
    formatTask,
    Task
} from '../google-tasks/index.js';



export const server = new McpServer({
    name: packageJson.name,
    version: packageJson.version
});



server.registerTool('get_current_tasks', {
    title: 'Get Current Tasks',
    description: 'Retrieve all tasks that are due today or overdue, as well as tasks with no due date.'
}, async () => {
    try {
        const listId = await getDefaultTaskListId();
        const allTasks = await getTasks(listId, false);

        const relevantTasks = allTasks.filter((task) => {
            if (task.status === "completed") return false;
            return isDueTodayOrOverdue(task.due);
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

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            task_list_id: listId,
                            overdue: overdue.map(formatTask),
                            due_today: dueToday.map(formatTask),
                            no_due_date: noDueDate.map(formatTask),
                            summary: {
                                overdue_count: overdue.length,
                                due_today_count: dueToday.length,
                                no_due_date_count: noDueDate.length,
                                total: relevantTasks.length
                            }
                        }
                    )
                }
            ]
        }
    } catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: `Failed to edit task: ${String(error)}` })
                }
            ]
        }
    }
});



server.registerTool('mark_task_complete', {
    title: 'Mark Task Complete',
    description: 'Mark a specific task as completed.',
    inputSchema: {
        task_id: z.string().describe('The ID of the task to mark as complete.')
    }
}, async ({ task_id }) => {
    try {
        const listId = await getDefaultTaskListId();

        const response = await tasksApi.tasks.patch({
            tasklist: listId,
            task: task_id,
            requestBody: {
                status: 'completed'
            }
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            success: true,
                            message: `Task "${response.data.title}" marked as complete`,
                            task: formatTask(response.data)
                        }
                    )
                }
            ]
        };
    } catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: `Failed to mark task complete: ${String(error)}` })
                }
            ]
        };
    }
});



server.registerTool('edit_task', {
    title: 'Edit Tasks',
    description: 'Edit an existing task. You can update the title, notes, due date, or status.',
    inputSchema: {
        task_id: z.string().describe('The ID of the task to edit.'),
        title: z.string().optional().describe('New title for the task.'),
        notes: z
            .string()
            .optional()
            .describe('New notes/description for the task.'),
        due: z
            .string()
            .optional()
            .describe('New due date in RFC 3339 format (e.g., 2024-12-25T00:00:00Z).'),
        status: z
            .enum(['needsAction', 'completed'])
            .optional()
            .describe('New status: "needsAction" or "completed".')
        }
}, async ({ task_id, title, notes, due, status }) => {
    try {
        const listId = await getDefaultTaskListId();

        const updateBody: Task = {};
        if (title !== undefined) updateBody.title = title;
        if (notes !== undefined) updateBody.notes = notes;
        if (due !== undefined) updateBody.due = due;
        if (status !== undefined) updateBody.status = status;

        if (Object.keys(updateBody).length === 0) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: 'No fields provided to update.'
                        })
                    }
                ]
            };
        }

        const response = await tasksApi.tasks.patch({
            tasklist: listId,
            task: task_id,
            requestBody: updateBody
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            success: true,
                            message: `Task "${response.data.title}" updated successfully.`,
                            task: formatTask(response.data)
                        }
                    )
                }
            ]
        };
    } catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: `Failed to edit task: ${String(error)}` })
                }
            ]
        };
    }
});



server.registerTool('create_task', {
    title: 'Create Task',
    description: 'Create a new task in Google Tasks.',
    inputSchema: {
        title: z.string().describe('Title of the new task.'),
        notes: z.string().optional().describe('Notes/description for the task.'),
        due: z
            .string()
            .optional()
            .describe('Due date in RFC 3339 format (e.g., 2024-12-25T00:00:00Z).'),
    },
}, async ({ title, notes, due }) => {
    try {
        const listId = await getDefaultTaskListId();

        const newTask: Task = { title };
        if (notes) newTask.notes = notes;
        if (due) newTask.due = due;

        const response = await tasksApi.tasks.insert({
            tasklist: listId,
            requestBody: newTask
        });

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            success: true,
                            message: `Task "${response.data.title}" created successfully.`,
                            task: formatTask(response.data)
                        }
                    )
                }
            ]
        };
    } catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ error: `Failed to create task: ${String(error)}` })
                }
            ]
        };
    }
});