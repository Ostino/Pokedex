const { Evs } = require('../models');
const crearControlador = require('../utils/controladorEvsIvs');

const controlador = crearControlador(Evs, 'evsId', 'Evs');

exports.crearEvs = controlador.crear;
exports.obtenerTodos = controlador.obtenerTodos;
exports.obtenerPorId = controlador.obtenerPorId;
exports.actualizar = controlador.actualizar;
