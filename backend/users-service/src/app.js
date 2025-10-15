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
    origin: ["http://10.79.14.125:3100, http://10.79.14.125:5173, http://10.79.14.125:8080", "http://10.79.13.142:5173",
  "http://10.79.13.142:8080",],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API working");
});
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
