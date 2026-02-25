import express from 'express';
import { MongoClient } from 'mongodb';
import { env } from '../env.js';

const router = express.Router();
const mongoClient = new MongoClient(env.mongoUri);

// Get patient history by email
router.get('/:email/history', async (req, res) => {
    const { email } = req.params;
    try {
        await mongoClient.connect();
        const db = mongoClient.db('saludplus');
        const patientHistories = db.collection('patient_histories');

        const patient = await patientHistories.findOne({ patientEmail: email });
        if (!patient) {
            return res.status(404).json({ ok: false, error: 'Patient not found' });
        }

        const summary = {
            totalAppointments: patient.appointments.length,
            totalSpent: patient.appointments.reduce((sum, app) => sum + app.amountPaid, 0),
            mostFrequentSpecialty: patient.appointments.reduce((freq, app) => {
                freq[app.specialty] = (freq[app.specialty] || 0) + 1;
                return freq;
            }, {})
        };
        summary.mostFrequentSpecialty = Object.keys(summary.mostFrequentSpecialty).reduce((a, b) =>
            summary.mostFrequentSpecialty[a] > summary.mostFrequentSpecialty[b] ? a : b
        );

        res.status(200).json({ ok: true, patient, summary });
    } catch (error) {
        console.error('Error fetching patient history:', error);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    } finally {
        await mongoClient.close();
    }
});

export default router;