import express from "express";
import {
  createConsulta,
  getConsultas,
  getConsultaById,
  updateConsulta,
  deleteConsulta,
  getConsultasByMedico
} from "../controllers/consultaController.js";

const router = express.Router();

router.post("/", createConsulta);
router.get("/", getConsultas);
router.get("/medico/:medico_id", getConsultasByMedico);
router.get("/:id", getConsultaById);
router.put("/:id", updateConsulta);
router.delete("/:id", deleteConsulta);

export default router;
