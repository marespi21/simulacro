import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  appointmentId: String,
  date: Date,
  doctorName: String,
  doctorEmail: String,
  specialty: String,
  treatmentCode: String,
  treatmentDescription: String,
  treatmentCost: Number,
  insuranceProvider: String,
  coveragePercentage: Number,
  amountPaid: Number
});

const patientHistorySchema = new mongoose.Schema({
  patientId: Number,
  patientName: String,
  patientEmail: {
    type: String,
    index: true,
  },
  insuranceName: String,
  appointments: [appointmentSchema],
});

export const PatientHistory = mongoose.model(
  "PatientHistory",
  patientHistorySchema,
);