import { createTables } from "./src/config/postgres.js";
import app from "./app.js";
import { env } from "./src/config/env.js";
import { connectMongo } from "./src/config/mongo.js";
import { migration } from "./services/migrationServices.js";

async function startServer() {
  try {
    console.log("Connecting to postgres...");
    await createTables();
    console.log("Postgres connected");

    //conection Mongo
    await connectMongo();
    //await migration();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();