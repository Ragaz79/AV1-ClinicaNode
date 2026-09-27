import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

type Origem = "body" | "params" | "query";

export function validar(schema: ZodType, origem: Origem){
    return (request: Request, response: Response, next: NextFunction) =>{
        const resultado = schema.safeParse(request[origem]);
        if (!resultado.success){
            return response.status(400).json({
                mensagem: "Dados inválidos",
                erros: resultado.error.issues.map(erro => ({
                    campo: erro.path.join("."),
                    mensagem: erro.message
                }))
            })
        }

        Object.assign(request[origem], resultado.data);
        return next();
    }
}