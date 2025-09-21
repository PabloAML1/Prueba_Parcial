import pool from "../config/db.js";

// Crear centro
export const createCentro = async (req, res) => {
  try {
    const { nombre, direccion } = req.body;
    const [result] = await pool.query(
      "INSERT INTO centros_medicos (nombre, direccion) VALUES (?, ?)",
      [nombre, direccion]
    );
    res.status(201).json({ id: result.insertId, nombre, direccion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos
export const getCentros = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM centros_medicos");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener uno
export const getCentroById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM centros_medicos WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "No encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar
export const updateCentro = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion } = req.body;
    await pool.query(
      "UPDATE centros_medicos SET nombre = ?, direccion = ? WHERE id = ?",
      [nombre, direccion, id]
    );
    res.json({ message: "Centro actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar
export const deleteCentro = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM centros_medicos WHERE id = ?", [id]);
    res.json({ message: "Centro eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
