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
import { Layers, Search, Filter, ArrowUpDown } from 'lucide-react';
import { PymStat } from '../types';

interface PymDashboardProps {
  pymStats: PymStat[];
  totalFinalizadas: number;
  onSelectPym?: (pym: string) => void;
  selectedPym?: string;
}

const BAR_COLORS = [
  '#2563eb', // blue-600
  '#0d9488', // teal-600
  '#7c3aed', // violet-600
  '#0284c7', // sky-600
  '#16a34a', // green-600
  '#ea580c', // orange-600
  '#db2777', // pink-600
  '#4f46e5'  // indigo-600
];

export const PymDashboard: React.FC<PymDashboardProps> = ({
  pymStats,
  totalFinalizadas,
  onSelectPym,
  selectedPym
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredStats = useMemo(() => {
    let result = pymStats.filter((item) =>
      item.pym.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.totalFinalizadas - b.totalFinalizadas);
    } else {
      result = [...result].sort((a, b) => b.totalFinalizadas - a.totalFinalizadas);
    }
    return result;
  }, [pymStats, searchTerm, sortOrder]);

  const chartData = useMemo(() => {
    // Show top 8 for clean visual presentation in chart
    return filteredStats.slice(0, 8).map((item) => ({
      name: item.pym.length > 22 ? `${item.pym.slice(0, 20)}…` : item.pym,
      fullName: item.pym,
      consultas: item.totalFinalizadas,
      porcentaje: item.porcentaje.toFixed(1)
    }));
  }, [filteredStats]);

  return (
    <div id="seccion-pym-finalizadas" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Consultas por Programa PyM
            </h2>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Solo Finalizadas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Métrica agrupada por la variable <code className="text-blue-700 font-mono font-medium">pym</code> con filtro de estado <code className="text-emerald-700 font-mono font-medium">estado_consulta = FINALIZADA</code>.
          </p>
        </div>

        {/* Search and sort control */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar programa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-44"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1 cursor-pointer"
            title="Cambiar orden por cantidad"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{sortOrder === 'desc' ? 'Mayor a menor' : 'Menor a mayor'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Visual Bar Chart */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Distribución Gráfica (Top Programas)
            </span>
            <span className="text-[11px] text-slate-400">
              Total consultas: {totalFinalizadas}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full bg-slate-50/50 rounded-xl p-3 border border-slate-100 flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11, fill: '#334155' }}
                  />
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
                  <Bar dataKey="consultas" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No se encontraron programas con los filtros aplicados</p>
            )}
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Detalle por Programa ({filteredStats.length} programas)
            </span>
            {selectedPym && onSelectPym && (
              <button
                type="button"
                onClick={() => onSelectPym('')}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Limpiar filtro activo
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 w-10">#</th>
                  <th className="py-2.5 px-3">Programa (pym)</th>
                  <th className="py-2.5 px-3 text-right">Finalizadas</th>
                  <th className="py-2.5 px-3 text-right">% Participación</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStats.map((item, idx) => {
                  const isSelected = selectedPym === item.pym;
                  return (
                    <tr
                      key={item.pym}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/60 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: BAR_COLORS[idx % BAR_COLORS.length] }}
                          />
                          <span>{item.pym}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.totalFinalizadas}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-blue-600"
                              style={{ width: `${Math.min(100, item.porcentaje)}%` }}
                            />
                          </div>
                          <span className="text-slate-500 font-mono w-10 text-right">
                            {item.porcentaje.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {onSelectPym && (
                          <button
                            type="button"
                            onClick={() => onSelectPym(isSelected ? '' : item.pym)}
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-200 hover:bg-slate-100 text-slate-600'
                            }`}
                            title="Filtrar registros por este programa"
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
                    <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                      No hay registros de PyM para mostrar
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
