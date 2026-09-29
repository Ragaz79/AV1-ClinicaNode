import { Paciente } from "../models/paciente";
import { PacienteInput } from "../schemas/paciente-schema";
import { PacienteRepository } from "./paciente-repository";

export class PacienteRepositoryMemoria implements PacienteRepository {

    private proximoId = 1;

    private pacientes: Paciente[] = [];

    listar(nome?: string): Paciente[] {
        if (!nome) return [...this.pacientes];

        return this.pacientes.filter(paciente =>
            paciente.nome
                .toLowerCase()
                .includes(nome.toLowerCase())
        );
    }

    buscarPorId(id: number): Paciente | null {
        return this.pacientes.find(paciente => paciente.id === id) ?? null;
    }
    buscarPorCpf(cpf: string): Paciente | null {
        return this.pacientes.find(paciente => paciente.cpf === cpf) ?? null;
    }
    criar(dados: PacienteInput): Paciente {

        const paciente = { id: this.proximoId++, ...dados };
        this.pacientes.push(paciente);
        return paciente;
    }
    atualizar(id: number, dados: PacienteInput): Paciente {
        const paciente = this.buscarPorId(id);
        if (!paciente) throw new Error("Paciente não encontrado");
        Object.assign(paciente, dados);
        return paciente;
    }

    excluir(id: number): void {
        const indice = this.pacientes.findIndex(paciente => paciente.id === id);
        if (indice === -1) return;
        this.pacientes.splice(indice, 1);
    }
}
