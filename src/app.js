import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import doctorsRouter from './routes/doctors.js';
import patientsRouter from './routes/patients.js';
import reportsRouter from './routes/reports.js';

const app = express();

// Middleware configuration
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/doctors', doctorsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/reports', reportsRouter);

// Test route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API is running!' });
});

export default app;