import express from 'express';
import UsuarioController from '../controllers/usuarioController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const usuarioRouter = express.Router();

let ctrl = new UsuarioController();
let auth = new AuthMiddleware();

usuarioRouter.get("/", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.summary = 'Lista usuários ativos'
    ctrl.listar(req, res);
})

usuarioRouter.get("/todos", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.summary = 'Lista todos os usuários (ativos e inativos) — admin'
    ctrl.listarTodos(req, res);
})

usuarioRouter.patch("/:id/ativo", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.summary = 'Ativa ou desativa um usuário'
    ctrl.toggleAtivo(req, res);
})

usuarioRouter.post("/", (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Usuário']
    // #swagger.summary = 'Cadastra um novo usuário'
    ctrl.cadastrar(req, res);
})

usuarioRouter.put("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Usuário']
    // #swagger.summary = 'Altera um usuário existente'
    ctrl.atualizar(req, res)
})

usuarioRouter.delete("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Usuário']
    // #swagger.summary = 'Exclui um usuário'
    ctrl.deletar(req, res);
})

usuarioRouter.get("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Usuário']
    // #swagger.summary = 'Busca um usuário pelo id'
    ctrl.obterPorId(req, res);
})


export default usuarioRouter;