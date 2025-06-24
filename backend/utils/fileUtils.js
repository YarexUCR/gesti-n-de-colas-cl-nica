const fs = require('fs');

function leerJSON(ruta) {
  try {
    const data = fs.readFileSync(ruta, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error al leer ${ruta}:`, error.message);
    return [];
  }
}

function escribirJSON(ruta, datos) {
  try {
    fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error al escribir ${ruta}:`, error.message);
  }
}

module.exports = { leerJSON, escribirJSON };
