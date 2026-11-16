import type { ShortcutChallenge } from "../types/game";

export const SHORTCUT_CHALLENGES: ShortcutChallenge[] = [
  {
    id: "sc-1",
    app: "word",
    situation:
      "Você apagou um parágrafo inteiro do seu trabalho de História sem querer no Word! Qual atalho desfaz a última ação imediatamente?",
    correctKeys: ["Ctrl", "Z"],
    options: [
      { keys: ["Ctrl", "Z"], label: "Desfazer" },
      { keys: ["Ctrl", "X"], label: "Recortar" },
      { keys: ["Ctrl", "V"], label: "Colar" },
      { keys: ["Ctrl", "S"], label: "Salvar" },
    ],
    explanation:
      "Ctrl+Z é o salvador dos estudantes! Ele desfaz o último comando ou exclusão acidental no Word, Excel e PowerPoint.",
  },
  {
    id: "sc-2",
    app: "word",
    situation:
      "A bateria do notebook está em 4%. Qual atalho salva o seu documento na hora antes que desligue?",
    correctKeys: ["Ctrl", "S"],
    options: [
      { keys: ["Ctrl", "A"], label: "Selecionar tudo" },
      { keys: ["Ctrl", "S"], label: "Salvar arquivo" },
      { keys: ["Ctrl", "P"], label: "Imprimir" },
      { keys: ["Ctrl", "F"], label: "Localizar" },
    ],
    explanation:
      "Ctrl+S (de Save, em inglês) salva o arquivo atual. Criar o hábito de apertar Ctrl+S evita perder trabalhos inteiros!",
  },
  {
    id: "sc-3",
    app: "word",
    situation:
      "Você selecionou o subtítulo do relatório e quer deixá-lo em Negrito usando apenas o teclado.",
    correctKeys: ["Ctrl", "B"],
    options: [
      { keys: ["Ctrl", "B"], label: "Negrito (Bold)" },
      { keys: ["Ctrl", "I"], label: "Itálico" },
      { keys: ["Ctrl", "U"], label: "Sublinhado" },
      { keys: ["Ctrl", "C"], label: "Copiar" },
    ],
    explanation:
      "No padrão internacional (e em editores modernos), Ctrl+B vem de Bold (Negrito). Dica: no Word em português instalado no Windows também funciona Ctrl+N!",
  },
  {
    id: "sc-4",
    app: "powerpoint",
    situation:
      "Chegou a hora de apresentar seu seminário de Ciências na frente da turma! Qual tecla inicia o PowerPoint em tela cheia desde o primeiro slide?",
    correctKeys: ["F5"],
    options: [
      { keys: ["F5"], label: "Apresentar do início" },
      { keys: ["Esc"], label: "Sair da apresentação" },
      { keys: ["Ctrl", "M"], label: "Novo slide" },
      { keys: ["Tab"], label: "Avançar recuo" },
    ],
    explanation:
      "A tecla F5 inicia o Modo Apresentação em tela cheia a partir do slide 1. E quando terminar, aperte Esc para voltar ao editor.",
  },
  {
    id: "sc-5",
    app: "excel",
    situation:
      "Você copiou uma tabela de notas com Ctrl+C e agora precisa colar os dados na outra coluna da planilha.",
    correctKeys: ["Ctrl", "V"],
    options: [
      { keys: ["Ctrl", "C"], label: "Copiar" },
      { keys: ["Ctrl", "V"], label: "Colar" },
      { keys: ["Ctrl", "X"], label: "Recortar" },
      { keys: ["Ctrl", "Y"], label: "Refazer" },
    ],
    explanation:
      "Ctrl+C copia, Ctrl+X recorta (move) e Ctrl+V cola. Repare que as teclas C, X e V ficam bem juntinhas no teclado!",
  },
  {
    id: "sc-6",
    app: "word",
    situation:
      "Você quer selecionar todo o texto de uma redação de 5 páginas de uma só vez para mudar a fonte para Arial 12.",
    correctKeys: ["Ctrl", "A"],
    options: [
      { keys: ["Ctrl", "A"], label: "Selecionar tudo" },
      { keys: ["Ctrl", "I"], label: "Itálico" },
      { keys: ["Ctrl", "U"], label: "Sublinhado" },
      { keys: ["Ctrl", "P"], label: "Imprimir" },
    ],
    explanation:
      "Ctrl+A (de All, tudo) seleciona todo o conteúdo do documento ou planilha de uma só vez.",
  },
  {
    id: "sc-7",
    app: "word",
    situation:
      "Seu texto tem 8 páginas e você precisa achar rapidamente onde escreveu a palavra 'fotossíntese'. Qual atalho abre a busca?",
    correctKeys: ["Ctrl", "F"],
    options: [
      { keys: ["Ctrl", "F"], label: "Localizar (Find)" },
      { keys: ["Ctrl", "N"], label: "Novo arquivo" },
      { keys: ["Ctrl", "Z"], label: "Desfazer" },
      { keys: ["F5"], label: "Apresentar" },
    ],
    explanation:
      "Ctrl+F vem de Find (Localizar) e abre a barra de pesquisa instantânea para encontrar qualquer palavra no texto.",
  },
  {
    id: "sc-8",
    app: "powerpoint",
    situation:
      "Você quer colocar em Itálico uma citação famosa no seu slide de História usando o teclado.",
    correctKeys: ["Ctrl", "I"],
    options: [
      { keys: ["Ctrl", "I"], label: "Itálico" },
      { keys: ["Ctrl", "B"], label: "Negrito" },
      { keys: ["Ctrl", "U"], label: "Sublinhado" },
      { keys: ["Ctrl", "S"], label: "Salvar" },
    ],
    explanation:
      "Ctrl+I ativa o Itálico (letras levemente inclinadas), ideal para citações, palavras estrangeiras e nomes científicos.",
  },
];
