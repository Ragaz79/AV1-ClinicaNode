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
