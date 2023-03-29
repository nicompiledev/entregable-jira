import jwt from "jsonwebtoken";
import conectarDB from "../config/db.js";

const checkAuth = async (req, res, next) => {
  let token;

  // Establecer la conexión a la base de datos
  const conexion = await conectarDB();
  res.setHeader('Content-Security-Policy', "font-src 'self' http://localhost:4000;");


  try {
    // Verificar si hay un token en el encabezado de autorización
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Obtener el token del encabezado de autorización y decodificarlo
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar el usuario correspondiente al ID del token decodificado
      const [rows] = await conexion.execute(
        "SELECT * FROM usuarios WHERE id_usuario = ?",
        [decoded.id]
      );

      // Si no se encuentra ningún usuario, devolver un error
      if (rows.length === 0) {
        const error = new Error("Token no válido");
        return res.status(401).json({ msg: error.message });
      }

      // Si se encuentra el usuario, establecer req.usuario con la información del usuario y llamar a next()
      req.usuario = {
        id_usuario: rows[0].id_usuario,
      };

      return next();
    }

    // Si no hay un token en el encabezado de autorización, devolver un error 401
    const error = new Error("Token no válido o inexistente");
    return res.status(401).json({ msg: error.message });
  } catch (error) {
    // Si ocurre un error al conectarse a la base de datos o al hacer una consulta, devolver un error 500
    console.log(`error: ${error.message}`);
    return res.status(500).json({ msg: "Error del servidor" });
  } finally {
    // Cerrar la conexión a la base de datos
    await conexion.end();
  }
};

export default checkAuth;
