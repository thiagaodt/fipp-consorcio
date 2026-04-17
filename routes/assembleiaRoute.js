import express from 'express';
import AssembleiaController from '../controllers/assembleiaController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const assembleiaRouter = express.Router();

let ctrl = new AssembleiaController();
let auth = new AuthMiddleware();

assembleiaRouter.get("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Assembléia']   
    // #swagger.summary = 'Lista todas as assembléias cadastradas'
    ctrl.listar(req, res);
})

assembleiaRouter.post("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Assembléia']
    // #swagger.summary = 'Cadastra uma nova assembléia'
    ctrl.cadastrar(req, res);
})

assembleiaRouter.put("/", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Assembléia']
    // #swagger.summary = 'Altera uma assembléia existente'
    ctrl.atualizar(req, res)
})

assembleiaRouter.delete("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Assembléia']
    // #swagger.summary = 'Exclui uma assembléia'
    ctrl.deletar(req, res);
})

assembleiaRouter.get("/:id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Assembléia']
    // #swagger.summary = 'Busca uma assembléia pelo id'
    ctrl.obterPorId(req, res);
})

export default assembleiaRouter;