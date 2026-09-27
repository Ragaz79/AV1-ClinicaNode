import { z } from 'zod';

export const pacienteInputSchema = z.object({
    nome: z
        .string({ error: "O Nome é obrigatório" })
        .trim()
        .min(3, "O nome deve possuir no mínimo 3 caracteres")
        .max(100, "O nome deve possuir no máximo 100 caracters"),
    cpf: z
        .string({ error: "O campo cpf é obrigatório" })
        .regex(/^\d{11}$/, "O CPF deve possiuir 11 dígitos"),
    telefone: z
        .string({ error: "O campo telefone é obrigatório" })
        .trim()
        .min(8, "Por favor informe um telefone válido")
        .max(20, "O telefone deve possuir no máximo 20 caracteres"),
    dataNascimento: z
        .iso.date({ error: "Informe uma data no formato AAAA-MM-DD" })
        .refine(
            valor => new Date(`${valor}T00:00:00`) <= new Date(),
            "a data de nascinento não pode estar no futuro"
        )

});
export const pacienteIdSchema = z.object({
    id: z.coerce.number().int().positive("O id deve ser positivo")
});

export type PacienteInput = z.infer<typeof pacienteInputSchema>;