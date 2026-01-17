import { google } from 'googleapis';

import type { Task, FormattedTask } from './types.js';
export type { Task, FormattedTask } from './types.js';



const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

export const tasksApi = google.tasks({ version: "v1", auth: oauth2Client });



export async function getDefaultTaskListId() {
    const response = await tasksApi.tasklists.list({ maxResults: 1 });
    const taskLists = response.data.items;
    if (!taskLists || taskLists.length === 0) throw new Error('No task lists found.');
    return taskLists[0].id!;
}

export async function getTasks(taskListId: string, showCompleted: boolean = false) {
    const response = await tasksApi.tasks.list({
        tasklist: taskListId,
        showCompleted,
        showHidden: false,
        maxResults: 100,
    });
    return response.data.items || [];
}

export function isDueTodayOrOverdue(dueDate: string | null | undefined) {
    if (!dueDate) return false;

    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return due <= today;
}

export function formatTask(task: Task): FormattedTask {
    return {
        id: task.id,
        title: task.title,
        notes: task.notes || null,
        due: task.due || null,
        status: task.status,
        completed: task.completed || null,
        updated: task.updated
    };
}