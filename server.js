import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import http from 'http'
/* import swaggerUi from 'swagger-ui-express';
import swaggerDocument from "./swagger_output.json" with { type: "json" }; */

import authRouter from './routes/authRoute.js';
import usuarioRouter from './routes/usuarioRoute.js';
import consorcioRouter from './routes/consorcioRoute.js';
import cotaRouter from './routes/cotaRoute.js';
import assembleiaRouter from './routes/assembleiaRoute.js';
import pagamentoRouter from './routes/pagamentoRoute.js';
import saldoRouter from './routes/saldoRoute.js';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/auth', authRouter);
app.use('/usuario', usuarioRouter);
app.use('/consorcio', consorcioRouter);
app.use('/cota', cotaRouter);
app.use('/assembleia', assembleiaRouter);
app.use('/pagamento', pagamentoRouter);
app.use('/saldo', saldoRouter);

server.listen(PORT, function() {
    console.log('backend OK: http://localhost:' + PORT + '/docs');
})