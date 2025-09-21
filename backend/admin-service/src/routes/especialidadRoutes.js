import express from "express";
import {
  createEspecialidad,
  getEspecialidades,
  getEspecialidadById,
  updateEspecialidad,
  deleteEspecialidad
} from "../controllers/especialidadController.js";

const router = express.Router();

router.post("/", createEspecialidad);
router.get("/", getEspecialidades);
router.get("/:id", getEspecialidadById);
router.put("/:id", updateEspecialidad);
router.delete("/:id", deleteEspecialidad);

export default router;
