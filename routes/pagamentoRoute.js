import express from 'express'
import PagamentoController from '../controllers/pagamentoController.js'
import AuthMiddleware from '../middlewares/authMiddleware.js'

const pagamentoRouter = express.Router();

let ctrl = new PagamentoController();
let auth = new AuthMiddleware();

pagamentoRouter.get("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Lista todos os pagamentos cadastrados'
    ctrl.listar(req, res);
})

pagamentoRouter.post("/", (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Cadastra um novo pagamento'
    ctrl.cadastrar(req, res);
})

pagamentoRouter.put("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Altera um pagamento existente'
    ctrl.atualizar(req, res)
})

pagamentoRouter.delete("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Exclui um pagamento'
    ctrl.deletar(req, res);
})

pagamentoRouter.get("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Busca um pagamento pelo id'
    ctrl.obterPorId(req, res);
})

export default pagamentoRouter;