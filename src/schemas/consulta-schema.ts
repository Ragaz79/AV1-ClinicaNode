import { z } from 'zod';

export const consultaInputSchema = z.object({
    
    pacienteId: z.number({ error: 'O id do paciente é obrigatório e deve ser um número'})
        .int("O id do paciente deve ser um número inteiro")
        .positive("O id do paciente deve ser positivo"),
    medicoId: z
        .number({ error: "O id do médico é obrigatório e deve ser um número" })
        .int("O id do médico deve ser um número inteiro")
        .positive("O id do médico deve ser positivo"),
    dataConsulta: z
        .iso.date({ error: "Informe uma data no formato AAAA-MM-DD" }),
    horaInicio: z
        .iso.time({ precision: -1, error: "Informe a hora de início no formato HH:MM" }),
    horaFim: z
        .iso.time({ precision: -1, error: "Informe a hora de fim no formato HH:MM" }),
    status: z
        .enum(["a", "r", "c"], { error: "O status deve ser a (agendada), r (realizada) ou c (cancelada)" })
        .default("a"),
});
    

export const consultaIdSchema = z.object({
    id: z.coerce.number({error: "O id deve ser um número"}).int("O id deve ser um número inteiro").positive("O id deve ser positivo")
});

export type ConsultaInput = z.infer<typeof consultaInputSchema>;