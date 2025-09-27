import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  WELCOME_TEMPLATE,
} from "../config/emailTemplates.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  const { name, email, password, role, especialidad_id, id_centro } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email, contraseña y rol son requeridos",
      });
    }

    if (!["ADMIN", "MEDICO"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Rol inválido. Solo ADMIN o MEDICO",
      });
    }

    // verificar email
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    const userId = result.insertId;

    if (role === "MEDICO") {
      if (!especialidad_id || !id_centro) {
        return res.status(400).json({
          success: false,
          message:
            "Especialidad e id_centro son requeridos para registrar un doctor",
        });
      }

      await pool.query(
        "INSERT INTO medicos (user_id, nombre, especialidad_id, id_centro) VALUES (?, ?, ?, ?)",
        [userId, name, especialidad_id, id_centro]
      );
    }

    // token según rol
    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const cookieName = role === "ADMIN" ? "admin_token" : "medico_token";

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message:
        role === "ADMIN"
          ? "Administrador registrado correctamente"
          : "Doctor registrado correctamente",
      user: { id: userId, email, role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email y contraseña requeridos" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales incorrectas" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const cookieName = user.role === "ADMIN" ? "admin_token" : "medico_token";

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LOGOUT =================
export const logoutAdmin = (req, res) => {
  try {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
export const logoutMedico = (req, res) => {
  try {
    res.clearCookie("medico_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({
      success: true,
      message: "Médico logged out successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ================= AUTH CHECK =================
export const isAuthenticatedAdmin = async (req, res) => {
  try {
    const token = req.cookies.admin_token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No autenticado como admin" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Token inválido" });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, role, is_account_verified, created_at, updated_at FROM users WHERE id=? AND role='ADMIN'",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Admin no encontrado" });
    }

    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const isAuthenticatedMedico = async (req, res) => {
  try {
    const token = req.cookies.medico_token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No autenticado como médico" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Token inválido" });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, role, is_account_verified, created_at, updated_at FROM users WHERE id=? AND role='MEDICO'",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Médico no encontrado" });
    }

    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SEND RESET OTP =================
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    const user = rows[0];

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expireAt = Date.now() + 15 * 60 * 1000;

    await pool.query(
      "UPDATE users SET reset_otp=?, reset_otp_expire_at=? WHERE id=?",
      [otp, expireAt, user.id]
    );

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    const user = rows[0];

    if (user.reset_otp !== otp || user.reset_otp === "") {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.reset_otp_expire_at < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password=?, reset_otp='', reset_otp_expire_at=0 WHERE id=?",
      [hashedPassword, user.id]
    );

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
