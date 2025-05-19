class PagoService {
    constructor (pagoRepository){
        this.pagoRepository = pagoRepository;
    }
    async registrarPago(pedidoId, monto, fecha){
        return await this.pagoRepository.registrarPago(pedidoId, monto, fecha);
    }
}

module.exports = PagoService;