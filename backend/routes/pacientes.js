const express = require('express');
const router = express.Router();
const path = require('path');
const { leerJSON, escribirJSON } = require('../utils/fileUtils');

const pacientesPath = path.join(__dirname, '../data/pacientes.json');
const historialPath = path.join(__dirname, '../data/historialPacientes.json');

// Registrar ingreso al hospital
router.post('/pacientes', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
  }

  const pacientes = leerJSON(pacientesPath);
  const nuevoPaciente = {
    id: pacientes.length > 0 ? pacientes[pacientes.length - 1].id + 1 : 1,
    nombre,
    horaIngresoHospital: new Date().toISOString(),
    estado: 'esperando',
    horaIngresoConsultorio: null,
    horaSalidaConsultorio: null
  };

  pacientes.push(nuevoPaciente);
  escribirJSON(pacientesPath, pacientes);
  res.status(201).json(nuevoPaciente);
});

// Obtener la cola actual (pacientes esperando o en consulta)
router.get('/pacientes', (req, res) => {
  const pacientes = leerJSON(pacientesPath);
  res.json(pacientes);
});

// Llamar a un paciente (marcar ingreso a consultorio)
router.put('/pacientes/:id/ingresar', (req, res) => {
  const id = parseInt(req.params.id);
  const pacientes = leerJSON(pacientesPath);
  const paciente = pacientes.find(p => p.id === id);

  if (!paciente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }

  if (paciente.estado !== 'esperando') {
    return res.status(400).json({ mensaje: 'El paciente no está en espera' });
  }

  paciente.estado = 'en consulta';
  paciente.horaIngresoConsultorio = new Date().toISOString();
  escribirJSON(pacientesPath, pacientes);

  res.json({ mensaje: 'Paciente ingresó al consultorio', paciente });
});

// Terminar consulta (registrar hora de salida y pasar a historial)
router.put('/pacientes/:id/salir', (req, res) => {
  const id = parseInt(req.params.id);
  let pacientes = leerJSON(pacientesPath);
  const paciente = pacientes.find(p => p.id === id);

  if (!paciente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }

  if (paciente.estado !== 'en consulta') {
    return res.status(400).json({ mensaje: 'El paciente no está en consulta' });
  }

  paciente.horaSalidaConsultorio = new Date().toISOString();
  paciente.estado = 'finalizado';

  // Registrar en historial
  const historial = leerJSON(historialPath);
  historial.push(paciente);
  escribirJSON(historialPath, historial);

  // Eliminar de la cola
  pacientes = pacientes.filter(p => p.id !== id);
  escribirJSON(pacientesPath, pacientes);

  res.json({ mensaje: 'Consulta finalizada y paciente archivado', paciente });
});

// Consultar historial completo
router.get('/pacientes/historial', (req, res) => {
  const historial = leerJSON(historialPath);
  res.json(historial);
});

module.exports = router;
