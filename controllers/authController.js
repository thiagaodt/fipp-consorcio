import AuthMiddleware from "../middlewares/authMiddleware.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";
import Bcrypt from "../utils/bcrypt.js";

export default class AuthController {

    #usuarioRepository;
    #bcrypt;

    constructor() {
        this.#usuarioRepository = new UsuarioRepository();
        this.#bcrypt = new Bcrypt();
    }

    async login(req, res) {
        try {
            let {email, senha} = req.body;
            if(email && senha) {
                let usuario = await this.#usuarioRepository.buscarPorEmail(email);
                if(usuario && usuario.ativo === "S") {
                    let hash = await this.#bcrypt.compare(senha, usuario.senha);
                    if(hash) {
                        let auth = new AuthMiddleware();
                        let token = auth.gerarToken(usuario.id, usuario.email, usuario.nome);
                        res.cookie("token", token, {
                        httpOnly: true,
                    })
                        return res.status(200).json({token: token, usuario: usuario});
                    }
                    else {
                        return res.status(401).json({msg: "Senha incorreta"});
                    }
                }
                else {
                    return res.status(404).json({msg: "Usuário não encontrado"});
                }
            }
            else {
                return res.status(400).json({msg: "Informe um e-mail e uma senha para gerar um token de acesso!"});
            }
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao gerar token de acesso"})
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                sameSite: "strict",
                path: "/",
            });
            return res.status(200).json({msg: "Logout realizado com sucesso"});
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao realizar logout"})
        }
    }

}