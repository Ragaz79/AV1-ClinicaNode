import { Request, Response } from "express";
import { authService, usuarioService } from "../container";

export function login(request: Request, response: Response) {
    return response.status(200).json(authService.login(request.body));
}

export function usuarioAutenticado(request: Request, response: Response) {
    return response.status(200).json(usuarioService.buscarPorId(request.usuarioId!));
}
