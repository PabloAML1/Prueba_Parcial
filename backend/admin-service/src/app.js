import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import centroRoutes from "./routes/centroRoutes.js";
import especialidadRoutes from "./routes/especialidadRoutes.js";
import medicoRoutes from "./routes/medicoRoutes.js";
import empleadoRoutes from "./routes/empleadoRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rutas
app.use("/api/centros", centroRoutes);
app.use("/api/especialidades", especialidadRoutes);
app.use("/api/medicos", medicoRoutes);
app.use("/api/empleados", empleadoRoutes);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Admin-Service corriendo en puerto ${PORT}`);
});