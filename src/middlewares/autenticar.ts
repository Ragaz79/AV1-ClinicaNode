import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { obterSegredoJwt } from "../config/auth";

export const autenticar: RequestHandler = (request, response, next) => {
    const [tipo, token] = request.headers.authorization?.split(" ") ?? [];
    if (tipo !== "Bearer" || !token) {
        response.status(401).json({ mensagem: "Token de autenticacao nao informado" });
        return;
    }

    try {
        const payload = jwt.verify(token, obterSegredoJwt());
        if (typeof payload === "string" || !payload.sub) {
            throw new Error("Token sem usuario");
        }

        request.usuarioId = Number(payload.sub);
        next();
    } catch {
        response.status(401).json({ mensagem: "Token invalido ou expirado" });
    }
};
