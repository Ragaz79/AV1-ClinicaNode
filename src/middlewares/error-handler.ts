import { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error";

export const erroHandler : ErrorRequestHandler = (

    error, request, response, next 
) => {
    if (error instanceof AppError){
        response.status(error.statusCode).json({mensagem: error.message})
        return;
    }
    console.log(error);
    response.status(500).json({mensagem: "Erro interno de servidor"})
}