class ProductoController {
    constructor(productoService){
        this.productoService = productoService;
    }

    async listarProductos(req, res){
        try {
            const producto = await this.productoService.getAll();
            res.json(producto);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
    async crearProducto(req, res){
        try{
            const {nombre, precio, stock} = req.body;
            const data = {
                nombre,
                precio,
                stock
            }
            await this.productoService.crearProducto(data);
            res.status(201).json({ message: 'Producto creado con éxito' });
        }catch(error){
            res.status(500).json({error: error.message});
        }
    }
}

module.exports = ProductoController;

