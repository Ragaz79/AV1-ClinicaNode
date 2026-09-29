import { Consulta } from "../models/consulta";
import { ConsultaInput } from "../schemas/consulta-schema";

export interface ConsultaRepository {
    listar(): Consulta[];
    buscarPorId(id: number): Consulta | undefined;
    criar(dados: ConsultaInput): Consulta;
    atualizar(id: number, dados: ConsultaInput): Consulta | undefined;
    excluir(id: number): boolean;

    pacienteExiste(id: number): boolean;
    medicoExiste(id: number): boolean;
    medicoOcupado(dados: ConsultaInput, ignorarId?: number): boolean;
    pacienteOcupado(dados: ConsultaInput, ignorarId?: number): boolean;
}
