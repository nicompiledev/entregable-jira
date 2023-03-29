import Cliente from "../models/Cliente.js";



// const agregarCliente = async (req, res) => {
//   const cliente = new Cliente(req.body);
//   cliente.usuario = req.usuario._id;
//   try {
//     const clienteAlmacenado = await cliente.save();
//     res.json(clienteAlmacenado);
//   } catch (error) {
//     console.log(error);
//   }
// };
const agregarCliente = async (req, res) => {
  const cliente = new Cliente(req.body);
  cliente.usuario = req.usuario._id;
  try {
    const clienteAlmacenado = await cliente.save();
    res.json(clienteAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

const obtenerClientes = async (req, res) => {
  const clientes = await Cliente.find()
    .where("usuario")
    .equals(req.usuario);

  res.json(clientes);
};

const obtenerCliente = async (req, res) => {
  const { id } = req.params;
  const cliente = await Cliente.findById(id);

  if (!cliente) {
    return res.status(404).json({ msg: "No Encontrado" });
  }

  if (cliente.usuario._id.toString() !== req.usuario._id.toString()) {
    return res.json({ msg: "Accion no válida" });
  }

  res.json(cliente);
};

const actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const cliente = await Cliente.findById(id);

  if (!cliente) {
    return res.status(404).json({ msg: "No Encontrado" });
  }

  if (cliente.usuario._id.toString() !== req.usuario._id.toString()) {
    return res.json({ msg: "Accion no válida" });
  }

  // Actualizar Cliente
  cliente.nombre = req.body.nombre || cliente.nombre;
  cliente.propietario = req.body.propietario || cliente.propietario;
  cliente.email = req.body.email || cliente.email;
  cliente.fecha = req.body.fecha || cliente.fecha;
  cliente.sintomas = req.body.sintomas || cliente.sintomas;

  try {
    const clienteActualizado = await cliente.save();
    res.json(clienteActualizado);
  } catch (error) {
    console.log(error);
  }
};

const eliminarCliente = async (req, res) => {
  const { id } = req.params;
  const cliente = await Cliente.findById(id);

  if (!cliente) {
    return res.status(404).json({ msg: "No Encontrado" });
  }

  if (cliente.usuario._id.toString() !== req.usuario._id.toString()) {
    return res.json({ msg: "Accion no válida" });
  }

  try {
    await cliente.deleteOne();
    res.json({ msg: "Cliente Eliminado" });
  } catch (error) {
    console.log(error);
  }
};

export {
  agregarCliente,
  obtenerClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente,
};
