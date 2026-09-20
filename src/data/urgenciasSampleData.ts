import { UrgenciaRecord } from '../types';

export const SAMPLE_URGENCIAS_203: UrgenciaRecord[] = [
  // AUDITORIA PRE EGRESO - Caso específico solicitado por el usuario
  {
    id: 'URG-1001',
    sede: 'DIBULLA',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    paciente: 'CARMENZA MARTINEZ ROJAS',
    identificacion: '40982312',
    fechaingreso: '2026-09-19 08:30',
    triage: 'II',
    cama: 'OBS-01',
    diagnostico: 'DOLOR ABDOMINAL AGUDO'
  },
  {
    id: 'URG-1002',
    sede: 'DIBULLA',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    paciente: 'JOSE LUIS ARRIETA PEREZ',
    identificacion: '84920194',
    fechaingreso: '2026-09-19 09:15',
    triage: 'III',
    cama: 'OBS-03',
    diagnostico: 'GASTROENTERITIS AGUDA'
  },
  {
    id: 'URG-1003',
    sede: 'MINGUEO',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    paciente: 'MARIA ANGELICA SUAREZ',
    identificacion: '55829104',
    fechaingreso: '2026-09-19 10:00',
    triage: 'II',
    cama: 'OBS-04',
    diagnostico: 'SINDROME FEBRIL'
  },
  {
    id: 'URG-1004',
    sede: 'MINGUEO',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    paciente: 'CARLOS ALBERTO GOMEZ',
    identificacion: '17892014',
    fechaingreso: '2026-09-19 11:20',
    triage: 'III',
    cama: 'OBS-02',
    diagnostico: 'INFECCION URINARIA'
  },
  {
    id: 'URG-1005',
    sede: 'DIBULLA',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    paciente: 'ANA DEL CARMEN OROZCO',
    identificacion: '33491024',
    fechaingreso: '2026-09-19 12:45',
    triage: 'III',
    cama: 'OBS-05',
    diagnostico: 'CEFALEA TENSIONAL'
  },
  {
    id: 'URG-1006',
    sede: 'DIBULLA',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'DARIO ALEXANDER SALAS CARREÑO',
    paciente: 'LUIS FERNANDO HERRERA',
    identificacion: '11209384',
    fechaingreso: '2026-09-19 07:15',
    triage: 'II',
    cama: 'HOSP-01',
    diagnostico: 'CRISIS HIPERTENSIVA'
  },
  {
    id: 'URG-1007',
    sede: 'DIBULLA',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'DARIO ALEXANDER SALAS CARREÑO',
    paciente: 'PATRICIA ELENA CHARRIS',
    identificacion: '49201948',
    fechaingreso: '2026-09-19 08:40',
    triage: 'III',
    cama: 'HOSP-02',
    diagnostico: 'TRAUMA CRANEOCEFALICO LEVE'
  },
  {
    id: 'URG-1008',
    sede: 'MINGUEO',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'ENEIDA JUDITH MARBELLO VIDES',
    paciente: 'JORGE ELIECER BARROS',
    identificacion: '77291048',
    fechaingreso: '2026-09-19 09:30',
    triage: 'II',
    cama: 'OBS-06',
    diagnostico: 'LUMBALGIA AGUDA INCAPACITANTE'
  },
  {
    id: 'URG-1009',
    sede: 'DIBULLA',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'ENEIDA JUDITH MARBELLO VIDES',
    paciente: 'SANDRA MILENA QUINTERO',
    identificacion: '22839104',
    fechaingreso: '2026-09-19 10:45',
    triage: 'III',
    cama: 'OBS-07',
    diagnostico: 'HERIDA EN MANO DERECHA'
  },
  {
    id: 'URG-1010',
    sede: 'DIBULLA',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'ENEIDA JUDITH MARBELLO VIDES',
    paciente: 'RAFAEL ENRIQUE MEJIA',
    identificacion: '84920184',
    fechaingreso: '2026-09-19 11:50',
    triage: 'II',
    cama: 'OBS-08',
    diagnostico: 'COLICO RENAL'
  },
  {
    id: 'URG-1011',
    sede: 'DIBULLA',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL DIBULLA',
    paciente: 'YENIS MARGARITA REDONDO',
    identificacion: '39482019',
    fechaingreso: '2026-09-19 13:10',
    triage: 'III',
    cama: 'CAM-01',
    diagnostico: 'BRONQUITIS AGUDA'
  },
  {
    id: 'URG-1012',
    sede: 'MINGUEO',
    urgenciaestado: 'AUDITORIA PRE EGRESO',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    paciente: 'HERNAN DARIO FONSECA',
    identificacion: '19284019',
    fechaingreso: '2026-09-19 14:00',
    triage: 'II',
    cama: 'CAM-02',
    diagnostico: 'FRACTURA RADIO DISTAL'
  },

  // OTROS ESTADOS DE URGENCIAS (EN OBSERVACION, EN HOSPITALIZACION, EGRESADO, etc.)
  {
    id: 'URG-2001',
    sede: 'DIBULLA',
    urgenciaestado: 'EN OBSERVACION',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    paciente: 'GUSTAVO ADOLFO PEREZ',
    identificacion: '72910482',
    fechaingreso: '2026-09-19 06:10',
    triage: 'II',
    diagnostico: 'DOLOR TORACICO ATIPICO'
  },
  {
    id: 'URG-2002',
    sede: 'DIBULLA',
    urgenciaestado: 'EN OBSERVACION',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    paciente: 'BEATRIZ ELENA SILVA',
    identificacion: '55829102',
    fechaingreso: '2026-09-19 06:40',
    triage: 'II',
    diagnostico: 'SINDROME EMETICO'
  },
  {
    id: 'URG-2003',
    sede: 'DIBULLA',
    urgenciaestado: 'EN OBSERVACION',
    funcionarioingreso: 'DARIO ALEXANDER SALAS CARREÑO',
    paciente: 'MIGUEL ANGEL CUESTA',
    identificacion: '18294012',
    fechaingreso: '2026-09-19 07:05',
    triage: 'III',
    diagnostico: 'ASMA BRONQUIAL MODERADA'
  },
  {
    id: 'URG-2004',
    sede: 'DIBULLA',
    urgenciaestado: 'EN OBSERVACION',
    funcionarioingreso: 'DARIO ALEXANDER SALAS CARREÑO',
    paciente: 'GLADYS MERCEDES HOYOS',
    identificacion: '40928194',
    fechaingreso: '2026-09-19 07:30',
    triage: 'III',
    diagnostico: 'VERTIGO PERIFERICO'
  },
  {
    id: 'URG-2005',
    sede: 'DIBULLA',
    urgenciaestado: 'EN OBSERVACION',
    funcionarioingreso: 'ENEIDA JUDITH MARBELLO VIDES',
    paciente: 'ALBERTO MARIO VEGA',
    identificacion: '84920199',
    fechaingreso: '2026-09-19 08:00',
    triage: 'II',
    diagnostico: 'FIEBRE TIFOIDEA EN ESTUDIO'
  },
  {
    id: 'URG-2006',
    sede: 'MINGUEO',
    urgenciaestado: 'EN OBSERVACION',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    paciente: 'DIANA PATRICIA MENDOZA',
    identificacion: '33491029',
    fechaingreso: '2026-09-19 08:20',
    triage: 'III',
    diagnostico: 'DENGUE SIN SIGNOS DE ALARMA'
  },
  {
    id: 'URG-2007',
    sede: 'MINGUEO',
    urgenciaestado: 'EN OBSERVACION',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    paciente: 'JESUS DAVID CAMARGO',
    identificacion: '11209389',
    fechaingreso: '2026-09-19 09:10',
    triage: 'II',
    diagnostico: 'CELULITIS EN MIEMBRO INFERIOR'
  },
  {
    id: 'URG-2008',
    sede: 'MINGUEO',
    urgenciaestado: 'EN OBSERVACION',
    funcionarioingreso: 'ENEIDA JUDITH MARBELLO VIDES',
    paciente: 'ROSA MARIA IBARRA',
    identificacion: '49201949',
    fechaingreso: '2026-09-19 10:15',
    triage: 'III',
    diagnostico: 'HIPOGLUCEMIA MODERADA'
  },

  // EN HOSPITALIZACION
  {
    id: 'URG-3001',
    sede: 'DIBULLA',
    urgenciaestado: 'EN HOSPITALIZACION',
    funcionarioingreso: 'DARIO ALEXANDER SALAS CARREÑO',
    paciente: 'FERNANDO JOSE CANTILLO',
    identificacion: '77291049',
    fechaingreso: '2026-09-18 19:30',
    triage: 'II',
    cama: 'HOSP-03',
    diagnostico: 'NEUMONIA ADQUIRIDA EN COMUNIDAD'
  },
  {
    id: 'URG-3002',
    sede: 'DIBULLA',
    urgenciaestado: 'EN HOSPITALIZACION',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    paciente: 'LILIANA MARGARITA POLO',
    identificacion: '22839109',
    fechaingreso: '2026-09-18 21:00',
    triage: 'II',
    cama: 'HOSP-04',
    diagnostico: 'PIELONEFRITIS AGUDA'
  },
  {
    id: 'URG-3003',
    sede: 'MINGUEO',
    urgenciaestado: 'EN HOSPITALIZACION',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    paciente: 'CARLOS JULIO MONTERO',
    identificacion: '84920189',
    fechaingreso: '2026-09-19 01:20',
    triage: 'II',
    cama: 'HOSP-05',
    diagnostico: 'APENDICITIS EN OBSERVACION'
  },

  // APROBADO EGRESO - Con funcionariovaloracionmedica (como en la captura del usuario)
  // DIOLMER ANDRES MENA ROMERO (5 registros)
  {
    id: 'URG-4001',
    sede: 'DIBULLA',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'ENEIDA JUDITH MARBELLO VIDES',
    funcionariovaloracionmedica: 'DIOLMER ANDRES MENA ROMERO',
    paciente: 'KATHERINE PAOLA SIERRA',
    identificacion: '39482011',
    fechaingreso: '2026-09-19 05:00',
    triage: 'III',
    diagnostico: 'AMIGDALITIS AGUDA'
  },
  {
    id: 'URG-4002',
    sede: 'DIBULLA',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    funcionariovaloracionmedica: 'DIOLMER ANDRES MENA ROMERO',
    paciente: 'OSCAR DANIEL RUIZ',
    identificacion: '19284011',
    fechaingreso: '2026-09-19 06:15',
    triage: 'III',
    diagnostico: 'GASTRITIS EROSIVA'
  },
  {
    id: 'URG-4003',
    sede: 'MINGUEO',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    funcionariovaloracionmedica: 'DIOLMER ANDRES MENA ROMERO',
    paciente: 'MARIA ANGELICA DAZA',
    identificacion: '33491044',
    fechaingreso: '2026-09-19 07:45',
    triage: 'III',
    diagnostico: 'CEFALEA TENSIONAL RESUELTA'
  },
  {
    id: 'URG-4004',
    sede: 'MINGUEO',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'DARIO ALEXANDER SALAS CARREÑO',
    funcionariovaloracionmedica: 'DIOLMER ANDRES MENA ROMERO',
    paciente: 'JUAN CARLOS RIVADENEIRA',
    identificacion: '72910488',
    fechaingreso: '2026-09-19 08:30',
    triage: 'II',
    diagnostico: 'TRAUMA MENOR TRATADO'
  },
  {
    id: 'URG-4005',
    sede: 'DIBULLA',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'ENEIDA JUDITH MARBELLO VIDES',
    funcionariovaloracionmedica: 'DIOLMER ANDRES MENA ROMERO',
    paciente: 'SANDRA MILENA BARRIOS',
    identificacion: '40918233',
    fechaingreso: '2026-09-19 09:20',
    triage: 'III',
    diagnostico: 'INFECCION URINARIA BAJA'
  },

  // JASMIN PAOLA MONSALVO CAVIEDES (7 registros)
  {
    id: 'URG-4006',
    sede: 'MINGUEO',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    funcionariovaloracionmedica: 'JASMIN PAOLA MONSALVO CAVIEDES',
    paciente: 'FERNANDO ALBERTO IBARRA',
    identificacion: '84918201',
    fechaingreso: '2026-09-19 06:40',
    triage: 'III',
    diagnostico: 'FARINGITIS ESTREPTOCOCICA'
  },
  {
    id: 'URG-4007',
    sede: 'MINGUEO',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    funcionariovaloracionmedica: 'JASMIN PAOLA MONSALVO CAVIEDES',
    paciente: 'LUISA FERNANDA GOMEZ',
    identificacion: '11248920',
    fechaingreso: '2026-09-19 07:10',
    triage: 'III',
    diagnostico: 'RINOSINUSITIS AGUDA'
  },
  {
    id: 'URG-4008',
    sede: 'MINGUEO',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    funcionariovaloracionmedica: 'JASMIN PAOLA MONSALVO CAVIEDES',
    paciente: 'PEDRO ANTONIO SUAREZ',
    identificacion: '17892011',
    fechaingreso: '2026-09-19 07:50',
    triage: 'III',
    diagnostico: 'LUMBALGIA MECANICA'
  },
  {
    id: 'URG-4009',
    sede: 'DIBULLA',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    funcionariovaloracionmedica: 'JASMIN PAOLA MONSALVO CAVIEDES',
    paciente: 'YENIFER PAOLA MEJIA',
    identificacion: '40919283',
    fechaingreso: '2026-09-19 08:15',
    triage: 'III',
    diagnostico: 'DISPEPSIA NO ULCEROSA'
  },
  {
    id: 'URG-4010',
    sede: 'DIBULLA',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    funcionariovaloracionmedica: 'JASMIN PAOLA MONSALVO CAVIEDES',
    paciente: 'ROBERTO CARLOS VIDAL',
    identificacion: '84928172',
    fechaingreso: '2026-09-19 08:45',
    triage: 'III',
    diagnostico: 'DERMATITIS POR CONTACTO'
  },
  {
    id: 'URG-4011',
    sede: 'MINGUEO',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    funcionariovaloracionmedica: 'JASMIN PAOLA MONSALVO CAVIEDES',
    paciente: 'CAROLINA ANDREA RIVERA',
    identificacion: '55928173',
    fechaingreso: '2026-09-19 09:00',
    triage: 'III',
    diagnostico: 'CONJUNTIVITIS BACTERIANA'
  },
  {
    id: 'URG-4012',
    sede: 'MINGUEO',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    funcionariovaloracionmedica: 'JASMIN PAOLA MONSALVO CAVIEDES',
    paciente: 'GABRIEL ENRIQUE PINTO',
    identificacion: '12891029',
    fechaingreso: '2026-09-19 09:30',
    triage: 'III',
    diagnostico: 'HERIDA SUTURADA MENOR'
  },

  // APOLINAR ELIAS RIVADENEIRA DAZA (2 registros)
  {
    id: 'URG-4013',
    sede: 'DIBULLA',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'DARIO ALEXANDER SALAS CARREÑO',
    funcionariovaloracionmedica: 'APOLINAR ELIAS RIVADENEIRA DAZA',
    paciente: 'MIGUEL ANGEL CORTES',
    identificacion: '84920199',
    fechaingreso: '2026-09-19 05:40',
    triage: 'II',
    diagnostico: 'CRISIS HIPERTENSIVA CONTROLADA'
  },
  {
    id: 'URG-4014',
    sede: 'DIBULLA',
    urgenciaestado: 'APROBADO EGRESO',
    funcionarioingreso: 'DARIO ALEXANDER SALAS CARREÑO',
    funcionariovaloracionmedica: 'APOLINAR ELIAS RIVADENEIRA DAZA',
    paciente: 'YULIETH MERCEDES MORALES',
    identificacion: '40918274',
    fechaingreso: '2026-09-19 06:20',
    triage: 'III',
    diagnostico: 'VERTIGO POSICIONAL BENIGNO'
  },

  // EN ESPERA TRIAGE
  {
    id: 'URG-5001',
    sede: 'DIBULLA',
    urgenciaestado: 'EN ESPERA TRIAGE',
    funcionarioingreso: 'DARIO ALEXANDER SALAS CARREÑO',
    paciente: 'WILFRIDO JOSE CORONEL',
    identificacion: '72910489',
    fechaingreso: '2026-09-19 14:10',
    diagnostico: 'CONSULTA GENERAL'
  },
  {
    id: 'URG-5002',
    sede: 'MINGUEO',
    urgenciaestado: 'EN ESPERA TRIAGE',
    funcionarioingreso: 'ELI GABRIEL MARQUINA MOVIL MINGUEO',
    paciente: 'YORLADY MARCELA PEREIRA',
    identificacion: '55829109',
    fechaingreso: '2026-09-19 14:25',
    diagnostico: 'MALESTAR GENERAL'
  },

  // EGRESADO
  {
    id: 'URG-6001',
    sede: 'DIBULLA',
    urgenciaestado: 'EGRESADO',
    funcionarioingreso: 'MILTON FRNANDO MURGAS DEL PRADO',
    paciente: 'EDINSON MANUEL PACHECO',
    identificacion: '18294019',
    fechaingreso: '2026-09-18 16:00',
    triage: 'III',
    diagnostico: 'ESGUINCE TOBILLO IZQUIERDO'
  },
  {
    id: 'URG-6002',
    sede: 'MINGUEO',
    urgenciaestado: 'EGRESADO',
    funcionarioingreso: 'ENEIDA JUDITH MARBELLO VIDES',
    paciente: 'CLAUDIA PATRICIA DUARTE',
    identificacion: '40928199',
    fechaingreso: '2026-09-18 17:30',
    triage: 'III',
    diagnostico: 'OTITIS MEDIA AGUDA'
  }
];
