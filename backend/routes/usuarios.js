const express = require('express');
const router = express.Router();
const path = require('path');
const { leerJSON, escribirJSON } = require('../utils/fileUtils');

const usuariosPath = path.join(__dirname, '../data/usuarios.json');

// Listar todos los usuarios
router.get('/usuarios', (req, res) => {
  const usuarios = leerJSON(usuariosPath);
  res.json(usuarios);
});



// Crear un nuevo usuario
router.post('/usuarios', (req, res) => {
  const { usuario, clave, rol } = req.body;

  if (!usuario || !clave || !rol) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  const usuarios = leerJSON(usuariosPath);
  const nuevoUsuario = {
    id: usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1,
    usuario,
    clave,
    rol
  };

  usuarios.push(nuevoUsuario);
  escribirJSON(usuariosPath, usuarios);

  res.status(201).json(nuevoUsuario);
});

// Eliminar un usuario por ID
router.delete('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let usuarios = leerJSON(usuariosPath);

  const existe = usuarios.some(u => u.id === id);
  if (!existe) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }

  usuarios = usuarios.filter(u => u.id !== id);
  escribirJSON(usuariosPath, usuarios);

  res.json({ mensaje: 'Usuario eliminado' });
});

module.exports = router;
