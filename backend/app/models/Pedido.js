class Pedido {
    constructor(idPedido, fecha, total, idCliente){
        this.idPedido = idPedido;
        this.fecha = fecha;
        this.total = total;
        this.idCliente = idCliente
    }
}
module.exports = Pedido;
