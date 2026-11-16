import type { MissionDefinition, WorkspaceState } from "../types/game";
import { evaluateCell, normalizeFormula } from "../utils/excelEngine";

export const MISSIONS: MissionDefinition[] = [
  // ======================== WORD ========================
  {
    id: "word-1",
    track: "word",
    order: 1,
    title: "Título e Destaques",
    subtitle: "Trabalho de Ciências: O Ciclo da Água",
    gradeTag: "8º Ano · Básico",
    xpReward: 100,
    conceptSummary:
      "Em trabalhos escolares, o título principal precisa de destaque (centralizado e fonte maior), subtítulos usam Negrito e termos científicos usam Itálico.",
    initialPrompt:
      "Formate o trabalho de Ciências seguindo as regras da barra de ferramentas do Word.",
    createInitialState: (): WorkspaceState => ({
      kind: "word",
      data: {
        selectedBlockId: "w1-title",
        blocks: [
          {
            id: "w1-title",
            role: "title",
            text: "O Ciclo da Água na Natureza",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Calibri",
            lineSpacing: 1,
            listType: "none",
            stylePreset: "normal",
            color: "#0F172A",
          },
          {
            id: "w1-sub1",
            role: "subtitle",
            text: "1. Evaporação",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 14,
            fontFamily: "Calibri",
            lineSpacing: 1,
            listType: "none",
            stylePreset: "normal",
            color: "#0F172A",
          },
          {
            id: "w1-body1",
            role: "body",
            text: "O calor do sol aquece rios, oceanos e o solo, transformando a água líquida em vapor. Nas plantas, esse processo também ocorre pela evapotranspiração.",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Calibri",
            lineSpacing: 1,
            listType: "none",
            stylePreset: "normal",
            color: "#1E293B",
            highlightTerm: "evapotranspiração",
            highlightTermItalic: false,
          },
          {
            id: "w1-sub2",
            role: "subtitle",
            text: "2. Condensação",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 14,
            fontFamily: "Calibri",
            lineSpacing: 1,
            listType: "none",
            stylePreset: "normal",
            color: "#0F172A",
          },
          {
            id: "w1-body2",
            role: "body",
            text: "Ao subir para camadas mais frias da atmosfera, o vapor esfria e forma pequenas gotículas que dão origem às nuvens.",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Calibri",
            lineSpacing: 1,
            listType: "none",
            stylePreset: "normal",
            color: "#1E293B",
          },
        ],
      },
    }),
    objectives: [
      {
        id: "w1-obj1",
        label: "Centralizar o título principal e ajustar tamanho para 20pt",
        check: (state) => {
          if (state.kind !== "word") return false;
          const title = state.data.blocks.find((b) => b.id === "w1-title");
          return Boolean(title && title.align === "center" && title.fontSize >= 20);
        },
      },
      {
        id: "w1-obj2",
        label: "Aplicar Negrito nos dois subtítulos (1. Evaporação e 2. Condensação)",
        check: (state) => {
          if (state.kind !== "word") return false;
          const subs = state.data.blocks.filter((b) => b.role === "subtitle");
          return subs.length > 0 && subs.every((b) => b.bold);
        },
      },
      {
        id: "w1-obj3",
        label: "Aplicar Itálico no termo científico \"evapotranspiração\"",
        check: (state) => {
          if (state.kind !== "word") return false;
          const b = state.data.blocks.find((item) => item.id === "w1-body1");
          return Boolean(b && (b.highlightTermItalic || b.italic));
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "word") return "";
      return state.data.blocks
        .map(
          (b) =>
            `[${b.role}] "${b.text.slice(0, 45)}..." | alinhamento=${b.align}, tamanho=${b.fontSize}pt, negrito=${b.bold}, itálico=${b.italic}, termoItálico=${Boolean(b.highlightTermItalic)}`
        )
        .join("\n");
    },
  },
  {
    id: "word-2",
    track: "word",
    order: 2,
    title: "Padrão Escolar (ABNT)",
    subtitle: "Redação de História: Revolução Industrial",
    gradeTag: "8º Ano · Formatação",
    xpReward: 120,
    conceptSummary:
      "As normas escolares pedem fonte padrão (Arial ou Times New Roman 12pt), texto Justificado (alinhado nas duas margens) e espaçamento 1,5 entre linhas.",
    initialPrompt:
      "Deixe os dois parágrafos do texto dentro do padrão escolar ABNT.",
    createInitialState: (): WorkspaceState => ({
      kind: "word",
      data: {
        selectedBlockId: "w2-body1",
        blocks: [
          {
            id: "w2-title",
            role: "title",
            text: "A Revolução Industrial e as Cidades",
            bold: true,
            italic: false,
            underline: false,
            align: "center",
            fontSize: 16,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "heading1",
            color: "#0F172A",
          },
          {
            id: "w2-body1",
            role: "body",
            text: "A partir do século XVIII, a invenção da máquina a vapor transformou profundamente o trabalho manual em produção industrial nas fábricas europeias.",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 14,
            fontFamily: "Calibri",
            lineSpacing: 1,
            listType: "none",
            stylePreset: "normal",
            color: "#1E293B",
          },
          {
            id: "w2-body2",
            role: "body",
            text: "Milhares de pessoas deixaram o campo em busca de emprego nos centros urbanos, provocando um rápido crescimento das cidades e novos desafios sociais.",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 14,
            fontFamily: "Calibri",
            lineSpacing: 1,
            listType: "none",
            stylePreset: "normal",
            color: "#1E293B",
          },
        ],
      },
    }),
    objectives: [
      {
        id: "w2-obj1",
        label: "Definir fonte Arial ou Times New Roman tamanho 12pt nos 2 parágrafos",
        check: (state) => {
          if (state.kind !== "word") return false;
          const bodies = state.data.blocks.filter((b) => b.role === "body");
          return bodies.every(
            (b) =>
              (b.fontFamily === "Arial" || b.fontFamily === "Times New Roman") &&
              b.fontSize === 12
          );
        },
      },
      {
        id: "w2-obj2",
        label: "Aplicar alinhamento Justificado nos 2 parágrafos de texto",
        check: (state) => {
          if (state.kind !== "word") return false;
          const bodies = state.data.blocks.filter((b) => b.role === "body");
          return bodies.every((b) => b.align === "justify");
        },
      },
      {
        id: "w2-obj3",
        label: "Configurar espaçamento entre linhas para 1,5 nos 2 parágrafos",
        check: (state) => {
          if (state.kind !== "word") return false;
          const bodies = state.data.blocks.filter((b) => b.role === "body");
          return bodies.every((b) => b.lineSpacing === 1.5);
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "word") return "";
      return state.data.blocks
        .map(
          (b) =>
            `[${b.id}] fonte=${b.fontFamily}, tamanho=${b.fontSize}pt, alinhamento=${b.align}, espaçamento=${b.lineSpacing}`
        )
        .join("\n");
    },
  },
  {
    id: "word-3",
    track: "word",
    order: 3,
    title: "Listas e Organização",
    subtitle: "Roteiro da Feira de Ciências: Filtro Caseiro",
    gradeTag: "8º Ano · Estrutura",
    xpReward: 120,
    conceptSummary:
      "Use Lista com Marcadores quando a ordem dos itens não importa (como ingredientes/materiais) e Lista Numerada quando há uma sequência de passos.",
    initialPrompt:
      "Organize o roteiro usando os tipos corretos de lista e destaque o aviso final.",
    createInitialState: (): WorkspaceState => ({
      kind: "word",
      data: {
        selectedBlockId: "w3-materials",
        blocks: [
          {
            id: "w3-title",
            role: "title",
            text: "Experimento: Filtro de Água Caseiro",
            bold: true,
            italic: false,
            underline: false,
            align: "center",
            fontSize: 18,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "heading1",
            color: "#0F172A",
          },
          {
            id: "w3-sub1",
            role: "subtitle",
            text: "Materiais necessários:",
            bold: true,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "normal",
            color: "#0F172A",
          },
          {
            id: "w3-materials",
            role: "list-materials",
            text: "Garrafa PET transparente\nAlgodão limpo\nAreia fina e pedriscos\nCarvão ativado",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "normal",
            color: "#1E293B",
          },
          {
            id: "w3-sub2",
            role: "subtitle",
            text: "Passo a passo da montagem:",
            bold: true,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "normal",
            color: "#0F172A",
          },
          {
            id: "w3-steps",
            role: "list-steps",
            text: "Cortar a base da garrafa com ajuda do professor\nColocar o algodão no gargalo virado para baixo\nAdicionar camadas de carvão, areia e pedriscos\nDespejar a água turva devagar e observar",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "normal",
            color: "#1E293B",
          },
          {
            id: "w3-warning",
            role: "warning",
            text: "Atenção: esta água filtrada não é própria para beber sem fervura.",
            bold: true,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "normal",
            color: "#B91C1C",
          },
        ],
      },
    }),
    objectives: [
      {
        id: "w3-obj1",
        label: "Transformar a lista de materiais em Lista com Marcadores",
        check: (state) => {
          if (state.kind !== "word") return false;
          const m = state.data.blocks.find((b) => b.id === "w3-materials");
          return Boolean(m && m.listType === "bullet");
        },
      },
      {
        id: "w3-obj2",
        label: "Transformar os passos da montagem em Lista Numerada",
        check: (state) => {
          if (state.kind !== "word") return false;
          const s = state.data.blocks.find((b) => b.id === "w3-steps");
          return Boolean(s && s.listType === "numbered");
        },
      },
      {
        id: "w3-obj3",
        label: "Aplicar Sublinhado (Ctrl+U) na frase de atenção",
        check: (state) => {
          if (state.kind !== "word") return false;
          const w = state.data.blocks.find((b) => b.id === "w3-warning");
          return Boolean(w && w.underline);
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "word") return "";
      return state.data.blocks
        .map((b) => `[${b.id}] lista=${b.listType}, sublinhado=${b.underline}`)
        .join("\n");
    },
  },
  {
    id: "word-4",
    track: "word",
    order: 4,
    title: "Revisão e Substituição",
    subtitle: "Projeto de Geografia: Biomas Brasileiros",
    gradeTag: "9º Ano · Produtividade",
    xpReward: 150,
    conceptSummary:
      "Em textos longos, você não precisa corrigir palavra por palavra manualmente: o recurso Localizar e Substituir corrige todas as ocorrências de uma vez.",
    initialPrompt:
      "Aplique Estilo Título 1, corrija o nome do bioma usando Localizar e Substituir e alinhe a assinatura.",
    createInitialState: (): WorkspaceState => ({
      kind: "word",
      data: {
        selectedBlockId: "w4-title",
        blocks: [
          {
            id: "w4-title",
            role: "title",
            text: "Biomas Brasileiros",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "normal",
            color: "#0F172A",
          },
          {
            id: "w4-body1",
            role: "body",
            text: "A amazonia é a maior floresta tropical do mundo e abriga uma biodiversidade imensa. Preservar a amazonia ajuda a regular o regime de chuvas de grande parte do Brasil.",
            bold: false,
            italic: false,
            underline: false,
            align: "justify",
            fontSize: 12,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "normal",
            color: "#1E293B",
          },
          {
            id: "w4-sig",
            role: "signature",
            text: "Turma 9º B — Projeto de Geografia",
            bold: false,
            italic: true,
            underline: false,
            align: "left",
            fontSize: 12,
            fontFamily: "Arial",
            lineSpacing: 1.5,
            listType: "none",
            stylePreset: "normal",
            color: "#475569",
          },
        ],
      },
    }),
    objectives: [
      {
        id: "w4-obj1",
        label: "Aplicar o estilo Título 1 em \"Biomas Brasileiros\"",
        check: (state) => {
          if (state.kind !== "word") return false;
          const t = state.data.blocks.find((b) => b.id === "w4-title");
          return Boolean(t && t.stylePreset === "heading1");
        },
      },
      {
        id: "w4-obj2",
        label: "Substituir todas as palavras \"amazonia\" por \"Amazônia\"",
        check: (state) => {
          if (state.kind !== "word") return false;
          const b = state.data.blocks.find((item) => item.id === "w4-body1");
          return Boolean(
            b && !b.text.includes("amazonia") && b.text.includes("Amazônia")
          );
        },
      },
      {
        id: "w4-obj3",
        label: "Alinhar a assinatura da turma à Direita",
        check: (state) => {
          if (state.kind !== "word") return false;
          const s = state.data.blocks.find((item) => item.id === "w4-sig");
          return Boolean(s && s.align === "right");
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "word") return "";
      return state.data.blocks
        .map(
          (b) =>
            `[${b.id}] estilo=${b.stylePreset}, alinhamento=${b.align}, texto="${b.text}"`
        )
        .join("\n");
    },
  },

  // ======================== EXCEL ========================
  {
    id: "excel-1",
    track: "excel",
    order: 1,
    title: "Soma de Gastos (=SOMA)",
    subtitle: "Controle semanal de lanche e material",
    gradeTag: "8º Ano · Fórmulas",
    xpReward: 110,
    conceptSummary:
      "Toda fórmula no Excel começa com o sinal de igual (=). A função =SOMA(B2:B5) soma automaticamente todos os números do intervalo B2 até B5.",
    initialPrompt:
      "Calcule o total dos gastos na célula B6 usando a função =SOMA e formate como Moeda.",
    createInitialState: (): WorkspaceState => ({
      kind: "excel",
      data: {
        selectedCell: "B6",
        showChart: false,
        cells: {
          A1: { raw: "Item da Semana", bold: true, readOnly: true },
          B1: { raw: "Valor", bold: true, readOnly: true },
          A2: { raw: "Lanche da escola", readOnly: true },
          B2: { raw: "18", currency: true, readOnly: true },
          A3: { raw: "Passagem de ônibus", readOnly: true },
          B3: { raw: "24", currency: true, readOnly: true },
          A4: { raw: "Caderno novo", readOnly: true },
          B4: { raw: "15", currency: true, readOnly: true },
          A5: { raw: "Caneta e lápis", readOnly: true },
          B5: { raw: "8", currency: true, readOnly: true },
          A6: { raw: "TOTAL", bold: true, readOnly: true },
          B6: { raw: "", bold: false, currency: false },
        },
      },
    }),
    objectives: [
      {
        id: "e1-obj1",
        label: "Na célula B6, digitar a fórmula =SOMA(B2:B5)",
        check: (state) => {
          if (state.kind !== "excel") return false;
          const raw = normalizeFormula(state.data.cells.B6?.raw || "");
          const ev = evaluateCell("B6", state.data.cells);
          return (
            (raw.startsWith("=SOMA(") || raw.startsWith("=SUM(")) &&
            ev.value === 65
          );
        },
      },
      {
        id: "e1-obj2",
        label: "Formatar B6 como Moeda (R$) e aplicar Negrito",
        check: (state) => {
          if (state.kind !== "excel") return false;
          const b6 = state.data.cells.B6;
          return Boolean(b6 && b6.currency && b6.bold);
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "excel") return "";
      const b6 = state.data.cells.B6;
      const ev = evaluateCell("B6", state.data.cells);
      return `Célula selecionada: ${state.data.selectedCell}\nB2=18, B3=24, B4=15, B5=8\nB6 raw="${b6?.raw || ""}" | resultado="${ev.formatted}" | moeda=${Boolean(b6?.currency)} | negrito=${Boolean(b6?.bold)}`;
    },
  },
  {
    id: "excel-2",
    track: "excel",
    order: 2,
    title: "Boletim Escolar (=MÉDIA e =MÁXIMO)",
    subtitle: "Analisando suas notas do bimestre",
    gradeTag: "8º Ano · Estatística",
    xpReward: 130,
    conceptSummary:
      "=MÉDIA(B2:B5) calcula a média aritmética das notas, e =MÁXIMO(B2:B5) descobre automaticamente qual foi a maior nota da lista.",
    initialPrompt:
      "Use =MÉDIA para calcular sua média bimestral em B6 e =MÁXIMO para achar a maior nota em B7.",
    createInitialState: (): WorkspaceState => ({
      kind: "excel",
      data: {
        selectedCell: "B6",
        showChart: false,
        cells: {
          A1: { raw: "Disciplina", bold: true, readOnly: true },
          B1: { raw: "Nota", bold: true, readOnly: true },
          A2: { raw: "Matemática", readOnly: true },
          B2: { raw: "8.5", readOnly: true },
          A3: { raw: "Português", readOnly: true },
          B3: { raw: "7.0", readOnly: true },
          A4: { raw: "Ciências", readOnly: true },
          B4: { raw: "9.5", readOnly: true },
          A5: { raw: "História", readOnly: true },
          B5: { raw: "8.0", readOnly: true },
          A6: { raw: "Média Geral", bold: true, readOnly: true },
          B6: { raw: "", bold: true },
          A7: { raw: "Maior Nota", bold: true, readOnly: true },
          B7: { raw: "", bold: true },
        },
      },
    }),
    objectives: [
      {
        id: "e2-obj1",
        label: "Em B6, calcular a média usando =MÉDIA(B2:B5)",
        check: (state) => {
          if (state.kind !== "excel") return false;
          const raw = normalizeFormula(state.data.cells.B6?.raw || "");
          const ev = evaluateCell("B6", state.data.cells);
          return (
            (raw.startsWith("=MEDIA(") || raw.startsWith("=AVERAGE(")) &&
            ev.value === 8.25
          );
        },
      },
      {
        id: "e2-obj2",
        label: "Em B7, encontrar a maior nota usando =MÁXIMO(B2:B5)",
        check: (state) => {
          if (state.kind !== "excel") return false;
          const raw = normalizeFormula(state.data.cells.B7?.raw || "");
          const ev = evaluateCell("B7", state.data.cells);
          return (
            (raw.startsWith("=MAXIMO(") || raw.startsWith("=MAX(")) &&
            ev.value === 9.5
          );
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "excel") return "";
      const ev6 = evaluateCell("B6", state.data.cells);
      const ev7 = evaluateCell("B7", state.data.cells);
      return `Notas B2:B5 = [8.5, 7.0, 9.5, 8.0]\nB6 raw="${state.data.cells.B6?.raw || ""}" (resultado=${ev6.formatted})\nB7 raw="${state.data.cells.B7?.raw || ""}" (resultado=${ev7.formatted})`;
    },
  },
  {
    id: "excel-3",
    track: "excel",
    order: 3,
    title: "Decisão Automática (=SE)",
    subtitle: "Aprovado ou Recuperação na turma",
    gradeTag: "9º Ano · Lógica",
    xpReward: 150,
    conceptSummary:
      "A função =SE(teste; se_verdadeiro; se_falso) toma decisões sozinha. Ex: =SE(B2>=6;\"Aprovado\";\"Recuperação\").",
    initialPrompt:
      "Escreva uma fórmula =SE na coluna C para classificar quem tirou 6 ou mais como Aprovado.",
    createInitialState: (): WorkspaceState => ({
      kind: "excel",
      data: {
        selectedCell: "C2",
        showChart: false,
        cells: {
          A1: { raw: "Aluno", bold: true, readOnly: true },
          B1: { raw: "Média", bold: true, readOnly: true },
          C1: { raw: "Situação", bold: true, readOnly: true },
          A2: { raw: "Lucas", readOnly: true },
          B2: { raw: "7.5", readOnly: true },
          C2: { raw: "" },
          A3: { raw: "Mariana", readOnly: true },
          B3: { raw: "5.5", readOnly: true },
          C3: { raw: "" },
          A4: { raw: "Pedro", readOnly: true },
          B4: { raw: "8.0", readOnly: true },
          C4: { raw: "" },
        },
      },
    }),
    objectives: [
      {
        id: "e3-obj1",
        label: "Em C2, criar a fórmula =SE(B2>=6;\"Aprovado\";\"Recuperação\")",
        check: (state) => {
          if (state.kind !== "excel") return false;
          const raw = normalizeFormula(state.data.cells.C2?.raw || "");
          const ev = evaluateCell("C2", state.data.cells);
          return (
            (raw.startsWith("=SE(") || raw.startsWith("=IF(")) &&
            String(ev.value).toLowerCase() === "aprovado"
          );
        },
      },
      {
        id: "e3-obj2",
        label: "Aplicar a lógica em C3 e C4 (use AutoPreencher ou digite as fórmulas)",
        check: (state) => {
          if (state.kind !== "excel") return false;
          const raw3 = normalizeFormula(state.data.cells.C3?.raw || "");
          const raw4 = normalizeFormula(state.data.cells.C4?.raw || "");
          const ev3 = evaluateCell("C3", state.data.cells);
          const ev4 = evaluateCell("C4", state.data.cells);
          const v3 = String(ev3.value).toLowerCase();
          const v4 = String(ev4.value).toLowerCase();
          return (
            (raw3.startsWith("=SE(") || raw3.startsWith("=IF(")) &&
            (raw4.startsWith("=SE(") || raw4.startsWith("=IF(")) &&
            (v3 === "recuperação" || v3 === "recuperacao") &&
            v4 === "aprovado"
          );
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "excel") return "";
      return ["C2", "C3", "C4"]
        .map((ref) => {
          const ev = evaluateCell(ref, state.data.cells);
          return `${ref} (Média B${ref.slice(1)}=${state.data.cells[`B${ref.slice(1)}`]?.raw}): raw="${state.data.cells[ref]?.raw || ""}" -> resultado="${ev.formatted}"`;
        })
        .join("\n");
    },
  },
  {
    id: "excel-4",
    track: "excel",
    order: 4,
    title: "Orçamento e Gráfico",
    subtitle: "Festa de Encerramento do 9º Ano",
    gradeTag: "9º Ano · Análise",
    xpReward: 160,
    conceptSummary:
      "Multiplicar quantidade × preço (=B2*C2), somar os subtotais e gerar um gráfico transforma números em decisões rápidas.",
    initialPrompt:
      "Calcule os subtotais na coluna D, some tudo em D5 e gere o gráfico de colunas.",
    createInitialState: (): WorkspaceState => ({
      kind: "excel",
      data: {
        selectedCell: "D2",
        showChart: false,
        chartTitle: "Custos da Festa por Item (R$)",
        chartRange: {
          labels: ["A2", "A3", "A4"],
          values: ["D2", "D3", "D4"],
        },
        cells: {
          A1: { raw: "Item", bold: true, readOnly: true },
          B1: { raw: "Qtd", bold: true, readOnly: true },
          C1: { raw: "Preço Unit.", bold: true, readOnly: true },
          D1: { raw: "Subtotal", bold: true, readOnly: true },
          A2: { raw: "Salgados", readOnly: true },
          B2: { raw: "4", readOnly: true },
          C2: { raw: "25", currency: true, readOnly: true },
          D2: { raw: "", currency: true },
          A3: { raw: "Sucos", readOnly: true },
          B3: { raw: "6", readOnly: true },
          C3: { raw: "10", currency: true, readOnly: true },
          D3: { raw: "", currency: true },
          A4: { raw: "Bolo", readOnly: true },
          B4: { raw: "2", readOnly: true },
          C4: { raw: "45", currency: true, readOnly: true },
          D4: { raw: "", currency: true },
          A5: { raw: "TOTAL GERAL", bold: true, readOnly: true },
          B5: { raw: "", readOnly: true },
          C5: { raw: "", readOnly: true },
          D5: { raw: "", bold: true, currency: true },
        },
      },
    }),
    objectives: [
      {
        id: "e4-obj1",
        label: "Calcular os subtotais em D2 (=B2*C2), D3 e D4",
        check: (state) => {
          if (state.kind !== "excel") return false;
          const d2 = evaluateCell("D2", state.data.cells).value;
          const d3 = evaluateCell("D3", state.data.cells).value;
          const d4 = evaluateCell("D4", state.data.cells).value;
          const r2 = (state.data.cells.D2?.raw || "").startsWith("=");
          const r3 = (state.data.cells.D3?.raw || "").startsWith("=");
          const r4 = (state.data.cells.D4?.raw || "").startsWith("=");
          return r2 && r3 && r4 && d2 === 100 && d3 === 60 && d4 === 90;
        },
      },
      {
        id: "e4-obj2",
        label: "Somar o Total Geral em D5 usando =SOMA(D2:D4)",
        check: (state) => {
          if (state.kind !== "excel") return false;
          const raw = normalizeFormula(state.data.cells.D5?.raw || "");
          const ev = evaluateCell("D5", state.data.cells);
          return (
            (raw.startsWith("=SOMA(") || raw.startsWith("=SUM(")) &&
            ev.value === 250
          );
        },
      },
      {
        id: "e4-obj3",
        label: "Clicar em Inserir Gráfico na barra de ferramentas",
        check: (state) => {
          if (state.kind !== "excel") return false;
          return state.data.showChart;
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "excel") return "";
      return ["D2", "D3", "D4", "D5"]
        .map(
          (ref) =>
            `${ref}: raw="${state.data.cells[ref]?.raw || ""}" -> ${evaluateCell(ref, state.data.cells).formatted}`
        )
        .join(" | ") + ` | Gráfico aberto=${state.data.showChart}`;
    },
  },

  // ======================== POWERPOINT ========================
  {
    id: "ppt-1",
    track: "powerpoint",
    order: 1,
    title: "Capa de Impacto",
    subtitle: "Seminário: Energia Solar na Escola",
    gradeTag: "8º Ano · Visual",
    xpReward: 100,
    conceptSummary:
      "A capa de uma apresentação precisa ter um título claro, o nome do grupo/turma no subtítulo e um tema visual harmônico.",
    initialPrompt:
      "Transforme o Slide 1 em uma capa organizada e escolha um tema colorido.",
    createInitialState: (): WorkspaceState => ({
      kind: "powerpoint",
      data: {
        selectedSlideIndex: 0,
        theme: "light",
        isPresenting: false,
        slides: [
          {
            id: "s1",
            title: "trabalho de ciencias energia solar",
            subtitle: "",
            body: "Neste trabalho vamos falar tudo sobre painéis fotovoltaicos e como o sol gera eletricidade.",
            layout: "title-content",
            isBulleted: false,
            notes: "",
            visualTag: "solar",
          },
          {
            id: "s2",
            title: "Como funciona?",
            subtitle: "",
            body: "Células fotovoltaicas captam a luz solar\nInversor transforma em energia elétrica\nEconomia na conta de luz da escola",
            layout: "image-text",
            isBulleted: true,
            notes: "",
            visualTag: "solar",
          },
        ],
      },
    }),
    objectives: [
      {
        id: "p1-obj1",
        label: "Aplicar o layout \"Slide de Capa\" no Slide 1",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          return state.data.slides[0]?.layout === "cover";
        },
      },
      {
        id: "p1-obj2",
        label: "Definir o título como \"Energia Solar na Escola\" e preencher o subtítulo",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          const s = state.data.slides[0];
          return Boolean(
            s &&
              s.title.trim().toLowerCase() === "energia solar na escola" &&
              (s.subtitle || "").trim().length >= 3
          );
        },
      },
      {
        id: "p1-obj3",
        label: "Aplicar um tema visual (Azul Acadêmico ou Verde Natureza)",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          return state.data.theme !== "light";
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "powerpoint") return "";
      const s = state.data.slides[0];
      return `Tema=${state.data.theme} | Slide 1 layout=${s?.layout}, título="${s?.title}", subtítulo="${s?.subtitle || ""}"`;
    },
  },
  {
    id: "ppt-2",
    track: "powerpoint",
    order: 2,
    title: "Menos Texto, Mais Clareza",
    subtitle: "Eliminando o 'textão' no slide",
    gradeTag: "8º Ano · Síntese",
    xpReward: 120,
    conceptSummary:
      "Ninguém consegue ler parágrafos gigantes num telão! Use tópicos curtos (bullets) e layouts divididos para dar respiro visual ao slide.",
    initialPrompt:
      "Corrija o Slide 2 transformando o texto longo em tópicos curtos e aplicando um layout equilibrado.",
    createInitialState: (): WorkspaceState => ({
      kind: "powerpoint",
      data: {
        selectedSlideIndex: 1,
        theme: "academic-blue",
        isPresenting: false,
        slides: [
          {
            id: "p2-s1",
            title: "Reciclagem na Comunidade",
            subtitle: "Projeto 8º Ano",
            body: "",
            layout: "cover",
            isBulleted: false,
            notes: "",
            visualTag: "recycle",
          },
          {
            id: "p2-s2",
            title: "Por que separar o lixo?",
            subtitle: "",
            body: "Separar materiais recicláveis reduz o volume enviado aos aterros sanitários\nDiminui a poluição de rios e solos urbanos\nGera renda para cooperativas de catadores locais\nEconomiza água e energia na fabricação de novos produtos",
            layout: "title-content",
            isBulleted: false,
            notes: "",
            visualTag: "recycle",
          },
        ],
      },
    }),
    objectives: [
      {
        id: "p2-obj1",
        label: "Ativar Tópicos Curtos (Bullets) no Slide 2",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          return Boolean(state.data.slides[1]?.isBulleted);
        },
      },
      {
        id: "p2-obj2",
        label: "Alterar o layout do Slide 2 para Duas Colunas ou Imagem e Texto",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          const layout = state.data.slides[1]?.layout;
          return layout === "two-columns" || layout === "image-text";
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "powerpoint") return "";
      const s = state.data.slides[1];
      return `Slide selecionado=${state.data.selectedSlideIndex + 1} | Slide 2: layout=${s?.layout}, isBulleted=${s?.isBulleted}`;
    },
  },
  {
    id: "ppt-3",
    track: "powerpoint",
    order: 3,
    title: "Ordem Lógica da História",
    subtitle: "Reorganizando os slides do seminário",
    gradeTag: "9º Ano · Roteiro",
    xpReward: 130,
    conceptSummary:
      "Toda boa apresentação conta uma história em ordem lógica: Capa -> Problema -> Solução -> Conclusão.",
    initialPrompt:
      "Os slides ficaram fora de ordem! Use as setas para cima e para baixo na lista lateral para organizar o seminário.",
    createInitialState: (): WorkspaceState => ({
      kind: "powerpoint",
      data: {
        selectedSlideIndex: 0,
        theme: "nature-green",
        isPresenting: false,
        slides: [
          {
            id: "ord-conc",
            title: "Conclusão e Fontes",
            body: "Cuidar da água é responsabilidade de todos.\nFonte: Agência Nacional de Águas (ANA).",
            layout: "title-content",
            isBulleted: true,
            notes: "",
            visualTag: "water",
          },
          {
            id: "ord-sol",
            title: "Soluções Sustentáveis",
            body: "Captação de água da chuva\nTratamento de esgoto\nConsumo consciente em casa",
            layout: "image-text",
            isBulleted: true,
            notes: "",
            visualTag: "recycle",
          },
          {
            id: "ord-capa",
            title: "Água no Planeta",
            subtitle: "Seminário de Geografia · 9º Ano",
            body: "",
            layout: "cover",
            isBulleted: false,
            notes: "",
            visualTag: "water",
          },
          {
            id: "ord-prob",
            title: "O Problema da Poluição",
            body: "Despejo de resíduos sem tratamento\nDesperdício nas redes de distribuição\nContaminação de nascentes",
            layout: "two-columns",
            isBulleted: true,
            notes: "",
            visualTag: "pollution",
          },
        ],
      },
    }),
    objectives: [
      {
        id: "p3-obj1",
        label: "Colocar \"Água no Planeta\" como 1º slide (Capa)",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          return state.data.slides[0]?.id === "ord-capa";
        },
      },
      {
        id: "p3-obj2",
        label: "Colocar \"O Problema da Poluição\" em 2º e \"Soluções Sustentáveis\" em 3º",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          return (
            state.data.slides[1]?.id === "ord-prob" &&
            state.data.slides[2]?.id === "ord-sol"
          );
        },
      },
      {
        id: "p3-obj3",
        label: "Deixar \"Conclusão e Fontes\" por último (4º slide)",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          return state.data.slides[3]?.id === "ord-conc";
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "powerpoint") return "";
      return (
        "Ordem atual dos slides:\n" +
        state.data.slides.map((s, idx) => `${idx + 1}. ${s.title}`).join("\n")
      );
    },
  },
  {
    id: "ppt-4",
    track: "powerpoint",
    order: 4,
    title: "Notas e Apresentação (F5)",
    subtitle: "Ensaio final antes de falar para a turma",
    gradeTag: "9º Ano · Oratória",
    xpReward: 150,
    conceptSummary:
      "As Anotações do Apresentador guardam o roteiro do que você vai falar, mantendo o slide limpo para a plateia. E a tecla F5 inicia a apresentação em tela cheia.",
    initialPrompt:
      "Escreva uma anotação no Slide 2 para lembrar sua fala e teste o Modo Apresentação.",
    createInitialState: (): WorkspaceState => ({
      kind: "powerpoint",
      data: {
        selectedSlideIndex: 1,
        theme: "academic-blue",
        isPresenting: false,
        slides: [
          {
            id: "p4-s1",
            title: "Inteligência Artificial no Cotidiano",
            subtitle: "Trabalho de Tecnologia · 9º Ano",
            body: "",
            layout: "cover",
            isBulleted: false,
            notes: "Cumprimentar a turma e apresentar os integrantes do grupo.",
            visualTag: "chart",
          },
          {
            id: "p4-s2",
            title: "Onde usamos IA hoje?",
            body: "Tradutores automáticos\nRecomendações de música e vídeo\nAssistentes de estudo e acessibilidade",
            layout: "image-text",
            isBulleted: true,
            notes: "",
            visualTag: "chart",
          },
        ],
      },
    }),
    objectives: [
      {
        id: "p4-obj1",
        label: "Escrever nas Anotações do Apresentador do Slide 2 (mín. 12 caracteres)",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          return (state.data.slides[1]?.notes || "").trim().length >= 12;
        },
      },
      {
        id: "p4-obj2",
        label: "Iniciar o Modo Apresentação (botão Apresentar / F5)",
        check: (state) => {
          if (state.kind !== "powerpoint") return false;
          return Boolean((state.data as { hasPresented?: boolean }).hasPresented || state.data.isPresenting);
        },
      },
    ],
    summarizeForAI: (state) => {
      if (state.kind !== "powerpoint") return "";
      const s2 = state.data.slides[1];
      return `Slide 2 notas="${s2?.notes || ""}" | Modo apresentação ativado=${Boolean((state.data as { hasPresented?: boolean }).hasPresented || state.data.isPresenting)}`;
    },
  },
];
