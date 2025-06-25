const express = require('express');
const router = express.Router();
const path = require('path');
const { leerJSON } = require('../utils/fileUtils');

const historialPath = path.join(__dirname, '../data/historialPacientes.json');
const consultoriosPath = path.join(__dirname, '../data/consultorios.json');

// Ruta: /api/metricas/entradas-mmc
router.get('/metricas/entradas-mmc', (req, res) => {
  const historial = leerJSON(historialPath);
  const consultorios = leerJSON(consultoriosPath);

  if (historial.length === 0) {
    return res.status(400).json({ mensaje: 'No hay datos en el historial' });
  }

  // λ: tasa de llegada (por hora)
  const totalPacientes = historial.length;
  const fechas = historial.map(p => p.horaIngresoHospital.split('T')[0]);
  const diasUnicos = [...new Set(fechas)];
  const promedioPacientesPorDia = totalPacientes / diasUnicos.length;
  const horasPorDia = 8;
  const lambda = promedioPacientesPorDia / horasPorDia;

  // μ: tasa de servicio (por hora)
  let totalConsultaMin = 0;
  historial.forEach(p => {
    const inicio = new Date(p.horaIngresoConsultorio);
    const fin = new Date(p.horaSalidaConsultorio);
    totalConsultaMin += (fin - inicio) / 60000;
  });
  const promedioConsultaMin = totalConsultaMin / totalPacientes;
  const mu = 60 / promedioConsultaMin;

  // c: cantidad de doctores activos (consultorios ocupados)
  const c = consultorios.filter(c => c.estado === 'ocupado' && c.idDoctor !== null).length;

  res.json({
    tasaLlegada_lambda: lambda.toFixed(4),
    tasaServicio_mu: mu.toFixed(4),
    servidores_c: c
  });
});

module.exports = router;
