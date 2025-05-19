class UsuarioService {
    constructor (usuarioRepository){
        this.usuarioRepository = usuarioRepository;
    }
    async login(usuario, password){
        return await this.usuarioRepository.getUsuario(usuario, password);
    }
}

module.exports = UsuarioService;