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



router.put('/pacientes/:id/ingresar', (req, res) => {
  const id = parseInt(req.params.id);
  const { idConsultorio, idDoctor } = req.body;

  if (!idConsultorio || !idDoctor) {
    return res.status(400).json({ mensaje: 'Debe enviar idConsultorio y idDoctor' });
  }

  const pacientes = leerJSON(pacientesPath);
  const paciente = pacientes.find(p => p.id === id);

  if (!paciente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }

  if (paciente.estado !== 'esperando') {
    return res.status(400).json({ mensaje: 'El paciente no está en espera' });
  }

  // Cambiar estado y agregar datos de la consulta
  paciente.estado = 'en consulta';
  paciente.horaIngresoConsultorio = new Date().toISOString();
  paciente.consultorioAsignado = idConsultorio;
  paciente.doctorAsignado = idDoctor;

  escribirJSON(pacientesPath, pacientes);

  res.json({ mensaje: 'Paciente ingresó al consultorio', paciente });
});



// Consultar historial completo
router.get('/pacientes/historial', (req, res) => {
  const historial = leerJSON(historialPath);
  res.json(historial);
});
// Devuelve solo los pacientes que están en espera
router.get('/pacientes/esperando', (req, res) => {
  const pacientes = leerJSON(pacientesPath);
  const esperando = pacientes.filter(p => p.estado === 'esperando');
  res.json(esperando);
});

// Obtener todos los pacientes actualmente en consulta
router.get('/pacientes/llamado', (req, res) => {
  const pacientes = leerJSON(pacientesPath);
  const pacientesEnConsulta = pacientes.filter(p => p.estado === 'en consulta');

  if (pacientesEnConsulta.length === 0) {
    return res.status(204).send(); // No hay pacientes siendo atendidos
  }

  // Solo devolvemos los campos necesarios
  const resultado = pacientesEnConsulta.map(p => ({
    id: p.id,
    nombre: p.nombre,
    horaIngresoConsultorio: p.horaIngresoConsultorio,
    consultorioAsignado: p.consultorioAsignado
  }));

  res.json(resultado);
});


// Finalizar consulta (solo si el doctor coincide)
router.put('/pacientes/:id/salir', (req, res) => {
  const id = parseInt(req.params.id);
  const { idDoctor } = req.body;

  let pacientes = leerJSON(pacientesPath);
  const paciente = pacientes.find(p => p.id === id);

  if (!paciente) {
    return res.status(404).json({ mensaje: 'Paciente no encontrado' });
  }

  if (paciente.estado !== 'en consulta') {
    return res.status(400).json({ mensaje: 'El paciente no está en consulta' });
  }

  if (paciente.idDoctor !== idDoctor) {
    return res.status(403).json({ mensaje: 'Este paciente no está asignado a usted' });
  }

  paciente.horaSalidaConsultorio = new Date().toISOString();
  paciente.estado = 'finalizado';

  // Guardar en historial
  const historial = leerJSON(historialPath);
  historial.push(paciente);
  escribirJSON(historialPath, historial);

  // Remover de la cola actual
  pacientes = pacientes.filter(p => p.id !== id);
  escribirJSON(pacientesPath, pacientes);

  res.json({ mensaje: 'Consulta finalizada y paciente archivado', paciente });
});



module.exports = router;
