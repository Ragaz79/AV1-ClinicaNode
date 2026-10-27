# Plano: app React Native (AV2)

Enunciado: app React Native + API em Node.js, com 4 CRUDs (pelo menos uma relação entre eles), validação com Zod e autenticação com JWT. Todos do grupo apresentam.

## Situação dos requisitos

| Requisito | Situação |
|---|---|
| API em Node.js | Pronta (Express + TypeScript + SQLite) |
| 4 CRUDs | Pacientes, médicos, consultas e usuários, com GET, GET/{id}, POST, PUT e DELETE |
| Pelo menos uma relação | Consulta → paciente, consulta → médico e consulta → usuário (quem agendou) |
| Zod | Os 4 CRUDs têm schema em `src/schemas/` e usam o `validar` nas rotas |
| Autenticação com JWT | **Falta** (seção "Antes do app") |
| App em React Native | **Falta** (este plano) |
| Todos apresentam | Cada pessoa precisa saber explicar a sua parte |

Também falta: commit e merge do CRUD de usuários na `master` e um README com os passos para rodar a API e o app.

## Antes do app: JWT na API

1. `npm install jsonwebtoken` e `npm install -D @types/jsonwebtoken`.
2. Chave secreta no `.env` (`JWT_SECRET=...`), que já está no `.gitignore`. Criar um `.env.example` com o nome da variável e sem o valor real, para o grupo saber o que preencher.
3. Rota `POST /auth/login`: recebe email e senha (validados pelo Zod), confere a senha com `bcrypt.compareSync` e devolve `{ token, usuario }`. O token leva só o id do usuário e expira (por exemplo, em 8 horas).
4. Middleware `autenticar`: lê o cabeçalho `Authorization: Bearer <token>`, confere com `jwt.verify` e guarda o id em `req.usuarioId`. Sem token ou com token inválido: 401.
5. Proteger `/pacientes`, `/medicos`, `/consultas` e `/usuarios` com o middleware.
6. No `POST /consultas`, passar o `req.usuarioId` para o service, que já grava quem agendou.
7. Swagger: configurar o esquema `bearerAuth`, para o botão "Authorize" do `/docs` mandar o token nos testes.
8. Decidir como nasce o primeiro usuário, já que as rotas vão exigir login: deixar o `POST /usuarios` aberto (cadastro) ou criar um usuário inicial quando a API sobe, a partir do `.env`.

## O app

**TypeScript:** o template padrão do Expo já vem em TypeScript, e assim os tipos do app (`Paciente`, `Medico`...) ficam iguais aos models da API.

**Ferramentas**
- **Expo**, para rodar no celular pelo app Expo Go, sem Android Studio. Criar dentro do repositório: `npx create-expo-app@latest mobile`.
- **Expo Router** (já vem no template), para as telas e a navegação.
- **`fetch`**, para chamar a API, dentro de um arquivo `api.ts` que coloca o endereço da API e o token em toda requisição.
- **`expo-secure-store`**, para guardar o token no celular de forma segura.

**Endereço da API:** no celular, `localhost` é o próprio celular.
- Celular de verdade: usar o IP do PC na rede (`ipconfig`), com o PC e o celular na mesma rede Wi-Fi e a porta 3000 liberada no firewall.
- Emulador de Android: `http://10.0.2.2:3000`.
- Rodando o app no navegador (Expo web): a API precisa do pacote `cors`.

**Estrutura**

```
mobile/
  app/
    _layout.tsx            sem token, vai para o login
    login.tsx
    (abas)/_layout.tsx     abas: Pacientes, Médicos, Consultas e Usuários
    (abas)/pacientes/index.tsx   lista
    (abas)/pacientes/[id].tsx    formulário: cria (id "novo") ou edita
    ...uma pasta igual para cada CRUD
  src/
    api.ts                 fetch + endereço da API + token; 401 volta para o login
    auth.tsx               guarda o token e oferece entrar e sair
    tipos.ts               Paciente, Medico, Consulta e Usuario
```

**Telas de cada CRUD**
- **Lista** (GET): puxar para atualizar, botão "Novo" e toque no item para editar.
- **Formulário** (POST para criar, PUT para editar): mostra embaixo de cada campo os erros que o Zod devolve no 400 e, num alerta, as mensagens de 404 e 409.
- **Excluir** (DELETE): pede confirmação antes.
- **Consultas:** escolha de paciente e de médico a partir das listas da API, campos de data (`AAAA-MM-DD`) e hora (`HH:MM`), status, e na lista os nomes no lugar dos ids. O formulário de edição precisa mandar sempre o status atual.
- **Usuários:** a senha é obrigatória para criar e opcional para editar.

## Ordem sugerida

1. JWT na API, testado pelo `/docs`.
2. Criar o projeto Expo, o `api.ts`, o login e as abas.
3. Tela de pacientes completa, que serve de modelo.
4. Médicos e usuários, copiando o modelo de pacientes.
5. Consultas por último, por causa da escolha de paciente e médico.
6. Testar no celular e no emulador, e escrever o README.

Divisão possível no grupo: uma pessoa cuida da base (login, `api.ts` e abas) e cada outra fica com as telas de um CRUD, a mesma divisão da AV1.
