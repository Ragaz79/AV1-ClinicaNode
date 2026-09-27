import { Router } from "express";
import {
    atualizarPaciente,
    buscarPacientePorId,
    criarPaciente,
    excluirPaciente,
    listarPacientes
} from "../controllers/pacientes-controller";

import { validar } from "../middlewares/validar";
import { pacienteIdSchema, pacienteInputSchema } from "../schemas/paciente-schema";
const pacientesRoutes = Router();
/**
 * @openapi
 * /pacientes:
 *   get:
 *     summary: Lista os pacientes
 *     tags: [Pacientes]
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra os pacientes pelo nome
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Paciente'
 */

pacientesRoutes.get("/", listarPacientes);

/**
 * @openapi
 * /pacientes/{id}:
 *   get:
 *     summary: Busca um paciente pelo ID
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paciente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paciente'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Paciente não encontrado
 */
pacientesRoutes.get("/:id", validar(pacienteIdSchema, "params"), buscarPacientePorId);


/**
 * @openapi
 * /pacientes:
 *   post:
 *     summary: Cadastra um paciente
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PacienteInput'
 *     responses:
 *       201:
 *         description: Paciente cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paciente'
 *       400:
 *         description: Dados obrigatórios ausentes
 *       409:
 *         description: CPF já cadastrado
 */
pacientesRoutes.post("/", validar(pacienteInputSchema,"body"), criarPaciente);

/**
 * @openapi
 * /pacientes/{id}:
 *   put:
 *     summary: Atualiza um paciente
 *     tags: [Pacientes]
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
 *             $ref: '#/components/schemas/PacienteInput'
 *     responses:
 *       200:
 *         description: Paciente atualizado
 *       400:
 *         description: Dados ou ID inválidos
 *       404:
 *         description: Paciente não encontrado
 *       409:
 *         description: CPF pertencente a outro paciente
 */
pacientesRoutes.put("/:id", validar(pacienteIdSchema, "params"), validar(pacienteInputSchema, "body"), atualizarPaciente);

/**
 * @openapi
 * /pacientes/{id}:
 *   delete:
 *     summary: Exclui um paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Paciente excluído
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Paciente não encontrado
 */
pacientesRoutes.delete("/:id", validar(pacienteIdSchema, "params"), excluirPaciente);

export { pacientesRoutes }
