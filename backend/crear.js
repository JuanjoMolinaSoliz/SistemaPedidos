const bcrypt = require('bcryptjs');

const passwordPlana = '1234';
const saltRounds = 10;

bcrypt.hash(passwordPlana, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error al hashear:', err);
        return;
    }
    console.log('Contraseña plana:', passwordPlana);
    console.log('Hash generado:', hash);
});