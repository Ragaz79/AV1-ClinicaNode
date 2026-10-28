export function obterSegredoJwt(): string {
    const segredo = process.env.JWT_SECRET;
    if (!segredo) {
        throw new Error("A variavel JWT_SECRET nao foi configurada");
    }
    return segredo;
}
