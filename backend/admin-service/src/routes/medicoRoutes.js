import express from "express";
import {
  createMedico,
  getMedicos,
  getMedicoById,
  updateMedico,
  deleteMedico
} from "../controllers/medicoController.js";

const router = express.Router();

router.post("/", createMedico);
router.get("/", getMedicos);
router.get("/:id", getMedicoById);
router.put("/:id", updateMedico);
router.delete("/:id", deleteMedico);

export default router;
