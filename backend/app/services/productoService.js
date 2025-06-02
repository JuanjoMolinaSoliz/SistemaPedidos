class ProductoService {
    constructor (productoRepository){
        this.productoRepository = productoRepository;
    }
    async getAll(){
        return await this.productoRepository.getAll();
    }
    async actualizarStock(idProducto, cantidad){
        return await this.productoRepository.actualizarStock(idProducto, cantidad)
    }
    async crearProducto(data){
        return await this.productoRepository.agregarProducto(data)
    }
    async eliminarProducto(idProducto){
        return await this.productoRepository.elminarProducto(idProducto)
    }
}

module.exports = ProductoService;