import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuarioRepository.js';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    throw new Error("JWT_SECRET não está definida. Copie o .env.example para .env e preencha.");
}

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

    // Use depois de validarToken.
    exigirAdmin(req, res, next) {
        if(req.usuarioLogado?.perfil !== 'ADMINISTRADOR') {
            return res.status(403).json({msg: "Acesso restrito a administradores"});
        }
        next();
    }

    // Identifica o usuário quando há token válido, sem bloquear a rota (ex.: cadastro público).
    async identificarOpcional(req, res, next) {
        let token = req.cookies.token;
        if(!token && req.headers.authorization) {
            token = req.headers.authorization.split(' ')[1];
        }
        if(token) {
            try {
                let payload = jwt.verify(token, SECRET);
                let usuarioRepository = new UsuarioRepository();
                req.usuarioLogado = await usuarioRepository.buscarPorId(payload.id) ?? undefined;
            }
            catch(ex) {
                req.usuarioLogado = undefined;
            }
        }
        next();
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