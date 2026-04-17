import express from 'express'
import ConsorcioController from "../controllers/consorcioController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"

const consorcioRouter = express.Router();

let ctrl = new ConsorcioController();
let auth = new AuthMiddleware();

consorcioRouter.get("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Consórcio']
    // #swagger.summary = 'Lista todos os consórcios cadastrados'
    ctrl.listar(req, res);
})

consorcioRouter.post("/", (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Consórcio']
    // #swagger.summary = 'Cadastra um novo consórcio'
    ctrl.cadastrar(req, res);
})

consorcioRouter.put("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Consórcio']
    // #swagger.summary = 'Altera um consórcio existente'
    ctrl.atualizar(req, res)
})

consorcioRouter.delete("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Consórcio']
    // #swagger.summary = 'Exclui um consórcio'
    ctrl.deletar(req, res);
})

consorcioRouter.get("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Consórcio']
    // #swagger.summary = 'Busca um consórcio pelo id'
    ctrl.obterPorId(req, res);
})

export default consorcioRouter;