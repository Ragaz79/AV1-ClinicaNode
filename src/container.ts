import { PacienteRepositoryMemoria } from "./repostitories/paciente-repository-memoria";        
import { PacienteService } from "./services/paciente-service";
import { ConsultaRepositorySqlite } from "./repostitories/consulta-repository-sqlite";        
import { ConsultaService } from "./services/consulta-service";

const pacienteRepository = new PacienteRepositoryMemoria();
export const pacienteService = new PacienteService(pacienteRepository);
const consultaRepository = new ConsultaRepositorySqlite();
export const consultaService = new ConsultaService(consultaRepository);

