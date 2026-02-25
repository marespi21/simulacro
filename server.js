import createTables from './postgres.js';
import app from './app.js';
import { env } from './src/env.js';

async function startServer() {
    try {
        console.log("Connecting to PostgreSQL...");
        await createTables();
        console.log("Connected to PostgreSQL successfully.");

        app.listen(env.port, () => {
            console.log(`Server running on http://localhost:${env.port}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

startServer();