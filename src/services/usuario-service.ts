import { AppError } from "../errors/app-error";
import { UsuarioRepository } from "../repostitories/usuario-repository";
import { UsuarioAtualizacao, UsuarioInput } from "../schemas/usuario-schema";

export class UsuarioService {
    constructor(private readonly repository: UsuarioRepository) {}

    listar() {
        return this.repository.listar();
    }

    buscarPorId(id: number) {
        const usuario = this.repository.buscarPorId(id);
        if (!usuario) throw new AppError("Usuário não encontrado", 404);
        return usuario;
    }

    criar(dados: UsuarioInput) {
        if (this.repository.buscarPorEmail(dados.email)) {
            throw new AppError("Email já cadastrado", 409);
        }
        return this.repository.criar(dados);
    }

    atualizar(id: number, dados: UsuarioAtualizacao) {
        this.buscarPorId(id);
        const mesmoEmail = this.repository.buscarPorEmail(dados.email);
        if (mesmoEmail && mesmoEmail.id !== id) {
            throw new AppError("Email pertence a outro usuário", 409);
        }
        return this.repository.atualizar(id, dados);
    }

    // As consultas que o usuário agendou continuam: o banco só limpa o "agendada por" (ON DELETE SET NULL).
    excluir(id: number) {
        this.buscarPorId(id);
        this.repository.excluir(id);
    }
}
