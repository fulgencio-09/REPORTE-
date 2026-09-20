import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle2, Clock, XCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { NormalizedConsultation } from '../types';

interface ConsultasTableProps {
  consultations: NormalizedConsultation[];
  selectedPym?: string;
  selectedMedico?: string;
  selectedConvenio?: string;
  onClearFilters?: () => void;
  onSelectConvenio?: (conv: string | undefined) => void;
}

const ITEMS_PER_PAGE = 10;

export const ConsultasTable: React.FC<ConsultasTableProps> = ({
  consultations,
  selectedPym,
  selectedMedico,
  selectedConvenio,
  onClearFilters,
  onSelectConvenio
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FINALIZADA' | 'EN SALA' | 'OTRAS'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Extraer lista única de convenios
  const uniqueConvenios = useMemo(() => {
    const set = new Set<string>();
    consultations.forEach((c) => {
      if (c.convenionombre) set.add(c.convenionombre);
    });
    return Array.from(set);
  }, [consultations]);

  const filteredData = useMemo(() => {
    return consultations.filter((item) => {
      // Status tab filter
      if (statusFilter === 'FINALIZADA' && item.estado_consulta !== 'FINALIZADA') return false;
      if (statusFilter === 'EN SALA' && item.estado_consulta !== 'EN SALA') return false;
      if (statusFilter === 'OTRAS' && (item.estado_consulta === 'FINALIZADA' || item.estado_consulta === 'EN SALA')) return false;

      // Drill-down filters
      if (selectedPym && item.pym !== selectedPym) return false;
      if (selectedMedico && item.mediconombre !== selectedMedico) return false;
      if (selectedConvenio && item.convenionombre !== selectedConvenio) return false;

      // Text search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchPym = item.pym.toLowerCase().includes(term);
        const matchMed = item.mediconombre.toLowerCase().includes(term);
        const matchConv = item.convenionombre ? item.convenionombre.toLowerCase().includes(term) : false;
        const matchPac = item.paciente ? item.paciente.toLowerCase().includes(term) : false;
        const matchDoc = item.documento ? item.documento.toLowerCase().includes(term) : false;
        const matchEst = item.estado_consulta.toLowerCase().includes(term);
        if (!matchPym && !matchMed && !matchConv && !matchPac && !matchDoc && !matchEst) {
          return false;
        }
      }

      return true;
    });
  }, [consultations, statusFilter, selectedPym, selectedMedico, selectedConvenio, searchTerm]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, selectedPym, selectedMedico, selectedConvenio, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const currentItems = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div id="seccion-tabla-registros" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-8">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Explorador de Registros Individuales
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              ({filteredData.length} registros filtrados de {consultations.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Revisión individual y auditoría de cada registro cargado en la base de datos.
          </p>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({consultations.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('FINALIZADA')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'FINALIZADA'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Finalizadas</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('EN SALA')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'EN SALA'
                  ? 'bg-white text-amber-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-600" />
              <span>En Sala</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('OTRAS')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'OTRAS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Otras
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar paciente, médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52"
            />
          </div>
        </div>
      </div>

      {/* Active drill-down badges if any */}
      {(selectedPym || selectedMedico || selectedConvenio) && (
        <div className="flex flex-wrap items-center gap-2 py-2 px-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 my-3">
          <span className="font-semibold">Filtros activos:</span>
          {selectedPym && (
            <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700 font-medium">
              PyM: {selectedPym}
            </span>
          )}
          {selectedMedico && (
            <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700 font-medium">
              Médico: {selectedMedico}
            </span>
          )}
          {selectedConvenio && (
            <span className="bg-white px-2 py-0.5 rounded border border-purple-200 text-purple-700 font-medium">
              Convenio: {selectedConvenio}
            </span>
          )}
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="ml-auto text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              Limpiar todos
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl mt-4">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Paciente / Documento</th>
              <th className="py-2.5 px-3">Programa (pym)</th>
              <th className="py-2.5 px-3">Profesional (mediconombre)</th>
              <th className="py-2.5 px-3">Convenio (convenionombre)</th>
              <th className="py-2.5 px-3">Estado (estado_consulta)</th>
              <th className="py-2.5 px-3">Fecha & Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                  {item.id}
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-slate-900">
                    {item.paciente || 'Paciente sin registrar'}
                  </div>
                  {item.documento && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      Doc: {item.documento}
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {item.pym}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-slate-900">{item.mediconombre}</div>
                  {item.consultorio && (
                    <div className="text-[10px] text-slate-400">{item.consultorio}</div>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <button
                    type="button"
                    onClick={() => onSelectConvenio && onSelectConvenio(item.convenionombre)}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    {item.convenionombre || 'Sin Convenio'}
                  </button>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      item.estado_consulta === 'FINALIZADA'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.estado_consulta === 'EN SALA'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.estado_consulta === 'FINALIZADA' && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    )}
                    {item.estado_consulta === 'EN SALA' && (
                      <Clock className="w-3 h-3 text-amber-600" />
                    )}
                    {item.estado_consulta !== 'FINALIZADA' && item.estado_consulta !== 'EN SALA' && (
                      <XCircle className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{item.estado_consulta}</span>
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                  {item.fecha || '2026-09-19'} {item.hora ? `• ${item.hora}` : ''}
                </td>
              </tr>
            ))}

            {currentItems.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No se encontraron registros que coincidan con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-3 text-xs text-slate-600">
          <span>
            Página <span className="font-semibold">{currentPage}</span> de{' '}
            <span className="font-semibold">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
