import create table from "./config/postgresUri";
import app  from "./app.js";
import {env} from "./config/env.js";

try {
    console.log("Connecting to postgres...")
    await createTables();
    console.log("connected to postgres successfully");

    app.listen(env.port,() =>{
        console.log(`Server running on port ${env.port}`)
    })
}catch(error){
    console.error("Error starting server:")
    process.exit
}