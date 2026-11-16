import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

interface TutorHistoryItem {
  role: "user" | "assistant";
  content: string;
}

interface TutorRequestBody {
  mode: "hint" | "explain" | "review" | "chat" | "shortcut";
  track?: string;
  missionTitle?: string;
  missionSummary?: string;
  objectives?: Array<{ label: string; completed: boolean }>;
  workspaceSnapshot?: string;
  userMessage?: string;
  history?: TutorHistoryItem[];
}

const SYSTEM_INSTRUCTION = `Você é a Prof. Bia, uma professora brasileira de informática e tecnologia muito paciente, didática e animada que ajuda alunos do 8º e 9º ano (13 a 15 anos) a dominarem o Microsoft Office (Word, Excel e PowerPoint) dentro do mini-game Oficina Office.

Regras da sua resposta:
1. Fale sempre em português do Brasil natural, claro, acolhedor e direto para adolescentes do 8º/9º ano. Sem formalidade excessiva e sem infantilizar.
2. Seja objetiva: use parágrafos curtos (2 a 3 frases) e listas com marcadores quando explicar passos.
3. Destaque nomes de botões, fórmulas e atalhos em negrito, por exemplo: **Negrito (Ctrl+B)**, **Justificado**, **\`=SOMA(B2:B5)\`**.
4. Observe sempre o estado atual do documento, planilha ou slide do aluno que foi enviado no contexto! Se o aluno errou a fórmula (ex: esqueceu o sinal \`=\`, usou vírgula em vez de ponto e vírgula, ou escolheu o intervalo errado), aponte exatamente onde está o detalhe e explique o porquê.
5. No modo "hint" (Dica), dê uma pista prática para o próximo objetivo que ainda falta, sem entregar tudo pronto de uma vez se o aluno ainda não tentou.
6. No modo "explain" (Explicar Conceito), explique de forma visual e simples PARA QUE serve aquela ferramenta na escola e na vida real (ex: trabalhos escolares, boletim, orçamento, seminários).
7. No modo "review" (Revisão após erro), elogie o que já foi feito e explique com clareza o que falta ajustar.
8. Nunca invente recursos que não existem no simulador; foque nos botões da barra de ferramentas, fórmulas em português (=SOMA, =MÉDIA, =MÁXIMO, =SE) e atalhos padrão do Office.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.post("/api/tutor", async (req, res) => {
    try {
      if (!ai || !process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error:
            "A chave da API do Gemini não está configurada no servidor. Verifique o painel Settings > Secrets.",
          code: "MISSING_API_KEY",
        });
      }

      const body = req.body as TutorRequestBody;
      const mode = body.mode || "chat";

      const objectivesText = (body.objectives || [])
        .map((obj, idx) => `${idx + 1}. [${obj.completed ? "FEITO" : "PENDENTE"}] ${obj.label}`)
        .join("\n");

      const historyText = (body.history || [])
        .slice(-6)
        .map((item) => `${item.role === "user" ? "Aluno" : "Prof. Bia"}: ${item.content}`)
        .join("\n");

      let modeInstruction = "";
      if (mode === "hint") {
        modeInstruction =
          "O aluno pediu uma DICA prática agora. Olhe os objetivos PENDENTES e o estado atual e dê uma orientação clara para o próximo passo.";
      } else if (mode === "explain") {
        modeInstruction =
          "O aluno clicou em EXPLICAR CONCEITO. Explique de maneira didática por que essa ferramenta/fórmula do Office funciona assim e dê um exemplo prático do dia a dia escolar.";
      } else if (mode === "review") {
        modeInstruction =
          "O aluno clicou em Verificar Tarefa, mas ainda há objetivos pendentes. Explique de forma encorajadora o que já está certo e o que precisa corrigir ou completar.";
      } else if (mode === "shortcut") {
        modeInstruction =
          "O aluno quer entender melhor um atalho de teclado do Office. Explique o atalho, um macete fácil de memorizar (ex: B de Bold, S de Save, Z de desfazer) e quando usar na escola.";
      } else {
        modeInstruction =
          "Responda à dúvida específica do aluno abaixo usando o contexto atual da missão.";
      }

      const prompt = [
        `Trilha atual: ${body.track || "Geral"}`,
        body.missionTitle ? `Missão atual: ${body.missionTitle}` : "",
        body.missionSummary ? `Contexto da missão: ${body.missionSummary}` : "",
        objectivesText ? `Checklist de objetivos:\n${objectivesText}` : "",
        body.workspaceSnapshot
          ? `Estado atual na tela do aluno:\n${body.workspaceSnapshot}`
          : "",
        historyText ? `Conversa recente:\n${historyText}` : "",
        `Instrução do momento: ${modeInstruction}`,
        body.userMessage ? `Mensagem do aluno: "${body.userMessage}"` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        return res.status(502).json({
          error: "A Prof. Bia não conseguiu gerar uma resposta agora. Tente perguntar novamente.",
          code: "EMPTY_RESPONSE",
        });
      }

      return res.json({ reply });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Erro no /api/tutor:", message);

      if (message.includes("403") || message.includes("PERMISSION_DENIED") || message.includes("API_KEY_INVALID")) {
        return res.status(403).json({
          error:
            "Chave de API inválida ou sem permissão. Verifique a chave configurada em Settings > Secrets.",
          code: "AUTH_ERROR",
        });
      }
      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({
          error:
            "Muitas perguntas em pouco tempo! Aguarde alguns segundos e tente novamente.",
          code: "RATE_LIMIT",
        });
      }

      return res.status(500).json({
        error: "Erro ao consultar a tutora de IA. Tente novamente em instantes.",
        code: "INTERNAL_ERROR",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Oficina Office rodando em http://localhost:${PORT}`);
  });
}

startServer();
