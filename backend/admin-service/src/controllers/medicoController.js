import pool from "../config/db.js";

// Crear médico
export const createMedico = async (req, res) => {
  try {
    const { nombre, especialidad_id, id_centro } = req.body;
    const [result] = await pool.query(
      "INSERT INTO medicos (nombre, especialidad_id, id_centro) VALUES (?, ?, ?)",
      [nombre, especialidad_id, id_centro]
    );
    res.status(201).json({ id: result.insertId, nombre, especialidad_id, id_centro });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos
export const getMedicos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.id, m.nombre, e.nombre AS especialidad, c.nombre AS centro
      FROM medicos m
      LEFT JOIN especialidades e ON m.especialidad_id = e.id
      LEFT JOIN centros_medicos c ON m.id_centro = c.id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener uno
export const getMedicoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM medicos WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "No encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar
export const updateMedico = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, especialidad_id, id_centro } = req.body;
    await pool.query(
      "UPDATE medicos SET nombre = ?, especialidad_id = ?, id_centro = ? WHERE id = ?",
      [nombre, especialidad_id, id_centro, id]
    );
    res.json({ message: "Médico actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar
export const deleteMedico = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM medicos WHERE id = ?", [id]);
    res.json({ message: "Médico eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
