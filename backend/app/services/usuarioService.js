class UsuarioService {
    constructor (usuarioRepository){
        this.usuarioRepository = usuarioRepository;
    }
    async login(usuario, password){
        return await this.usuarioRepository.getUsuario(usuario, password);
    }
    //para crear un usuario
    async crearUsuario(usuario, password){
        return await this.usuarioRepository.crearUsuario(usuario, password);
    }
    async actualizarUltimaConexion(usuarioId) {
        console.log(`Simulando actualización de la última conexión para el usuario con ID: ${usuarioId}`);
        return { success: true, message: `Última conexión actualizada para el usuario ${usuarioId}` };
    }
}

module.exports = UsuarioService;