import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import helmet from "helmet";

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

const dominiosPermitidos = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (dominiosPermitidos.indexOf(origin) !== -1) {
      // El Origen del Request esta permitido
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
};

app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "font-src": ["'self'", "http://localhost:4000"],
  },
}));

app.use(cors());

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/admins", adminRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
