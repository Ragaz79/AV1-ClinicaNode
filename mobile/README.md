# Aplicativo mobile da Clinica

Aplicativo Expo + React Native + TypeScript conectado a API Node.js da raiz do repositorio.

## Preparado no codigo

- login e criacao do primeiro acesso;
- armazenamento seguro do JWT;
- envio automatico do Bearer token;
- logout e tratamento de sessao expirada;
- CRUD de pacientes;
- CRUD de medicos;
- CRUD de consultas com selecao de paciente e medico;
- CRUD de usuarios.

## Configuracao

Antes de executar, crie o arquivo `.env` a partir de `.env.example` e informe o IP do computador que executa a API:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

O celular e o computador precisam estar na mesma rede. As dependencias ainda precisam ser instaladas antes do primeiro teste.

