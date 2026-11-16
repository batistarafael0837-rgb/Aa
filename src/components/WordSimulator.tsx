import React, { useEffect, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Replace,
  Search,
  Underline,
} from "lucide-react";
import type { WordBlock, WordMissionState } from "../types/game";
import { sound } from "../utils/sound";

interface WordSimulatorProps {
  state: WordMissionState;
  onChange: (next: WordMissionState) => void;
}

export const WordSimulator: React.FC<WordSimulatorProps> = ({ state, onChange }) => {
  const [termOnlySelected, setTermOnlySelected] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [replaceFeedback, setReplaceFeedback] = useState<string | null>(null);

  const selectedBlock =
    state.blocks.find((b) => b.id === state.selectedBlockId) || state.blocks[0];

  const updateSelectedBlock = (updater: (block: WordBlock) => WordBlock) => {
    sound.playClick();
    onChange({
      ...state,
      blocks: state.blocks.map((b) =>
        b.id === selectedBlock.id ? updater(b) : b
      ),
    });
  };

  const toggleItalic = () => {
    if (termOnlySelected && selectedBlock.highlightTerm) {
      updateSelectedBlock((b) => ({
        ...b,
        highlightTermItalic: !b.highlightTermItalic,
      }));
    } else {
      updateSelectedBlock((b) => ({ ...b, italic: !b.italic }));
    }
  };

  const toggleBold = () => {
    updateSelectedBlock((b) => ({ ...b, bold: !b.bold }));
  };

  const toggleUnderline = () => {
    updateSelectedBlock((b) => ({ ...b, underline: !b.underline }));
  };

  // Keyboard shortcuts inside simulator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "b") {
        e.preventDefault();
        toggleBold();
      } else if (key === "i") {
        e.preventDefault();
        toggleItalic();
      } else if (key === "u") {
        e.preventDefault();
        toggleUnderline();
      } else if (key === "f") {
        e.preventDefault();
        setShowFindReplace((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleReplaceAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findText.trim()) return;
    let count = 0;
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");

    const nextBlocks = state.blocks.map((b) => {
      const matches = b.text.match(regex);
      if (matches) {
        count += matches.length;
        return { ...b, text: b.text.replace(regex, replaceText) };
      }
      return b;
    });

    sound.playStepComplete();
    onChange({ ...state, blocks: nextBlocks });
    setReplaceFeedback(
      count > 0
        ? `${count} ocorrência(s) substituída(s).`
        : `Nenhuma ocorrência de "${findText}" encontrada.`
    );
  };

  const renderBlockContent = (block: WordBlock) => {
    const lines = block.text.split("\n");

    if (block.listType === "bullet") {
      return (
        <ul className="list-disc pl-6 space-y-1">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      );
    }

    if (block.listType === "numbered") {
      return (
        <ol className="list-decimal pl-6 space-y-1">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      );
    }

    if (block.highlightTerm && block.text.includes(block.highlightTerm)) {
      const idx = block.text.indexOf(block.highlightTerm);
      const before = block.text.slice(0, idx);
      const after = block.text.slice(idx + block.highlightTerm.length);
      return (
        <span>
          {before}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onChange({ ...state, selectedBlockId: block.id });
              setTermOnlySelected(true);
            }}
            title="Clique para selecionar apenas este termo científico"
            className={`px-1 rounded transition-colors cursor-pointer ${
              block.highlightTermItalic ? "italic" : "underline decoration-dotted decoration-blue-500 underline-offset-4"
            } ${
              termOnlySelected && state.selectedBlockId === block.id
                ? "bg-blue-100 text-blue-900 ring-1 ring-blue-500"
                : "hover:bg-blue-50"
            }`}
          >
            {block.highlightTerm}
          </button>
          {after}
        </span>
      );
    }

    return lines.map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const fontStack =
    selectedBlock.fontFamily === "Times New Roman"
      ? '"Times New Roman", Georgia, serif'
      : selectedBlock.fontFamily === "Arial"
      ? "Arial, Helvetica, sans-serif"
      : '"DM Sans", Calibri, sans-serif';

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Ribbon Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-blue-700 pr-2 border-r border-slate-200 whitespace-nowrap">
          Word · Página Inicial
        </span>

        {/* Font Family & Size */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
          <select
            aria-label="Tipo de fonte"
            value={selectedBlock.fontFamily}
            onChange={(e) =>
              updateSelectedBlock((b) => ({
                ...b,
                fontFamily: e.target.value as WordBlock["fontFamily"],
              }))
            }
            className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Calibri">Calibri</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>

          <select
            aria-label="Tamanho da fonte"
            value={selectedBlock.fontSize}
            onChange={(e) =>
              updateSelectedBlock((b) => ({
                ...b,
                fontSize: Number(e.target.value),
              }))
            }
            className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[11, 12, 14, 16, 18, 20, 24].map((size) => (
              <option key={size} value={size}>
                {size}pt
              </option>
            ))}
          </select>
        </div>

        {/* Bold / Italic / Underline */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          <button
            type="button"
            onClick={toggleBold}
            title="Negrito (Ctrl+B)"
            aria-label="Negrito"
            className={`h-8 w-8 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${
              selectedBlock.bold
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleItalic}
            title="Itálico (Ctrl+I)"
            aria-label="Itálico"
            className={`h-8 w-8 flex items-center justify-center rounded-md text-xs transition-colors ${
              (termOnlySelected && selectedBlock.highlightTermItalic) ||
              (!termOnlySelected && selectedBlock.italic)
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleUnderline}
            title="Sublinhado (Ctrl+U)"
            aria-label="Sublinhado"
            className={`h-8 w-8 flex items-center justify-center rounded-md text-xs transition-colors ${
              selectedBlock.underline
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          {(
            [
              { val: "left", icon: AlignLeft, label: "Alinhar à Esquerda" },
              { val: "center", icon: AlignCenter, label: "Centralizar" },
              { val: "right", icon: AlignRight, label: "Alinhar à Direita" },
              { val: "justify", icon: AlignJustify, label: "Justificado" },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = selectedBlock.align === item.val;
            return (
              <button
                key={item.val}
                type="button"
                title={item.label}
                aria-label={item.label}
                onClick={() =>
                  updateSelectedBlock((b) => ({ ...b, align: item.val }))
                }
                className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Line Spacing & Lists */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          <button
            type="button"
            onClick={() =>
              updateSelectedBlock((b) => ({
                ...b,
                lineSpacing: b.lineSpacing === 1 ? 1.5 : 1,
              }))
            }
            title="Alternar Espaçamento entre linhas (1,0 / 1,5)"
            className={`h-8 px-2.5 flex items-center gap-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              selectedBlock.lineSpacing === 1.5
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Espaço {selectedBlock.lineSpacing === 1.5 ? "1,5" : "1,0"}
          </button>

          <button
            type="button"
            onClick={() =>
              updateSelectedBlock((b) => ({
                ...b,
                listType: b.listType === "bullet" ? "none" : "bullet",
              }))
            }
            title="Lista com Marcadores"
            aria-label="Lista com Marcadores"
            className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
              selectedBlock.listType === "bullet"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() =>
              updateSelectedBlock((b) => ({
                ...b,
                listType: b.listType === "numbered" ? "none" : "numbered",
              }))
            }
            title="Lista Numerada"
            aria-label="Lista Numerada"
            className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
              selectedBlock.listType === "numbered"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Style Preset & Find/Replace */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              updateSelectedBlock((b) => {
                const nextPreset =
                  b.stylePreset === "heading1" ? "normal" : "heading1";
                return {
                  ...b,
                  stylePreset: nextPreset,
                  fontSize: nextPreset === "heading1" ? 20 : 12,
                  bold: nextPreset === "heading1" ? true : false,
                  color: nextPreset === "heading1" ? "#1D4ED8" : "#0F172A",
                };
              })
            }
            className={`h-8 px-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              selectedBlock.stylePreset === "heading1"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            Título 1
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowFindReplace((v) => !v);
            }}
            className={`h-8 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              showFindReplace
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Localizar e Substituir
          </button>
        </div>
      </div>

      {/* Find & Replace Drawer */}
      {showFindReplace && (
        <form
          onSubmit={handleReplaceAll}
          className="bg-blue-50/70 border-b border-blue-200 px-4 py-2.5 flex flex-wrap items-center gap-2"
        >
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Localizar palavra..."
            className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Substituir por..."
            className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-md w-44 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Replace className="w-3.5 h-3.5" />
            Substituir Tudo
          </button>
          {replaceFeedback && (
            <span className="text-xs text-blue-800 font-medium ml-1">
              {replaceFeedback}
            </span>
          )}
        </form>
      )}

      {/* Document Canvas */}
      <div className="bg-slate-100/80 p-5 sm:p-7 overflow-y-auto min-h-[420px]">
        <div
          className="max-w-[660px] mx-auto bg-white border border-slate-200 shadow-sm px-8 sm:px-12 py-10 space-y-4 min-h-[380px]"
          style={{ fontFamily: fontStack }}
        >
          {state.blocks.map((block) => {
            const isSelected = block.id === selectedBlock.id;
            const blockFont =
              block.fontFamily === "Times New Roman"
                ? '"Times New Roman", Georgia, serif'
                : block.fontFamily === "Arial"
                ? "Arial, Helvetica, sans-serif"
                : '"DM Sans", Calibri, sans-serif';

            return (
              <div
                key={block.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  sound.playClick();
                  setTermOnlySelected(false);
                  onChange({ ...state, selectedBlockId: block.id });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setTermOnlySelected(false);
                    onChange({ ...state, selectedBlockId: block.id });
                  }
                }}
                className={`p-2.5 -mx-2.5 rounded-lg cursor-pointer transition-all outline-none ${
                  isSelected
                    ? "ring-2 ring-blue-500/80 bg-blue-50/30"
                    : "hover:bg-slate-50"
                }`}
                style={{
                  fontFamily: blockFont,
                  fontSize: `${block.fontSize}px`,
                  fontWeight: block.bold ? 700 : 400,
                  fontStyle: block.italic ? "italic" : "normal",
                  textDecoration: block.underline ? "underline" : "none",
                  textAlign: block.align,
                  lineHeight: block.lineSpacing === 1.5 ? 1.65 : 1.25,
                  color: block.color,
                }}
              >
                {renderBlockContent(block)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Word Status Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span>
          Selecionado:{" "}
          <strong className="text-slate-900">
            {termOnlySelected && selectedBlock.highlightTerm
              ? `Termo "${selectedBlock.highlightTerm}"`
              : selectedBlock.text.slice(0, 32) +
                (selectedBlock.text.length > 32 ? "..." : "")}
          </strong>
        </span>
        <span className="tabular-nums text-slate-500">
          {selectedBlock.fontFamily} · {selectedBlock.fontSize}pt · Espaço{" "}
          {selectedBlock.lineSpacing === 1.5 ? "1,5" : "1,0"}
        </span>
      </div>
    </div>
  );
};
