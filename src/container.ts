import { PacienteRepositorySqlite } from "./repostitories/paciente-repository-sqlite";
import { PacienteService } from "./services/paciente-service";

const pacienteRepository = new PacienteRepositorySqlite();

export const pacienteService = new PacienteService(pacienteRepository);

