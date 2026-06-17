/**
 * MyBatis 로그 → DBeaver 실행용 SQL 변환기
 * Preparing: 쿼리(?) + Parameters: 값(String)... → ? 를 순서대로 치환
 */

const SAMPLE_LOG = `==>  Preparing: SELECT * FROM KPI_TABLE WHERE USE_YN = ? AND YM = ? AND CNT > ?
==> Parameters: Y(String), 202505(String), 10(Integer)`;

let logInputEl;
let queryInputEl;
let paramsInputEl;
let outputEl;
let statusEl;
let previewBody;

function init() {
  logInputEl = document.getElementById('logInput');
  queryInputEl = document.getElementById('queryInput');
  paramsInputEl = document.getElementById('paramsInput');
  outputEl = document.getElementById('output');
  statusEl = document.getElementById('status');
  previewBody = document.getElementById('previewBody');

  document.getElementById('convertBtn').addEventListener('click', convert);
  document.getElementById('parseLogBtn').addEventListener('click', parseFromLog);
  document.getElementById('sampleBtn').addEventListener('click', loadSample);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.getElementById('copyBtn').addEventListener('click', copySql);

  loadSample();
}

function loadSample() {
  logInputEl.value = SAMPLE_LOG;
  parseFromLog();
  convert();
}

function clearAll() {
  logInputEl.value = '';
  queryInputEl.value = '';
  paramsInputEl.value = '';
  outputEl.value = '';
  statusEl.textContent = '';
  previewBody.innerHTML = '<tr><td colspan="4" style="color:#9ca3af;">변환 후 표시됩니다.</td></tr>';
}

function parseFromLog() {
  const log = logInputEl.value;
  if (!log.trim()) {
    statusEl.className = 'status error';
    statusEl.textContent = '로그를 붙여넣어 주세요.';
    return;
  }

  const preparingMatch = log.match(/Preparing:\s*(.+?)(?:\r?\n|$)/i);
  const parametersMatch = log.match(/Parameters:\s*(.+?)(?:\r?\n|$)/is);

  if (preparingMatch) {
    queryInputEl.value = preparingMatch[1].trim();
  }
  if (parametersMatch) {
    paramsInputEl.value = parametersMatch[1].trim();
  }

  if (!preparingMatch && !parametersMatch) {
    statusEl.className = 'status error';
    statusEl.textContent = 'Preparing: 또는 Parameters: 를 찾을 수 없습니다.';
    return;
  }

  statusEl.className = 'status';
  statusEl.textContent = '로그에서 쿼리/파라미터를 분리했습니다. 변환을 눌러주세요.';
}

function parseParamToken(token) {
  const trimmed = token.trim();
  if (!trimmed) return null;

  if (trimmed === 'null' || trimmed.toLowerCase() === 'null(null)') {
    return { index: 0, raw: trimmed, value: null, type: 'null', sql: 'NULL' };
  }

  const lastOpen = trimmed.lastIndexOf('(');
  const lastClose = trimmed.endsWith(')') ? trimmed.length - 1 : -1;

  if (lastOpen === -1 || lastClose === -1 || lastOpen >= lastClose) {
    return { index: 0, raw: trimmed, value: trimmed, type: 'String', sql: toSqlLiteral(trimmed, 'String') };
  }

  const type = trimmed.slice(lastOpen + 1, lastClose).trim();
  const value = trimmed.slice(0, lastOpen);
  return {
    index: 0,
    raw: trimmed,
    value,
    type,
    sql: toSqlLiteral(value, type),
  };
}

function parseParameters(paramStr) {
  if (!paramStr || !paramStr.trim()) return [];

  const tokens = splitParameters(paramStr);
  return tokens.map((token, index) => {
    const parsed = parseParamToken(token);
    if (!parsed) return null;
    parsed.index = index + 1;
    return parsed;
  }).filter(Boolean);
}

function splitParameters(paramStr) {
  const result = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < paramStr.length; i += 1) {
    const ch = paramStr[i];
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;

    if (ch === ',' && depth === 0) {
      if (current.trim()) result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim()) result.push(current.trim());
  return result;
}

function toSqlLiteral(value, type) {
  if (value === null || value === undefined) return 'NULL';
  if (type === 'null' || String(value).toLowerCase() === 'null') return 'NULL';

  const normalizedType = (type || 'String').toLowerCase();

  if (['integer', 'int', 'long', 'double', 'float', 'short', 'byte', 'bigdecimal'].includes(normalizedType)) {
    const num = String(value).trim();
    return num === '' ? 'NULL' : num;
  }

  if (['boolean', 'bool'].includes(normalizedType)) {
    const lower = String(value).trim().toLowerCase();
    if (lower === 'true') return '1';
    if (lower === 'false') return '0';
    return String(value).trim();
  }

  // String, Date, Timestamp, LocalDateTime 등은 따옴표
  return `'${escapeSqlString(String(value))}'`;
}

function escapeSqlString(value) {
  return value.replace(/'/g, "''");
}

function replaceQuestionMarks(query, params) {
  let paramIndex = 0;
  let result = '';
  let inSingleQuote = false;

  for (let i = 0; i < query.length; i += 1) {
    const ch = query[i];
    const next = query[i + 1];

    if (ch === "'" && !inSingleQuote) {
      inSingleQuote = true;
      result += ch;
      continue;
    }
    if (ch === "'" && inSingleQuote) {
      if (next === "'") {
        result += "''";
        i += 1;
      } else {
        inSingleQuote = false;
        result += ch;
      }
      continue;
    }

    if (ch === '?' && !inSingleQuote) {
      if (paramIndex >= params.length) {
        throw new Error(`파라미터가 부족합니다. '?': ${(query.match(/\?/g) || []).length}개, 파라미터: ${params.length}개`);
      }
      result += params[paramIndex].sql;
      paramIndex += 1;
      continue;
    }

    result += ch;
  }

  if (paramIndex < params.length) {
    throw new Error(`파라미터가 남았습니다. 사용 ${paramIndex}개 / 전체 ${params.length}개`);
  }

  return result;
}

function renderPreview(params) {
  if (!params.length) {
    previewBody.innerHTML = '<tr><td colspan="4" style="color:#9ca3af;">파라미터가 없습니다.</td></tr>';
    return;
  }

  previewBody.innerHTML = params.map((p) => `
    <tr>
      <td>${p.index}</td>
      <td><code>${escapeHtml(p.raw)}</code></td>
      <td><code>${escapeHtml(p.type)}</code></td>
      <td><code>${escapeHtml(p.sql)}</code></td>
    </tr>
  `).join('');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function convert() {
  try {
    const query = queryInputEl.value.trim();
    const paramStr = paramsInputEl.value.trim();

    if (!query) {
      statusEl.className = 'status error';
      statusEl.textContent = '쿼리(Preparing)가 비어 있습니다.';
      return;
    }

    const params = parseParameters(paramStr);
    const sql = replaceQuestionMarks(query, params);

    outputEl.value = sql;
    renderPreview(params);

    const qCount = (query.match(/\?/g) || []).length;
    statusEl.className = 'status';
    statusEl.textContent = `변환 완료: ? ${qCount}개 → 파라미터 ${params.length}개 치환`;
  } catch (error) {
    statusEl.className = 'status error';
    statusEl.textContent = error.message || '변환 중 오류가 발생했습니다.';
    outputEl.value = '';
  }
}

async function copySql() {
  if (!outputEl.value) return;
  await navigator.clipboard.writeText(outputEl.value);
  statusEl.className = 'status';
  statusEl.textContent = 'SQL이 클립보드에 복사되었습니다.';
}

document.addEventListener('DOMContentLoaded', init);
