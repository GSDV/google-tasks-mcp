import { app } from './server/index.js';



// Start the server.
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Google Tasks MCP Server running on port ${PORT}.`);
});