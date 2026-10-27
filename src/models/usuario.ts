// A senha não faz parte do model: ela fica só no banco, como hash, e nunca sai nas respostas.
export interface Usuario {
    id: number;
    nome: string;
    email: string;
}
