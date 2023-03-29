import conectarDB from "../config/db.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/usuarios/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";
import bcrypt from "bcrypt";

const registrar = async (req, res) => {
  const { nombre, apellido, correo_electronico, contrasena, telefono } = req.body;

  // Prevenir usuarios duplicados
  let conexion;
  try {

    conexion = await conectarDB();
    const [rows] = await conexion.execute(
      "SELECT * FROM usuarios WHERE correo_electronico = ?",
      [correo_electronico]
    );
    if (rows.length > 0) {
      const error = new Error("Usuario ya registrado");
      return res.status(400).json({ msg: error.message });
    }

    // Guardar un Nuevo Usuario
    const token = generarId();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    await conexion.execute(
      "INSERT INTO usuarios (nombre, apellido, correo_electronico, contrasena, telefono, token) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, apellido, correo_electronico, hashedPassword, telefono, token]
    );

    // Enviar el email
    emailRegistro({
      email: correo_electronico,
      nombre,
      token,
    });

    res.json({ nombre, correo_electronico, telefono });

  } catch (error) {
    console.log(error);
  } finally {
    if (conexion) {
      try {
        await conexion.close();
      } catch (error) {
        console.log('Error al cerrar la conexión:', error);
      }
    }
  }
};


const perfil = async (req, res) => {

  const id = req.usuario.id_usuario;
  let conexion;
  try {
    conexion = await conectarDB();
    const [rows] = await conexion.execute(
      `SELECT * FROM usuarios WHERE id_usuario = ${id}`
    );
    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error del servidor" });
  } finally {
    if (conexion) {
      try {
        await conexion.close();
      } catch (error) {
        console.log('Error al cerrar la conexión:', error);
      }
    }
  }
};

const confirmar = async (req, res) => {
  const { token } = req.params;

  let conexion;
  try {
    conexion = await conectarDB();
    const [rows] = await conexion.execute(
      `SELECT * FROM usuarios WHERE token = '${token}'`
    );
    if (!rows.length) {
      const error = new Error("Token no válido");
      return res.status(404).json({ msg: error.message });
    }
    const usuarioConfirmar = rows[0];

    await conexion.execute(
      `UPDATE usuarios SET token = NULL, confirmado = true WHERE id_usuario = ${usuarioConfirmar.id_usuario}`
    );
    res.json({ msg: "Usuario Confirmado Correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error del servidor" });
  } finally {
    if (conexion) {
      try {
        await conexion.close();
      } catch (error) {
        console.log('Error al cerrar la conexión:', error);
      }
    }
  }
};

const autenticar = async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  console.log(req.body);

  let conexion;
  try {
    conexion = await conectarDB();
    // Comprobar si el usuario existe
    const [rows] = await conexion.execute('SELECT * FROM usuarios WHERE correo_electronico = ?', [correo_electronico]);
    const usuario = rows[0];
    if (!usuario) {
      const error = new Error("El correo no existe");
      return res.status(404).json({ msg: error.message });
    }

    // Comprobar si el usuario está confirmado
    if (!usuario.confirmado) {
      const error = new Error("Tu Cuenta no ha sido confirmada, por favor verifica tu email");
      return res.status(403).json({ msg: error.message });
    }

    // Revisar el password
    if (await bcrypt.compare(contrasena, usuario.contrasena)) {

      // Generar el JWT y devolverlo:
      const token = generarJWT(usuario.id_usuario);
      // Autenticar
      res.json({
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo_electronico: usuario.correo_electronico,
        telefono: usuario.telefono,
        token: generarJWT(usuario.id_usuario),
      });
    } else {
      const error = new Error("La contraseña es incorrecta");
      return res.status(403).json({ msg: error.message });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Error de servidor' });
  } finally {
    if (conexion) {
      try {
        await conexion.close();
      } catch (error) {
        console.log('Error al cerrar la conexión:', error);
      }
    }
  }
};


const olvidePassword = async (req, res) => {
  const { correo_electronico } = req.body;
  let conexion;

  try {
    // Obtener la conexión a la base de datos
    conexion = await conectarDB();

    // Ejecutar una consulta para obtener el usuario con el correo_electronico proporcionado
    const [rows] = await conexion.execute(
      "SELECT * FROM usuarios WHERE correo_electronico = ?",
      [correo_electronico]
    );

    if (rows.length === 0) {
      const error = new Error("El Usuario no existe");
      return res.status(400).json({ msg: error.message });
    }

    const usuario = rows[0];

    // Generar un nuevo token y actualizarlo en la base de datos
    const token = generarId();
    await conexion.execute(
      "UPDATE usuarios SET token = ? WHERE id_usuario = ?",
      [token, usuario.id_usuario]
    );

    // Enviar Email con instrucciones
    emailOlvidePassword({
      email: correo_electronico,
      nombre: usuario.nombre,
      token,
    });

    res.json({ msg: "Hemos enviado un correo_electronico con las instrucciones" });
  } catch (error) {
    console.log(error);
  } finally {
    if (conexion) {
      try {
        await conexion.close();
      } catch (error) {
        console.log('Error al cerrar la conexión:', error);
      }
    }
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { contrasena } = req.body;
  let conexion;

  try {
    conexion = await conectarDB();

    const [rows] = await conexion.execute('SELECT * FROM usuarios WHERE token = ?', [token]);

    const usuario = rows[0];
    if (!usuario) {
      const error = new Error("Token no válido");
      return res.status(400).json({ msg: error.message })
    }

    // Hashear el password
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);
    const sql = 'UPDATE usuarios SET token = NULL, contrasena = ? WHERE token = ?';
    await conexion.execute(sql, [contrasenaHash, token]);

    res.json({ message: "Password modificado correctamente" });
  } catch (error) {
    console.log(error);
  } finally {
    if (conexion) {
      try {
        await conexion.close();
      } catch (error) {
        console.log('Error al cerrar la conexión:', error);
      }
    }
  }
};

const actualizarPerfil = async (req, res) => {
  let conexion;
  try {
    conexion = await conectarDB();
    const [rows] = await conexion.execute(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [req.params.id_usuario]
    );

    const usuario = rows[0];
    if (!usuario) {
      const error = new Error("Hubo un error");
      return res.status(400).json({ msg: error.message });
    }

    const { correo_electronico } = req.body;
    if (usuario.correo_electronico !== req.body.correo_electronico) {
      const [rows] = await conexion.execute(
        "SELECT * FROM usuarios WHERE correo_electronico = ?",
        [correo_electronico]
      );

      const existeEmail = rows[0];
      if (existeEmail) {
        const error = new Error("Ese correo_electronico ya esta en uso");
        return res.status(400).json({ msg: error.message });
      }
    }

    // contraseña
    if (req.body.contrasena) {
      const salt = await bcrypt.genSalt(10);
      const contrasenaHash = await bcrypt.hash(req.body.contrasena, salt);
      req.body.contrasena = contrasenaHash;
    }

    await conexion.execute(
      "UPDATE usuarios SET nombre = ?, apellido = ?, correo_electronico = ?, telefono = ? WHERE id_usuario = ?",
      [req.body.nombre, req.body.apellido, req.body.correo_electronico, req.body.telefono, req.params.id_usuario]
    );

    const usuarioActualizado = {
      id_usuario: req.params.id_usuario,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      correo_electronico: req.body.correo_electronico,
      telefono: req.body.telefono,
    };

    res.json(usuarioActualizado);

  } catch (error) {
    console.log(error);
  } finally {
    if (conexion) {
      try {
        await conexion.close();
      } catch (error) {
        console.log('Error al cerrar la conexión:', error);
      }
    }
  }
};


const actualizarPassword = async (req, res) => {
  // Leer los datos
  const { id_usuario } = req.usuario;
  const { pwd_actual, pwd_nuevo } = req.body;


  let conexion;

  try {
    // Conectar a la base de datos
    const conexion = await conectarDB();

    // Comprobar que el usuario existe
    const [rows] = await conexion.execute(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id_usuario]
    );

    if (rows.length === 0) {
      const error = new Error("Hubo un error");
      return res.status(400).json({ msg: error.message });
    }

    // Comprobar su password
    const usuario = rows[0];
    if (pwd_actual === usuario.contrasena) {
      // Almacenar el nuevo password
      await conexion.execute(
        "UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?",
        [pwd_nuevo, id_usuario]
      );
      res.json({ msg: "Password Almacenado Correctamente" });
    } else {
      const error = new Error("El Password Actual es Incorrecto");
      return res.status(400).json({ msg: error.message });
    }
  } catch (error) {
    console.log(`error: ${error.message}`);
    res.status(500).json({ msg: "Hubo un error en el servidor" });
  } finally {
    if (conexion) {
      try {
        await conexion.close();
      } catch (error) {
        console.log('Error al cerrar la conexión:', error);
      }
    }
  }
};

export {
  registrar,
  perfil,
  confirmar,
  autenticar,
  olvidePassword,
  nuevoPassword,
  actualizarPerfil,
  actualizarPassword,
};