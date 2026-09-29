import { AppError } from "../errors/app-error";
import { ConsultaRepository } from "../repostitories/consulta-repository";
import { ConsultaInput } from "../schemas/consulta-schema";

export class ConsultaService {
    constructor (private readonly repository: ConsultaRepository) {}

    listar(){
        return this.repository.listar();
    }

    buscarPorId(id: number) {
        const consulta = this.repository.buscarPorId(id);
        if (!consulta) throw new AppError("Consulta não encontrada", 404);
        return consulta;
    }

    criar(dados: ConsultaInput){
        this.validarRegras(dados);
        return this.repository.criar(dados);
    }

    atualizar(id: number, dados: ConsultaInput){
        this.buscarPorId(id);
        this.validarRegras(dados, id);
        return this.repository.atualizar(id, dados);
    }

    excluir(id: number){
        this.buscarPorId(id);
        this.repository.excluir(id);
    }

    // Regras que valem para criar e para atualizar. No atualizar, o id da própria consulta não entra no choque de horário.
    private validarRegras(dados: ConsultaInput, ignorarId?: number) {
        if (dados.horaFim <= dados.horaInicio) {
            throw new AppError("A hora de fim deve ser depois da hora de início", 400);
        }
        if (!this.repository.pacienteExiste(dados.pacienteId)) {
            throw new AppError("Paciente não encontrado", 404);
        }
        if (!this.repository.medicoExiste(dados.medicoId)) {
            throw new AppError("Médico não encontrado", 404);
        }
        // Consulta cancelada não ocupa horário.
        if (dados.status !== "c") {
            if (this.repository.medicoOcupado(dados, ignorarId)) {
                throw new AppError("O médico já tem consulta nesse horário", 409);
            }
            if (this.repository.pacienteOcupado(dados, ignorarId)) {
                throw new AppError("O paciente já tem consulta nesse horário", 409);
            }
        }
    }
}
