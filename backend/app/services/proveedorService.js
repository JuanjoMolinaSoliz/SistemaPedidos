// services/proveedorService.js
class ProveedorService { // <<-- Debe ser una CLASE
    constructor(proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    async getAllProveedores() {
        return await this.proveedorRepository.findAll();
    }

    async getProveedorById(id) {
        return await this.proveedorRepository.findById(id);
    }

    async createProveedor(proveedorData) {
        if (!proveedorData.nombre || !proveedorData.contacto || !proveedorData.telefono || !proveedorData.email) {
            throw new Error('Faltan campos obligatorios para crear el proveedor.');
        }
        const existing = await this.proveedorRepository.findByName(proveedorData.nombre);
        if (existing) {
            throw new Error('Ya existe un proveedor con este nombre.');
        }
        return await this.proveedorRepository.save(proveedorData);
    }

    async updateProveedor(id, updates) {
        const proveedor = await this.proveedorRepository.findById(id);
        if (!proveedor) {
            throw new Error('Proveedor no encontrado.');
        }
        return await this.proveedorRepository.update(id, updates);
    }

    async deleteProveedor(id) {
        const deleted = await this.proveedorRepository.delete(id);
        if (!deleted) {
            throw new Error('Proveedor no encontrado o no pudo ser eliminado.');
        }
        return true;
    }
}

module.exports = ProveedorService; // Exporta la CLASE
