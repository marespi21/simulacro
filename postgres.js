import { Pool } from 'pg';
import { env } from './src/env.js';

const pool = new Pool({
    connectionString: env.postgresUri
});

async function createTables() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Create speciality table
        await client.query(`
            CREATE TABLE IF NOT EXISTS speciality (
                speciality_id SERIAL PRIMARY KEY,
                speciality VARCHAR(255) NOT NULL UNIQUE
            );
        `);

        // Create insurance_provider table
        await client.query(`
            CREATE TABLE IF NOT EXISTS insurance_provider (
                insurance_id SERIAL PRIMARY KEY,
                insurance_provider VARCHAR(255) NOT NULL UNIQUE,
                coverage_percentage INT NOT NULL CHECK (coverage_percentage BETWEEN 0 AND 100)
            );
        `);

        // Create doctor table
        await client.query(`
            CREATE TABLE IF NOT EXISTS doctor (
                doctor_id SERIAL PRIMARY KEY,
                doctor_name VARCHAR(255) NOT NULL,
                doctor_email VARCHAR(255) NOT NULL UNIQUE,
                speciality_id INT REFERENCES speciality(speciality_id) ON DELETE CASCADE
            );
        `);

        // Create patient table
        await client.query(`
            CREATE TABLE IF NOT EXISTS patient (
                patient_id SERIAL PRIMARY KEY,
                patient_name VARCHAR(255) NOT NULL,
                patient_email VARCHAR(255) NOT NULL UNIQUE,
                patient_phone VARCHAR(20),
                patient_address VARCHAR(255),
                insurance_id INT REFERENCES insurance_provider(insurance_id) ON DELETE SET NULL
            );
        `);

        // Create treatment table
        await client.query(`
            CREATE TABLE IF NOT EXISTS treatment (
                treatment_code VARCHAR(255) PRIMARY KEY,
                treatment_description VARCHAR(255) NOT NULL,
                treatment_cost INT NOT NULL CHECK (treatment_cost > 0)
            );
        `);

        // Create appointment table
        await client.query(`
            CREATE TABLE IF NOT EXISTS appointment (
                appointment_id SERIAL PRIMARY KEY,
                appointment_date DATE NOT NULL,
                patient_id INT REFERENCES patient(patient_id) ON DELETE CASCADE,
                doctor_id INT REFERENCES doctor(doctor_id) ON DELETE CASCADE,
                treatment_code VARCHAR(255) REFERENCES treatment(treatment_code) ON DELETE CASCADE,
                insurance_id INT REFERENCES insurance_provider(insurance_id) ON DELETE SET NULL,
                amount_paid INT NOT NULL CHECK (amount_paid >= 0)
            );
        `);

        await client.query("COMMIT");
        console.log("Tables created successfully.");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error creating tables:", error);
    } finally {
        client.release();
    }
}

export default createTables;