import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowDownToLine, BarChart3, Bold, DollarSign } from "lucide-react";
import type { ExcelMissionState } from "../types/game";
import { evaluateCell } from "../utils/excelEngine";
import { sound } from "../utils/sound";

interface ExcelSimulatorProps {
  state: ExcelMissionState;
  onChange: (next: ExcelMissionState) => void;
}

const ALL_COLS = ["A", "B", "C", "D"];
const ALL_ROWS = [1, 2, 3, 4, 5, 6, 7];

export const ExcelSimulator: React.FC<ExcelSimulatorProps> = ({ state, onChange }) => {
  const activeCell = state.cells[state.selectedCell] || { raw: "" };
  const [formulaInput, setFormulaInput] = useState(activeCell.raw);

  useEffect(() => {
    setFormulaInput(state.cells[state.selectedCell]?.raw || "");
  }, [state.selectedCell, state.cells]);

  // Determine active columns & rows present in this mission
  const visibleCols = ALL_COLS.filter((col) =>
    Object.keys(state.cells).some((ref) => ref.startsWith(col))
  );
  const maxRow = Math.max(
    ...Object.keys(state.cells).map((ref) => parseInt(ref.slice(1), 10) || 1),
    5
  );
  const visibleRows = ALL_ROWS.filter((r) => r <= maxRow);

  const commitFormula = (value: string, targetRef = state.selectedCell) => {
    const existing = state.cells[targetRef] || { raw: "" };
    if (existing.readOnly) return;
    sound.playClick();
    onChange({
      ...state,
      cells: {
        ...state.cells,
        [targetRef]: {
          ...existing,
          raw: value,
        },
      },
    });
  };

  const toggleSelectedCellProp = (prop: "bold" | "currency") => {
    const existing = state.cells[state.selectedCell] || { raw: "" };
    sound.playClick();
    onChange({
      ...state,
      cells: {
        ...state.cells,
        [state.selectedCell]: {
          ...existing,
          [prop]: !existing[prop],
        },
      },
    });
  };

  const handleAutoFillDown = () => {
    const col = state.selectedCell.charAt(0);
    const startRow = parseInt(state.selectedCell.slice(1), 10);
    const baseRaw = state.cells[state.selectedCell]?.raw || "";
    if (!baseRaw.startsWith("=")) return;

    const nextCells = { ...state.cells };
    let filledCount = 0;

    for (let r = startRow + 1; r <= maxRow; r++) {
      const targetRef = `${col}${r}`;
      const targetCell = nextCells[targetRef];
      if (!targetCell || targetCell.readOnly) continue;
      // Only fill rows that have adjacent data in column A or B
      if (!nextCells[`A${r}`]?.raw) continue;

      const delta = r - startRow;
      const adjusted = baseRaw.replace(/\b([A-E])(\d+)\b/g, (_m, c, rowNum) => {
        return `${c}${parseInt(rowNum, 10) + delta}`;
      });
      nextCells[targetRef] = {
        ...targetCell,
        raw: adjusted,
      };
      filledCount++;
    }

    if (filledCount > 0) {
      sound.playStepComplete();
      onChange({ ...state, cells: nextCells });
    }
  };

  const evaluatedMap: Record<string, ReturnType<typeof evaluateCell>> = {};
  for (const r of visibleRows) {
    for (const c of visibleCols) {
      const ref = `${c}${r}`;
      evaluatedMap[ref] = evaluateCell(ref, state.cells);
    }
  }

  const activeEvaluated = evaluatedMap[state.selectedCell];

  // Build chart data if mission supports it
  const chartData =
    state.showChart && state.chartRange
      ? state.chartRange.labels.map((labelRef, idx) => {
          const valRef = state.chartRange!.values[idx];
          const label = String(evaluatedMap[labelRef]?.value || labelRef);
          const rawVal = evaluatedMap[valRef]?.value;
          const numeric = typeof rawVal === "number" ? rawVal : 0;
          return { label, value: numeric, formatted: evaluatedMap[valRef]?.formatted || "0" };
        })
      : [];
  const maxChartVal = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-emerald-700 pr-2 border-r border-slate-200 whitespace-nowrap">
          Excel · Fórmulas e Dados
        </span>

        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          <button
            type="button"
            onClick={() => toggleSelectedCellProp("bold")}
            title="Negrito na célula selecionada"
            aria-label="Negrito"
            className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
              activeCell.bold
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => toggleSelectedCellProp("currency")}
            title="Formatar como Moeda (R$)"
            className={`h-8 px-2.5 flex items-center gap-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              activeCell.currency
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Moeda (R$)
          </button>
        </div>

        {/* Function Quick Insert */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Inserir:</span>
          {["=SOMA(", "=MÉDIA(", "=MÁXIMO(", "=SE("].map((fn) => (
            <button
              key={fn}
              type="button"
              disabled={activeCell.readOnly}
              onClick={() => {
                sound.playClick();
                setFormulaInput(fn);
              }}
              className="h-8 px-2 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 rounded-md text-xs font-mono disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              {fn.replace("(", "")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {formulaInput.startsWith("=") && (
            <button
              type="button"
              onClick={handleAutoFillDown}
              title="Copiar fórmula para as linhas abaixo (Alça de Preenchimento)"
              className="h-8 px-2.5 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
              AutoPreencher ↓
            </button>
          )}

          {state.chartRange && (
            <button
              type="button"
              onClick={() => {
                sound.playStepComplete();
                onChange({ ...state, showChart: !state.showChart });
              }}
              className={`h-8 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                state.showChart
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Inserir Gráfico
            </button>
          )}
        </div>
      </div>

      {/* Formula Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commitFormula(formulaInput);
        }}
        className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-2"
      >
        <div className="h-8 w-14 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-md font-mono text-xs font-semibold text-slate-800 shrink-0">
          {state.selectedCell}
        </div>
        <span className="font-mono text-xs font-semibold text-emerald-700 px-1 shrink-0">
          fx
        </span>
        <input
          type="text"
          value={formulaInput}
          disabled={activeCell.readOnly}
          onChange={(e) => setFormulaInput(e.target.value)}
          onBlur={() => {
            if (!activeCell.readOnly && formulaInput !== activeCell.raw) {
              commitFormula(formulaInput);
            }
          }}
          placeholder={
            activeCell.readOnly
              ? "Célula fixa da tabela (selecione uma célula editável)"
              : "Digite um valor ou fórmula começando com = (ex: =SOMA(B2:B5))"
          }
          className="flex-1 h-8 px-3 text-sm font-mono bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:text-slate-500"
        />
        <button
          type="submit"
          disabled={activeCell.readOnly}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
        >
          Aplicar
        </button>
      </form>

      {/* Grid */}
      <div className="p-4 sm:p-5 bg-slate-50/70 overflow-x-auto">
        <table className="w-full border-collapse bg-white border border-slate-300 text-sm">
          <thead>
            <tr>
              <th className="w-10 h-8 bg-slate-100 border border-slate-300 text-xs font-mono text-slate-500" />
              {visibleCols.map((col) => (
                <th
                  key={col}
                  className="h-8 bg-slate-100 border border-slate-300 text-xs font-mono font-semibold text-slate-600 px-3"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row}>
                <td className="h-10 bg-slate-100 border border-slate-300 text-center text-xs font-mono font-semibold text-slate-500 tabular-nums">
                  {row}
                </td>
                {visibleCols.map((col) => {
                  const ref = `${col}${row}`;
                  const cell = state.cells[ref] || { raw: "" };
                  const ev = evaluatedMap[ref];
                  const isSelected = state.selectedCell === ref;
                  const isNumeric = typeof ev?.value === "number";

                  return (
                    <td
                      key={ref}
                      onClick={() => {
                        sound.playClick();
                        onChange({ ...state, selectedCell: ref });
                      }}
                      className={`h-10 px-3 border border-slate-300 cursor-pointer transition-colors relative ${
                        isSelected
                          ? "ring-2 ring-inset ring-emerald-600 bg-emerald-50/40"
                          : cell.readOnly
                          ? "bg-slate-50/40 hover:bg-slate-50"
                          : "bg-white hover:bg-emerald-50/20"
                      } ${isNumeric ? "text-right tabular-nums" : "text-left"} ${
                        cell.bold ? "font-bold text-slate-900" : "text-slate-800"
                      }`}
                    >
                      {ev?.error ? (
                        <span className="inline-flex items-center gap-1 text-red-700 font-mono text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {ev.formatted}
                        </span>
                      ) : (
                        <span>
                          {ev?.formatted || (
                            <span className="text-slate-300 text-xs">
                              {!cell.readOnly ? "Clique p/ editar" : ""}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Live Column Chart */}
        {state.showChart && chartData.length > 0 && (
          <div className="mt-5 bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-900">
                {state.chartTitle || "Gráfico de Colunas"}
              </h4>
              <span className="text-xs text-slate-500">Atualizado em tempo real</span>
            </div>
            <div className="flex items-end gap-6 h-40 pt-4 pb-2 px-4 border-b border-slate-200">
              {chartData.map((d) => {
                const heightPct = Math.max(Math.round((d.value / maxChartVal) * 100), 4);
                return (
                  <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-xs font-mono font-medium text-slate-700 mb-1 tabular-nums">
                      {d.formatted}
                    </span>
                    <div
                      className="w-full max-w-[64px] bg-emerald-600 rounded-t-md transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-6 px-4 pt-2">
              {chartData.map((d) => (
                <div
                  key={d.label}
                  className="flex-1 text-center text-xs font-medium text-slate-700 truncate"
                >
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span>
          Célula <strong className="font-mono text-slate-900">{state.selectedCell}</strong>
          {activeEvaluated?.error ? ` · Erro: ${activeEvaluated.error}` : ""}
        </span>
        <span className="text-slate-500">
          Dica: use ponto e vírgula (;) dentro do =SE e dois pontos (:) em intervalos como B2:B5
        </span>
      </div>
    </div>
  );
};
