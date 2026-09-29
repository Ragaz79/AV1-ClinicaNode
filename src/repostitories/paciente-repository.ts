import { Paciente } from "../models/paciente";
import { PacienteInput } from "../schemas/paciente-schema";

export interface PacienteRepository {
    listar(nome?: string): Paciente[];
    buscarPorId(id: number): Paciente | null;
    buscarPorCpf(cpf: string): Paciente | null;
    criar(dados: PacienteInput): Paciente;
    atualizar(id: number, dados: PacienteInput): Paciente;
    excluir(id: number): void;

}