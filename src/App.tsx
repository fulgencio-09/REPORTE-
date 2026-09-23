import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Activity,
  Layers,
  Users,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  RotateCcw,
  Download,
  Filter,
  Info,
  ChevronRight,
  Building2,
  ShieldAlert,
  Database
} from 'lucide-react';
import { NormalizedConsultation, DashboardSummary, Urgencias203Summary } from './types';
import { INITIAL_SAMPLE_DATA } from './data/sampleData';
import { SAMPLE_URGENCIAS_203 } from './data/urgenciasSampleData';
import {
  computeDashboardSummary,
  downloadTemplate,
  exportSummaryToExcel
} from './utils/dataParser';
import {
  summarizeUrgenciasRecords,
  parseUrgenciasRawData,
  exportUrgenciasToExcel
} from './utils/urgenciasParser';
import {
  saveLocalUrgencias,
  loadLocalUrgencias,
  clearLocalUrgencias,
  saveLocalConsultas,
  loadLocalConsultas,
  clearLocalConsultas,
  getServerSyncStatus
} from './utils/localStorageManager';
import {
  subscribeToCloudUrgencias,
  subscribeToCloudConsultasMeta
} from './firebase';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { PymDashboard } from './components/PymDashboard';
import { MedicoDashboard } from './components/MedicoDashboard';
import { EnSalaSection } from './components/EnSalaSection';
import { ConveniosSection } from './components/ConveniosSection';
import { ConsultasTable } from './components/ConsultasTable';
import { ReportModal } from './components/ReportModal';
import { FileUploaderModal } from './components/FileUploaderModal';
import { UrgenciasView } from './components/UrgenciasView';
import { UrgenciasReportModal } from './components/UrgenciasReportModal';
import { SecurityCodeModal } from './components/SecurityCodeModal';
import * as XLSX from 'xlsx';

export default function App() {
  // Active Module State (Default to 'urgencias' for the requested Reporte 203 workflow)
  const [activeModule, setActiveModule] = useState<'urgencias' | 'consultas'>('urgencias');

  // ==========================================
  // ESTADO DE URGENCIAS - REPORTE 203
  // ==========================================
  const [urgenciasSummary, setUrgenciasSummary] = useState<Urgencias203Summary>(() =>
    summarizeUrgenciasRecords(SAMPLE_URGENCIAS_203)
  );
  const [urgenciasFileName, setUrgenciasFileName] = useState<string | null>(null);
  const [isStoredUrgencias, setIsStoredUrgencias] = useState(false);
  const [isUrgenciasReportOpen, setIsUrgenciasReportOpen] = useState(false);
  const urgenciasFileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // ESTADO DE CONSULTAS Y PYM
  // ==========================================
  const [consultations, setConsultations] = useState<NormalizedConsultation[]>(INITIAL_SAMPLE_DATA);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isStoredConsultas, setIsStoredConsultas] = useState(false);

  // Security Code (8492) State
  const [securityModalState, setSecurityModalState] = useState<{
    isOpen: boolean;
    actionType: 'urgencias' | 'consultas';
    targetTitle: string;
  } | null>(null);

  // Recuperar datos sincronizados del servidor web al iniciar la aplicación y verificar periódicamente
  useEffect(() => {
    let lastUrgTimestamp = '';
    let lastConsTimestamp = '';

    async function loadSavedData() {
      try {
        const storedUrg = await loadLocalUrgencias();
        if (storedUrg && storedUrg.summary) {
          setUrgenciasSummary(storedUrg.summary);
          setUrgenciasFileName(storedUrg.fileName);
          setIsStoredUrgencias(true);
          lastUrgTimestamp = storedUrg.savedAt || '';
        }
      } catch (err) {
        console.warn('No se pudo cargar el archivo de urgencias:', err);
      }

      try {
        const storedCons = await loadLocalConsultas();
        if (storedCons && storedCons.consultations && storedCons.consultations.length > 0) {
          setConsultations(storedCons.consultations);
          setFileName(storedCons.fileName);
          setIsStoredConsultas(true);
          lastConsTimestamp = storedCons.savedAt || '';
        }
      } catch (err) {
        console.warn('No se pudo cargar el archivo de consultas:', err);
      }
    }

    // Carga inicial (Firestore > Servidor > IndexedDB)
    loadSavedData();

    // 1. Suscripción en TIEMPO REAL a la Base de Datos Cloud (Firestore)
    // Permite que cuando se suba un informe desde un teléfono, tablet u otra PC, se actualicen todas las pantallas al instante
    let unsubUrg: (() => void) | null = null;
    let unsubConsMeta: (() => void) | null = null;

    try {
      unsubUrg = subscribeToCloudUrgencias((cloudUrg) => {
        if (cloudUrg && cloudUrg.summary) {
          if (cloudUrg.savedAt !== lastUrgTimestamp) {
            setUrgenciasSummary(cloudUrg.summary);
            setUrgenciasFileName(cloudUrg.fileName);
            setIsStoredUrgencias(true);
            lastUrgTimestamp = cloudUrg.savedAt;
          }
        }
      });
    } catch (e) {
      console.warn('Suscripción Firestore Urgencias no disponible:', e);
    }

    try {
      unsubConsMeta = subscribeToCloudConsultasMeta(async (meta) => {
        if (meta && meta.updatedAt && meta.updatedAt !== lastConsTimestamp) {
          const freshCons = await loadLocalConsultas();
          if (freshCons && freshCons.consultations && freshCons.consultations.length > 0) {
            setConsultations(freshCons.consultations);
            setFileName(freshCons.fileName);
            setIsStoredConsultas(true);
            lastConsTimestamp = freshCons.savedAt || meta.updatedAt;
          }
        }
      });
    } catch (e) {
      console.warn('Suscripción Firestore Consultas no disponible:', e);
    }

    // 2. Sincronización periódica de respaldo con el servidor web (cada 15 segundos o al enfocar)
    const checkSync = async () => {
      try {
        const status = await getServerSyncStatus();
        if (!status) return;

        if (status.hasUrgencias && status.urgenciasMeta?.updatedAt && status.urgenciasMeta.updatedAt !== lastUrgTimestamp) {
          const freshUrg = await loadLocalUrgencias();
          if (freshUrg && freshUrg.summary) {
            setUrgenciasSummary(freshUrg.summary);
            setUrgenciasFileName(freshUrg.fileName);
            setIsStoredUrgencias(true);
            lastUrgTimestamp = freshUrg.savedAt || status.urgenciasMeta.updatedAt;
          }
        }

        if (status.hasConsultas && status.consultasMeta?.updatedAt && status.consultasMeta.updatedAt !== lastConsTimestamp) {
          const freshCons = await loadLocalConsultas();
          if (freshCons && freshCons.consultations && freshCons.consultations.length > 0) {
            setConsultations(freshCons.consultations);
            setFileName(freshCons.fileName);
            setIsStoredConsultas(true);
            lastConsTimestamp = freshCons.savedAt || status.consultasMeta.updatedAt;
          }
        }
      } catch {
        // Silencioso
      }
    };

    const interval = setInterval(checkSync, 15000);
    const onFocus = () => { checkSync(); };
    window.addEventListener('focus', onFocus);

    return () => {
      if (unsubUrg) unsubUrg();
      if (unsubConsMeta) unsubConsMeta();
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleUrgenciasFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          alert('El archivo no contiene filas de datos.');
          return;
        }

        const newSummary = parseUrgenciasRawData(rawJson);
        setUrgenciasSummary(newSummary);
        setUrgenciasFileName(file.name);
        setIsStoredUrgencias(true);

        // Guardar y reemplazar automáticamente en almacenamiento local
        await saveLocalUrgencias(newSummary, file.name);
      } catch (err) {
        console.error('Error al procesar archivo de urgencias', err);
        alert('Error al leer el archivo. Verifique el formato Excel o CSV.');
      } finally {
        if (urgenciasFileInputRef.current) urgenciasFileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleResetUrgencias = async () => {
    setUrgenciasSummary(summarizeUrgenciasRecords(SAMPLE_URGENCIAS_203));
    setUrgenciasFileName(null);
    setIsStoredUrgencias(false);
    await clearLocalUrgencias();
  };

  // Cross-filtering states
  const [selectedPym, setSelectedPym] = useState<string>('');
  const [selectedMedico, setSelectedMedico] = useState<string>('');
  const [selectedConvenio, setSelectedConvenio] = useState<string>('');
  const [userSelectedConvenios, setUserSelectedConvenios] = useState<string[] | null>(null);
  const [activeTab, setActiveTab] = useState<'todo' | 'pym' | 'medicos' | 'ensala' | 'convenios' | 'registros'>('todo');

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Compute stats dynamically based on consultations data and chosen convenios
  const summary: DashboardSummary = useMemo(() => {
    return computeDashboardSummary(consultations, userSelectedConvenios || undefined);
  }, [consultations, userSelectedConvenios]);

  // Handler for uploading new report (reemplaza archivo previo y persiste localmente)
  const handleDataLoaded = async (newConsultations: NormalizedConsultation[], uploadedName: string) => {
    setConsultations(newConsultations);
    setFileName(uploadedName);
    setIsStoredConsultas(true);
    setSelectedPym('');
    setSelectedMedico('');
    setSelectedConvenio('');
    setUserSelectedConvenios(null);

    // Guardar y reemplazar en almacenamiento local
    await saveLocalConsultas(newConsultations, uploadedName);
  };

  // Handler to reset sample data
  const handleResetSampleData = async () => {
    setConsultations(INITIAL_SAMPLE_DATA);
    setFileName(null);
    setIsStoredConsultas(false);
    setSelectedPym('');
    setSelectedMedico('');
    setSelectedConvenio('');
    setUserSelectedConvenios(null);
    await clearLocalConsultas();
  };

  // Manejador del código de seguridad (8492) para los botones de subir reporte y subir consulta
  const handleOpenSecurityFor = (type: 'urgencias' | 'consultas') => {
    setSecurityModalState({
      isOpen: true,
      actionType: type,
      targetTitle: type === 'urgencias' ? 'Subir Reporte 203 de Urgencias' : 'Subir Consulta Externa & PyM'
    });
  };

  const handleSecuritySuccess = () => {
    if (securityModalState?.actionType === 'urgencias') {
      urgenciasFileInputRef.current?.click();
    } else if (securityModalState?.actionType === 'consultas') {
      setIsUploadOpen(true);
    }
  };

  // Handler para alternar convenios seleccionados (soporta 10 o más)
  const handleToggleConvenio = (conv: string) => {
    const current = summary.selectedConvenios || [];
    if (current.includes(conv)) {
      if (current.length <= 1) return;
      setUserSelectedConvenios(current.filter((c) => c !== conv));
    } else {
      setUserSelectedConvenios([...current, conv]);
    }
  };

  const handleSelectAllConvenios = () => {
    setUserSelectedConvenios([...summary.todosConvenios]);
  };

  const handleSelectTop10Convenios = () => {
    setUserSelectedConvenios(summary.todosConvenios.slice(0, 10));
  };

  const handleClearConvenios = () => {
    if (summary.todosConvenios.length > 0) {
      setUserSelectedConvenios([summary.todosConvenios[0]]);
    }
  };

  const handleResetToTop3 = () => {
    setUserSelectedConvenios(summary.todosConvenios.slice(0, 3));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Hidden file input for Urgencias Reporte 203 upload from header */}
      <input
        ref={urgenciasFileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleUrgenciasFileUpload}
      />

      {/* Top Application Header with Module Switcher */}
      <Header
        currentModule={activeModule}
        onChangeModule={setActiveModule}
        totalFinalizadas={summary.totalFinalizadas}
        totalEnSala={summary.totalEnSala}
        totalUrgencias={urgenciasSummary.totalRegistros}
        totalPreEgreso={urgenciasSummary.totalPreEgreso}
        totalAprobadoEgreso={urgenciasSummary.totalAprobadoEgreso}
        onOpenUpload={() => handleOpenSecurityFor(activeModule)}
        onOpenReport={() => {
          if (activeModule === 'urgencias') {
            setIsUrgenciasReportOpen(true);
          } else {
            setIsReportOpen(true);
          }
        }}
        onResetSampleData={() => {
          if (activeModule === 'urgencias') {
            handleResetUrgencias();
          } else {
            handleResetSampleData();
          }
        }}
        onDownloadTemplate={downloadTemplate}
        onExportExcel={() => {
          if (activeModule === 'urgencias') {
            exportUrgenciasToExcel(urgenciasSummary);
          } else {
            exportSummaryToExcel(summary);
          }
        }}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ========================================================= */}
        {/* MÓDULO 1: INFORME DE URGENCIAS (REPORTE 203)             */}
        {/* ========================================================= */}
        {activeModule === 'urgencias' && (
          <UrgenciasView
            summary={urgenciasSummary}
            fileName={urgenciasFileName}
            isStoredLocally={isStoredUrgencias}
            onRequestUpload={() => handleOpenSecurityFor('urgencias')}
            onUpdateSummary={async (newSummary, newFileName) => {
              setUrgenciasSummary(newSummary);
              if (newFileName !== undefined) {
                setUrgenciasFileName(newFileName);
                setIsStoredUrgencias(true);
                await saveLocalUrgencias(newSummary, newFileName);
              }
            }}
            onOpenReportModal={() => setIsUrgenciasReportOpen(true)}
          />
        )}

        {/* ========================================================= */}
        {/* MÓDULO 2: CONSULTAS Y PYM (INFORME CONSULTA EXTERNA)     */}
        {/* ========================================================= */}
        {activeModule === 'consultas' && (
          <>
            {/* Source File & Mode Banner */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 mb-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <span>
                  Origen de datos:{' '}
                  <strong className="text-slate-900 font-semibold">
                    {fileName ? fileName : 'Muestra oficial de prueba (36 consultas precargadas)'}
                  </strong>
                </span>
                {isStoredConsultas && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    Base de Datos Cloud Activa (Sincronizado multi-dispositivo)
                  </span>
                )}
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">
                  Total filas analizadas: <strong className="text-slate-800">{summary.totalRegistros}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Regla de negocio: <strong className="text-emerald-800">PyM y Médicos = Solo FINALIZADA</strong>
                </span>
              </div>
            </div>

            {/* Top KPI Cards */}
            <KpiCards summary={summary} />

            {/* Tab Navigation for Focused Workflows */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 mb-6 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('todo')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'todo'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Vista Integral Completa
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pym')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'pym'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Consultas por PyM ({summary.totalPymUnicos})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('medicos')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'medicos'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Consultas por Médico ({summary.totalMedicosUnicos})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ensala')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'ensala'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>En Sala ({summary.totalEnSala})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('convenios')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'convenios'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Convenios & Programas ({summary.selectedConvenios?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('registros')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'registros'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Registros Individuales ({summary.totalRegistros})
              </button>
            </div>

            {/* Content depending on active tab or full view */}
            {(activeTab === 'todo' || activeTab === 'ensala') && (
              <EnSalaSection
                enSalaStats={summary.enSalaStats}
                totalEnSala={summary.totalEnSala}
                onSelectMedico={(medico) => {
                  setSelectedMedico(medico);
                  setActiveTab('registros');
                }}
              />
            )}

            {(activeTab === 'todo' || activeTab === 'convenios') && (
              <ConveniosSection
                summary={summary}
                selectedConvenios={summary.selectedConvenios}
                onToggleConvenio={handleToggleConvenio}
                onSelectAllConvenios={handleSelectAllConvenios}
                onSelectTop10Convenios={handleSelectTop10Convenios}
                onSelectPredeterminados={() => setUserSelectedConvenios(null)}
                onClearConvenios={handleClearConvenios}
                onSelectConvenioFilter={(conv) => {
                  setSelectedConvenio(conv);
                  setActiveTab('registros');
                }}
              />
            )}

            {(activeTab === 'todo' || activeTab === 'pym') && (
              <PymDashboard
                pymStats={summary.pymStats}
                totalFinalizadas={summary.totalFinalizadas}
                selectedPym={selectedPym}
                onSelectPym={(pym) => {
                  setSelectedPym(pym);
                  setActiveTab('registros');
                }}
              />
            )}

            {(activeTab === 'todo' || activeTab === 'medicos') && (
              <MedicoDashboard
                medicoStats={summary.medicoStats}
                totalFinalizadas={summary.totalFinalizadas}
                selectedMedico={selectedMedico}
                onSelectMedico={(medico) => {
                  setSelectedMedico(medico);
                  setActiveTab('registros');
                }}
              />
            )}

            {(activeTab === 'todo' || activeTab === 'registros') && (
              <ConsultasTable
                consultations={consultations}
                selectedPym={selectedPym}
                selectedMedico={selectedMedico}
                selectedConvenio={selectedConvenio}
                onSelectConvenio={(conv) => setSelectedConvenio(conv || '')}
                onClearFilters={() => {
                  setSelectedPym('');
                  setSelectedMedico('');
                  setSelectedConvenio('');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-500">
          <p>
            Hospital Santa Teresa de Jesús de Ávila • Monitoreo de Urgencias (Reporte 203) y Consultas PyM
          </p>
          <p className="mt-1 sm:mt-0">
            Responsable: Ing. Fulgencio Quintero Brito (Cel: 3006774200) • Marcellis Oñate (Coord. Administrativa)
          </p>
        </div>
      </footer>

      {/* Modales de Informe y Carga */}
      <FileUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        summary={summary}
        onUpdateSelectedConvenios={(convs) => setUserSelectedConvenios(convs)}
      />

      <UrgenciasReportModal
        isOpen={isUrgenciasReportOpen}
        onClose={() => setIsUrgenciasReportOpen(false)}
        summary={urgenciasSummary}
      />

      {/* Modal de Control de Seguridad (Código 8492) */}
      {securityModalState && (
        <SecurityCodeModal
          isOpen={securityModalState.isOpen}
          onClose={() => setSecurityModalState(null)}
          onSuccess={handleSecuritySuccess}
          targetTitle={securityModalState.targetTitle}
          actionType={securityModalState.actionType}
        />
      )}
    </div>
  );
}
