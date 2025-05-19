class PedidoService{
    constructor (pedidoRepository, detallePedidoService, productoRepository){
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoService = detallePedidoService;
        this.productoRepository = productoRepository;
    }
    async crearPedido(fecha, idCliente, detalles){
        const pedidoId = await this.pedidoRepository.crear(fecha, idCliente);
        for(const item of detalles){
            await this.detallePedidoService.agregarDetalle(
                pedidoId,
                item.idProducto,
                item.cantidad,
                item.precio
            );
            await this.productoRepository.actualizarStock(item.idProducto, item.cantidad);
        }
        const total = await this.pedidoRepository.calcularTotal(pedidoId);
        return {pedidoId, total}
    }
}

module.exports = PedidoService;