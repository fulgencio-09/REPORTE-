export interface RawRecord {
  [key: string]: any;
}

export interface NormalizedConsultation {
  id: string;
  pym: string;
  mediconombre: string;
  estado_consulta: string;
  convenionombre?: string;
  paciente?: string;
  documento?: string;
  fecha?: string;
  hora?: string;
  consultorio?: string;
}

export interface ColumnMapping {
  pym: string;
  mediconombre: string;
  estado_consulta: string;
  convenionombre?: string;
  paciente?: string;
  documento?: string;
  fecha?: string;
  hora?: string;
}

export interface PymStat {
  pym: string;
  totalFinalizadas: number;
  porcentaje: number;
}

export interface MedicoStat {
  mediconombre: string;
  totalFinalizadas: number;
  porcentaje: number;
  enSala: number;
  programasAtendidos: number;
}

export interface EnSalaStat {
  mediconombre: string;
  cantidad: number;
  consultas: NormalizedConsultation[];
}

export interface ConvenioStat {
  convenionombre: string;
  totalConsultas: number;
  totalFinalizadas: number;
  totalEnSala: number;
  porcentaje: number;
}

export interface ProgramaConvenioStat {
  pym: string;
  totalPorConvenios: number;
  totalGeneral: number;
  porConvenio: { [convenio: string]: number };
}

export interface ConvenioCuadroItem {
  pym: string;
  finalizadas: number;
  porcentaje: number;
}

export interface ConvenioCuadroStat {
  convenionombre: string;
  totalFinalizadas: number;
  totalEnSala: number;
  programas: ConvenioCuadroItem[];
}

export interface DashboardSummary {
  totalRegistros: number;
  totalFinalizadas: number;
  totalEnSala: number;
  totalOtras: number;
  totalPymUnicos: number;
  totalMedicosUnicos: number;
  totalConveniosUnicos: number;
  todosConvenios: string[];
  selectedConvenios: string[];
  pymStats: PymStat[];
  medicoStats: MedicoStat[];
  enSalaStats: EnSalaStat[];
  convenioStats: ConvenioStat[];
  programaConvenioStats: ProgramaConvenioStat[];
  convenioCuadros: ConvenioCuadroStat[];
}

export interface FilterState {
  searchMedico: string;
  searchPym: string;
  selectedPym: string;
  selectedMedico: string;
  activeTab: 'resumen' | 'pym' | 'medicos' | 'ensala' | 'todos';
}

// ==========================================
// TIPOS PARA INFORME DE URGENCIAS (REPORTE 203)
// ==========================================

export interface UrgenciaRecord {
  id: string;
  sede: string;
  urgenciaestado: string;
  funcionarioingreso: string;
  funcionariovaloracionmedica?: string;
  paciente?: string;
  identificacion?: string;
  fechaingreso?: string;
  triage?: string;
  medicotrata?: string;
  diagnostico?: string;
  cama?: string;
  rawData?: Record<string, any>;
}

export interface SedeEstadoStat {
  sede: string;
  estado: string;
  cantidad: number;
}

export interface EstadoUrgenciaStat {
  estado: string;
  total: number;
  porSede: { [sede: string]: number };
}

export interface PreEgresoFuncionarioStat {
  funcionarioingreso: string;
  cantidad: number;
  porSede: { [sede: string]: number };
  registros: UrgenciaRecord[];
}

export interface FuncionarioValoracionStat {
  funcionariovaloracionmedica: string;
  cantidad: number;
  porSede: { [sede: string]: number };
  registros: UrgenciaRecord[];
}

export interface Urgencias203Summary {
  totalRegistros: number;
  totalPreEgreso: number;
  totalAprobadoEgreso: number;
  sedes: string[];
  estados: string[];
  sedeEstadoStats: SedeEstadoStat[];
  estadoStats: EstadoUrgenciaStat[];
  preEgresoFuncionarios: PreEgresoFuncionarioStat[];
  preEgresoRecords: UrgenciaRecord[];
  aprobadoValoracionMedica: FuncionarioValoracionStat[];
  aprobadoEgresoRecords: UrgenciaRecord[];
}
