import React from 'react';
import { CheckCircle, Clock, Layers, Users, Building2 } from 'lucide-react';
import { DashboardSummary } from '../types';

interface KpiCardsProps {
  summary: DashboardSummary;
  onFilterStatus?: (status: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  const finalizadasPct = summary.totalRegistros > 0
    ? ((summary.totalFinalizadas / summary.totalRegistros) * 100).toFixed(1)
    : '0';

  const enSalaPct = summary.totalRegistros > 0
    ? ((summary.totalEnSala / summary.totalRegistros) * 100).toFixed(1)
    : '0';

  const convNames = (summary.selectedConvenios || []).slice(0, 3).join(', ');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {/* KPI 1: Finalizadas */}
      <div
        id="kpi-card-finalizadas"
        className="bg-white rounded-xl border border-emerald-200/80 p-4.5 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Consultas Finalizadas
          </span>
          <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {summary.totalFinalizadas}
          </span>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {finalizadasPct}% del total
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Criterio: <code className="text-emerald-700 font-mono text-[11px] bg-emerald-50/60 px-1 py-0.5 rounded">estado_consulta = FINALIZADA</code>
        </p>
      </div>

      {/* KPI 2: En Sala */}
      <div
        id="kpi-card-en-sala"
        className="bg-white rounded-xl border border-amber-200/80 p-4.5 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 tracking-wide uppercase">
            Pacientes En Sala
          </span>
          <span className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {summary.totalEnSala}
          </span>
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {enSalaPct}% en espera
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Distribuido en <span className="font-semibold text-slate-700">{summary.enSalaStats.length}</span> profesionales
        </p>
      </div>

      {/* KPI 3: Programas PyM */}
      <div
        id="kpi-card-pym"
        className="bg-white rounded-xl border border-blue-200/80 p-4.5 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-800 tracking-wide uppercase">
            Programas PyM Activos
          </span>
          <span className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Layers className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {summary.totalPymUnicos}
          </span>
          <span className="text-xs font-medium text-slate-500">
            con atenciones
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2 truncate">
          Mayor volumen:{' '}
          <span className="font-medium text-slate-800">
            {summary.pymStats[0]?.pym || 'N/A'} ({summary.pymStats[0]?.totalFinalizadas || 0})
          </span>
        </p>
      </div>

      {/* KPI 4: Profesionales */}
      <div
        id="kpi-card-profesionales"
        className="bg-white rounded-xl border border-indigo-200/80 p-4.5 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-800 tracking-wide uppercase">
            Profesionales Médicos
          </span>
          <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Users className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {summary.totalMedicosUnicos}
          </span>
          <span className="text-xs font-medium text-slate-500">
            atendiendo
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2 truncate">
          Top profesional:{' '}
          <span className="font-medium text-slate-800">
            {summary.medicoStats[0]?.mediconombre || 'N/A'} ({summary.medicoStats[0]?.totalFinalizadas || 0})
          </span>
        </p>
      </div>

      {/* KPI 5: 3 Convenios */}
      <div
        id="kpi-card-convenios"
        className="bg-white rounded-xl border border-purple-200/80 p-4.5 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-800 tracking-wide uppercase">
            3 Convenios Activos
          </span>
          <span className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
            <Building2 className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {summary.selectedConvenios?.length || 0}
          </span>
          <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            de {summary.totalConveniosUnicos || 0} convenios
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2 truncate" title={convNames}>
          Auditoría: <span className="font-medium text-slate-800">{convNames || 'Sin convenios'}</span>
        </p>
      </div>
    </div>
  );
};
