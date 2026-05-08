import express from 'express';
import SaldoController from '../controllers/saldoController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const saldoRouter = express.Router();

let ctrl = new SaldoController();
let auth = new AuthMiddleware();

saldoRouter.get("/consorcio/:con_id", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Saldo']
    // #swagger.summary = 'Consulta o saldo do consórcio'
    ctrl.obterSaldoConsorcio(req, res);
});

saldoRouter.get("/consorcio/:con_id/movimentacoes", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Saldo']
    // #swagger.summary = 'Lista movimentações do consórcio'
    ctrl.listarMovimentacoesConsorcio(req, res);
});

saldoRouter.get("/administrador", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Saldo']
    // #swagger.summary = 'Consulta o saldo do administrador logado'
    ctrl.obterMeuSaldoAdministrador(req, res);
});

saldoRouter.get("/administrador/movimentacoes", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Saldo']
    // #swagger.summary = 'Lista movimentações do administrador logado'
    ctrl.listarMinhasMovimentacoesAdministrador(req, res);
});

saldoRouter.post("/administrador/saque", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Saldo']
    // #swagger.summary = 'Realiza saque do saldo do administrador'
    ctrl.sacarSaldoAdministrador(req, res);
});

export default saldoRouter;
