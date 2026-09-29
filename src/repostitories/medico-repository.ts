import { Medico } from "../models/medico";
import { MedicoInput } from "../schemas/medico-schema";

export interface MedicoRepository {
    listar(): Medico[];
    buscarPorId(id: number): Medico | null;
    buscarPorCrm(crm: string): Medico | null;
    buscarPorCpf(cpf: string): Medico | null;
    possuiConsultas(id: number): boolean;
    criar(dados: MedicoInput): Medico;
    atualizar(id: number, dados: MedicoInput): Medico;
    excluir(id: number): void;
}
