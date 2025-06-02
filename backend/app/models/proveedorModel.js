// models/proveedorModel.js

class Proveedor {
    constructor(id, nombre, contacto, telefono, email, direccion) {
        this.id = id; // UUID o ID autoincremental de la DB
        this.nombre = nombre;
        this.contacto = contacto;
        this.telefono = telefono;
        this.email = email;
        this.direccion = direccion;
        this.fechaCreacion = new Date().toISOString();
        this.fechaActualizacion = new Date().toISOString();
    }
}

module.exports = Proveedor;