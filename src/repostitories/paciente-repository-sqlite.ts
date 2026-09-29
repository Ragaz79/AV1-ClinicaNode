import { db } from "../database/db";
import { Paciente } from "../models/paciente";
import { PacienteInput } from "../schemas/paciente-schema";
import { PacienteRepository } from "./paciente-repository";

export class PacienteRepositorySqlite implements PacienteRepository {

    listar(nome?: string): Paciente[] {

        if (nome) {
            return db.prepare(`
                SELECT
                    PAC_ID AS id,
                    PAC_NOME AS nome,
                    PAC_CPF AS cpf,
                    PAC_TELEFONE AS telefone,
                    PAC_DATANASCIMENTO AS dataNascimento,
                    PAC_SEXO AS sexo
                FROM PACIENTE
                WHERE PAC_NOME LIKE ?
            `).all(`%${nome}%`) as Paciente[];
        }

        return db.prepare(`
            SELECT
                PAC_ID AS id,
                PAC_NOME AS nome,
                PAC_CPF AS cpf,
                PAC_TELEFONE AS telefone,
                PAC_DATANASCIMENTO AS dataNascimento,
                PAC_SEXO AS sexo
            FROM PACIENTE
        `).all() as Paciente[];
    }


    buscarPorId(id: number): Paciente | null {

        const paciente = db.prepare(`
            SELECT
                PAC_ID AS id,
                PAC_NOME AS nome,
                PAC_CPF AS cpf,
                PAC_TELEFONE AS telefone,
                PAC_DATANASCIMENTO AS dataNascimento,
                PAC_SEXO AS sexo
            FROM PACIENTE
            WHERE PAC_ID = ?
        `).get(id) as Paciente | undefined;

        return paciente ?? null;
    }


    buscarPorCpf(cpf: string): Paciente | null {

        const paciente = db.prepare(`
            SELECT
                PAC_ID AS id,
                PAC_NOME AS nome,
                PAC_CPF AS cpf,
                PAC_TELEFONE AS telefone,
                PAC_DATANASCIMENTO AS dataNascimento,
                PAC_SEXO AS sexo
            FROM PACIENTE
            WHERE PAC_CPF = ?
        `).get(cpf) as Paciente | undefined;

        return paciente ?? null;
    }


    criar(dados: PacienteInput): Paciente {

        const resultado = db.prepare(`
            INSERT INTO PACIENTE (
                PAC_NOME,
                PAC_CPF,
                PAC_TELEFONE,
                PAC_DATANASCIMENTO,
                PAC_SEXO
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            dados.nome,
            dados.cpf,
            dados.telefone,
            dados.dataNascimento,
            dados.sexo
        );

        const paciente = this.buscarPorId(
            Number(resultado.lastInsertRowid)
        );

        if (!paciente) {
            throw new Error("Erro ao criar paciente");
        }

        return paciente;
    }


    atualizar(id: number, dados: PacienteInput): Paciente {

        db.prepare(`
            UPDATE PACIENTE
            SET
                PAC_NOME = ?,
                PAC_CPF = ?,
                PAC_TELEFONE = ?,
                PAC_DATANASCIMENTO = ?,
                PAC_SEXO = ?
            WHERE PAC_ID = ?
        `).run(
            dados.nome,
            dados.cpf,
            dados.telefone,
            dados.dataNascimento,
            dados.sexo,
            id
        );

        const paciente = this.buscarPorId(id);

        if (!paciente) {
            throw new Error("Paciente não encontrado");
        }

        return paciente;
    }


    excluir(id: number): void {

        db.prepare(`
            DELETE FROM PACIENTE
            WHERE PAC_ID = ?
        `).run(id);
    }
}