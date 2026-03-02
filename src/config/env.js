//Configurar variables de entorno
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path"; // para obtener la ruta de donde va estar ubicado el archivo .env

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, "../../.env") });

const required = ["MONGO_URI", "POSTGRES_URI"]; //Para que sean obligatorias

for (const key of required) {
  if (!process.env[key]) {
    console.log(`Error, no se encontró la variable ${key} en el .env`); // Si la llave que se recorre no existe, se muestra en consola y retorno el error.
    throw new Error(
      `No se encontró la variable de entorno obligatoria: ${key}`,
    );
  }
}

export const env = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  postgresUri: process.env.POSTGRES_URI,
  fileDataCsv: process.env.FILE_DATA_CSV ?? "./data",
  schemaSqlPath: process.env.SCHEMA_SQL_PATH,
};