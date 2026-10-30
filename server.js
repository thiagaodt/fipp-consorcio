import './utils/env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import http from 'http'
import swaggerUi from 'swagger-ui-express';

import authRouter from './routes/authRoute.js';
import usuarioRouter from './routes/usuarioRoute.js';
import consorcioRouter from './routes/consorcioRoute.js';
import cotaRouter from './routes/cotaRoute.js';
import assembleiaRouter from './routes/assembleiaRoute.js';
import pagamentoRouter from './routes/pagamentoRoute.js';
import saldoRouter from './routes/saldoRoute.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

// A documentação é gerada por "npm run api" (swagger.js -> swagger_output.json).
const swaggerPath = path.join(__dirname, 'swagger_output.json');
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.warn('[AVISO] swagger_output.json não encontrado. Rode "npm run api" para gerar a documentação em /docs.');
}
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