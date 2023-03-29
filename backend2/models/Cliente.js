import mongoose from "mongoose";

const clientesSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    placa: {
      type: String,
      required: true,
    },
    telefono: {
      type: String,
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    servicio: {
      type: String,
      required: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  },
  {
    timestamps: true,
  }
);

const Cliente = mongoose.model("Cliente", clientesSchema);

export default Cliente;
