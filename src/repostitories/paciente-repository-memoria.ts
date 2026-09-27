import { object } from "zod";
import { Paciente } from "../models/paciente";
import { PacienteInput } from "../schemas/paciente-schema";
import { PacienteRepository } from "./paciente-repository";
import tr from "zod/v4/locales/tr.js";

export class PacienteRepositoryMemoria implements PacienteRepository {

    private proximoId = 3;
    private pacientes: Paciente[] = [
        {
            id: 1,
            nome: "João das neves",
            cpf: "03525856969",
            telefone: "24999988555",
            dataNascimento: "1990-10-04"
        },
        {
            id: 2,
            nome: "Daynerys Targarian",
            cpf: "52569852159",
            telefone: "2485412555",
            dataNascimento: "1988-11-30"
        }
    ];

    listar(nome?: string): Paciente[] {
        if (!nome) return [...this.pacientes];
        return this.pacientes.filter(paciente => paciente.nome.toLowerCase()
            .includes(nome.toLowerCase()))
    }

    buscarPorId(id: number): Paciente | undefined {
        return this.pacientes.find(paciente => paciente.id === id);
    }
    buscarPorCpf(cpf: string): Paciente | undefined {
        return this.pacientes.find(paciente => paciente.cpf === cpf);
    }
    criar(dados: PacienteInput): Paciente {

        const paciente = { id: this.proximoId++, ...dados }
        this.pacientes.push(paciente);
        return paciente;
    }
    atualizar(id: number, dados: PacienteInput): Paciente | undefined {
        const paciente = this.buscarPorId(id);
        if(!paciente) return undefined;
        Object.assign(paciente, dados);
        return paciente;
    }

    excluir(id: number): boolean {
        const indice = this.pacientes.findIndex(paciente => paciente.id === id);
        if (indice === -1) return false;
        this.pacientes.splice(indice, 1);
        return true;

    }

}
