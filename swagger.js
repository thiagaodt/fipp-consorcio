// Gera o swagger_output.json a partir das rotas e dos comentários #swagger.
// Uso: npm run api
import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'FIPP Consórcio — API',
        description: 'API de consórcios: usuários, consórcios, cotas, assembleias, pagamentos PIX e saldos.'
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
    }
};

swaggerAutogen({ openapi: '3.0.0' })('./swagger_output.json', ['./server.js'], doc);
