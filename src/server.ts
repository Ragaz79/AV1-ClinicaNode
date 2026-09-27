import { app } from "./app";
const porta = 3000;
app.listen(porta,() => {
    console.log(`servidor rodando em http://localhost:${porta}`);
    console.log(`Swagger em http://localhost:${porta}/docs`);
});