class PagoRepository{
    constructor(db){
        this.db = db;
    }
    async registrarPago(pedidoId, monto, fecha){
        const [result] = await this.db.query(
            'INSERT INTO pagos (idPedido, monto, fecha) VALUES (?, ?, ?)',
            [pedidoId, monto, fecha]
        );
        return result.insertId;
    }
}

module.exports = PagoRepository;