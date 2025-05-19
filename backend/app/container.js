const db = require('./db/db');

// Repositories
const ClienteRepository = require('./repositories/clienteRepository');
const ProductoRepository = require('./repositories/productoRepository');
const PedidoRepository = require('./repositories/pedidoRepository');
const DetallePedidoRepository = require('./repositories/detallePedidoRepository');
const FacturaRepository = require('./repositories/facturaRepository');
const PagoRepository = require('./repositories/pagoRepository');
const UsuarioRepository = require('./repositories/usuarioRepository');

// Services
const ClienteService = require('./services/clienteService');
const ProductoService = require('./services/productoService');
const PedidoService = require('./services/pedidoService');
const FacturaService = require('./services/facturaService');
const PagoService = require('./services/pagoService');
const UserService = require('./services/usuarioService');

// Controllers
const ClienteController = require('./controllers/ClienteController');
const ProductoController = require('./controllers/ProductoController');
const PedidoController = require('./controllers/PedidoController');
const FacturaController = require('./controllers/FacturaController');
const PagoController = require('./controllers/PagoController');
const UserController = require('./controllers/UsuarioController');
const UsuarioService = require('./services/usuarioService');
const UsuarioController = require('./controllers/UsuarioController');

// Repositorios
const clienteRepository = new ClienteRepository(db);
const productoRepository = new ProductoRepository(db);
const pedidoRepository = new PedidoRepository(db);
const detallePedidoRepository = new DetallePedidoRepository(db);
const facturaRepository = new FacturaRepository(db);
const pagoRepository = new PagoRepository(db);
const usuarioRepository = new UsuarioRepository(db);

// Servicios
const clienteService = new ClienteService(clienteRepository);
const productoService = new ProductoService(productoRepository);
const pedidoService = new PedidoService(pedidoRepository, detallePedidoRepository, productoRepository);
const facturaService = new FacturaService(facturaRepository);
const pagoService = new PagoService(pagoRepository);
const usuarioService = new UsuarioService(usuarioRepository);

// Controladores
const clienteController = new ClienteController(clienteService);
const productoController = new ProductoController(productoService);
const pedidoController = new PedidoController(pedidoService);
const facturaController = new FacturaController(facturaService);
const pagoController = new PagoController(pagoService);
const usuarioController = new UsuarioController(usuarioService);

module.exports = {
  clienteController,
  productoController,
  pedidoController,
  facturaController,
  pagoController,
  usuarioController
};