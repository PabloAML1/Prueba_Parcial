import express from "express";
import dotenv from "dotenv";
import consultaRoutes from "./routes/consultaRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

// Rutas
app.use("/consultas", consultaRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Consultas-Service corriendo en puerto ${PORT}`);
});
