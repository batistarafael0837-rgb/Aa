import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Keyboard,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { SHORTCUT_CHALLENGES } from "../data/shortcuts";
import type { ShortcutChallenge } from "../types/game";
import { sound } from "../utils/sound";

interface ShortcutArcadeProps {
  onBack: () => void;
  onAddXp: (xp: number) => void;
}

const APP_LABELS: Record<ShortcutChallenge["app"], string> = {
  word: "Microsoft Word",
  excel: "Microsoft Excel",
  powerpoint: "Microsoft PowerPoint",
};

export const ShortcutArcade: React.FC<ShortcutArcadeProps> = ({
  onBack,
  onAddXp,
}) => {
  const [index, setIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const current = SHORTCUT_CHALLENGES[index];
  const answered = selectedIdx !== null;
  const isCorrect =
    answered &&
    current.options[selectedIdx].keys.join("+") === current.correctKeys.join("+");

  const handleChoose = (optIndex: number) => {
    if (answered) return;
    setSelectedIdx(optIndex);
    setAiNote(null);

    const chosen = current.options[optIndex];
    const correct = chosen.keys.join("+") === current.correctKeys.join("+");

    if (correct) {
      sound.playStepComplete();
      const gained = 25 + streak * 5;
      setScore((s) => s + gained);
      setStreak((st) => st + 1);
      onAddXp(gained);
    } else {
      sound.playError();
      setStreak(0);
    }
  };

  // Support real keyboard presses for shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (finished || answered) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      let pressed: string[] | null = null;
      if (e.key === "F5") {
        e.preventDefault();
        pressed = ["F5"];
      } else if (e.key === "Escape") {
        pressed = ["Esc"];
      } else if ((e.ctrlKey || e.metaKey) && e.key.length === 1) {
        const k = e.key.toUpperCase();
        if (["Z", "X", "C", "V", "S", "B", "I", "U", "A", "F"].includes(k)) {
          e.preventDefault();
          pressed = ["Ctrl", k];
        }
      }

      if (pressed) {
        const matchIdx = current.options.findIndex(
          (o) => o.keys.join("+") === pressed!.join("+")
        );
        if (matchIdx !== -1) {
          handleChoose(matchIdx);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const handleNext = () => {
    sound.playClick();
    setSelectedIdx(null);
    setAiNote(null);
    if (index + 1 >= SHORTCUT_CHALLENGES.length) {
      sound.playMissionWin();
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setIndex(0);
    setSelectedIdx(null);
    setScore(0);
    setStreak(0);
    setFinished(false);
    setAiNote(null);
  };

  const askAiAboutShortcut = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "shortcut",
          track: APP_LABELS[current.app],
          missionTitle: `Atalho ${current.correctKeys.join("+")}`,
          userMessage: `Explique com um macete fácil para um aluno do 8º/9º ano memorizar o atalho ${current.correctKeys.join(
            "+"
          )} nesta situação: "${current.situation}"`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setAiNote(data.reply);
      } else {
        setAiNote(data.error || "Não foi possível consultar a Prof. Bia agora.");
      }
    } catch {
      setAiNote("Erro de conexão ao consultar a Prof. Bia.");
    } finally {
      setAiLoading(false);
    }
  };

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Desafio de Atalhos Concluído
          </h2>
          <p className="text-slate-600 text-sm">
            Você completou as {SHORTCUT_CHALLENGES.length} rodadas e acumulou{" "}
            <strong className="text-slate-900 tabular-nums">{score} XP</strong> para
            agilizar seus trabalhos escolares.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Jogar Novamente
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Mapa
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-600 tabular-nums">
          <span>
            Rodada {index + 1} de {SHORTCUT_CHALLENGES.length}
          </span>
          <span aria-hidden="true">·</span>
          <span>Sequência: {streak}</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-slate-900">{score} XP</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Keyboard className="w-4 h-4 text-slate-700" />
            <span>{APP_LABELS[current.app]}</span>
            <span aria-hidden="true">·</span>
            <span>Clique no atalho ou pressione no teclado</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 text-balance">
            {current.situation}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {current.options.map((opt, optIdx) => {
            const isOptionCorrect =
              opt.keys.join("+") === current.correctKeys.join("+");
            const isSelected = selectedIdx === optIdx;

            let cardClass =
              "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50";
            if (answered) {
              if (isOptionCorrect) {
                cardClass = "border-emerald-500 bg-emerald-50/70";
              } else if (isSelected) {
                cardClass = "border-red-400 bg-red-50/70";
              } else {
                cardClass = "border-slate-200 bg-slate-50/40 opacity-60";
              }
            }

            return (
              <button
                key={opt.keys.join("+")}
                type="button"
                disabled={answered}
                onClick={() => handleChoose(optIdx)}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${cardClass}`}
              >
                <div className="flex items-center gap-1.5">
                  {opt.keys.map((k, ki) => (
                    <React.Fragment key={k}>
                      <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-md font-mono text-xs font-semibold text-slate-800 shadow-xs">
                        {k}
                      </kbd>
                      {ki < opt.keys.length - 1 && (
                        <span className="text-slate-400 text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                isCorrect
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-sm">
                <p className="font-semibold">
                  {isCorrect
                    ? "Acertou em cheio!"
                    : `Quase lá! O atalho certo era ${current.correctKeys.join("+")}.`}
                </p>
                <p className="text-slate-700">{current.explanation}</p>
              </div>
            </div>

            {aiNote && (
              <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-200 text-sm text-slate-800 space-y-1">
                <p className="text-xs font-semibold text-indigo-700">
                  Dica da Prof. Bia (IA)
                </p>
                <p className="whitespace-pre-line leading-relaxed">{aiNote}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={aiLoading}
                onClick={askAiAboutShortcut}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading ? "Prof. Bia pensando..." : "Pedir macete para a Prof. Bia"}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {index + 1 >= SHORTCUT_CHALLENGES.length
                  ? "Ver Resultado"
                  : "Próxima Rodada"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
