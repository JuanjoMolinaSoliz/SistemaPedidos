class PedidoRepository {
    constructor(db){
        this.db = db;
    }

    async crear(fecha, idCliente){
        const [result] = await this.db.query(
            'INSERT INTO pedido(fecha, idCliente) VALUES(?, ?)',
            [fecha, idCliente]
        );
        return result.insertId;
    }
    async calcularTotal(pedidoId){
        const [rows] = await this.db.query(
            'SELECT subtotal FROM detallePedido WHERE idPedido = ?',
            [pedidoId]
        );
        const total = rows.reduce((sum, item) => sum + item.subtotal, 0);
        await this.db.query(
            'UPDATE pedido SET total = ? WHERE idPedido = ?',
            [total, pedidoId]
        );
        return total;
    }
}
module.exports = PedidoRepository;