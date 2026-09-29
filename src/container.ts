import { PacienteRepositorySqlite } from "./repostitories/paciente-repository-sqlite";
import { PacienteService } from "./services/paciente-service";
import { ConsultaRepositorySqlite } from "./repostitories/consulta-repository-sqlite";        
import { ConsultaService } from "./services/consulta-service";
import { MedicoRepositorySqlite } from "./repostitories/medico-repository-sqlite";
import { MedicoService } from "./services/medico-service";


const pacienteRepository = new PacienteRepositorySqlite();
export const pacienteService = new PacienteService(pacienteRepository);
const consultaRepository = new ConsultaRepositorySqlite();
export const consultaService = new ConsultaService(consultaRepository);
const medicoRepository = new MedicoRepositorySqlite();
export const medicoService = new MedicoService(medicoRepository);

