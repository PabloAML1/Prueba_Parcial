import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  WELCOME_TEMPLATE
} from "../config/emailTemplates.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  const { name, email, password, especialidad_id, id_centro } = req.body;

  // Validar datos obligatorios
  if (!name || !email || !password || !especialidad_id || !id_centro) {
    return res.json({ success: false, message: "Todos los campos son requeridos para registrar un doctor" });
  }

  try {
    // Verificar si el email ya existe
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.json({ success: false, message: "El email ya está registrado" });
    }

    // Crear usuario (siempre MEDICO)
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'MEDICO')",
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    // Insertar en tabla medicos
    await pool.query(
      "INSERT INTO medicos (user_id, nombre, especialidad_id, id_centro) VALUES (?, ?, ?, ?)",
      [userId, name, especialidad_id, id_centro]
    );

    // Generar token
    const token = jwt.sign({ id: userId, role: "MEDICO" }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Email de bienvenida
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Bienvenido al sistema",
      html: WELCOME_TEMPLATE.replace("{{name}}", name)
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "Doctor registrado correctamente" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Email and password are required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "Incorrect credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ================= LOGOUT =================
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ================= SEND VERIFY OTP =================
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    const user = rows[0];

    if (user.is_account_verified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expireAt = Date.now() + 24 * 60 * 60 * 1000;

    await pool.query("UPDATE users SET verify_otp=?, verify_otp_expire_at=? WHERE id=?",
      [otp, expireAt, userId]);

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    };
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    const user = rows[0];

    if (user.verify_otp !== otp || user.verify_otp === "") {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verify_otp_expire_at < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    await pool.query(
      "UPDATE users SET is_account_verified=1, verify_otp='', verify_otp_expire_at=0 WHERE id=?",
      [userId]
    );

    res.json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= AUTH CHECK =================
export const isAuthenticated = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(
      "SELECT id, name, email, role, is_account_verified, created_at, updated_at FROM users WHERE id=?",
      [userId]
    );
    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================= SEND RESET OTP =================
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    const user = rows[0];

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expireAt = Date.now() + 15 * 60 * 1000;

    await pool.query("UPDATE users SET reset_otp=?, reset_otp_expire_at=? WHERE id=?",
      [otp, expireAt, user.id]);

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
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
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
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
