import React from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  FileText,
  RotateCcw,
  Download,
  Activity,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Layers,
  HeartPulse
} from 'lucide-react';

interface HeaderProps {
  currentModule: 'urgencias' | 'consultas';
  onChangeModule: (mod: 'urgencias' | 'consultas') => void;
  totalFinalizadas: number;
  totalEnSala: number;
  totalUrgencias?: number;
  totalPreEgreso?: number;
  totalAprobadoEgreso?: number;
  onOpenUpload: () => void;
  onOpenReport: () => void;
  onResetSampleData: () => void;
  onDownloadTemplate?: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onChangeModule,
  totalFinalizadas,
  totalEnSala,
  totalUrgencias = 0,
  totalPreEgreso = 0,
  totalAprobadoEgreso = 0,
  onOpenUpload,
  onOpenReport,
  onResetSampleData,
  onDownloadTemplate,
  onExportExcel
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Logo, Title & Institutional Data */}
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm ring-4 ${
              currentModule === 'urgencias' ? 'bg-orange-600 ring-orange-100' : 'bg-blue-600 ring-blue-50'
            }`}>
              {currentModule === 'urgencias' ? <ShieldAlert className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Hospital Santa Teresa de Jesús de Ávila
                </h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                  currentModule === 'urgencias'
                    ? 'bg-orange-50 text-orange-800 border-orange-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  {currentModule === 'urgencias' ? 'Módulo Urgencias (Reporte 203)' : 'Módulo Consultas & PyM'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ing. Fulgencio Quintero Brito (Cel: 3006774200) · Coord. Marcellis Oñate
              </p>
            </div>
          </div>

          {/* Module Switcher & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Module Switcher Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => onChangeModule('urgencias')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentModule === 'urgencias'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Informe Urgencias (Reporte 203)</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeModule('consultas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentModule === 'consultas'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Consultas & PyM</span>
              </button>
            </div>

            {/* Quick status counter */}
            {currentModule === 'urgencias' ? (
              <div className="hidden xl:flex items-center gap-2 bg-orange-50/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-orange-900 border border-orange-200">
                <span>Total: <strong>{totalUrgencias}</strong></span>
                <span className="text-orange-300">|</span>
                <span className="text-orange-700">Pre Egreso: <strong>{totalPreEgreso}</strong></span>
                <span className="text-orange-300">|</span>
                <span className="text-emerald-700">Aprobado: <strong>{totalAprobadoEgreso}</strong></span>
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-2 bg-slate-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
                <span className="text-emerald-700">Fin: <strong>{totalFinalizadas}</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-amber-700">En Sala: <strong>{totalEnSala}</strong></span>
              </div>
            )}

            {/* Action Buttons */}
            <button
              id="btn-subir-reporte"
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title={currentModule === 'urgencias' ? 'Subir reporte de urgencias (requiere código 8492)' : 'Subir consulta externa (requiere código 8492)'}
            >
              <UploadCloud className={`w-4 h-4 ${currentModule === 'urgencias' ? 'text-orange-600' : 'text-blue-600'}`} />
              <span>{currentModule === 'urgencias' ? 'Subir Reporte (203)' : 'Subir Consulta'}</span>
            </button>

            <button
              id="btn-generar-informe"
              type="button"
              onClick={onOpenReport}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs transition-colors cursor-pointer ${
                currentModule === 'urgencias'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
              title="Descargar informe firmado por Ing. Fulgencio Quintero Brito y Marcellis Oñate"
            >
              <FileText className="w-4 h-4" />
              <span>Descargar Informe Firmado</span>
            </button>

            <button
              id="btn-exportar-excel"
              type="button"
              onClick={onExportExcel}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-emerald-700 text-xs transition-colors cursor-pointer"
              title="Exportar a Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            <button
              id="btn-cargar-muestra"
              type="button"
              onClick={onResetSampleData}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs transition-colors cursor-pointer"
              title="Restablecer datos de muestra"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
