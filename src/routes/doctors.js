import express from 'express';
import { Pool } from 'pg';
import { env } from '../env.js';

const router = express.Router();
const pool = new Pool({ connectionString: env.postgresUri });

// List all doctors or filter by specialty
router.get('/', async (req, res) => {
    const { specialty } = req.query;
    try {
        const query = specialty
            ? 'SELECT * FROM doctor WHERE speciality_id = (SELECT speciality_id FROM speciality WHERE speciality = $1)'
            : 'SELECT * FROM doctor';
        const params = specialty ? [specialty] : [];

        const result = await pool.query(query, params);
        res.status(200).json({ ok: true, doctors: result.rows });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM doctor WHERE doctor_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, error: 'Doctor not found' });
        }
        res.status(200).json({ ok: true, doctor: result.rows[0] });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
});

// Update doctor by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, specialty } = req.body;
    try {
        const specialityResult = await pool.query(
            'SELECT speciality_id FROM speciality WHERE speciality = $1',
            [specialty]
        );
        if (specialityResult.rows.length === 0) {
            return res.status(400).json({ ok: false, error: 'Invalid specialty' });
        }
        const specialityId = specialityResult.rows[0].speciality_id;

        const result = await pool.query(
            'UPDATE doctor SET doctor_name = $1, doctor_email = $2, speciality_id = $3 WHERE doctor_id = $4 RETURNING *',
            [name, email, specialityId, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, error: 'Doctor not found' });
        }
        res.status(200).json({ ok: true, message: 'Doctor updated successfully', doctor: result.rows[0] });
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
});

export default router;