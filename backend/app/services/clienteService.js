// 2
class ClienteService {
    constructor(clienteRepository){
        this.clienteRepository = clienteRepository;
    }
    async registraCliente(data){
        return await this.clienteRepository.crear(data)
    }
    async getAllClientes(){
        return await this.clienteRepository.getAll();
    }
}

module.exports = ClienteService;