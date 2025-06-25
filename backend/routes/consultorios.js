const express = require('express');
const router = express.Router();
const path = require('path');
const { leerJSON, escribirJSON } = require('../utils/fileUtils');

const consultoriosPath = path.join(__dirname, '../data/consultorios.json');

// Listar todos los consultorios
router.get('/consultorios', (req, res) => {
  const consultorios = leerJSON(consultoriosPath);
  res.json(consultorios);
});

// Crear un nuevo consultorio
router.post('/consultorios', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre del consultorio es obligatorio' });
  }

  const consultorios = leerJSON(consultoriosPath);
  const nuevoConsultorio = {
    id: consultorios.length > 0 ? consultorios[consultorios.length - 1].id + 1 : 1,
    nombre,
    estado: 'libre',
    idDoctor: null
  };

  consultorios.push(nuevoConsultorio);
  escribirJSON(consultoriosPath, consultorios);

  res.status(201).json(nuevoConsultorio);
});

// Eliminar un consultorio por ID
router.delete('/consultorios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let consultorios = leerJSON(consultoriosPath);

  const existe = consultorios.some(c => c.id === id);
  if (!existe) {
    return res.status(404).json({ mensaje: 'Consultorio no encontrado' });
  }

  consultorios = consultorios.filter(c => c.id !== id);
  escribirJSON(consultoriosPath, consultorios);

  res.json({ mensaje: 'Consultorio eliminado' });
});

// Actualizar estado de uso del consultorio (asignar doctor o liberar)
// Verificar disponibilidad antes de asignar doctor o liberar correctamente
router.put('/consultorios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { estado, idDoctor } = req.body;

  if (!['libre', 'ocupado'].includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido: debe ser "libre" u "ocupado"' });
  }

  const consultorios = leerJSON(consultoriosPath);
  const consultorio = consultorios.find(c => c.id === id);

  if (!consultorio) {
    return res.status(404).json({ mensaje: 'Consultorio no encontrado' });
  }

  if (estado === 'ocupado') {
    // Verificar si el doctor ya está en otro consultorio ocupado
    const yaAsignado = consultorios.some(c => c.estado === 'ocupado' && c.idDoctor === idDoctor && c.id !== id);
    if (yaAsignado) {
      return res.status(400).json({ mensaje: 'Este doctor ya está asignado a otro consultorio ocupado' });
    }

    // Asignar el doctor al consultorio
    consultorio.estado = 'ocupado';
    consultorio.idDoctor = idDoctor;
  }

  if (estado === 'libre') {
    // Solo puede liberar si el doctor que hace la solicitud es quien lo tiene ocupado
    if (consultorio.estado === 'ocupado' && consultorio.idDoctor !== idDoctor) {
      return res.status(403).json({ mensaje: 'No tiene permiso para liberar este consultorio' });
    }

    // Liberar el consultorio
    consultorio.estado = 'libre';
    consultorio.idDoctor = null;
  }

  escribirJSON(consultoriosPath, consultorios);
  res.json({ mensaje: 'Consultorio actualizado', consultorio });
});


module.exports = router;
