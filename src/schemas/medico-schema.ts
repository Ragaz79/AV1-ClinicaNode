import { z } from "zod";

export const medicoInputSchema = z.object({
    nome: z.string({ error: "Informe o nome do médico" })
        .trim().min(3, "O nome deve ter pelo menos 3 caracteres")
        .max(100, "O nome deve ter no máximo 100 caracteres"),
    crm: z.string({ error: "Informe o CRM" })
        .trim().min(1, "Informe o CRM")
        .max(20, "O CRM deve ter no máximo 20 caracteres"),
    especialidade: z.string({ error: "Informe a especialidade" })
        .trim().min(1, "Informe a especialidade")
        .max(100, "A especialidade deve ter no máximo 100 caracteres"),
    dataNascimento: z.iso.date({ error: "Informe a data no formato AAAA-MM-DD" })
        .refine(data => new Date(`${data}T00:00:00`) <= new Date(), "A data de nascimento não pode estar no futuro"),
    telefone: z.string({ error: "Informe o telefone" })
        .trim().min(8, "Informe um telefone válido")
        .max(20, "O telefone deve ter no máximo 20 caracteres"),
    cpf: z.string({ error: "Informe o CPF" })
        .regex(/^\d{11}$/, "O CPF deve conter exatamente 11 números"),
    plantaoInicio: z.iso.time({ precision: -1, error: "Informe o início do plantão no formato HH:MM" }),
    plantaoFim: z.iso.time({ precision: -1, error: "Informe o fim do plantão no formato HH:MM" }),
    sexo: z.enum(["m", "f"], { error: "Selecione uma opção válida para sexo" })
}).refine(dados => dados.plantaoFim > dados.plantaoInicio, {
    path: ["plantaoFim"],
    message: "O fim do plantão deve ser posterior ao início"
});

export const medicoIdSchema = z.object({
    id: z.coerce.number().int("O ID deve ser um número inteiro").positive("O ID deve ser positivo")
});

export type MedicoInput = z.infer<typeof medicoInputSchema>;
