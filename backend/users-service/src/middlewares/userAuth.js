import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  const { admin_token } = req.cookies;
  if (!admin_token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Admin login required",
    });
  }

  try {
    const decoded = jwt.verify(admin_token, process.env.JWT_SECRET);
    if (decoded.id && decoded.role === "ADMIN") {
      req.userId = decoded.id;
      req.role = decoded.role;
      return next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Not an admin",
      });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export const medicoAuth = (req, res, next) => {
  const { medico_token } = req.cookies;
  if (!medico_token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Medico login required",
    });
  }

  try {
    const decoded = jwt.verify(medico_token, process.env.JWT_SECRET);
    if (decoded.id && decoded.role === "MEDICO") {
      req.userId = decoded.id;
      req.role = decoded.role;
      return next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Not a medico",
      });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};
