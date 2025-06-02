// controllers/ProveedorController.js

// DEBE SER UNA CLASE
class ProveedorController {
    constructor(proveedorService) {
        this.proveedorService = proveedorService;
    }

    // Todos los métodos deben ser arrow functions para mantener el 'this'
    // y para que sean propiedades de la instancia, directamente funciones.
    getAllProveedores = async (req, res) => {
        try {
            const proveedores = await this.proveedorService.getAllProveedores();
            res.status(200).json(proveedores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    getProveedorById = async (req, res) => {
        try {
            const { id } = req.params;
            const proveedor = await this.proveedorService.getProveedorById(id);
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado.' });
            }
            res.status(200).json(proveedor);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    createProveedor = async (req, res) => {
        try {
            const nuevoProveedor = await this.proveedorService.createProveedor(req.body);
            res.status(201).json({ mensaje: 'Proveedor creado exitosamente', proveedor: nuevoProveedor });
        } catch (error) {
            if (error.message.includes('obligatorios')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('nombre')) {
                return res.status(409).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al crear el proveedor.' });
        }
    }

    updateProveedor = async (req, res) => {
        try {
            const { id } = req.params;
            const updatedProveedor = await this.proveedorService.updateProveedor(id, req.body);
            res.status(200).json({ mensaje: 'Proveedor actualizado exitosamente', proveedor: updatedProveedor });
        } catch (error) {
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al actualizar el proveedor.' });
        }
    }

    deleteProveedor = async (req, res) => {
        try {
            const { id } = req.params;
            await this.proveedorService.deleteProveedor(id);
            res.status(204).send(); // No Content
        } catch (error) {
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Error al eliminar el proveedor.' });
        }
    }
}

module.exports = ProveedorController; // DEBE EXPORTAR LA CLASE
