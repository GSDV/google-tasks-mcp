import { tasks_v1 } from 'googleapis';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ZodRawShape } from 'zod';

import { Task, FormattedTask, TaskList } from '../google-tasks/types.js';



export interface ToolContext {
    tasksApi: tasks_v1.Tasks;
    getTaskLists: () => Promise<TaskList[]>;
    getDefaultTaskListId: () => Promise<string>;
    getTasks: (taskListId: string, showCompleted?: boolean) => Promise<Task[]>;
    formatTask: (task: Task) => FormattedTask;
    isDueTodayOrOverdue: (dueDate: string | null | undefined) => boolean;
}



export type ToolResult = CallToolResult;



export interface ToolDefinition<TInput = void> {
    name: string;
    config: {
        title: string;
        description: string;
        inputSchema?: ZodRawShape;
    };
    handler: (ctx: ToolContext, input: TInput) => Promise<ToolResult>;
}