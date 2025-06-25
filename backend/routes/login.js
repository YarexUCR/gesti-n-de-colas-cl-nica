const express = require('express');
const router = express.Router();
const path = require('path');
const { leerJSON } = require('../utils/fileUtils');

const usuariosPath = path.join(__dirname, '../data/usuarios.json');

router.post('/login', (req, res) => {
  const { usuario, clave } = req.body;

  if (!usuario || !clave) {
    return res.status(400).json({ mensaje: 'Usuario y clave requeridos' });
  }

  const usuarios = leerJSON(usuariosPath);
  const encontrado = usuarios.find(u => u.usuario === usuario && u.clave === clave);

  if (!encontrado) {
    return res.status(401).json({ mensaje: 'Credenciales inválidas' });
  }

  res.json({
    id: encontrado.id,
    usuario: encontrado.usuario,
    rol: encontrado.rol
  });
});

module.exports = router;
