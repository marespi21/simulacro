import pg from "pg"; //grupo de conexiones, crea paquetes de 10 conexiones, se puede configuarra el tamaño
import { env } from "./env.js";
import { readFile } from "fs/promises";
import { resolve } from "path";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.postgresUri, //configuración para la url de la conexion
});

export default pool;

export async function createTables() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Leer archivo SQL
    const sqlPath = resolve(env.schemaSqlPath);
    const sql = await readFile(sqlPath, "utf-8"); 
      

    // script to create table patients
    await client.query(sql); // aca debo poner lo creado en sql.
    await client.query("COMMIT"); //Siempre debo poner esto para finalizar mi script
    console.log("Tablas creadas correctamente");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creando tablas", error);
  } finally {
    client.release(); //liberar la conexión para poder usarlas después.
  }
}