import { Router } from "express";
import {
    atualizarUsuario,
    buscarUsuarioPorId,
    criarUsuario,
    excluirUsuario,
    listarUsuarios
} from "../controllers/usuarios-controller";

import { validar } from "../middlewares/validar";
import { autenticar } from "../middlewares/autenticar";
import { usuarioAtualizacaoSchema, usuarioIdSchema, usuarioInputSchema } from "../schemas/usuario-schema";
const usuariosRoutes = Router();

usuariosRoutes.post("/", validar(usuarioInputSchema, "body"), criarUsuario);
usuariosRoutes.use(autenticar);

/**
 * @openapi
 * /usuarios:
 *   get:
 *     summary: Lista os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários (sem a senha)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 */
usuariosRoutes.get("/", listarUsuarios);

/**
 * @openapi
 * /usuarios/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Usuário não encontrado
 */
usuariosRoutes.get("/:id", validar(usuarioIdSchema, "params"), buscarUsuarioPorId);

/**
 * @openapi
 * /usuarios:
 *   post:
 *     security: []
 *     summary: Cadastra um usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       201:
 *         description: Usuário cadastrado (a resposta não traz a senha)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email já cadastrado
 */
/**
 * @openapi
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     description: A senha é opcional. Se não for enviada, a senha atual continua valendo.
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioAtualizacao'
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados ou ID inválidos
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Email pertence a outro usuário
 */
usuariosRoutes.put("/:id", validar(usuarioIdSchema, "params"), validar(usuarioAtualizacaoSchema, "body"), atualizarUsuario);

/**
 * @openapi
 * /usuarios/{id}:
 *   delete:
 *     summary: Exclui um usuário
 *     description: As consultas que ele agendou continuam, só ficam sem o "agendada por".
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Usuário excluído
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Usuário não encontrado
 */
usuariosRoutes.delete("/:id", validar(usuarioIdSchema, "params"), excluirUsuario);

export { usuariosRoutes }
