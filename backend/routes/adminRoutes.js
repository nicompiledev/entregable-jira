import express from "express";
const router = express.Router();

import {
  loguearAdmin,
  registrarLavadero,
  getLavederos,
  getLavadero,
  modificarLavadero,
  eliminarLavadero,
} from "../controllers/adminController.js";


// área publica
router.post("/login", loguearAdmin);
router.post("/registrar-lavadero", registrarLavadero);
router.get("/lavaderos", getLavederos);
router.get("/lavaderos/:id_lavadero", getLavadero);
router.put("/lavaderos/:id_lavadero", modificarLavadero);
router.delete("/lavaderos/:id_lavadero", eliminarLavadero);


export default router;