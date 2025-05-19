class DetallePedidoService {
    constructor(detallePedidoRepository, productoService) {
        this.detallePedidoRepository = detallePedidoRepository;
        this.productoService = productoService;
    }
    async agregarDetalle(idPedido, idProducto, cantidad) {
        if (!idPedido || !idProducto || cantidad <= 0) {
            throw new Error('Invalid detail parameters');
        }
        const producto = await this.productoService.obtenerProducto(idProducto);
        const precio = producto.precio;
        await this.detallePedidoRepository.agregarDetalle(
            idPedido, 
            idProducto,
            cantidad,
            precio
        );
        await this.productoService.actualizarStock(idProducto, -cantidad);
    }
}

module.exports = DetallePedidoService;