import da from "zod/v4/locales/da.js";
import { AppError } from "../errors/app-error"; 
import { PacienteRepository } from "../repostitories/paciente-repository";  
import { PacienteInput } from "../schemas/paciente-schema";

export class PacienteService {
    constructor (private readonly repository: PacienteRepository) {}

    listar(nome?: string){
        return this.repository.listar(nome);
    }
    buscarPorId(id: number) {
        const paciente = this.repository.buscarPorId(id);
        if (!paciente) throw new AppError("Paciente não encontrado",404);
        return paciente;
    }
    criar(dados: PacienteInput){
        if (this.repository.buscarPorCpf(dados.cpf)) {
            throw new AppError("CPF já cadastrado");            
        }
        return this.repository.criar(dados);
    }

    atualizar(id: number, dados: PacienteInput){
        this.buscarPorId(id);
        const mesmoCpf = this.repository.buscarPorCpf(dados.cpf);
        if (mesmoCpf && mesmoCpf.id === id){
            throw new AppError("CPF pertence a outro paciente", 409);
        }
        return this.repository.atualizar(id, dados);
    }
    excluir(id: number){
        this.buscarPorId(id);
        this.repository.excluir(id);

    }    
}

