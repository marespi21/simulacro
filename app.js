import express from "express";
import simulacroRoutes from "./routes/simulacro.routes.js";
import doctorsRoutes from './routes/doctors.routes.js'

const app = express();

app.use(express.json());

app.use("/api/simulacro", simulacroRoutes);
app.use("/api/doctors", doctorsRoutes)

export default app;