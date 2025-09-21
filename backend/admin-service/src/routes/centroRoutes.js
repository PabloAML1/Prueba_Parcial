import express from "express";
import {
  createCentro,
  getCentros,
  getCentroById,
  updateCentro,
  deleteCentro
} from "../controllers/centroController.js";

const router = express.Router();

router.post("/", createCentro);
router.get("/", getCentros);
router.get("/:id", getCentroById);
router.put("/:id", updateCentro);
router.delete("/:id", deleteCentro);

export default router;
