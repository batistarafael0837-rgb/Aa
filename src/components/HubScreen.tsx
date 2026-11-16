import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Keyboard,
  Presentation,
  Table2,
} from "lucide-react";
import type { MissionDefinition, OfficeTrack } from "../types/game";
import { sound } from "../utils/sound";

interface HubScreenProps {
  missions: MissionDefinition[];
  completedIds: string[];
  totalXp: number;
  selectedTrack: OfficeTrack | "all";
  onSelectTrack: (track: OfficeTrack | "all") => void;
  onStartMission: (missionId: string) => void;
  onStartShortcuts: () => void;
}

const HERO_IMG = "/src/assets/images/hero_office_desk_1794692331379.jpg";

const TRACK_META: Record<
  OfficeTrack,
  {
    name: string;
    accentText: string;
    accentButton: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  word: {
    name: "Word",
    accentText: "text-blue-700",
    accentButton: "bg-blue-600 hover:bg-blue-700",
    icon: FileText,
  },
  excel: {
    name: "Excel",
    accentText: "text-emerald-700",
    accentButton: "bg-emerald-600 hover:bg-emerald-700",
    icon: Table2,
  },
  powerpoint: {
    name: "PowerPoint",
    accentText: "text-orange-700",
    accentButton: "bg-orange-600 hover:bg-orange-700",
    icon: Presentation,
  },
};

export const HubScreen: React.FC<HubScreenProps> = ({
  missions,
  completedIds,
  totalXp,
  selectedTrack,
  onSelectTrack,
  onStartMission,
  onStartShortcuts,
}) => {
  const [heroError, setHeroError] = useState(false);

  const filteredMissions =
    selectedTrack === "all"
      ? missions
      : missions.filter((m) => m.track === selectedTrack);

  const nextRecommended =
    missions.find((m) => !completedIds.includes(m.id)) || missions[0];

  const wordDone = missions.filter(
    (m) => m.track === "word" && completedIds.includes(m.id)
  ).length;
  const excelDone = missions.filter(
    (m) => m.track === "excel" && completedIds.includes(m.id)
  ).length;
  const pptDone = missions.filter(
    (m) => m.track === "powerpoint" && completedIds.includes(m.id)
  ).length;

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 sm:py-10 space-y-10">
      {/* Split Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
          <div className="text-xs font-medium text-slate-500">
            Ensino Fundamental II · 8º e 9º Ano
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
            Domine o Office resolvendo missões reais da escola
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-xl">
            Pratique formatação de trabalhos no Word, fórmulas inteligentes no
            Excel e apresentações no PowerPoint com a Prof. Bia explicando cada
            passo na hora.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartMission(nextRecommended.id);
              }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {completedIds.length === 0
                ? "Começar Primeira Missão"
                : `Continuar: ${nextRecommended.title}`}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartShortcuts();
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Keyboard className="w-4 h-4 text-slate-600" />
              Desafio de Atalhos
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="h-full min-h-[260px] rounded-xl border border-slate-200 bg-white overflow-hidden">
            {!heroError ? (
              <img
                src={HERO_IMG}
                alt="Mesa de estudos com laptop exibindo documentos, planilhas e slides do Office"
                referrerPolicy="no-referrer"
                onError={() => setHeroError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[260px] bg-gradient-to-br from-slate-100 to-blue-50 flex flex-col items-center justify-center p-8 text-center">
                <Table2 className="w-12 h-12 text-blue-600 mb-3" />
                <p className="text-sm font-semibold text-slate-800">
                  Simulador Interativo Office
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Word · Excel · PowerPoint
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4-Column Progress Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Pontuação Acumulada</div>
          <div className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {totalXp} XP
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Word · Textos</div>
          <div className="mt-1 font-display text-2xl font-bold text-blue-700 tabular-nums">
            {wordDone} / 4
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Excel · Planilhas</div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-700 tabular-nums">
            {excelDone} / 4
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">PowerPoint · Slides</div>
          <div className="mt-1 font-display text-2xl font-bold text-orange-700 tabular-nums">
            {pptDone} / 4
          </div>
        </div>
      </section>

      {/* Track Filter & Missions Grid */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Missões Práticas
            </h2>
            <p className="text-sm text-slate-600">
              Escolha um aplicativo e resolva os desafios diretamente no simulador.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filtrar missões por aplicativo"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200"
          >
            {(
              [
                { id: "all", label: "Todas (12)" },
                { id: "word", label: "Word" },
                { id: "excel", label: "Excel" },
                { id: "powerpoint", label: "PowerPoint" },
              ] as const
            ).map((tab) => {
              const active = selectedTrack === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    sound.playClick();
                    onSelectTrack(tab.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMissions.map((mission) => {
            const meta = TRACK_META[mission.track];
            const Icon = meta.icon;
            const isDone = completedIds.includes(mission.id);

            return (
              <div
                key={mission.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${meta.accentText}`} />
                      <span className={`font-semibold ${meta.accentText}`}>
                        {meta.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Missão {mission.order}</span>
                    </div>
                    <span className="tabular-nums font-medium text-slate-600">
                      {mission.xpReward} XP
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">
                    {mission.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {mission.subtitle}
                  </p>
                  <div className="text-xs text-slate-500">
                    {mission.gradeTag} · {mission.objectives.length} objetivos
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      Concluída
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Disponível</span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onStartMission(mission.id);
                    }}
                    className={`px-3.5 py-2 text-xs font-medium text-white rounded-lg transition-colors whitespace-nowrap ${
                      isDone
                        ? "bg-slate-800 hover:bg-slate-900"
                        : meta.accentButton
                    }`}
                  >
                    {isDone ? "Praticar de Novo" : "Abrir Missão"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
