const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const vecinoRoutes = require('./routes/vecinoRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const registroRoutes = require('./routes/registroRoutes');
const subsecretariaRoutes = require('./routes/subsecretariaRoutes');
const tipoRoutes = require('./routes/tipoRoutes');
const subtipoRoutes = require('./routes/subtipoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/vecinos', vecinoRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/subsecretarias', subsecretariaRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/subtipos', subtipoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

