// api-gateway - Versión Final Funcional
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(cors());

// Logger simple
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

// ---- Proxies ----
app.use("/api/consultas-medicas", createProxyMiddleware({
  target: "http://consultas-api:4000",
  changeOrigin: true,
  pathRewrite: { "^/api/consultas-medicas": "" }
}));

app.use("/api/admin", createProxyMiddleware({
  target: "http://admin-api:4000",
  changeOrigin: true,
  pathRewrite: { "^/api/admin": "" }
}));

app.use("/api/users", createProxyMiddleware({
  target: "http://users-api:4000",
  changeOrigin: true,
  pathRewrite: { "^/api/users": "" }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API Gateway corriendo en puerto ${PORT}`));
