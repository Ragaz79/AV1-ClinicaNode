import swaggerJsdoc from "swagger-jsdoc";
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
            },
            {
                name: "Consultas",
                description: "Agendamento de consultas"
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
                Consulta: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        pacienteId: { type: "integer", example: 1 },
                        medicoId: { type: "integer", example: 2 },
                        dataConsulta: { type: "string", format: "date", example: "2026-10-05" },
                        horaInicio: { type: "string", example: "10:00" },
                        horaFim: { type: "string", example: "10:30" },
                        status: { type: "string", enum: ["a", "r", "c"], example: "a" }
                    }
                },
                ConsultaInput: {
                    type: "object",
                    required: ["pacienteId", "medicoId", "dataConsulta", "horaInicio", "horaFim"],
                    properties: {
                        pacienteId: { type: "integer", example: 1 },
                        medicoId: { type: "integer", example: 2 },
                        dataConsulta: { type: "string", format: "date", example: "2026-10-05" },
                        horaInicio: { type: "string", example: "10:00" },
                        horaFim: { type: "string", example: "10:30" },
                        status: {
                            type: "string",
                            enum: ["a", "r", "c"],
                            example: "a",
                            description: "a = agendada, r = realizada, c = cancelada. Se não for enviado, começa como a."
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
    "./src/routes/*.ts",
    "./dist/routes/*.js"
  ]
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
export { swaggerSpec };