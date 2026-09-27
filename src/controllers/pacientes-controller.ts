import { NextFunction, Request, Response } from "express";  
import { pacienteService } from "../container";

export function listarPacientes(req: Request, res: Response){
    const nome = req.query.nome?.toString();
    return res.status(200).json(pacienteService.listar(nome));
}

export function buscarPacientePorId(req: Request, res: Response){
    return res.status(200).json(pacienteService.buscarPorId(Number(req.params.id)));
}

export function criarPaciente(req: Request, res: Response){
    return res.status(201).json(pacienteService.criar(req.body));
}

export function atualizarPaciente(req: Request, res: Response){
    return res.status(200).json(
        pacienteService.atualizar(Number(req.params.id),req.body)
    );
}
export function excluirPaciente(req: Request, res: Response){
    pacienteService.excluir(Number(req.params.id));
    return res.status(204).send();
}