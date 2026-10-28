export interface Paciente {
    id: number;
    nome: string;
    cpf: string;
    telefone: string;
    dataNascimento: string;
    sexo: "M" | "F";
}

export interface Medico {
    id: number;
    nome: string;
    crm: string;
    especialidade: string;
    dataNascimento: string;
    telefone: string;
    cpf: string;
    plantaoInicio: string;
    plantaoFim: string;
    sexo: "m" | "f";
}

export interface Consulta {
    id: number;
    pacienteId: number;
    medicoId: number;
    dataConsulta: string;
    horaInicio: string;
    horaFim: string;
    status: "a" | "r" | "c";
    usuarioId: number | null;
}

export interface Usuario {
    id: number;
    nome: string;
    email: string;
}

export interface LoginResponse {
    token: string;
    usuario: Usuario;
}

export interface ApiValidationError {
    campo: string;
    mensagem: string;
}

