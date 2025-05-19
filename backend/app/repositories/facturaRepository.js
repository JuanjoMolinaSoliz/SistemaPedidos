const PDFDocument = require('pdfkit');

class FacturaRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * @param {number} idPedido
     * @param {string} fechaEmision
     * @param {number} totalFinal
     * @returns {Promise<number>}
     * @throws {Error}
     */
    async agregarFactura(idPedido, fechaEmision, totalFinal) {
        try {
             const [result] = await this.db.query(
                'INSERT INTO Factura(idPedido, fechaEmision, totalFinal) VALUES (?, ?, ?)',
                [idPedido, fechaEmision, totalFinal]
            );
            return result.insertId;

        } catch (error) {
             console.error('Error al agregar factura en DB:', error);
             throw new Error('Error al guardar registro de factura: ' + error.message);
        }
    }

    /**
     * @param {number} idPedido
     * @returns {Promise<{pdfBuffer: Buffer, datosEncabezado: object}>}
     * @throws {Error}
     */

// ... importaciones y constructor ...

    async generarPdf(idPedido) {
        console.log('Intentando generar PDF para Pedido ID:', idPedido);

        // --- Consulta de Datos ---
        try {
             const query = `SELECT
pe.fecha AS fecha_pedido,
pe.total AS total_pedido,
c.nombre AS nombre_cliente,
c.ci AS ci_cliente,
dp.cantidad,
dp.subtotal,
p.nombre AS nombre_producto,
p.precio AS precio_producto
FROM Pedido pe
JOIN Cliente c ON pe.idCliente = c.idCliente
JOIN DetallePedido dp ON pe.idPedido = dp.idPedido
JOIN Producto p ON p.idProducto = dp.idProducto
WHERE pe.idPedido = ?`;

             console.log('Executing SQL Query (Cleaned):', query);
             console.log('Parameters:', [idPedido]);

             const [detalles] = await this.db.query(query, [idPedido]);

             if (!detalles || detalles.length === 0) {
                 throw new Error(`Pedido con ID ${idPedido} no encontrado o sin detalles.`);
             }

            const datosEncabezado = detalles[0];
             return new Promise((resolve, reject) => {
                 try {
                     const doc = new PDFDocument();
                     let pdfBuffer = Buffer.from('');

                     doc.on('data', (chunk) => { pdfBuffer = Buffer.concat([pdfBuffer, chunk]); });
                     doc.on('end', () => { resolve({ pdfBuffer: pdfBuffer, datosEncabezado: datosEncabezado }); });
                     doc.on('error', (err) => { reject(err); });

                     // --- Contenido del PDF ---
                     doc.fontSize(18).text('FACTURA', { align: 'center' });
                     doc.moveDown();

                     doc.fontSize(12)
                         .text(`Fecha Pedido: ${datosEncabezado.fecha_pedido ? new Date(datosEncabezado.fecha_pedido).toLocaleDateString() : 'N/A'}`)
                         .text(`Cliente: ${datosEncabezado.nombre_cliente} (CI: ${datosEncabezado.ci_cliente})`)
                         .moveDown();

                     const startY = doc.y + 10;
                     let y = startY;

                     doc.font('Helvetica-Bold')
                          .text('Producto', 50, y, { width: 200 })
                          .text('Cantidad', 280, y, { width: 70, align: 'right' })
                          .text('P. Unit.', 360, y, { width: 70, align: 'right' })
                          .text('Subtotal', 440, y, { width: 80, align: 'right' });

                      doc.lineCap('butt')
                          .moveTo(50, y + 15)
                          .lineTo(550, y + 15)
                          .stroke();

                      doc.font('Helvetica');
                      y += 25;

                      detalles.forEach(item => {
                          const precioUnitarioCalculado = item.cantidad > 0 ? item.subtotal / item.cantidad : item.precio_producto;
                          doc.text(item.nombre_producto, 50, y, { width: 200 })
                              .text(item.cantidad.toString(), 280, y, { width: 70, align: 'right' })
                              .text(`$${precioUnitarioCalculado.toFixed(2)}`, 360, y, { width: 70, align: 'right' })
                              .text(`$${item.subtotal.toFixed(2)}`, 440, y, { width: 80, align: 'right' });
                          y += 20;
                          if (y + 20 > doc.page.height - doc.page.margins.bottom) {
                               doc.addPage();
                               y = doc.page.margins.top;
                               doc.font('Helvetica-Bold')
                                   .text('Producto', 50, y, { width: 200 })
                                   .text('Cantidad', 280, y, { width: 70, align: 'right' })
                                   .text('P. Unit.', 360, y, { width: 70, align: 'right' })
                                   .text('Subtotal', 440, y, { width: 80, align: 'right' });
                               y += 25;
                               doc.font('Helvetica');
                           }
                       });

                       doc.lineCap('butt')
                           .moveTo(400, y + 10)
                           .lineTo(550, y + 10)
                           .stroke();
                       y += 20;

                       const totalFinalPedido = datosEncabezado.total_pedido !== null ? datosEncabezado.total_pedido : detalles.reduce((sum, item) => sum + item.subtotal, 0);

                       doc.font('Helvetica-Bold')
                           .text('TOTAL:', 380, y, { width: 60, align: 'right' })
                           .text(`$${totalFinalPedido.toFixed(2)}`, 440, y, { width: 80, align: 'right' });


                       doc.end(); // Finaliza la generación del PDF

                 } catch (error) {
                     console.error('Error during PDFKit generation or stream handling:', error);
                     reject(error);
                 }
             }); // Fin de la promesa

        } catch (error) {
            console.error('Error al obtener datos del pedido para PDF:', error);
            throw new Error('Error al obtener datos del pedido: ' + error.message);
        }
    }
}

module.exports = FacturaRepository;