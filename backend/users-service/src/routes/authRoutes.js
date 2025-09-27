import express from "express";
import {
  login,
  register,
  sendResetOtp,
  resetPassword,
  isAuthenticatedAdmin,
  isAuthenticatedMedico,
  logoutMedico,
  logoutAdmin,
} from "../controllers/authController.js";
import { adminAuth, medicoAuth } from "../middlewares/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout-doctor", logoutMedico);
authRouter.post("/logout-admin", logoutAdmin);
authRouter.get("/is-auth-doctor", medicoAuth, isAuthenticatedMedico);
authRouter.get("/is-auth-admin", adminAuth, isAuthenticatedAdmin);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
