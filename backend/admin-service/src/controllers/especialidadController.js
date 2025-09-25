import pool from "../config/db.js";

// Crear especialidad
export const createEspecialidad = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const [result] = await pool.query(
      "INSERT INTO especialidades (nombre, descripcion) VALUES (?, ?)",
      [nombre, descripcion]
    );
    res.status(201).json({ id: result.insertId, nombre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todas
export const getEspecialidades = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM especialidades");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener por id
export const getEspecialidadById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM especialidades WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "No encontrada" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar
export const updateEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    await pool.query("UPDATE especialidades SET nombre = ?, descripcion = ? WHERE id = ?", [nombre, descripcion, id]);
    res.json({ message: "Especialidad actualizada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar
export const deleteEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM especialidades WHERE id = ?", [id]);
    res.json({ message: "Especialidad eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
