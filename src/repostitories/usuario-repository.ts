import { Usuario, UsuarioCredenciais } from "../models/usuario";
import { UsuarioAtualizacao, UsuarioInput } from "../schemas/usuario-schema";

export interface UsuarioRepository {
    listar(): Usuario[];
    buscarPorId(id: number): Usuario | null;
    buscarPorEmail(email: string): Usuario | null;
    buscarCredenciaisPorEmail(email: string): UsuarioCredenciais | null;
    criar(dados: UsuarioInput): Usuario;
    atualizar(id: number, dados: UsuarioAtualizacao): Usuario;
    excluir(id: number): void;
}
