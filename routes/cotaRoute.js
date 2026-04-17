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

cotaRouter.post("/", (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Cota']
    // #swagger.summary = 'Cadastra uma nova cota'
    ctrl.cadastrar(req, res);
})

cotaRouter.put("/", auth.validarToken, (req, res) => {
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
    // #swagger.summary = 'Exclui um consórcio'
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

