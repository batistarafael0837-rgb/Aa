import type { ExcelCell } from "../types/game";

export interface EvaluatedCell {
  value: string | number;
  error?: string;
  formatted: string;
}

const COLS = ["A", "B", "C", "D", "E"];

export function expandRange(startRef: string, endRef: string): string[] {
  const sCol = startRef.charAt(0).toUpperCase();
  const sRow = parseInt(startRef.slice(1), 10);
  const eCol = endRef.charAt(0).toUpperCase();
  const eRow = parseInt(endRef.slice(1), 10);

  const c1 = COLS.indexOf(sCol);
  const c2 = COLS.indexOf(eCol);
  if (c1 === -1 || c2 === -1 || Number.isNaN(sRow) || Number.isNaN(eRow)) {
    return [];
  }

  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);
  const minR = Math.min(sRow, eRow);
  const maxR = Math.max(sRow, eRow);

  const refs: string[] = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      refs.push(`${COLS[c]}${r}`);
    }
  }
  return refs;
}

function parseNumber(val: string | number): number | null {
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  const trimmed = val.trim().replace(/^R\$\s*/i, "");
  if (!trimmed) return null;
  // Support Brazilian decimal comma when there's no dot, e.g. "7,5" -> "7.5"
  const normalized =
    trimmed.includes(",") && !trimmed.includes(".")
      ? trimmed.replace(",", ".")
      : trimmed.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function splitArgs(argStr: string): string[] {
  const args: string[] = [];
  let current = "";
  let inQuotes = false;
  let depth = 0;

  for (let i = 0; i < argStr.length; i++) {
    const ch = argStr[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (!inQuotes && ch === "(") {
      depth++;
      current += ch;
    } else if (!inQuotes && ch === ")") {
      depth--;
      current += ch;
    } else if (!inQuotes && depth === 0 && (ch === ";" || ch === ",")) {
      args.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim() !== "") {
    args.push(current.trim());
  }
  return args;
}

export function evaluateCell(
  cellRef: string,
  cells: Record<string, ExcelCell>,
  visited: Set<string> = new Set()
): EvaluatedCell {
  const cell = cells[cellRef];
  if (!cell || cell.raw.trim() === "") {
    return { value: "", formatted: "" };
  }

  const raw = cell.raw.trim();
  if (!raw.startsWith("=")) {
    const num = parseNumber(raw);
    if (num !== null) {
      return {
        value: num,
        formatted: formatDisplayValue(num, cell.currency),
      };
    }
    return { value: raw, formatted: raw };
  }

  if (visited.has(cellRef)) {
    return { value: "#REF!", error: "Referência circular", formatted: "#REF!" };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(cellRef);

  const expr = raw.slice(1).trim();

  // Check IF / SE formula: =SE(B2>=6;"Aprovado";"Recuperação")
  const seMatch = expr.match(/^(?:SE|IF)\s*\((.*)\)$/i);
  if (seMatch) {
    const args = splitArgs(seMatch[1]);
    if (args.length < 3) {
      return {
        value: "#VALOR!",
        error: "A função =SE precisa de 3 partes: condição; verdadeiro; falso.",
        formatted: "#VALOR!",
      };
    }
    const [condStr, trueRaw, falseRaw] = args;
    const condResult = evaluateCondition(condStr, cells, nextVisited);
    if (condResult === null) {
      return {
        value: "#VALOR!",
        error: "Condição inválida na fórmula =SE.",
        formatted: "#VALOR!",
      };
    }
    const chosen = condResult ? trueRaw : falseRaw;
    const stripped = chosen.replace(/^"(.*)"$/, "$1");
    return { value: stripped, formatted: stripped };
  }

  // Check aggregate functions: SOMA, MÉDIA/MEDIA, MÁXIMO/MAXIMO, MÍNIMO/MINIMO
  const fnMatch = expr.match(
    /^(SOMA|SUM|M[ÉE]DIA|AVERAGE|M[ÁA]XIMO|MAX|M[ÍI]NIMO|MIN)\s*\((.*)\)$/i
  );
  if (fnMatch) {
    const fnName = fnMatch[1].toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const args = splitArgs(fnMatch[2]);
    const nums: number[] = [];

    for (const arg of args) {
      const rangeMatch = arg.match(/^([A-E]\d+)\s*:\s*([A-E]\d+)$/i);
      if (rangeMatch) {
        const refs = expandRange(rangeMatch[1], rangeMatch[2]);
        for (const r of refs) {
          const ev = evaluateCell(r, cells, nextVisited);
          if (ev.error) return { value: ev.value, error: ev.error, formatted: String(ev.value) };
          if (typeof ev.value === "number") nums.push(ev.value);
        }
      } else if (/^[A-E]\d+$/i.test(arg)) {
        const ev = evaluateCell(arg.toUpperCase(), cells, nextVisited);
        if (ev.error) return { value: ev.value, error: ev.error, formatted: String(ev.value) };
        if (typeof ev.value === "number") nums.push(ev.value);
      } else {
        const n = parseNumber(arg);
        if (n !== null) nums.push(n);
      }
    }

    if (nums.length === 0) {
      return { value: 0, formatted: formatDisplayValue(0, cell.currency) };
    }

    let result = 0;
    if (fnName === "SOMA" || fnName === "SUM") {
      result = nums.reduce((acc, n) => acc + n, 0);
    } else if (fnName === "MEDIA" || fnName === "AVERAGE") {
      result = nums.reduce((acc, n) => acc + n, 0) / nums.length;
    } else if (fnName === "MAXIMO" || fnName === "MAX") {
      result = Math.max(...nums);
    } else if (fnName === "MINIMO" || fnName === "MIN") {
      result = Math.min(...nums);
    }

    const rounded = Math.round(result * 100) / 100;
    return {
      value: rounded,
      formatted: formatDisplayValue(rounded, cell.currency),
    };
  }

  // Simple arithmetic expressions with cell references like =B2*C2 or =(B2+C2)/2
  const arithmeticExpr = expr.replace(/\b([A-E]\d+)\b/gi, (match) => {
    const ev = evaluateCell(match.toUpperCase(), cells, nextVisited);
    if (typeof ev.value === "number") return String(ev.value);
    return "NaN";
  });

  if (/^[0-9+\-*/().\s]+$/.test(arithmeticExpr)) {
    try {
      const result = Function(`"use strict"; return (${arithmeticExpr})`)();
      if (typeof result === "number" && Number.isFinite(result)) {
        const rounded = Math.round(result * 100) / 100;
        return {
          value: rounded,
          formatted: formatDisplayValue(rounded, cell.currency),
        };
      }
      if (result === Infinity || result === -Infinity) {
        return { value: "#DIV/0!", error: "Divisão por zero", formatted: "#DIV/0!" };
      }
    } catch {
      return { value: "#VALOR!", error: "Erro na expressão", formatted: "#VALOR!" };
    }
  }

  return {
    value: "#NOME?",
    error: "Função desconhecida ou sintaxe incorreta",
    formatted: "#NOME?",
  };
}

function evaluateCondition(
  condStr: string,
  cells: Record<string, ExcelCell>,
  visited: Set<string>
): boolean | null {
  const match = condStr.match(/^(.+?)(>=|<=|<>|!=|=|>|<)(.+)$/);
  if (!match) return null;

  const leftRaw = match[1].trim();
  const op = match[2].trim();
  const rightRaw = match[3].trim();

  const resolveOperand = (token: string): string | number | null => {
    if (/^[A-E]\d+$/i.test(token)) {
      const ev = evaluateCell(token.toUpperCase(), cells, visited);
      return ev.value;
    }
    const stripped = token.replace(/^"(.*)"$/, "$1");
    const num = parseNumber(stripped);
    return num !== null ? num : stripped;
  };

  const left = resolveOperand(leftRaw);
  const right = resolveOperand(rightRaw);
  if (left === null || right === null) return null;

  if (typeof left === "number" && typeof right === "number") {
    switch (op) {
      case ">=":
        return left >= right;
      case "<=":
        return left <= right;
      case ">":
        return left > right;
      case "<":
        return left < right;
      case "=":
        return left === right;
      case "<>":
      case "!=":
        return left !== right;
      default:
        return null;
    }
  }

  const ls = String(left).toLowerCase();
  const rs = String(right).toLowerCase();
  if (op === "=") return ls === rs;
  if (op === "<>" || op === "!=") return ls !== rs;
  return null;
}

export function formatDisplayValue(val: number, isCurrency?: boolean): string {
  if (isCurrency) {
    return val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }
  return Number.isInteger(val)
    ? String(val)
    : val.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

export function normalizeFormula(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}
