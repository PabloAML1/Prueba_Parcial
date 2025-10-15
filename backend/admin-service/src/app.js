import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import centroRoutes from "./routes/centroRoutes.js";
import especialidadRoutes from "./routes/especialidadRoutes.js";
import medicoRoutes from "./routes/medicoRoutes.js";
import empleadoRoutes from "./routes/empleadoRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000, http://localhost:5173',
       'http://10.79.14.125:5173',
       'http://10.79.14.125:3000',
       'http://10.79.13.142:5173',
       'http://10.79.13.142:3000',],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rutas
app.use("/centros", centroRoutes);
app.use("/especialidades", especialidadRoutes);
app.use("/medicos", medicoRoutes);
app.use("/empleados", empleadoRoutes);
app.use("/dashboard", dashboardRoutes);

const PORT = process.env.PORT;
// IMPORTANTE: Escuchar en '0.0.0.0' para que sea accesible desde otros contenedores.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin-Service corriendo en puerto ${PORT}`);
});
