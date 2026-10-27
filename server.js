const express = require('express');
require('dotenv').config();

const pessoaRoutes = require('./src/routes/pessoaRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');

const app = express();
app.use(express.json());

app.use('/pessoas', pessoaRoutes);
app.use('/pedidos', pedidoRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log('Servidor rodando na porta ' + PORT));
