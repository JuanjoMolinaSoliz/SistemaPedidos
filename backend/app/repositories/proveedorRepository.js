// repositories/proveedorRepository.js
const Proveedor = require('../models/proveedorModel');
const { v4: uuidv4 } = require('uuid');

class ProveedorRepository {
    constructor(db) {
        this.db = db;
        // Elimina o comenta esta línea de simulación en memoria si estás usando una DB real
        // if (!ProveedorRepository.proveedoresDB) {
        //     ProveedorRepository.proveedoresDB = [];
        // }
    }

    async findAll() {
        try {
            // Consulta real a la base de datos
            const [rows] = await this.db.query('SELECT * FROM proveedores');
            return rows.map(row => new Proveedor(
                row.id,
                row.nombre,
                row.contacto,
                row.telefono,
                row.email,
                row.direccion
                // No necesitas pasar fechas de creación/actualización aquí si no se van a usar en el modelo
                // y se manejan automáticamente en la DB
            ));
        } catch (error) {
            console.error('Error al obtener todos los proveedores:', error);
            throw error; // Re-lanza el error para que el servicio lo maneje
        }
    }

    async findById(id) {
        try {
            const [rows] = await this.db.query('SELECT * FROM proveedores WHERE id = ?', [id]);
            if (rows.length === 0) {
                return null;
            }
            const row = rows[0];
            return new Proveedor(
                row.id,
                row.nombre,
                row.contacto,
                row.telefono,
                row.email,
                row.direccion
            );
        } catch (error) {
            console.error('Error al obtener proveedor por ID:', error);
            throw error;
        }
    }

    async findByName(nombre) {
        try {
            const [rows] = await this.db.query('SELECT * FROM proveedores WHERE nombre = ?', [nombre]);
            if (rows.length === 0) {
                return null;
            }
            const row = rows[0];
            return new Proveedor(
                row.id,
                row.nombre,
                row.contacto,
                row.telefono,
                row.email,
                row.direccion
            );
        } catch (error) {
            console.error('Error al obtener proveedor por nombre:', error);
            throw error;
        }
    }

    async save(proveedorData) {
        try {
            const newId = uuidv4();
            const query = `
                INSERT INTO proveedores (id, nombre, contacto, telefono, email, direccion)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [
                newId,
                proveedorData.nombre,
                proveedorData.contacto,
                proveedorData.telefono,
                proveedorData.email,
                proveedorData.direccion
            ];
            await this.db.query(query, values);

            // Devuelve el objeto completo del proveedor creado
            return new Proveedor(
                newId,
                proveedorData.nombre,
                proveedorData.contacto,
                proveedorData.telefono,
                proveedorData.email,
                proveedorData.direccion
            );
        } catch (error) {
            console.error('Error al guardar el proveedor:', error);
            throw error;
        }
    }

    async update(id, updates) {
        try {
            // Construir la consulta de actualización dinámicamente
            const fields = [];
            const values = [];
            for (const key in updates) {
                // Evitar actualizar el ID o campos no permitidos
                if (key !== 'id' && updates.hasOwnProperty(key)) {
                    fields.push(`${key} = ?`);
                    values.push(updates[key]);
                }
            }

            if (fields.length === 0) {
                return await this.findById(id); // No hay nada que actualizar
            }

            values.push(id); // Añadir el ID al final para la cláusula WHERE

            const query = `UPDATE proveedores SET ${fields.join(', ')} WHERE id = ?`;
            await this.db.query(query, values);

            return await this.findById(id); // Devolver el proveedor actualizado
        } catch (error) {
            console.error('Error al actualizar el proveedor:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const [result] = await this.db.query('DELETE FROM proveedores WHERE id = ?', [id]);
            return result.affectedRows > 0; // true si se eliminó una fila
        } catch (error) {
            console.error('Error al eliminar el proveedor:', error);
            throw error;
        }
    }
}

module.exports = ProveedorRepository;
