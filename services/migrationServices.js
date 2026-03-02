import { readFile } from "fs/promises";
import pool from "../src/config/postgres.js";
import { parse } from "csv-parse/sync";
import { resolve } from "path";
import { env } from "../src/config/env.js";
import { PatientHistory } from "../src/models/patientHistory.js";

export async function migration(clearBefore = false) {
  const client = await pool.connect();

  try {
    console.log("Starting migration...");

    const csv = await readFile(resolve(env.fileDataCsv), "utf-8");

    const rows = parse(csv, {
      columns: true,
      trim: true,
      skip_empty_lines: true,
    });

    let insertedPatients = 0;
    let insertedDoctors = 0;
    let insertedAppointments = 0;

    for (const row of rows) {
      const patientEmail = row.patient_email.toLowerCase();

      // 🔹 1. Insert patient if not exists
      const patientResult = await client.query(
        `INSERT INTO patients (name, email, phone, address)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [
          row.patient_name,
          patientEmail,
          row.patient_phone,
          row.patient_address,
        ],
      );


      let patientId;
      if (patientResult.rows.length > 0) {
        patientId = patientResult.rows[0].id;
        insertedPatients++;
      } else {
        const existing = await client.query(
          "SELECT id FROM patients WHERE email = $1",
          [patientEmail],
        );
        patientId = existing.rows[0].id;
      }

      // 🔹 2. Insert specialty if not exists
      let specialtyResult = await client.query(
        `SELECT id FROM specialty WHERE name = $1`,
        [row.specialty],
      );

      let specialtyId;
      if (specialtyResult.rows.length === 0) {
        const insertSpecialty = await client.query(
          `INSERT INTO specialty (name) VALUES ($1) RETURNING id`,
          [row.specialty],
        );
        specialtyId = insertSpecialty.rows[0].id;
      } else {
        specialtyId = specialtyResult.rows[0].id;
      }

      // 🔹 3. Insert doctor if not exists
      const doctorResult = await client.query(
        `INSERT INTO doctors (name, email, specialty)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [row.doctor_name, row.doctor_email, specialtyId],
      );

      let doctorId;
      if (doctorResult.rows.length > 0) {
        doctorId = doctorResult.rows[0].id;
        insertedDoctors++;
      } else {
        const existing = await client.query(
          "SELECT id FROM doctors WHERE email = $1",
          [row.doctor_email],
        );
        doctorId = existing.rows[0].id;
      }

      // 🔹 4. Insert insurance if not exists
      const insuranceResult = await client.query(
        `INSERT INTO insurances (name_provider, coverage_percentage)
         VALUES ($1, $2)
         ON CONFLICT (name_provider) DO NOTHING
         RETURNING id`,
        [row.insurance_provider, row.coverage_percentage],
      );

      let insuranceId;
      if (insuranceResult.rows.length > 0) {
        insuranceId = insuranceResult.rows[0].id;
      } else {
        const existing = await client.query(
          "SELECT id FROM insurances WHERE name_provider = $1",
          [row.insurance_provider],
        );
        insuranceId = existing.rows[0].id;
      }

      // 🔹 5. Insert treatment if not exists
      const treatmentResult = await client.query(
        `INSERT INTO treatments (code, description, cost)
         VALUES ($1, $2, $3)
         ON CONFLICT (code) DO NOTHING
         RETURNING id`,
        [row.treatment_code, row.treatment_description, row.treatment_cost],
      );

      let treatmentId;
      if (treatmentResult.rows.length > 0) {
        treatmentId = treatmentResult.rows[0].id;
      } else {
        const existing = await client.query(
          "SELECT id FROM treatments WHERE code = $1",
          [row.treatment_code],
        );
        treatmentId = existing.rows[0].id;
      }

      // 🔹 6. Insert appointment
      await client.query(
        `INSERT INTO appointments (appointment_id, appointment_date, amount_paid, patient_id, doctor_id, insurance_id, treatment_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (appointment_id) DO NOTHING
         `,
        [
          row.appointment_id,
          row.appointment_date,
          row.amount_paid,
          patientId,
          doctorId,
          insuranceId,
          treatmentId,
        ],
      );
      insertedAppointments++;
      

      // 🔹 7. Update Mongo history
      await PatientHistory.updateOne(
        { patientEmail },
        {
          $setOnInsert: {
            patientName: row.patient_name,
            patientEmail,
          },
          $push: {
            appointments: {
              appointmentId: row.appointment_id,
              date: row.appointment_date,
              doctorName: row.doctor_name,
              doctorEmail: row.doctor_email,
              specialty: row.specialty,
              treatmentCode: row.treatment_code,
              treatmentDescription: row.treatment_description,
              treatmentCost: row.treatment_cost,
              insuranceProvider: row.insurance_provider,
              coveragePercentage: row.coverage_percentage,
              amountPaid : row.amount_paid
            },
          },
        },
        { upsert: true },
      );
    }

    console.log("Migration completed");

    return {
      ok: true,
      patients: insertedPatients,
      doctors: insertedDoctors,
      appointments: insertedAppointments,
    };
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    client.release();
  }
}