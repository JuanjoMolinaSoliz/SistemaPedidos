class UsuarioController {
    constructor(usuarioService){
        this.usuarioService = usuarioService;
    }

    async loginUser(req, res){
        try {
            const {usuario, password} = req.body;
            const user = await this.usuarioService.login(usuario, password);
            res.json(user);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
}

module.exports = UsuarioController;