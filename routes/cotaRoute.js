import express from 'express'
import CotaController from "../controllers/cotaController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"

const cotaRouter = express.Router();

let ctrl = new CotaController();
let auth = new AuthMiddleware();

cotaRouter.get("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Cota']
    // #swagger.summary = 'Lista todas as cotas cadastradas'
    ctrl.listar(req, res);
})

cotaRouter.get("/minhas", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Cota']
    // #swagger.summary = 'Lista as cotas do usuário logado'
    ctrl.listarMinhas(req, res);
})

cotaRouter.get("/consorcio/:con_id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Cota']
    // #swagger.summary = 'Lista cotas de um consórcio'
    ctrl.listarPorConsorcio(req, res);
})

cotaRouter.post("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Cota']
    // #swagger.summary = 'Cadastra uma nova cota'
    ctrl.cadastrar(req, res);
})

cotaRouter.put("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Cota']
    // #swagger.summary = 'Altera uma cota existente'
    ctrl.atualizar(req, res)
})

cotaRouter.delete("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Cota']
    // #swagger.summary = 'Exclui uma cota'
    ctrl.deletar(req, res);
})

cotaRouter.get("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Cota']
    // #swagger.summary = 'Busca uma cota pelo id'
    ctrl.obterPorId(req, res);
})

export default cotaRouter;
