import { Request, Response } from "express";
import { consultaService } from "../container";

export function listarConsultas(req: Request, res: Response){
    return res.status(200).json(consultaService.listar());
}

export function buscarConsultaPorId(req: Request, res: Response){
    return res.status(200).json(consultaService.buscarPorId(Number(req.params.id)));
}

export function criarConsulta(req: Request, res: Response){
    return res.status(201).json(consultaService.criar(req.body));
}

export function atualizarConsulta(req: Request, res: Response){
    return res.status(200).json(
        consultaService.atualizar(Number(req.params.id), req.body)
    );
}

export function excluirConsulta(req: Request, res: Response){
    consultaService.excluir(Number(req.params.id));
    return res.status(204).send();
}
