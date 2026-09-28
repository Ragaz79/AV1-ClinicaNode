import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export const db = new Database(path.resolve(process.cwd(), "clinica.db"));

// O SQLite vem com as chaves estrangeiras desligadas.
db.pragma("foreign_keys = ON");

// Cria as tabelas que ainda não existem.
db.exec(fs.readFileSync(path.resolve(process.cwd(), "src/database/schema.sql"), "utf8"));
