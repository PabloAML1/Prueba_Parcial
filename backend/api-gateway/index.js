import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { apiReference } from "@scalar/express-api-reference";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3100",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Logger simple
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

// ---- Proxies ----
app.use(
  "/api/consultas-medicas",
  createProxyMiddleware({
    target: "http://consultas-api:4000",
    changeOrigin: true,
    pathRewrite: { "^/api/consultas-medicas": "" },
  })
);

app.use(
  "/api/admin",
  createProxyMiddleware({
    target: "http://admin-api:4000",
    changeOrigin: true,
    pathRewrite: { "^/api/admin": "" },
  })
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: "http://users-api:4000",
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" },
  })
);

// Servir el archivo YAML estático
app.use("/openapi.yaml", express.static(path.join(__dirname, "openapi.yaml")));

// ---- Scalar Docs ----
app.use(
  "/api-docs",
  apiReference({
    spec: { url: "/openapi.yaml" },
  })
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API Gateway corriendo en puerto ${PORT}`));
