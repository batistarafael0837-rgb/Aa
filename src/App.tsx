import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AITutorPanel } from "./components/AITutorPanel";
import { ExcelSimulator } from "./components/ExcelSimulator";
import { HubScreen } from "./components/HubScreen";
import { PowerPointSimulator } from "./components/PowerPointSimulator";
import { ShortcutArcade } from "./components/ShortcutArcade";
import { WordSimulator } from "./components/WordSimulator";
import { MISSIONS } from "./data/missions";
import type {
  AppScreen,
  MissionDefinition,
  OfficeTrack,
  TutorMessage,
  WorkspaceState,
} from "./types/game";
import { sound } from "./utils/sound";

const STORAGE_KEY = "oficina_office_progress_v1";

interface SavedProgress {
  completedIds: string[];
  totalXp: number;
}

function loadProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedIds: [], totalXp: 0 };
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    return {
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      totalXp: typeof parsed.totalXp === "number" ? parsed.totalXp : 0,
    };
  } catch {
    return { completedIds: [], totalXp: 0 };
  }
}

export default function App() {
  const [progress, setProgress] = useState<SavedProgress>(() => loadProgress());
  const [screen, setScreen] = useState<AppScreen>("TITLE_MENU");
  const [selectedTrack, setSelectedTrack] = useState<OfficeTrack | "all">("all");
  const [activeMissionId, setActiveMissionId] = useState<string>(MISSIONS[0].id);
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>(() =>
    MISSIONS[0].createInitialState()
  );
  const [muted, setMuted] = useState(false);

  // Mission completion & AI Tutor state
  const [missionWon, setMissionWon] = useState(false);
  const [xpJustEarned, setXpJustEarned] = useState(0);
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const activeMission: MissionDefinition = useMemo(
    () => MISSIONS.find((m) => m.id === activeMissionId) || MISSIONS[0],
    [activeMissionId]
  );

  const objectiveResults = useMemo(
    () =>
      activeMission.objectives.map((obj) => ({
        ...obj,
        completed: obj.check(workspaceState),
      })),
    [activeMission, workspaceState]
  );

  const completedCount = objectiveResults.filter((o) => o.completed).length;
  const allCompleted = completedCount === objectiveResults.length;

  // Play subtle step chime when objective count increases
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);
  useEffect(() => {
    if (screen === "PLAYING" && completedCount > prevCompletedCount) {
      sound.playStepComplete();
    }
    setPrevCompletedCount(completedCount);
  }, [completedCount, prevCompletedCount, screen]);

  const startMission = (missionId: string) => {
    const mission = MISSIONS.find((m) => m.id === missionId) || MISSIONS[0];
    setActiveMissionId(mission.id);
    setWorkspaceState(mission.createInitialState());
    setMissionWon(false);
    setXpJustEarned(0);
    setPrevCompletedCount(0);
    setTutorError(null);
    setTutorMessages([
      {
        id: `welcome-${mission.id}`,
        role: "assistant",
        content: `Olá! Vamos resolver **${mission.title}**.\n\n${mission.initialPrompt} Se travar em qualquer passo, clique em **Pedir Dica** ou me pergunte aqui embaixo!`,
        timestamp: Date.now(),
      },
    ]);
    setScreen("PLAYING");
  };

  const resetCurrentMission = () => {
    sound.playClick();
    setWorkspaceState(activeMission.createInitialState());
    setMissionWon(false);
    setPrevCompletedCount(0);
    setTutorError(null);
  };

  const toggleMute = () => {
    const next = !muted;
    sound.muted = next;
    setMuted(next);
  };

  const callTutorApi = async (
    mode: "hint" | "explain" | "review" | "chat",
    userMessage?: string
  ) => {
    if (tutorLoading) return;
    setTutorError(null);

    const currentHistory = [...tutorMessages];
    if (mode === "chat" && userMessage) {
      const userMsg: TutorMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: Date.now(),
      };
      currentHistory.push(userMsg);
      setTutorMessages(currentHistory);
    } else if (mode === "hint") {
      const labelMsg: TutorMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: "Prof. Bia, pode me dar uma dica para o próximo passo?",
        timestamp: Date.now(),
      };
      currentHistory.push(labelMsg);
      setTutorMessages(currentHistory);
    } else if (mode === "explain") {
      const labelMsg: TutorMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: "Prof. Bia, explique por que usamos esse recurso na prática.",
        timestamp: Date.now(),
      };
      currentHistory.push(labelMsg);
      setTutorMessages(currentHistory);
    }

    setTutorLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          track: activeMission.track.toUpperCase(),
          missionTitle: activeMission.title,
          missionSummary: activeMission.conceptSummary,
          objectives: objectiveResults.map((o) => ({
            label: o.label,
            completed: o.completed,
          })),
          workspaceSnapshot: activeMission.summarizeForAI(workspaceState),
          userMessage,
          history: currentHistory.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTutorError(data.error || "Erro ao consultar a tutora de IA.");
        return;
      }

      const replyMsg: TutorMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: Date.now(),
      };
      setTutorMessages((prev) => [...prev, replyMsg]);
    } catch {
      setTutorError("Não foi possível conectar com a Prof. Bia. Verifique sua conexão.");
    } finally {
      setTutorLoading(false);
    }
  };

  const handleVerifyMission = () => {
    if (allCompleted) {
      sound.playMissionWin();
      const alreadyDone = progress.completedIds.includes(activeMission.id);
      const earned = alreadyDone ? 0 : activeMission.xpReward;
      if (!alreadyDone) {
        setProgress((prev) => ({
          completedIds: [...prev.completedIds, activeMission.id],
          totalXp: prev.totalXp + activeMission.xpReward,
        }));
      }
      setXpJustEarned(earned);
      setMissionWon(true);
    } else {
      sound.playError();
      callTutorApi("review");
    }
  };

  const nextMission = useMemo(() => {
    const idx = MISSIONS.findIndex((m) => m.id === activeMission.id);
    return idx >= 0 && idx + 1 < MISSIONS.length ? MISSIONS[idx + 1] : null;
  }, [activeMission]);

  const handleNavTrack = (track: OfficeTrack | "all") => {
    sound.playClick();
    setSelectedTrack(track);
    setScreen("TITLE_MENU");
  };

  const trackLabel =
    activeMission.track === "word"
      ? "Word"
      : activeMission.track === "excel"
      ? "Excel"
      : "PowerPoint";

  const nextRecommended =
    MISSIONS.find((m) => !progress.completedIds.includes(m.id)) || MISSIONS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setScreen("TITLE_MENU");
            }}
            className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Oficina Office
          </button>

          {/* Zone 2: Clean single-line text links */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => handleNavTrack("all")}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                screen === "TITLE_MENU" && selectedTrack === "all"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent"
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => handleNavTrack("word")}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                screen === "TITLE_MENU" && selectedTrack === "word"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent"
              }`}
            >
              Word
            </button>
            <button
              type="button"
              onClick={() => handleNavTrack("excel")}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                screen === "TITLE_MENU" && selectedTrack === "excel"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent"
              }`}
            >
              Excel
            </button>
            <button
              type="button"
              onClick={() => handleNavTrack("powerpoint")}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                screen === "TITLE_MENU" && selectedTrack === "powerpoint"
                  ? "border-orange-600 text-orange-700"
                  : "border-transparent"
              }`}
            >
              PowerPoint
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setScreen("SHORTCUTS");
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                screen === "SHORTCUTS"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent"
              }`}
            >
              Atalhos
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            {screen === "TITLE_MENU" ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  startMission(nextRecommended.id);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Praticar Agora
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setScreen("TITLE_MENU");
                }}
                className="px-4 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Mapa de Missões
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {screen === "TITLE_MENU" && (
        <HubScreen
          missions={MISSIONS}
          completedIds={progress.completedIds}
          totalXp={progress.totalXp}
          selectedTrack={selectedTrack}
          onSelectTrack={setSelectedTrack}
          onStartMission={startMission}
          onStartShortcuts={() => setScreen("SHORTCUTS")}
        />
      )}

      {screen === "SHORTCUTS" && (
        <ShortcutArcade
          onBack={() => setScreen("TITLE_MENU")}
          onAddXp={(xp) =>
            setProgress((prev) => ({
              ...prev,
              totalXp: prev.totalXp + xp,
            }))
          }
        />
      )}

      {screen === "PLAYING" && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4">
          {/* Mission HUD Strip */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold text-slate-700">{trackLabel}</span>
                <span aria-hidden="true">·</span>
                <span>Missão {activeMission.order} de 4</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{activeMission.xpReward} XP</span>
              </div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate">
                {activeMission.title} — {activeMission.subtitle}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleMute}
                title={muted ? "Ativar sons" : "Silenciar sons"}
                aria-label={muted ? "Ativar sons" : "Silenciar sons"}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              >
                {muted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={resetCurrentMission}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar
              </button>

              <button
                type="button"
                onClick={handleVerifyMission}
                className={`h-9 px-4 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  allCompleted
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {allCompleted ? "Concluir Missão" : "Verificar Tarefa"}
              </button>
            </div>
          </div>

          {/* Two-Zone Sandbox Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left/Center Zone: Checklist + Interactive Simulator */}
            <div className="lg:col-span-8 space-y-4">
              {/* Objectives Checklist */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xs font-semibold text-slate-700">
                    Objetivos desta missão
                  </h2>
                  <span className="text-xs font-medium text-slate-500 tabular-nums">
                    {completedCount} de {objectiveResults.length} concluídos
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {objectiveResults.map((obj) => (
                    <li
                      key={obj.id}
                      className={`flex items-start gap-2.5 text-sm transition-colors ${
                        obj.completed ? "text-emerald-800" : "text-slate-700"
                      }`}
                    >
                      {obj.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <span className={obj.completed ? "line-through opacity-80" : ""}>
                        {obj.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Office Simulator */}
              {workspaceState.kind === "word" && (
                <WordSimulator
                  state={workspaceState.data}
                  onChange={(data) => setWorkspaceState({ kind: "word", data })}
                />
              )}

              {workspaceState.kind === "excel" && (
                <ExcelSimulator
                  state={workspaceState.data}
                  onChange={(data) => setWorkspaceState({ kind: "excel", data })}
                />
              )}

              {workspaceState.kind === "powerpoint" && (
                <PowerPointSimulator
                  state={workspaceState.data}
                  onChange={(data) =>
                    setWorkspaceState({ kind: "powerpoint", data })
                  }
                />
              )}
            </div>

            {/* Right Zone: Prof. Bia AI Tutor */}
            <div className="lg:col-span-4 lg:sticky lg:top-20">
              <AITutorPanel
                messages={tutorMessages}
                loading={tutorLoading}
                error={tutorError}
                onRequestMode={(mode) => callTutorApi(mode)}
                onSendMessage={(text) => callTutorApi("chat", text)}
                onClearError={() => setTutorError(null)}
              />
            </div>
          </div>
        </main>
      )}

      {/* Mission Victory Modal */}
      {missionWon && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-700">
                  Missão Concluída
                  {xpJustEarned > 0 ? ` · +${xpJustEarned} XP` : " · Revisão"}
                </div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {activeMission.title}
                </h2>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">
                O que você dominou:
              </p>
              <p>{activeMission.conceptSummary}</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMissionWon(false);
                  setScreen("TITLE_MENU");
                }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Voltar ao Mapa
              </button>
              {nextMission && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    startMission(nextMission.id);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  Próxima: {nextMission.title}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
