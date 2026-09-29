import { db } from "../database/db";
import { Consulta } from "../models/consulta";
import { ConsultaInput } from "../schemas/consulta-schema";
import { ConsultaRepository } from "./consulta-repository";

function mapearConsulta(registro: Record<string, unknown>): Consulta {
    return {
        id: Number(registro.id),
        pacienteId: Number(registro.pacienteId),
        medicoId: Number(registro.medicoId),
        dataConsulta: String(registro.dataConsulta),
        horaInicio: String(registro.horaInicio),
        horaFim: String(registro.horaFim),
        status: registro.status as Consulta["status"]
    };
}

// Cada coluna do banco ganha, com AS, o nome que ela tem no TypeScript.
const SELECT_CONSULTA = `
    SELECT CON_ID           AS id,
           CON_PAC_ID       AS pacienteId,
           CON_MED_ID       AS medicoId,
           CON_DATACONSULTA AS dataConsulta,
           CON_HORAINICIO   AS horaInicio,
           CON_HORAFIM      AS horaFim,
           CON_STATUS       AS status
    FROM CONSULTA`;

export class ConsultaRepositorySqlite implements ConsultaRepository {

    listar(): Consulta[] {
        const consultas = db.prepare(SELECT_CONSULTA).all();
        return consultas.map(mapearConsulta);
    }

    buscarPorId(id: number): Consulta | undefined {
        const consulta = db.prepare(`${SELECT_CONSULTA} WHERE CON_ID = ?`).get(id);
        return consulta ? mapearConsulta(consulta) : undefined;
    }

    criar(dados: ConsultaInput): Consulta {
        const resultado = db.prepare(`
            INSERT INTO CONSULTA (CON_PAC_ID, CON_MED_ID, CON_DATACONSULTA, CON_HORAINICIO, CON_HORAFIM, CON_STATUS)
            VALUES (@pacienteId, @medicoId, @dataConsulta, @horaInicio, @horaFim, @status)
        `).run(this.campos(dados));
        const consulta = this.buscarPorId(Number(resultado.lastInsertRowid));
        if (!consulta) throw new Error("Erro ao criar consulta");
        return consulta;
    }

    atualizar(id: number, dados: ConsultaInput): Consulta | undefined {
        const resultado = db.prepare(`
            UPDATE CONSULTA
            SET CON_PAC_ID       = @pacienteId,
                CON_MED_ID       = @medicoId,
                CON_DATACONSULTA = @dataConsulta,
                CON_HORAINICIO   = @horaInicio,
                CON_HORAFIM      = @horaFim,
                CON_STATUS       = @status
            WHERE CON_ID = @id
        `).run({ ...this.campos(dados), id });
        if (resultado.changes === 0) return undefined;
        return this.buscarPorId(id);
    }

    excluir(id: number): boolean {
        const resultado = db.prepare("DELETE FROM CONSULTA WHERE CON_ID = ?").run(id);
        return resultado.changes > 0;
    }

    pacienteExiste(id: number): boolean {
        return db.prepare("SELECT 1 FROM PACIENTE WHERE PAC_ID = ?").get(id) !== undefined;
    }

    medicoExiste(id: number): boolean {
        return db.prepare("SELECT 1 FROM MEDICO WHERE MED_ID = ?").get(id) !== undefined;
    }

    // Duas consultas se chocam quando uma começa antes de a outra terminar e termina depois de a outra começar.
    medicoOcupado(dados: ConsultaInput, ignorarId?: number): boolean {
        return db.prepare(`
            SELECT 1 FROM CONSULTA
            WHERE CON_MED_ID = @medicoId
              AND CON_DATACONSULTA = @dataConsulta
              AND CON_STATUS <> 'c'
              AND CON_HORAINICIO < @horaFim
              AND CON_HORAFIM > @horaInicio
              AND CON_ID <> @ignorarId
        `).get({
            medicoId: dados.medicoId,
            dataConsulta: dados.dataConsulta,
            horaInicio: dados.horaInicio,
            horaFim: dados.horaFim,
            ignorarId: ignorarId ?? 0
        }) !== undefined;
    }

    pacienteOcupado(dados: ConsultaInput, ignorarId?: number): boolean {
        return db.prepare(`
            SELECT 1 FROM CONSULTA
            WHERE CON_PAC_ID = @pacienteId
              AND CON_DATACONSULTA = @dataConsulta
              AND CON_STATUS <> 'c'
              AND CON_HORAINICIO < @horaFim
              AND CON_HORAFIM > @horaInicio
              AND CON_ID <> @ignorarId
        `).get({
            pacienteId: dados.pacienteId,
            dataConsulta: dados.dataConsulta,
            horaInicio: dados.horaInicio,
            horaFim: dados.horaFim,
            ignorarId: ignorarId ?? 0
        }) !== undefined;
    }

    // Só os campos que o INSERT e o UPDATE usam: o node:sqlite dá erro se o objeto tiver chave a mais.
    private campos(dados: ConsultaInput) {
        return {
            pacienteId: dados.pacienteId,
            medicoId: dados.medicoId,
            dataConsulta: dados.dataConsulta,
            horaInicio: dados.horaInicio,
            horaFim: dados.horaFim,
            status: dados.status
        };
    }
}
