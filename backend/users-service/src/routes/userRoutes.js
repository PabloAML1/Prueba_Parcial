import express from 'express';
import { adminAuth, medicoAuth } from "../middlewares/userAuth.js";
import { getUserData } from '../controllers/userController.js';
const userRouter = express.Router();

userRouter.get('/data',medicoAuth,getUserData);

export default userRouter;