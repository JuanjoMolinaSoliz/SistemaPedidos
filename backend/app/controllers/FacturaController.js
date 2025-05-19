class FacturaController {
    constructor(facturaService) {
        this.facturaService = facturaService;
    }

    async registrar(req, res) {
    try {
        const { idPedido } = req.body;
        const pdfBuffer = await this.facturaService.registrarFactura(idPedido);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=factura_${idPedido}.pdf`
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error en FacturaController.registrar:', error);
        res.status(500).json({
            error: 'Error al generar PDF',
            detalle: error.message 
        });
    }
}
}

module.exports = FacturaController;
