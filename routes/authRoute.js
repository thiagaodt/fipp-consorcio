import express from 'express'
import AuthController from '../controllers/authController.js'
import AuthMiddleware from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

let ctrl = new AuthController();
let auth = new AuthMiddleware();


authRouter.post("/login", (req, res) => {
    /* #swagger.tags = ['Auth']
       #swagger.summary = 'Gera um token de acesso'
       #swagger.parameters['body'] = {
            in: 'body',
            description: 'Credenciais válidas do usuário',
            required: true,
            schema: { $ref: '#/components/schemas/token' }
       } 
    */
    ctrl.login(req, res);
})

authRouter.post("/logout", auth.validarToken, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    /* #swagger.tags = ['Auth']
    /* #swagger.summary = 'Realiza o logout do usuário' */
    ctrl.logout(req, res);
})

export default authRouter;  