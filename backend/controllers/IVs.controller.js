const { Ivs } = require('../models');
const crearControlador = require('../utils/controladorEvsIvs');

const controlador = crearControlador(Ivs, 'ivsId', 'IVs');

exports.crearIvs = controlador.crear;
exports.obtenerTodos = controlador.obtenerTodos;
exports.obtenerPorId = controlador.obtenerPorId;
exports.actualizar = controlador.actualizar;
