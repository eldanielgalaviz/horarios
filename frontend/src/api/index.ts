// Exportación de todos los servicios API para un acceso más fácil

import { authService } from './auth.service';
import { adminService } from './admin.service';
import { alumnoService } from './alumno.service';
import { maestroService } from './maestro.service';
import { checadorService } from './checador.service';
import { grupoService } from './grupo.service';
import { materiaService } from './materia.service';
import { salonService } from './salon.service';
import { horarioService } from './horario.service';
import { asistenciaService } from './asistencia.service';

export {
  authService,
  adminService,
  alumnoService,
  maestroService,
  checadorService,
  grupoService,
  materiaService,
  salonService,
  horarioService,
  asistenciaService
};