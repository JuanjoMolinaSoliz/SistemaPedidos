const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

const container = require('./app/container');

const clienteRoutes = require('./app/routes/clienteRoutes')(container.clienteController);
const productoRoutes = require('./app/routes/productoRouter')(container.productoController);
const pedidoRoutes = require('./app/routes/pedidoRoutes')(container.pedidoController);
const facturaRoutes = require('./app/routes/facturaRoutes')(container.facturaController);
const pagoRoutes = require('./app/routes/pagoRoutes')(container.pagoController);
const usuarioRoutes = require('./app/routes/usuarioRoutes')(container.usuarioController);


app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/auth', usuarioRoutes);


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});