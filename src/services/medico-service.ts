import { AppError } from "../errors/app-error";
import { MedicoRepository } from "../repostitories/medico-repository";
import { MedicoInput } from "../schemas/medico-schema";

export class MedicoService {
    constructor(private readonly repository: MedicoRepository) {}

    listar() {
        return this.repository.listar();
    }

    buscarPorId(id: number) {
        const medico = this.repository.buscarPorId(id);
        if (!medico) throw new AppError("Médico não encontrado", 404);
        return medico;
    }

    criar(dados: MedicoInput) {
        if (this.repository.buscarPorCrm(dados.crm)) {
            throw new AppError("CRM já cadastrado", 409);
        }
        if (this.repository.buscarPorCpf(dados.cpf)) {
            throw new AppError("CPF já cadastrado", 409);
        }
        return this.repository.criar(dados);
    }

    atualizar(id: number, dados: MedicoInput) {
        this.buscarPorId(id);
        const mesmoCrm = this.repository.buscarPorCrm(dados.crm);
        if (mesmoCrm && mesmoCrm.id !== id) {
            throw new AppError("CRM pertence a outro médico", 409);
        }

        const mesmoCpf = this.repository.buscarPorCpf(dados.cpf);
        if (mesmoCpf && mesmoCpf.id !== id) {
            throw new AppError("CPF pertence a outro médico", 409);
        }
        return this.repository.atualizar(id, dados);
    }

    excluir(id: number) {
        this.buscarPorId(id);
        if (this.repository.possuiConsultas(id)) {
            throw new AppError("Este médico tem consultas vinculadas e não pode ser excluído", 409);
        }
        this.repository.excluir(id);
    }
}
