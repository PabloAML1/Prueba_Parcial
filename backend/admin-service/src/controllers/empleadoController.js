import pool from "../config/db.js";

// Crear empleado
export const createEmpleado = async (req, res) => {
  try {
    const { nombre, cargo, salario, id_centro } = req.body;
    const [result] = await pool.query(
      "INSERT INTO empleados (nombre, cargo, salario, id_centro) VALUES (?, ?, ?, ?)",
      [nombre, cargo, salario, id_centro]
    );
    res.status(201).json({ id: result.insertId, nombre, cargo, salario, id_centro });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos
export const getEmpleados = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.id, e.nombre, e.cargo, e.salario, c.nombre AS centro
      FROM empleados e
      LEFT JOIN centros_medicos c ON e.id_centro = c.id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener uno
export const getEmpleadoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM empleados WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "No encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar
export const updateEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cargo, salario, id_centro } = req.body;
    await pool.query(
      "UPDATE empleados SET nombre = ?, cargo = ?, salario = ?, id_centro = ? WHERE id = ?",
      [nombre, cargo, salario, id_centro, id]
    );
    res.json({ message: "Empleado actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar
export const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM empleados WHERE id = ?", [id]);
    res.json({ message: "Empleado eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
