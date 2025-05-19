class PagoController{
    constructor(pagoService){
        this.pagoService = pagoService;
    }
    async registrar(req, res){
        try {
            const {pedidoId, monto, fecha} = req.body;
            const pago = await this.pagoService.registrarPago(pedidoId, monto, fecha);
            res.status(201).json(pago);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
}

module.exports = PagoController;