import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import transporter from "../config/nodemailer.js";
import { WELCOME_TEMPLATE } from "../config/emailTemplates.js";

const DOCTOR_ROLE = "MEDICO";

async function sendWelcomeEmail({ email, name }) {
  if (!email || !process.env.SENDER_EMAIL) {
    return;
  }

  try {
    const personalizedTemplate = WELCOME_TEMPLATE.replace(
      "{{name}}",
      name ?? "Doctor"
    );

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Bienvenido al sistema",
      html: personalizedTemplate,
    });
  } catch (error) {
    console.error("Failed to send welcome email to doctor", error);
  }
}

export const createMedico = async (req, res) => {
  const { nombre, especialidad_id, id_centro, email, password } = req.body;

  if (!nombre || !especialidad_id || !id_centro || !email || !password) {
    return res.status(400).json({
      error: "Nombre, especialidad, centro, email y password son requeridos.",
    });
  }

  let connection;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [existingEmail] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingEmail.length > 0) {
      await connection.rollback();
      transactionStarted = false;
      connection.release();
      return res.status(409).json({ error: "El email ya esta registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await connection.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPassword, DOCTOR_ROLE]
    );

    const userId = userResult.insertId;

    const [medicoResult] = await connection.query(
      "INSERT INTO medicos (user_id, nombre, especialidad_id, id_centro) VALUES (?, ?, ?, ?)",
      [userId, nombre, especialidad_id, id_centro]
    );

    await connection.commit();
    transactionStarted = false;
    connection.release();
    connection = null;

    await sendWelcomeEmail({ email, name: nombre });

    return res.status(201).json({
      id: medicoResult.insertId,
      user_id: userId,
      nombre,
      especialidad_id,
      id_centro,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Failed to rollback createMedico transaction",
          rollbackError
        );
      }
    }

    if (connection) {
      connection.release();
    }

    return res.status(500).json({ error: error.message });
  }
};

export const getMedicos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.id,
        m.user_id,
        m.nombre,
        m.especialidad_id,
        m.id_centro,
        e.nombre AS especialidad,
        c.nombre AS centro,
        u.email,
        u.password
      FROM medicos m
      LEFT JOIN especialidades e ON m.especialidad_id = e.id
      LEFT JOIN centros_medicos c ON m.id_centro = c.id
      LEFT JOIN users u ON m.user_id = u.id
    `);

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMedicoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT m.id, m.user_id, m.nombre, m.especialidad_id, m.id_centro, u.email, u.password
       FROM medicos m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateMedico = async (req, res) => {
  const { id } = req.params;
  const { nombre, especialidad_id, id_centro, email, password } = req.body;

  if (!nombre || !especialidad_id || !id_centro || !email) {
    return res.status(400).json({
      error: "Nombre, especialidad, centro y email son requeridos.",
    });
  }

  let connection;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();

    const [medicoRows] = await connection.query(
      "SELECT user_id FROM medicos WHERE id = ?",
      [id]
    );

    if (medicoRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: "No encontrado" });
    }

    const userId = medicoRows[0].user_id;

    await connection.beginTransaction();
    transactionStarted = true;

    const [emailRows] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND id <> ?",
      [email, userId]
    );

    if (emailRows.length > 0) {
      await connection.rollback();
      transactionStarted = false;
      connection.release();
      return res.status(409).json({ error: "El email ya esta registrado." });
    }

    await connection.query(
      "UPDATE medicos SET nombre = ?, especialidad_id = ?, id_centro = ? WHERE id = ?",
      [nombre, especialidad_id, id_centro, id]
    );

    const updates = [nombre, email];
    let updateQuery = "UPDATE users SET name = ?, email = ?";

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ", password = ?";
      updates.push(hashedPassword);
    }

    updateQuery += " WHERE id = ?";
    updates.push(userId);

    await connection.query(updateQuery, updates);

    await connection.commit();
    transactionStarted = false;
    connection.release();

    return res.json({ message: "Medico actualizado" });
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Failed to rollback updateMedico transaction",
          rollbackError
        );
      }
    }

    if (connection) {
      connection.release();
    }

    return res.status(500).json({ error: error.message });
  }
};

export const deleteMedico = async (req, res) => {
  const { id } = req.params;

  let connection;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();
    const [medicoRows] = await connection.query(
      "SELECT user_id FROM medicos WHERE id = ?",
      [id]
    );

    if (medicoRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: "No encontrado" });
    }

    const userId = medicoRows[0].user_id;

    await connection.beginTransaction();
    transactionStarted = true;

    await connection.query("DELETE FROM medicos WHERE id = ?", [id]);
    await connection.query("DELETE FROM users WHERE id = ?", [userId]);

    await connection.commit();
    transactionStarted = false;
    connection.release();

    return res.json({ message: "Medico eliminado" });
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Failed to rollback deleteMedico transaction",
          rollbackError
        );
      }
    }

    if (connection) {
      connection.release();
    }

    return res.status(500).json({ error: error.message });
  }
};
