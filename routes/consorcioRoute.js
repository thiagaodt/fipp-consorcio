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

consorcioRouter.get("/meus", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Consórcio']
    // #swagger.summary = 'Lista os consórcios administrados pelo usuário logado'
    ctrl.listarMeus(req, res);
})

consorcioRouter.post("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Consórcio']
    // #swagger.summary = 'Cadastra um novo consórcio'
    ctrl.cadastrar(req, res);
})

consorcioRouter.put("/:id", auth.validarToken, (req, res) => {
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
