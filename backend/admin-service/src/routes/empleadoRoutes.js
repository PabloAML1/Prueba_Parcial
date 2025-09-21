import express from "express";
import {
  createEmpleado,
  getEmpleados,
  getEmpleadoById,
  updateEmpleado,
  deleteEmpleado
} from "../controllers/empleadoController.js";

const router = express.Router();

router.post("/", createEmpleado);
router.get("/", getEmpleados);
router.get("/:id", getEmpleadoById);
router.put("/:id", updateEmpleado);
router.delete("/:id", deleteEmpleado);

export default router;
