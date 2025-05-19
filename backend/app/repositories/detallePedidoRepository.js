class DetallePedidoRepository{
    constructor(db){
        this.db = db;
    }

    async calcularSubtotal(idProducto, cantidad){
        try {
            const result = await this.db.query(
                'SELECT precio FROM productos WHERE idProducto = ?',
                [idProducto]
            );
            if (result.length === 0) {
                throw new Error('Producto no encontrado');
            }
            const precio = result[0].precio;
            return precio * cantidad;
        } catch (error) {
            throw new Error('Error al calcular subtotal: ' + error.message);
        }
    }
    async agregarDetalle(idPedido, idProducto, cantidad, precio) {
        try {

            const subtotal = precio * cantidad;
            await this.db.query(
                'INSERT INTO DetallePedido (idPedido, idProducto, cantidad, subtotal) VALUES (?, ?, ?, ?)',
                [idPedido, idProducto, cantidad, subtotal]
            );
        } catch (error) {
            throw new Error('Error al agregar detalle: ' + error.message);
        }
    }
}
module.exports = DetallePedidoRepository;