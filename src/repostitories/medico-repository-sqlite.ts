import { db } from "../database/db";
import { Medico } from "../models/medico";
import { MedicoInput } from "../schemas/medico-schema";
import { MedicoRepository } from "./medico-repository";

function mapearMedico(registro: Record<string, unknown>): Medico {
    return {
        id: Number(registro.id),
        nome: String(registro.nome),
        crm: String(registro.crm),
        especialidade: String(registro.especialidade),
        dataNascimento: String(registro.dataNascimento),
        telefone: String(registro.telefone),
        cpf: String(registro.cpf),
        plantaoInicio: String(registro.plantaoInicio),
        plantaoFim: String(registro.plantaoFim),
        sexo: registro.sexo as Medico["sexo"]
    };
}

const SELECT_MEDICO = `
    SELECT
        MED_ID AS id,
        MED_NOME AS nome,
        MED_CRM AS crm,
        MED_ESPECIALIDADE AS especialidade,
        MED_DATANASCIMENTO AS dataNascimento,
        MED_TELEFONE AS telefone,
        MED_CPF AS cpf,
        MED_PLANTAOINICIO AS plantaoInicio,
        MED_PLANTAOFIM AS plantaoFim,
        MED_SEXO AS sexo
    FROM MEDICO`;

export class MedicoRepositorySqlite implements MedicoRepository {
    listar(): Medico[] {
        const medicos = db.prepare(`${SELECT_MEDICO} ORDER BY MED_NOME`).all();
        return medicos.map(mapearMedico);
    }

    buscarPorId(id: number): Medico | null {
        const medico = db.prepare(`${SELECT_MEDICO} WHERE MED_ID = ?`).get(id);
        return medico ? mapearMedico(medico) : null;
    }

    buscarPorCrm(crm: string): Medico | null {
        const medico = db.prepare(`${SELECT_MEDICO} WHERE MED_CRM = ?`).get(crm);
        return medico ? mapearMedico(medico) : null;
    }

    buscarPorCpf(cpf: string): Medico | null {
        const medico = db.prepare(`${SELECT_MEDICO} WHERE MED_CPF = ?`).get(cpf);
        return medico ? mapearMedico(medico) : null;
    }

    possuiConsultas(id: number): boolean {
        return db.prepare("SELECT 1 FROM CONSULTA WHERE CON_MED_ID = ? LIMIT 1").get(id) !== undefined;
    }

    criar(dados: MedicoInput): Medico {
        const resultado = db.prepare(`
            INSERT INTO MEDICO (
                MED_NOME, MED_CRM, MED_ESPECIALIDADE, MED_DATANASCIMENTO,
                MED_TELEFONE, MED_CPF, MED_PLANTAOINICIO, MED_PLANTAOFIM, MED_SEXO
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            dados.nome,
            dados.crm,
            dados.especialidade,
            dados.dataNascimento,
            dados.telefone,
            dados.cpf,
            dados.plantaoInicio,
            dados.plantaoFim,
            dados.sexo
        );

        const medico = this.buscarPorId(Number(resultado.lastInsertRowid));
        if (!medico) throw new Error("Erro ao criar médico");
        return medico;
    }

    atualizar(id: number, dados: MedicoInput): Medico {
        db.prepare(`
            UPDATE MEDICO
            SET MED_NOME = ?,
                MED_CRM = ?,
                MED_ESPECIALIDADE = ?,
                MED_DATANASCIMENTO = ?,
                MED_TELEFONE = ?,
                MED_CPF = ?,
                MED_PLANTAOINICIO = ?,
                MED_PLANTAOFIM = ?,
                MED_SEXO = ?
            WHERE MED_ID = ?
        `).run(
            dados.nome,
            dados.crm,
            dados.especialidade,
            dados.dataNascimento,
            dados.telefone,
            dados.cpf,
            dados.plantaoInicio,
            dados.plantaoFim,
            dados.sexo,
            id
        );

        const medico = this.buscarPorId(id);
        if (!medico) throw new Error("Médico não encontrado");
        return medico;
    }

    excluir(id: number): void {
        db.prepare("DELETE FROM MEDICO WHERE MED_ID = ?").run(id);
    }
}
