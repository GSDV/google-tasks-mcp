import { z } from 'zod';

import { ToolDefinition, ToolContext } from '../types.js';
import { createSuccessResponse, createErrorResponse } from '../utils/response-builders.js';
import { withErrorHandling } from '../utils/with-error-handling.js';



interface SearchTasksInput {
    task_list_id?: string;
    keywords?: string[];
    due_after?: string;
    due_before?: string;
    include_completed?: boolean;
}

const inputSchema = {
    task_list_id: z.string().optional().describe('The ID of the task list to search. If not provided, uses the default task list.'),
    keywords: z.array(z.string()).optional().describe('Array of keywords to search for. Matches if ANY keyword is found in task title OR notes (case-insensitive).'),
    due_after: z.string().optional().describe('Filter tasks with due date on or after this timestamp (RFC 3339 format, e.g., "2026-01-15T00:00:00Z").'),
    due_before: z.string().optional().describe('Filter tasks with due date on or before this timestamp (RFC 3339 format, e.g., "2026-01-31T23:59:59Z").'),
    include_completed: z.boolean().optional().describe('Include completed tasks in search results. Default: false.')
};



function matchesKeywords(task: { title?: string | null; notes?: string | null }, keywords: string[]): boolean {
    const titleLower = (task.title || '').toLowerCase();
    const notesLower = (task.notes || '').toLowerCase();

    return keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return titleLower.includes(keywordLower) || notesLower.includes(keywordLower);
    });
}

function isWithinDateRange(dueDate: string | null | undefined, dueAfter?: string, dueBefore?: string): boolean {
    if (!dueDate) return false;

    const due = new Date(dueDate);

    if (dueAfter) {
        const after = new Date(dueAfter);
        if (due < after) return false;
    }

    if (dueBefore) {
        const before = new Date(dueBefore);
        if (due > before) return false;
    }

    return true;
}



async function handler(ctx: ToolContext, input: SearchTasksInput) {
    const { keywords, due_after, due_before, include_completed = false } = input;

    const hasKeywords = keywords && keywords.length > 0;
    const hasDateRange = due_after || due_before;

    if (!hasKeywords && !hasDateRange) {
        return createErrorResponse('At least one search criteria is required: keywords or date range (due_after/due_before).');
    }

    const listId = input.task_list_id || await ctx.getDefaultTaskListId();
    const allTasks = await ctx.getTasks(listId, include_completed);

    const matchingTasks = allTasks.filter(task => {
        if (!include_completed && task.status === 'completed') {
            return false;
        }

        if (hasKeywords && !matchesKeywords(task, keywords!)) {
            return false;
        }

        if (hasDateRange && !isWithinDateRange(task.due, due_after, due_before)) {
            return false;
        }

        return true;
    });

    const searchCriteria: Record<string, unknown> = {};
    if (hasKeywords) searchCriteria.keywords = keywords;
    if (due_after) searchCriteria.due_after = due_after;
    if (due_before) searchCriteria.due_before = due_before;
    if (include_completed) searchCriteria.include_completed = true;

    return createSuccessResponse({
        task_list_id: listId,
        search_criteria: searchCriteria,
        tasks: matchingTasks.map(ctx.formatTask),
        summary: {
            total_matches: matchingTasks.length
        }
    });
}



export const searchTasks: ToolDefinition<SearchTasksInput> = {
    name: 'search_tasks',
    config: {
        title: 'Search Tasks',
        description: 'Search for tasks by keywords and/or due date range. Keywords are matched case-insensitively against task title and notes (matches if ANY keyword is found). Date range filters tasks by their due date.',
        inputSchema
    },
    handler: withErrorHandling('search tasks', handler)
};
