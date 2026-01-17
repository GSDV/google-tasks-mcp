# Google Tasks MCP

This is a simple MCP for working with Google Tasks. Agents will be able to run CRUD actions on your tasks. The MCP also exposes helpful functions such as getting all current + outdated tasks.

## Tools

| Tool | Description |
|------|-------------|
| `get_current_tasks` | Retrieve all tasks that are due today or overdue, as well as tasks with no due date. |
| `mark_task_complete` | Mark a specific task as completed. |
| `edit_task` | Edit an existing task. You can update the title, notes, due date, or status. |
| `create_task` | Create a new task in Google Tasks. |

## Setup
1. Make a new project in [Google Cloud](https://console.cloud.google.com)
    - Once made, search for the Google Tasks API and enable it.
    - Publish this new project, do not leave it in testing. Ignore Google's warnings.

2. Make new OAuth 2.0 Client ID [here](https://console.cloud.google.com/apis/credentials)
    - Make it a web appplication type.
    - Add the following URI "Authorize redirect URIs": https://developers.google.com/oauthplayground
    - Copy the Client ID and Client Secret as env variables for the project.

3. Create a refresh token [here](https://developers.google.com/oauthplayground/)
    - In the settings (gear icon, top right), check "Use your own OAuth credentials" and add the id and secret from step 2.
    - From the list on the left, in "Google Tasks API v1", select https://www.googleapis.com/auth/tasks and click "Authorize APIs".
    - There will be warnings, ignore all of them ("Advanced" -> "Go to [Project Name]").
    - Click "Exchange authorization code for tokens".
    - Copy refresh_token from the JSON, set it in GOOGLE_REFRESH_TOKEN env variable.

4. Create a secret key for MCP_API_KEY
    - You must give this same key to all agents that access this MCP.

5. Find a hosting provider to deploy, like onrender