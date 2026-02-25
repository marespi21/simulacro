import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import { env } from '../src/env.js';

const pool = new Pool({ connectionString: env.postgresUri });
const mongoClient = new MongoClient(env.mongoUri);

export async function migrateData() {
    try {
        const csvData = await readFile(env.fileDataCsv, 'utf-8');
        const records = parse(csvData, { columns: true });

        const client = await pool.connect();
        await mongoClient.connect();
        const db = mongoClient.db('saludplus');
        const patientHistories = db.collection('patient_histories');

        await client.query('BEGIN');

        for (const record of records) {
            // Normalize and insert data into PostgreSQL
            const { patient_name, patient_email, patient_phone, patient_address, doctor_name, doctor_email, specialty, appointment_id, appointment_date, treatment_code, treatment_description, treatment_cost, insurance_provider, coverage_percentage, amount_paid } = record;

            const insuranceResult = await client.query(
                `INSERT INTO insurance_provider (insurance_provider, coverage_percentage)
                 VALUES ($1, $2)
                 ON CONFLICT (insurance_provider) DO UPDATE SET coverage_percentage = EXCLUDED.coverage_percentage
                 RETURNING insurance_id`,
                [insurance_provider, coverage_percentage]
            );

            const insuranceId = insuranceResult.rows[0].insurance_id;

            const patientResult = await client.query(
                `INSERT INTO patient (patient_name, patient_email, patient_phone, patient_address, insurance_id)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (patient_email) DO UPDATE SET patient_phone = EXCLUDED.patient_phone, patient_address = EXCLUDED.patient_address
                 RETURNING patient_id`,
                [patient_name, patient_email, patient_phone, patient_address, insuranceId]
            );

            const patientId = patientResult.rows[0].patient_id;

            // Insert data into MongoDB
            await patientHistories.updateOne(
                { patientEmail: patient_email },
                {
                    $set: {
                        patientName: patient_name,
                        patientPhone: patient_phone,
                        patientAddress: patient_address
                    },
                    $push: {
                        appointments: {
                            appointmentId: appointment_id,
                            date: appointment_date,
                            doctorName: doctor_name,
                            doctorEmail: doctor_email,
                            specialty,
                            treatmentCode: treatment_code,
                            treatmentDescription: treatment_description,
                            treatmentCost: treatment_cost,
                            insuranceProvider: insurance_provider,
                            coveragePercentage: coverage_percentage,
                            amountPaid: amount_paid
                        }
                    }
                },
                { upsert: true }
            );
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await mongoClient.close();
        pool.end();
    }
}