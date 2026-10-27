import { Router } from "express";
import { login, usuarioAutenticado } from "../controllers/auth-controller";
import { autenticar } from "../middlewares/autenticar";
import { validar } from "../middlewares/validar";
import { loginSchema } from "../schemas/usuario-schema";

const authRoutes = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Autentica um usuario
 *     tags: [Autenticacao]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado
 *       401:
 *         description: Email ou senha invalidos
 */
authRoutes.post("/login", validar(loginSchema, "body"), login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Retorna o usuario autenticado
 *     tags: [Autenticacao]
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: Token ausente, invalido ou expirado
 */
authRoutes.get("/me", autenticar, usuarioAutenticado);

export { authRoutes };
