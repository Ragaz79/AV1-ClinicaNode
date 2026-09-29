import { Router } from "express";
import {
    atualizarMedico,
    buscarMedicoPorId,
    criarMedico,
    excluirMedico,
    listarMedicos
} from "../controllers/medicos-controller";
import { validar } from "../middlewares/validar";
import { medicoIdSchema, medicoInputSchema } from "../schemas/medico-schema";

const medicosRoutes = Router();

/**
 * @openapi
 * /medicos:
 *   get:
 *     summary: Lista os médicos cadastrados
 *     tags: [Médicos]
 *     responses:
 *       200:
 *         description: Lista de médicos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medico'
 */
medicosRoutes.get("/", listarMedicos);

/**
 * @openapi
 * /medicos/{id}:
 *   get:
 *     summary: Busca um médico pelo ID
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Médico encontrado
 *       404:
 *         description: Médico não encontrado
 */
medicosRoutes.get("/:id", validar(medicoIdSchema, "params"), buscarMedicoPorId);

/**
 * @openapi
 * /medicos:
 *   post:
 *     summary: Cadastra um médico
 *     tags: [Médicos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicoInput'
 *     responses:
 *       201:
 *         description: Médico cadastrado
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: CRM ou CPF já cadastrado
 */
medicosRoutes.post("/", validar(medicoInputSchema, "body"), criarMedico);

/**
 * @openapi
 * /medicos/{id}:
 *   put:
 *     summary: Atualiza um médico
 *     tags: [Médicos]
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
 *             $ref: '#/components/schemas/MedicoInput'
 *     responses:
 *       200:
 *         description: Médico atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Médico não encontrado
 *       409:
 *         description: CRM ou CPF já cadastrado
 */
medicosRoutes.put("/:id", validar(medicoIdSchema, "params"), validar(medicoInputSchema, "body"), atualizarMedico);

/**
 * @openapi
 * /medicos/{id}:
 *   delete:
 *     summary: Exclui um médico sem consultas vinculadas
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Médico excluído
 *       404:
 *         description: Médico não encontrado
 *       409:
 *         description: Médico possui consultas vinculadas
 */
medicosRoutes.delete("/:id", validar(medicoIdSchema, "params"), excluirMedico);

export { medicosRoutes };
