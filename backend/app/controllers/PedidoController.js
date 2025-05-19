class PedidoController {
    constructor (pedidoService){
        this.pedidoService = pedidoService;
    }
    async crearPedido(req, res){
        try {
            const {fecha, idCliente, detalles} = req.body;
            const result = await this.pedidoService.crearPedido(fecha, idCliente, detalles);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
}

module.exports = PedidoController;