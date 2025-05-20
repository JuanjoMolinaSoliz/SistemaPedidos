// pensado para el ORM
class Cliente {
    constructor(idCliente, nombre, ci){
        this.idCliente = idCliente;
        this.nombre = nombre;
        this.ci = ci;
    }
}
module.exports = Cliente;