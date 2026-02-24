import { Pool } from 'pg';
import { env } from './env.js';

const pool = new Pool({
    connectionString: env.postgresUri
});

async function createTables() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            CREATE TABLE IF NOT EXISTS speciality (
                speciality_id SERIAL PRIMARY KEY,
                speciality VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS insurance_provider (
                insurance_id SERIAL PRIMARY KEY,
                insurance_provider VARCHAR(255),
                coverage_percentage INT
            );

            CREATE TABLE IF NOT EXISTS doctor (
                doctor_id SERIAL PRIMARY KEY,
                doctor_name VARCHAR(255),
                doctor_email VARCHAR(255),
                speciality_id INT REFERENCES speciality(speciality_id)
            );

            CREATE TABLE IF NOT EXISTS patient (
                patient_id SERIAL PRIMARY KEY,
                patient_name VARCHAR(255),
                patient_email VARCHAR(255),
                patient_phone VARCHAR(20),
                patient_address VARCHAR(255),
                insurance_id INT REFERENCES insurance_provider(insurance_id)
            );

            CREATE TABLE IF NOT EXISTS treatment (
                treatment_code VARCHAR(255) PRIMARY KEY,
                treatment_description VARCHAR(255),
                treatment_cost INT
            );

            CREATE TABLE IF NOT EXISTS appointment (
                appointment_id SERIAL PRIMARY KEY,
                appointment_date DATE NOT NULL,
                patient_id INT REFERENCES patient(patient_id),
                doctor_id INT REFERENCES doctor(doctor_id),
                treatment_code VARCHAR(255) REFERENCES treatment(treatment_code),
                amount_paid INT
            );
        `);

        await client.query("COMMIT");
        console.log("Tables created successfully ");

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error creating tables ", error);
    } finally {
        client.release();
    }
}

export default createTables;