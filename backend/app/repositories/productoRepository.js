const Producto = require('../models/Producto');

class ProductoRepository {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    try {
      const [productos] = await this.db.query('SELECT idProducto, nombre, precio, stock FROM Producto');

      return productos.map(row => new Producto(row.idProducto, row.nombre, row.precio, row.stock));
    } catch (error) {
      console.error('Error en ProductoRepository.getAll:', error);
      throw new Error('Error fetching products: ' + error.message);
    }
  }

async agregarProducto(data){
  try {
    const [result] = await this.db.query(`
      INSERT INTO \`Producto\` (\`nombre\`, \`precio\`, \`stock\`) VALUES(?, ?, ?)`,
      [data.nombre, data.precio, data.stock]);

    return result.insertId;

  } catch (error) {
    console.error('Error en ProductoRepository.agregarProducto:', error);
    throw new Error('Error create product: '+ error.message);
  }
}

  async actualizarStock(idProducto, cantidad) {
    try {
      const [result] = await this.db.query(
        'UPDATE Producto SET stock = stock - ? WHERE idProducto = ?',
        [cantidad, idProducto]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en ProductoRepository.actualizarStock:', error);
      throw new Error('Error updating stock: ' + error.message);
    }
  }

  async elminarProducto(idProducto) {
    try {
      const [result] = await this.db.query(
        'DELETE FROM Producto WHERE idProducto = ?',
        [idProducto]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en ProductoRepository.elminarProducto:', error);
      throw new Error('Error deleting product: ' + error.message);
    }
  }
}



module.exports = ProductoRepository;
