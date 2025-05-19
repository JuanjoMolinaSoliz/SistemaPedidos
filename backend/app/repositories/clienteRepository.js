const Cliente = require('../models/Cliente');
class ClienteRepository{
    constructor(db) {
        this.db = db;
    }

    async crear(cliente) {
        const result = await this.db.query(
        'INSERT INTO cliente (nombre, ci) VALUES (?, ?)',
        [cliente.nombre, cliente.ci]);
        return result[0].insertId;
    }

        async getAll() {
        try {
            const [rows] = await this.db.query('SELECT * FROM Cliente');
            return rows.map(row => new Cliente(row.idCliente, row.nombre, row.ci));

        } catch (error) {
            console.error('Error in ClienteRepository.getAll:', error);
            throw new Error('Error fetching clients from database: ' + error.message);
        }
    }
}

module.exports = ClienteRepository;