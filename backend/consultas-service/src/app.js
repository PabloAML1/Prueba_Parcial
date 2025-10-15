import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import consultaRoutes from "./routes/consultaRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3100, http://localhost:5173', 'http://10.79.14.125:3100, http://10.79.14.125:5173' , 'http://10.79.13.142:3100, http://10.79.13.142:5173'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rutas
app.use("/consultas", consultaRoutes);

const PORT = process.env.PORT;
// IMPORTANTE: Escuchar en '0.0.0.0' para que sea accesible desde otros contenedores.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin-Service corriendo en puerto ${PORT}`);
});