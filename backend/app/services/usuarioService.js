class UsuarioService {
    constructor (usuarioRepository){
        this.usuarioRepository = usuarioRepository;
    }
    async login(usuario, password){
        return await this.usuarioRepository.getUsuario(usuario, password);
    }
    //para crear un usuario
    async crearUsuario(usuario, password){
        console.log("UsuarioService.crearUsuario", usuario, password);
        return await this.usuarioRepository.crearUsuario(usuario, password);
    }
}

module.exports = UsuarioService;