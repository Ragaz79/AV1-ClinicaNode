import { Request, Response } from "express";
import { medicoService } from "../container";

export function listarMedicos(_req: Request, res: Response) {
    return res.status(200).json(medicoService.listar());
}

export function buscarMedicoPorId(req: Request, res: Response) {
    return res.status(200).json(medicoService.buscarPorId(Number(req.params.id)));
}

export function criarMedico(req: Request, res: Response) {
    return res.status(201).json(medicoService.criar(req.body));
}

export function atualizarMedico(req: Request, res: Response) {
    return res.status(200).json(medicoService.atualizar(Number(req.params.id), req.body));
}

export function excluirMedico(req: Request, res: Response) {
    medicoService.excluir(Number(req.params.id));
    return res.status(204).send();
}
