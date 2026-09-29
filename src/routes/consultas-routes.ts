import { Router } from "express";
import {
    atualizarConsulta,
    buscarConsultaPorId,
    criarConsulta,
    excluirConsulta,
    listarConsultas
} from "../controllers/consultas-controller";

import { validar } from "../middlewares/validar";
import { consultaIdSchema, consultaInputSchema } from "../schemas/consulta-schema";

const consultasRoutes = Router();
/**
 * @openapi
 * /consultas:
 *   get:
 *     summary: Lista as consultas
 *     tags: [Consultas]
 *     responses:
 *       200:
 *         description: Lista de consultas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consulta'
 */

consultasRoutes.get("/", listarConsultas);

/**
 * @openapi
 * /consultas/{id}:
 *   get:
 *     summary: Busca uma consulta pelo ID
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Consulta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consulta'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Consulta não encontrada
 */
consultasRoutes.get("/:id", validar(consultaIdSchema, "params"), buscarConsultaPorId);


/**
 * @openapi
 * /consultas:
 *   post:
 *     summary: Cadastra uma consulta
 *     tags: [Consultas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsultaInput'
 *     responses:
 *       201:
 *         description: Consulta cadastrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consulta'
 *       400:
 *         description: Dados inválidos ou hora de fim antes da hora de início
 *       404:
 *         description: Paciente ou médico não encontrado
 *       409:
 *         description: O médico ou o paciente já tem consulta nesse horário
 */
consultasRoutes.post("/", validar(consultaInputSchema,"body"), criarConsulta);

/**
 * @openapi
 * /consultas/{id}:
 *   put:
 *     summary: Atualiza uma consulta
 *     tags: [Consultas]
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
 *             $ref: '#/components/schemas/ConsultaInput'
 *     responses:
 *       200:
 *         description: Consulta atualizada
 *       400:
 *         description: Dados ou ID inválidos
 *       404:
 *         description: Consulta, paciente ou médico não encontrado
 *       409:
 *         description: O médico ou o paciente já tem consulta nesse horário
 */
consultasRoutes.put("/:id", validar(consultaIdSchema, "params"), validar(consultaInputSchema, "body"), atualizarConsulta);

/**
 * @openapi
 * /consultas/{id}:
 *   delete:
 *     summary: Exclui uma consulta
 *     tags: [Consultas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Consulta excluída
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Consulta não encontrada
 */
consultasRoutes.delete("/:id", validar(consultaIdSchema, "params"), excluirConsulta);

export { consultasRoutes }
