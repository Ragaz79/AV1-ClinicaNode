import { Request, Response } from "express";
import { usuarioService } from "../container";

export function listarUsuarios(req: Request, res: Response){
    return res.status(200).json(usuarioService.listar());
}

export function buscarUsuarioPorId(req: Request, res: Response){
    return res.status(200).json(usuarioService.buscarPorId(Number(req.params.id)));
}

export function criarUsuario(req: Request, res: Response){
    return res.status(201).json(usuarioService.criar(req.body));
}

export function atualizarUsuario(req: Request, res: Response){
    return res.status(200).json(
        usuarioService.atualizar(Number(req.params.id), req.body)
    );
}

export function excluirUsuario(req: Request, res: Response){
    usuarioService.excluir(Number(req.params.id));
    return res.status(204).send();
}
