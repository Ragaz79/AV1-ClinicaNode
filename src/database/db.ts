import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync(path.resolve(process.cwd(), "clinica.db"));

// O SQLite vem com as chaves estrangeiras desligadas.
db.exec("PRAGMA foreign_keys = ON");

// Cria as tabelas que ainda não existem.
db.exec(fs.readFileSync(path.resolve(process.cwd(), "src/database/schema.sql"), "utf8"));

// O CREATE TABLE IF NOT EXISTS não mexe em tabela que já existe: bancos criados antes do
// CON_USU_ID ganham a coluna aqui, sem precisar apagar o clinica.db.
const colunasConsulta = db.prepare("PRAGMA table_info(CONSULTA)").all();
if (!colunasConsulta.some(coluna => coluna.name === "CON_USU_ID")) {
    db.exec("ALTER TABLE CONSULTA ADD COLUMN CON_USU_ID INTEGER REFERENCES USUARIO (USU_ID) ON DELETE SET NULL");
}
