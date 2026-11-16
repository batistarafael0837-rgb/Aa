import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Lightbulb, Send, Sparkles } from "lucide-react";
import type { TutorMessage } from "../types/game";
import { sound } from "../utils/sound";

interface AITutorPanelProps {
  messages: TutorMessage[];
  loading: boolean;
  error: string | null;
  onRequestMode: (mode: "hint" | "explain") => void;
  onSendMessage: (text: string) => void;
  onClearError: () => void;
}

const AVATAR_SRC = "/src/assets/images/tutor_bia_avatar_1794692330659.jpg";

function renderFormattedText(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("• ");
    const content = isBullet ? trimmed.slice(2) : line;

    // Parse **bold** and `code` inline
    const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    const renderedParts = parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="font-mono text-xs bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded border border-slate-200"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 pl-1">
          <span className="text-indigo-600 font-bold leading-5">•</span>
          <span className="flex-1">{renderedParts}</span>
        </div>
      );
    }

    if (trimmed === "") {
      return <div key={lineIdx} className="h-1.5" />;
    }

    return <p key={lineIdx}>{renderedParts}</p>;
  });
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  messages,
  loading,
  error,
  onRequestMode,
  onSendMessage,
  onClearError,
}) => {
  const [input, setInput] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    sound.playClick();
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full max-h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center gap-3">
        {!avatarFailed ? (
          <img
            src={AVATAR_SRC}
            alt="Prof. Bia, tutora de Office"
            referrerPolicy="no-referrer"
            onError={() => setAvatarFailed(true)}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-display font-bold text-sm shrink-0">
            PB
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            Prof. Bia · Tutora IA
          </h3>
          <p className="text-xs text-slate-500 truncate">
            Tira-dúvidas e explicações em tempo real
          </p>
        </div>
      </div>

      {/* Quick Action Controls */}
      <div className="px-3 py-2 border-b border-slate-200 bg-white flex items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            sound.playClick();
            onRequestMode("hint");
          }}
          className="flex-1 h-8 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <Lightbulb className="w-3.5 h-3.5 shrink-0" />
          Pedir Dica
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            sound.playClick();
            onRequestMode("explain");
          }}
          className="flex-1 h-8 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          Explicar Conceito
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed space-y-1.5 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700"
              }`}
            >
              {msg.role === "user" ? (
                <p>{msg.content}</p>
              ) : (
                renderFormattedText(msg.content)
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Prof. Bia está analisando sua tela...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 flex items-start justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={onClearError}
              className="text-red-700 font-semibold hover:underline shrink-0"
            >
              Fechar
            </button>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo para a Prof. Bia..."
          className="flex-1 h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Enviar pergunta para a tutora de IA"
          className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
