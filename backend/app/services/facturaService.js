class FacturaService {
    constructor(facturaRepository){
        this.facturaRepository = facturaRepository;
    }
    /**
     * @param {number} idPedido 
     * @returns {Promise<Buffer>}
     * @throws {Error}
     */
    async registrarFactura(idPedido){
        try {
            const { pdfBuffer, datosEncabezado } = await this.facturaRepository.generarPdf(idPedido);
            if (!datosEncabezado) {
                 throw new Error(`No se pudieron obtener datos de encabezado para el pedido ID ${idPedido}`);
            }
            const fechaEmision = new Date().toISOString().split('T')[0];
            const totalFinal = datosEncabezado.total_pedido;

             if (totalFinal === null || totalFinal === undefined) {
                 console.warn(`FacturaService: Total final para pedido ID ${idPedido} es null/undefined. Guardando factura con total 0 en DB.`);
                 totalFinal = 0;
             }

            const facturaId = await this.facturaRepository.agregarFactura(idPedido, fechaEmision, totalFinal);
            console.log(`Registro de factura creado en DB con ID: ${facturaId} para pedido ${idPedido}`);
            return pdfBuffer;

        } catch (error) {
             console.error(`Error en FacturaService.registrarFactura para pedido ${idPedido}:`, error);
             throw error;
        }
    }
}

module.exports = FacturaService;
