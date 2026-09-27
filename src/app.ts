import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { pacientesRoutes } from './routes/pacientes-routes';
import { erroHandler } from './middlewares/error-handler';

const app = express();

app.use(express.json());

app.get("/", (request, response) => {
    return response.status(200).json({
        nome: "Api da, Clinica",
        versao:"1.0.0",
        documentacao: "/docs"
    });
} );

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      supportedSubmitMethods: [
        "get",
        "post",
        "put",
        "patch",
        "delete"
      ]
    }
  })
);
app.use("/pacientes", pacientesRoutes);
app.use(erroHandler);
export {app}