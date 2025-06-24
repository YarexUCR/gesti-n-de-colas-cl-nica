const express = require('express');
const router = express.Router();
const path = require('path');
const { leerJSON } = require('../utils/fileUtils');

const usuariosPath = path.join(__dirname, '../data/usuarios.json');

router.post('/login', (req, res) => {
  const { usuario, clave } = req.body;
  const usuarios = leerJSON(usuariosPath);
  const encontrado = usuarios.find(u => u.usuario === usuario && u.clave === clave);
  if (encontrado) {
    res.json({ usuario: encontrado });
  } else {
    res.status(401).json({ mensaje: 'Usuario o clave incorrecta' });
  }
});

module.exports = router;
