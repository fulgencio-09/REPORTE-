import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { Users, Search, ArrowUpDown, Clock, CheckCircle2 } from 'lucide-react';
import { MedicoStat } from '../types';

interface MedicoDashboardProps {
  medicoStats: MedicoStat[];
  totalFinalizadas: number;
  onSelectMedico?: (medico: string) => void;
  selectedMedico?: string;
}

const MEDICO_COLORS = [
  '#4338ca', // indigo-700
  '#2563eb', // blue-600
  '#0284c7', // sky-600
  '#0d9488', // teal-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#be123c'  // rose-700
];

export const MedicoDashboard: React.FC<MedicoDashboardProps> = ({
  medicoStats,
  totalFinalizadas,
  onSelectMedico,
  selectedMedico
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'finalizadas' | 'enSala' | 'nombre'>('finalizadas');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredStats = useMemo(() => {
    let list = medicoStats.filter((m) =>
      m.mediconombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    list = [...list].sort((a, b) => {
      if (sortBy === 'finalizadas') {
        return sortAsc ? a.totalFinalizadas - b.totalFinalizadas : b.totalFinalizadas - a.totalFinalizadas;
      }
      if (sortBy === 'enSala') {
        return sortAsc ? a.enSala - b.enSala : b.enSala - a.enSala;
      }
      return sortAsc ? a.mediconombre.localeCompare(b.mediconombre) : b.mediconombre.localeCompare(a.mediconombre);
    });

    return list;
  }, [medicoStats, searchTerm, sortBy, sortAsc]);

  const chartData = useMemo(() => {
    return filteredStats.slice(0, 8).map((item) => ({
      name: item.mediconombre.length > 20 ? `${item.mediconombre.slice(0, 18)}…` : item.mediconombre,
      fullName: item.mediconombre,
      finalizadas: item.totalFinalizadas,
      enSala: item.enSala,
      porcentaje: item.porcentaje.toFixed(1)
    }));
  }, [filteredStats]);

  return (
    <div id="seccion-medicos-finalizadas" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Consultas por Profesional Médico
            </h2>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Solo Finalizadas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Métrica agrupada por la variable <code className="text-indigo-700 font-mono font-medium">mediconombre</code> con filtro <code className="text-emerald-700 font-mono font-medium">estado_consulta = FINALIZADA</code>, además de visibilidad de pacientes <code className="text-amber-700 font-mono font-medium">EN SALA</code>.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar profesional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48"
            />
          </div>
        </div>
      </div>

      {/* Grid: Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Chart */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Comparativa de Consultas Finalizadas por Profesional
            </span>
            <span className="text-[11px] text-slate-400">
              {medicoStats.length} profesionales registrados
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full bg-slate-50/50 rounded-xl p-3 border border-slate-100 flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
                >
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    tick={{ fontSize: 10, fill: '#334155' }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${value} consultas (${item.payload.porcentaje}%)`,
                      'Finalizadas'
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullName;
                      }
                      return label;
                    }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="finalizadas" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`med-cell-${index}`} fill={MEDICO_COLORS[index % MEDICO_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No se encontraron profesionales con los filtros actuales</p>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Rendimiento por Profesional
            </span>
            {selectedMedico && onSelectMedico && (
              <button
                type="button"
                onClick={() => onSelectMedico('')}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Limpiar filtro activo
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortBy === 'nombre') setSortAsc(!sortAsc);
                        else { setSortBy('nombre'); setSortAsc(false); }
                      }}
                      className="flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                    >
                      <span>Profesional (mediconombre)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortBy === 'finalizadas') setSortAsc(!sortAsc);
                        else { setSortBy('finalizadas'); setSortAsc(false); }
                      }}
                      className="flex items-center justify-end gap-1 hover:text-slate-900 ml-auto cursor-pointer"
                    >
                      <span>Finalizadas</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (sortBy === 'enSala') setSortAsc(!sortAsc);
                        else { setSortBy('enSala'); setSortAsc(false); }
                      }}
                      className="flex items-center justify-end gap-1 hover:text-slate-900 ml-auto cursor-pointer"
                    >
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>En Sala</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStats.map((item) => {
                  const isSelected = selectedMedico === item.mediconombre;
                  return (
                    <tr
                      key={item.mediconombre}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/60 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900">{item.mediconombre}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.programasAtendidos} programas PyM atendidos
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="font-bold text-slate-900">{item.totalFinalizadas}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.porcentaje.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.enSala > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            {item.enSala} en sala
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {onSelectMedico && (
                          <button
                            type="button"
                            onClick={() => onSelectMedico(isSelected ? '' : item.mediconombre)}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
                            }`}
                            title="Filtrar registros por este profesional"
                          >
                            {isSelected ? 'Activo' : 'Filtrar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                      No hay profesionales con los criterios seleccionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
