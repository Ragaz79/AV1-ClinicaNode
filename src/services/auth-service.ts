import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { obterSegredoJwt } from "../config/auth";
import { AppError } from "../errors/app-error";
import { UsuarioRepository } from "../repostitories/usuario-repository";
import { LoginInput } from "../schemas/usuario-schema";

export class AuthService {
    constructor(private readonly repository: UsuarioRepository) {}

    login(dados: LoginInput) {
        const credenciais = this.repository.buscarCredenciaisPorEmail(dados.email);
        if (!credenciais || !bcrypt.compareSync(dados.senha, credenciais.senhaHash)) {
            throw new AppError("Email ou senha invalidos", 401);
        }

        const usuario = {
            id: credenciais.id,
            nome: credenciais.nome,
            email: credenciais.email
        };
        const token = jwt.sign(
            { nome: usuario.nome, email: usuario.email },
            obterSegredoJwt(),
            { subject: String(usuario.id), expiresIn: "8h" }
        );

        return { token, usuario };
    }
}
