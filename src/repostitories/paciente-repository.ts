import { Paciente } from "../models/paciente";
import { PacienteInput } from "../schemas/paciente-schema";

export interface PacienteRepository {
    listar(nome?: string): Promise<Paciente[]>;
    buscarPorId(id: number) : Promise<Paciente | null>;
    buscarPorCpf(cpf: string) :Promise<Paciente | null>;
    criar(dados: PacienteInput) : Promise<Paciente>;
    atualizar(id: number, dados: PacienteInput) : Promise<Paciente>;
    excluir(id:number) : Promise<void>;

}