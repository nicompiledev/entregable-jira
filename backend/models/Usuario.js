import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generarId from "../helpers/generarId.js";

const usuarioSchema = new mongoose.Schema({

  // Campos que va a tener cada documento de la colección, con su tipo y validaciones correspondientes
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  telefono: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    default: generarId(), // Se usa un helper para generar un ID aleatorio por defecto
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
  confirmado: {
    type: Boolean,
    default: false,
  },
  rol: {
    type: String,
    default: "cliente",
  },
})

usuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.comprobarPassword = async function (
  passwordFormulario
) {
  return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;
