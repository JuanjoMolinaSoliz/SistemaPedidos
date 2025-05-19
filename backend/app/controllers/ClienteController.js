const { error } = require("qrcode-terminal");

class ClienteController{
    constructor (clienteService){
        this.clienteService = clienteService;
    }

    async registrar(req, res){
        try{
            const {ci, nombre} = req.body;
            const data = {
                ci,
                nombre
            }
            const cliente = await this.clienteService.registraCliente(data);
            res.status(201).json(cliente);
        }catch(err){
            res.status(500).json({err: error.message})
        }
    }
    async listar(req, res){
        try {
            const clientes = await this.clienteService.getAllClientes();
            res.json(clientes);
        } catch (error) {
            console.error('Error in ClienteController.listar:', error);
            res.status(500).json({ error: 'Error al obtener la lista de clientes', detalle: error.message });
        }
    }
}

module.exports = ClienteController;