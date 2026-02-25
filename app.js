import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import createTables from './postgres.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors()); // Enable CORS for cross-origin requests
app.use(bodyParser.json()); // Parse JSON bodies

// Test route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// Initialize PostgreSQL tables
createTables();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});