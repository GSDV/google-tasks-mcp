import packageJson from '../../package.json' with { type: 'json' };

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import {
    tasksApi,
    getTaskLists,
    getDefaultTaskListId,
    getTasks,
    isDueTodayOrOverdue,
    formatTask
} from '../google-tasks/index.js';

import { registerAllTools, ToolContext } from '../tools/index.js';



export const server = new McpServer({
    name: packageJson.name,
    version: packageJson.version
});



const toolContext: ToolContext = {
    tasksApi,
    getTaskLists,
    getDefaultTaskListId,
    getTasks,
    formatTask,
    isDueTodayOrOverdue
};

registerAllTools(server, toolContext);
