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

pagamentoRouter.get("/cota/:cot_id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Lista pagamentos de uma cota'
    ctrl.listarPorCota(req, res);
})

pagamentoRouter.get("/assembleia/:ass_id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Lista pagamentos de uma assembleia'
    ctrl.listarPorAssembleia(req, res);
})

pagamentoRouter.post("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Cadastra um novo pagamento (uso interno)'
    ctrl.cadastrar(req, res);
})

pagamentoRouter.post("/pix", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Gera um QR Code PIX (AbacatePay) para pagamento da parcela'
    ctrl.gerarPix(req, res);
})

pagamentoRouter.post("/webhook", (req, res) => {
    // #swagger.tags = ['Pagamento']
    // #swagger.summary = 'Webhook do AbacatePay para confirmação de pagamento'
    ctrl.webhook(req, res);
})

pagamentoRouter.put("/:id", auth.validarToken, (req, res) => {
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
