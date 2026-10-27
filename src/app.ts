import express from 'express';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { pacientesRoutes } from './routes/pacientes-routes';
import { consultasRoutes } from './routes/consultas-routes';
import { medicosRoutes } from './routes/medicos-routes';
import { usuariosRoutes } from './routes/usuarios-routes';
import { authRoutes } from './routes/auth-routes';
import { erroHandler } from './middlewares/error-handler';
import { autenticar } from './middlewares/autenticar';

const app = express();

app.use(express.json());
app.get("/", (_request, response) => response.redirect("/visual/"));
app.use(express.static(path.resolve(process.cwd(), "public")));
app.use("/visual", express.static(path.resolve(process.cwd(), "visual")));

app.get("/api", (request, response) => {
    return response.status(200).json({
        nome: "API da Clínica",
        versao: "1.0.0",
        documentacao: "/docs"
    });
});

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
app.use("/auth", authRoutes);
app.use("/pacientes", autenticar, pacientesRoutes);
app.use("/consultas", autenticar, consultasRoutes);
app.use("/medicos", autenticar, medicosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use(erroHandler);

export { app };
