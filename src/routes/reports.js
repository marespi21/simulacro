import express from 'express';
import { Pool } from 'pg';
import { env } from '../env.js';

const router = express.Router();
const pool = new Pool({ connectionString: env.postgresUri });

// Generate revenue report
router.get('/revenue', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const query = `
            SELECT
                insurance_provider.insurance_provider,
                COUNT(appointment.appointment_id) AS appointment_count,
                SUM(appointment.amount_paid) AS total_amount
            FROM appointment
            JOIN insurance_provider ON appointment.insurance_id = insurance_provider.insurance_id
            WHERE ($1::DATE IS NULL OR appointment.appointment_date >= $1)
              AND ($2::DATE IS NULL OR appointment.appointment_date <= $2)
            GROUP BY insurance_provider.insurance_provider
        `;
        const params = [startDate || null, endDate || null];

        const result = await pool.query(query, params);
        const totalRevenue = result.rows.reduce((sum, row) => sum + parseInt(row.total_amount, 10), 0);

        res.status(200).json({
            ok: true,
            report: {
                totalRevenue,
                byInsurance: result.rows,
                period: { startDate, endDate }
            }
        });
    } catch (error) {
        console.error('Error generating revenue report:', error);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
});

export default router;