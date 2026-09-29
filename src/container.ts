import { PacienteRepositorySqlite } from "./repostitories/paciente-repository-sqlite";
import { PacienteService } from "./services/paciente-service";
import { ConsultaRepositorySqlite } from "./repostitories/consulta-repository-sqlite";        
import { ConsultaService } from "./services/consulta-service";


const pacienteRepository = new PacienteRepositorySqlite();
export const pacienteService = new PacienteService(pacienteRepository);
const consultaRepository = new ConsultaRepositorySqlite();
export const consultaService = new ConsultaService(consultaRepository);

