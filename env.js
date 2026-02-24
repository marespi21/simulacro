import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve} from 'path';


__dirname = dirname (fileURLToPath(import.meta.url));

const required = ["MONGO_URI","POSTGRES_URI"];

for (const key of required){
    if (!process.env[key]){
        console.log(`Error:Midding required environment variable ${key}`)
        throw error ();
    }
}

config({ path: resolve(__dirname, '../../.env')});

export const env = {
    port: process.env.PORT || 3000,
    mongoUri : process.env.MONGO_URI,
    postgresUri : process.env.POSTGRES_URI,
    fileDataCsv : process.env.FILE_DATA_CSV ?? "./data/simulation_saludplus_data.csv"
}
