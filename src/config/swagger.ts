import swaggerJsdoc from "swagger-jsdoc";
import path from "node:path";
const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API da Clínica",
            version: "1.0.0",
            description: "API desenvolvida nas aulas de Node.js"
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Ambiente de desenvolvimento"
            }
        ],
        tags: [
            {
                name: "Pacientes",
                description: "Operações relacionadas aos pacientes"
            }
        ],
        components: {
            schemas: {
                Paciente: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        nome: { type: "string", example: "Maria Silva" },
                        cpf: { type: "string", example: "11111111111" },
                        telefone: { type: "string", example: "21999990001" },
                        dataNascimento: {
                            type: "string",
                            format: "date",
                            example: "1990-05-10"
                        }
                    }
                },
                PacienteInput: {
                    type: "object",
                    required: ["nome", "cpf", "telefone", "dataNascimento"],
                    properties: {
                        nome: { type: "string", example: "Ana Oliveira" },
                        cpf: { type: "string", example: "33333333333" },
                        telefone: { type: "string", example: "21999990003" },
                        dataNascimento: {


                            type: "string",
                            format: "date",
                            example: "1995-08-15"
                        }
                    }
                },
                MensagemErro: {
                    type: "object",
                    properties: {
                        mensagem: {
                            type: "string",
                            example: "Paciente não encontrado"
                        }
                    }
                }
            }
        }
    },
     apis: [
    path.resolve(process.cwd(), "src/routes/*.ts"),
    path.resolve(process.cwd(), "dist/routes/*.js")
  ]
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
export { swaggerSpec };