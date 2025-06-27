const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/api', require('./routes/login'));
app.use('/api', require('./routes/usuarios'));
app.use('/api', require('./routes/consultorios'));
app.use('/api', require('./routes/pacientes'));
app.use('/api', require('./routes/metricas'));
//app.use('/api', require('./routes/eventos'));
//app.use('/api', require('./routes/informes'));

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}/login.html`);
});
