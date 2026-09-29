export interface Consulta {
    id: number;
    pacienteId: number;
    medicoId: number;
    dataConsulta: string;
    horaInicio: string;
    horaFim: string;
    status: "a" | "r" | "c";
}