import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true, // acepta cualquier origen dinámicamente
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API working");
});
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
