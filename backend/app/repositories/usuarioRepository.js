const bcrypt = require('bcryptjs');

class UsuarioRepository{
    constructor(db){ this.db = db; }

    async getUsuario(usuario, password){
        try {
            const [rows] = await this.db.query('SELECT idEmpleado, usuario, nombre, rol, password FROM Empleado WHERE usuario = ?', [usuario]);

            if (rows.length === 0) {
                console.warn(`Intento de login fallido: Usuario '${usuario}' no encontrado.`);
                throw new Error('Credenciales inválidas.');
            }

            const user = rows[0];

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                 console.warn(`Intento de login fallido: Contraseña incorrecta para usuario '${usuario}'.`);
                throw new Error('Credenciales inválidas.');
            }

            const authenticatedUser = {
                id: user.idEmpleado,
                usuario: user.usuario,
                nombre: user.nombre,
                rol: user.rol
            };

            console.log(`Usuario '${usuario}' autenticado correctamente.`);
            return authenticatedUser;

        } catch (error) {
            console.error('Error en UsuarioRepository.getUsuario:', error);
            if (error.message === 'Credenciales inválidas') {
                 throw error;
            } else {
                 throw new Error('Error interno al intentar autenticar usuario. Intente más tarde: ' + error.message);
            }
        }
    }

     async crearUsuario(usuario, passwordPlana, nombre, rol) {
         try {
             const hashedPassword = await bcrypt.hash(passwordPlana, 10);
              const [result] = await this.db.query(
                  'INSERT INTO Empleado (usuario, password, nombre, rol) VALUES (?, ?, ?, ?)',
                  [usuario, hashedPassword, nombre, rol]
              );
              console.log(`Usuario '${usuario}' creado en DB con ID: ${result.insertId}`);
              return result.insertId;
         } catch (error) {
              console.error('Error creando usuario en DB:', error);
              throw new Error('Error al registrar nuevo usuario: ' + error.message);
         }
     }
}

module.exports = UsuarioRepository;
