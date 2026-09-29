import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync(path.resolve(process.cwd(), "clinica.db"));

// O SQLite vem com as chaves estrangeiras desligadas.
db.exec("PRAGMA foreign_keys = ON");

// Cria as tabelas que ainda não existem.
db.exec(fs.readFileSync(path.resolve(process.cwd(), "src/database/schema.sql"), "utf8"));
