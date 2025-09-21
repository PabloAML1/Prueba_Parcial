import pool from "../config/db.js";

// Crear consulta
export const createConsulta = async (req, res) => {
  try {
    const { fecha, descripcion, medico_id, paciente_nombre, id_centro } = req.body;
    const [result] = await pool.query(
      "INSERT INTO consultas (fecha, descripcion, medico_id, paciente_nombre, id_centro) VALUES (?, ?, ?, ?, ?)",
      [fecha, descripcion, medico_id, paciente_nombre, id_centro]
    );
    res.status(201).json({ id: result.insertId, fecha, descripcion, medico_id, paciente_nombre, id_centro });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todas
export const getConsultas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT con.id, con.fecha, con.descripcion, con.paciente_nombre,
             m.nombre AS medico, e.nombre AS especialidad, c.nombre AS centro
      FROM consultas con
      LEFT JOIN medicos m ON con.medico_id = m.id
      LEFT JOIN especialidades e ON m.especialidad_id = e.id
      LEFT JOIN centros_medicos c ON con.id_centro = c.id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener por ID
export const getConsultaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM consultas WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Consulta no encontrada" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar
export const updateConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, descripcion, medico_id, paciente_nombre, id_centro } = req.body;
    await pool.query(
      "UPDATE consultas SET fecha = ?, descripcion = ?, medico_id = ?, paciente_nombre = ?, id_centro = ? WHERE id = ?",
      [fecha, descripcion, medico_id, paciente_nombre, id_centro, id]
    );
    res.json({ message: "Consulta actualizada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar
export const deleteConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM consultas WHERE id = ?", [id]);
    res.json({ message: "Consulta eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reporte: Consultas por médico
export const getConsultasByMedico = async (req, res) => {
  try {
    const { medico_id } = req.params;
    const [rows] = await pool.query(
      `SELECT con.id, con.fecha, con.descripcion, con.paciente_nombre, c.nombre AS centro
       FROM consultas con
       LEFT JOIN centros_medicos c ON con.id_centro = c.id
       WHERE con.medico_id = ?`,
      [medico_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
