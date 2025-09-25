import pool from "../config/db.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

    // Datos básicos del usuario
    const [users] = await pool.query(
      "SELECT id, name, email, role, is_account_verified FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = users[0];

    // Si es médico, traer también su info
    let medicoData = null;
    if (user.role === "MEDICO") {
      const [medicos] = await pool.query(
        `SELECT m.id, m.nombre, m.especialidad_id, m.id_centro,
                e.nombre AS especialidad, c.nombre AS centro
         FROM medicos m
         LEFT JOIN especialidades e ON m.especialidad_id = e.id
         LEFT JOIN centros_medicos c ON m.id_centro = c.id
         WHERE m.user_id = ?`,
        [userId]
      );
      if (medicos.length > 0) {
        medicoData = medicos[0];
      }
    }

    return res.json({
      success: true,
      userData: {
        ...user,
        medicoData
      }
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

