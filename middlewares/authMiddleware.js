import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuarioRepository.js';

const SECRET = "***REMOVIDO***";

export default class AuthMiddleware {
    gerarToken(id, email, nome) {
        let jsonWebToken = jwt.sign(
        {
            id: id,
            nome: nome,
            email: email,
        }, 
        SECRET, 
        {
            expiresIn: 3000
        })

        return jsonWebToken;
    }

    async validarToken(req, res, next) {
        // Busca o token no Cookie OU no Header de Authorization (usado pelo Swagger)
        let token = req.cookies.token;
        
        if(!token && req.headers.authorization) {
            // O header vem no formato: "Bearer eyJhbGci..."
            token = req.headers.authorization.split(' ')[1];
        }

        if(token) {
            try {
                let payload = jwt.verify(token, SECRET);
                let usuarioRepository = new UsuarioRepository();
                let usuario = await usuarioRepository.buscarPorId(payload.id);
                if(usuario) {
                   req.usuarioLogado = usuario;
                   next();
                }
                else {
                    return res.status(404).json({msg: "Usuário não encontrado"});
                }
            }
            catch(ex) {
                console.log(ex)
                return res.status(401).json({msg: "Token inválido!"});
            }
        }
        else {
            return res.status(401).json({msg: "Token não encontrado!"});
        }
    }
}