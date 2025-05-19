const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '5916125_Jjms',
    database: 'sistema_pedidos'
})

module.exports = db;