import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

const required = ["MONGO_URI", "POSTGRES_URI"];

for (const key of required) {
    if (!process.env[key]) {
        console.error(`Error: Missing required environment variable: ${key}`);
        process.exit(1);
    }
}

console.log('Loaded environment variables:', process.env);

export const env = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    postgresUri: process.env.POSTGRES_URI,
    fileDataCsv: process.env.FILE_DATA_CSV || "./data/simulation_saludplus_data.csv"
};
