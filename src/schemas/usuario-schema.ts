import { z } from "zod";

export const usuarioInputSchema = z.object({
    nome: z
        .string({ error: "Informe o nome do usuário" })
        .trim()
        .min(3, "O nome deve ter pelo menos 3 caracteres")
        .max(100, "O nome deve ter no máximo 100 caracteres"),
    // Guarda o email sempre sem espaços e em minúsculo, para "Ana@x.com" e "ana@x.com" serem o mesmo.
    email: z
        .string({ error: "Informe o email" })
        .trim()
        .toLowerCase()
        .pipe(z.email({ error: "Informe um email válido" }).max(100, "O email deve ter no máximo 100 caracteres")),
    // O bcrypt só usa os primeiros 72 caracteres da senha.
    senha: z
        .string({ error: "Informe a senha" })
        .min(6, "A senha deve ter pelo menos 6 caracteres")
        .max(72, "A senha deve ter no máximo 72 caracteres")
});

// No PUT a senha é opcional: se não vier, a senha atual continua valendo.
export const usuarioAtualizacaoSchema = usuarioInputSchema.partial({ senha: true });

export const usuarioIdSchema = z.object({
    id: z.coerce
        .number({ error: "O id deve ser um número" })
        .int("O id deve ser um número inteiro")
        .positive("O id deve ser positivo")
});

export type UsuarioInput = z.infer<typeof usuarioInputSchema>;
export type UsuarioAtualizacao = z.infer<typeof usuarioAtualizacaoSchema>;
