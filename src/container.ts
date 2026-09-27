import { PacienteRepositoryMemoria } from "./repostitories/paciente-repository-memoria";        
import { PacienteService } from "./services/paciente-service";
const pacienteRepository = new PacienteRepositoryMemoria();
export const pacienteService = new PacienteService(pacienteRepository);

