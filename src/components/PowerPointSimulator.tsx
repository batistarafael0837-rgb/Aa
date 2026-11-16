import React, { useEffect } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Columns2,
  Droplets,
  Image as ImageIcon,
  LayoutTemplate,
  List,
  Play,
  Recycle,
  Sun,
  X,
} from "lucide-react";
import type {
  PowerPointMissionState,
  SlideItem,
  SlideLayout,
  SlideTheme,
} from "../types/game";
import { sound } from "../utils/sound";

interface PowerPointSimulatorProps {
  state: PowerPointMissionState;
  onChange: (next: PowerPointMissionState) => void;
}

const THEME_STYLES: Record<
  SlideTheme,
  {
    name: string;
    bg: string;
    title: string;
    subtitle: string;
    body: string;
    accentBar: string;
    cardBg: string;
  }
> = {
  light: {
    name: "Clássico Claro",
    bg: "bg-white",
    title: "text-slate-900",
    subtitle: "text-slate-500",
    body: "text-slate-700",
    accentBar: "bg-slate-200",
    cardBg: "bg-slate-50 border-slate-200",
  },
  "academic-blue": {
    name: "Azul Acadêmico",
    bg: "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900",
    title: "text-white",
    subtitle: "text-blue-200",
    body: "text-slate-100",
    accentBar: "bg-blue-400",
    cardBg: "bg-white/10 border-white/15",
  },
  "nature-green": {
    name: "Verde Natureza",
    bg: "bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950",
    title: "text-white",
    subtitle: "text-emerald-200",
    body: "text-emerald-50",
    accentBar: "bg-emerald-400",
    cardBg: "bg-white/10 border-white/15",
  },
};

export const PowerPointSimulator: React.FC<PowerPointSimulatorProps> = ({
  state,
  onChange,
}) => {
  const activeSlide =
    state.slides[state.selectedSlideIndex] || state.slides[0];
  const themeStyle = THEME_STYLES[state.theme];

  const updateActiveSlide = (updater: (slide: SlideItem) => SlideItem) => {
    onChange({
      ...state,
      slides: state.slides.map((s, idx) =>
        idx === state.selectedSlideIndex ? updater(s) : s
      ),
    });
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= state.slides.length) return;
    sound.playClick();
    const copy = [...state.slides];
    const [removed] = copy.splice(index, 1);
    copy.splice(target, 0, removed);
    onChange({
      ...state,
      slides: copy,
      selectedSlideIndex: target,
    });
  };

  const startPresentation = () => {
    sound.playStepComplete();
    onChange({
      ...state,
      isPresenting: true,
      hasPresented: true,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        startPresentation();
      } else if (e.key === "Escape" && state.isPresenting) {
        onChange({ ...state, isPresenting: false });
      } else if (state.isPresenting && e.key === "ArrowRight") {
        onChange({
          ...state,
          selectedSlideIndex: Math.min(
            state.slides.length - 1,
            state.selectedSlideIndex + 1
          ),
        });
      } else if (state.isPresenting && e.key === "ArrowLeft") {
        onChange({
          ...state,
          selectedSlideIndex: Math.max(0, state.selectedSlideIndex - 1),
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const renderSlideVisual = (tag?: SlideItem["visualTag"]) => {
    const iconClass = "w-12 h-12 opacity-90";
    switch (tag) {
      case "solar":
        return <Sun className={iconClass} />;
      case "water":
        return <Droplets className={iconClass} />;
      case "recycle":
        return <Recycle className={iconClass} />;
      default:
        return <BarChart3 className={iconClass} />;
    }
  };

  const renderBodyLines = (slide: SlideItem, compact = false) => {
    const lines = slide.body
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (slide.isBulleted) {
      return (
        <ul
          className={`list-disc pl-5 space-y-1.5 ${
            compact ? "text-[10px]" : "text-sm sm:text-base"
          } ${themeStyle.body}`}
        >
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      );
    }

    return (
      <div
        className={`space-y-1.5 ${
          compact ? "text-[10px]" : "text-sm sm:text-base"
        } ${themeStyle.body}`}
      >
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-orange-700 pr-2 border-r border-slate-200 whitespace-nowrap">
          PowerPoint · Design e Slides
        </span>

        {/* Layout controls */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          {(
            [
              { id: "cover", label: "Slide de Capa", icon: LayoutTemplate },
              { id: "title-content", label: "Título e Texto", icon: List },
              { id: "two-columns", label: "Duas Colunas", icon: Columns2 },
              { id: "image-text", label: "Imagem e Texto", icon: ImageIcon },
            ] as Array<{ id: SlideLayout; label: string; icon: React.ComponentType<{ className?: string }> }>
          ).map((l) => {
            const Icon = l.icon;
            const active = activeSlide.layout === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  updateActiveSlide((s) => ({ ...s, layout: l.id }));
                }}
                className={`h-8 px-2.5 flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-orange-600 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{l.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bullets toggle */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            updateActiveSlide((s) => ({ ...s, isBulleted: !s.isBulleted }));
          }}
          className={`h-8 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeSlide.isBulleted
              ? "bg-orange-600 text-white"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          Tópicos Curtos
        </button>

        {/* Theme switcher */}
        <select
          aria-label="Tema dos slides"
          value={state.theme}
          onChange={(e) => {
            sound.playClick();
            onChange({ ...state, theme: e.target.value as SlideTheme });
          }}
          className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="light">Tema: Clássico Claro</option>
          <option value="academic-blue">Tema: Azul Acadêmico</option>
          <option value="nature-green">Tema: Verde Natureza</option>
        </select>

        {/* Present F5 */}
        <button
          type="button"
          onClick={startPresentation}
          className="h-8 px-3 ml-auto bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5" />
          Apresentar (F5)
        </button>
      </div>

      {/* Main Editor Split: Slide Thumbnails + Active Stage */}
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] bg-slate-100/80 min-h-[420px]">
        {/* Left Slide Thumbnails */}
        <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-3 flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto">
          {state.slides.map((slide, idx) => {
            const isActive = idx === state.selectedSlideIndex;
            return (
              <div
                key={slide.id}
                className={`shrink-0 w-36 md:w-full rounded-lg border p-2 transition-all ${
                  isActive
                    ? "border-orange-500 bg-orange-50/50 ring-1 ring-orange-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onChange({ ...state, selectedSlideIndex: idx });
                    }}
                    className="text-xs font-mono font-semibold text-slate-700 hover:text-orange-700"
                  >
                    Slide {idx + 1}
                  </button>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSlide(idx, -1)}
                      title="Mover slide para cima"
                      aria-label={`Mover slide ${idx + 1} para cima`}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === state.slides.length - 1}
                      onClick={() => moveSlide(idx, 1)}
                      title="Mover slide para baixo"
                      aria-label={`Mover slide ${idx + 1} para baixo`}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onChange({ ...state, selectedSlideIndex: idx });
                  }}
                  className={`w-full aspect-video rounded border border-slate-200 p-2 text-left overflow-hidden flex flex-col justify-center ${themeStyle.bg}`}
                >
                  <span className={`text-[10px] font-semibold leading-tight line-clamp-2 ${themeStyle.title}`}>
                    {slide.title}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Center Stage + Notes */}
        <div className="p-4 sm:p-6 flex flex-col gap-4">
          {/* 16:9 Editable Slide Canvas */}
          <div
            className={`w-full aspect-video rounded-xl border border-slate-200 shadow-sm p-6 sm:p-9 flex flex-col justify-between transition-colors ${themeStyle.bg}`}
          >
            {activeSlide.layout === "cover" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                <div className={`w-14 h-1 rounded-full ${themeStyle.accentBar}`} />
                <input
                  type="text"
                  aria-label="Título do slide"
                  value={activeSlide.title}
                  onChange={(e) =>
                    updateActiveSlide((s) => ({ ...s, title: e.target.value }))
                  }
                  placeholder="Título da apresentação..."
                  className={`w-full text-center font-display text-xl sm:text-3xl font-bold bg-transparent border border-transparent hover:border-white/25 focus:border-orange-400 rounded-md px-2 py-1 focus:outline-none ${themeStyle.title}`}
                />
                <input
                  type="text"
                  aria-label="Subtítulo do slide"
                  value={activeSlide.subtitle || ""}
                  onChange={(e) =>
                    updateActiveSlide((s) => ({ ...s, subtitle: e.target.value }))
                  }
                  placeholder="Digite aqui o subtítulo (ex: Turma 8º A)..."
                  className={`w-full max-w-md text-center text-sm sm:text-base bg-transparent border border-dashed border-slate-400/50 focus:border-orange-400 rounded-md px-3 py-1.5 focus:outline-none ${themeStyle.subtitle}`}
                />
              </div>
            ) : (
              <>
                <div className="border-b border-current/10 pb-3">
                  <input
                    type="text"
                    aria-label="Título do slide"
                    value={activeSlide.title}
                    onChange={(e) =>
                      updateActiveSlide((s) => ({ ...s, title: e.target.value }))
                    }
                    className={`w-full font-display text-lg sm:text-2xl font-bold bg-transparent border border-transparent hover:border-slate-300/40 focus:border-orange-400 rounded px-1 py-0.5 focus:outline-none ${themeStyle.title}`}
                  />
                </div>

                {activeSlide.layout === "image-text" ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-5 items-center pt-4">
                    <div>{renderBodyLines(activeSlide)}</div>
                    <div
                      className={`h-full min-h-[120px] rounded-xl border flex flex-col items-center justify-center gap-2 p-4 ${themeStyle.cardBg} ${themeStyle.subtitle}`}
                    >
                      {renderSlideVisual(activeSlide.visualTag)}
                      <span className="text-xs font-medium text-center">
                        Ilustração do tema
                      </span>
                    </div>
                  </div>
                ) : activeSlide.layout === "two-columns" ? (
                  <div className="flex-1 grid grid-cols-2 gap-4 pt-4 items-start">
                    {(() => {
                      const lines = activeSlide.body
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(Boolean);
                      const mid = Math.ceil(lines.length / 2);
                      const col1 = lines.slice(0, mid);
                      const col2 = lines.slice(mid);
                      return (
                        <>
                          <div className={`p-3 rounded-lg border ${themeStyle.cardBg}`}>
                            <ul
                              className={`${
                                activeSlide.isBulleted ? "list-disc pl-4" : ""
                              } space-y-1.5 text-xs sm:text-sm ${themeStyle.body}`}
                            >
                              {col1.map((l, i) => (
                                <li key={i}>{l}</li>
                              ))}
                            </ul>
                          </div>
                          <div className={`p-3 rounded-lg border ${themeStyle.cardBg}`}>
                            <ul
                              className={`${
                                activeSlide.isBulleted ? "list-disc pl-4" : ""
                              } space-y-1.5 text-xs sm:text-sm ${themeStyle.body}`}
                            >
                              {col2.map((l, i) => (
                                <li key={i}>{l}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex-1 pt-4 overflow-y-auto">
                    {renderBodyLines(activeSlide)}
                  </div>
                )}
              </>
            )}

            <div className={`text-[11px] flex justify-between pt-2 ${themeStyle.subtitle}`}>
              <span>Oficina Office</span>
              <span className="tabular-nums">
                Slide {state.selectedSlideIndex + 1} de {state.slides.length}
              </span>
            </div>
          </div>

          {/* Speaker Notes Box */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <label
              htmlFor="ppt-notes"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Anotações do Apresentador (visível só para você durante a fala)
            </label>
            <textarea
              id="ppt-notes"
              rows={2}
              value={activeSlide.notes}
              onChange={(e) =>
                updateActiveSlide((s) => ({ ...s, notes: e.target.value }))
              }
              placeholder="Escreva aqui o que você vai explicar em voz alta neste slide..."
              className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Presentation Modal */}
      {state.isPresenting && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-5xl flex items-center justify-between text-white/80 text-xs mb-3">
            <span>Modo Apresentação · Pressione Esc para sair</span>
            <button
              type="button"
              onClick={() => onChange({ ...state, isPresenting: false })}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white flex items-center gap-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              Sair (Esc)
            </button>
          </div>

          <div
            className={`w-full max-w-5xl aspect-video rounded-xl border border-white/15 p-10 sm:p-14 flex flex-col justify-between shadow-2xl ${themeStyle.bg}`}
          >
            <div className="flex-1 flex flex-col justify-center">
              <h2 className={`font-display text-3xl sm:text-5xl font-bold mb-4 ${themeStyle.title}`}>
                {activeSlide.title}
              </h2>
              {activeSlide.subtitle && (
                <p className={`text-xl mb-4 ${themeStyle.subtitle}`}>
                  {activeSlide.subtitle}
                </p>
              )}
              {activeSlide.body && renderBodyLines(activeSlide)}
            </div>
            <div className={`flex justify-between text-xs ${themeStyle.subtitle}`}>
              <span>Apresentação Escolar</span>
              <span className="tabular-nums">
                {state.selectedSlideIndex + 1} / {state.slides.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              disabled={state.selectedSlideIndex === 0}
              onClick={() =>
                onChange({
                  ...state,
                  selectedSlideIndex: state.selectedSlideIndex - 1,
                })
              }
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-sm rounded-lg flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              type="button"
              disabled={state.selectedSlideIndex === state.slides.length - 1}
              onClick={() =>
                onChange({
                  ...state,
                  selectedSlideIndex: state.selectedSlideIndex + 1,
                })
              }
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-30 text-white text-sm rounded-lg flex items-center gap-1.5"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
