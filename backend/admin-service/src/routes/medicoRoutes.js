import express from "express";
import {
  createMedico,
  getMedicos,
  getMedicoById,
  updateMedico,
  deleteMedico,
  getMedicoByUserId,
} from "../controllers/medicoController.js";

const router = express.Router();

router.post("/", createMedico);
router.get("/", getMedicos);
router.get("/user/:user_id", getMedicoByUserId);
router.get("/:id", getMedicoById);
router.put("/:id", updateMedico);
router.delete("/:id", deleteMedico);

export default router;
