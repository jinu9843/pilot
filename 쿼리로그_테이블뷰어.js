/**
 * AS-IS 쿼리 로그 → 보기 편한 테이블 뷰어
 * scm_family_cd | tech_cd | ... 형식 파싱
 */

const SAMPLE = `scm_family_cd | tech_cd | fab_den_cd | mode_cd | gubun_nm | m202601 | m202602
DRAM | | AC | DC | 계획 | 100 | 120
DRAM | | AC | DC | 실적 | 95 | 118
NAND | 1Z | | | 계획 | 80 | 90`;

let parsed = { headers: [], rows: [] };

function init() {
  document.getElementById('parseBtn').addEventListener('click', parseAndRender);
  document.getElementById('sampleBtn').addEventListener('click', loadSample);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.getElementById('copyTsvBtn').addEventListener('click', copyTsv);
  document.getElementById('input').addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') parseAndRender();
  });

  ['showRowNo', 'highlightEmpty', 'stickyHeader', 'zebra'].forEach((id) => {
    document.getElementById(id).addEventListener('change', () => {
      if (parsed.headers.length) renderTable();
    });
  });

  document.getElementById('filterInput').addEventListener('input', renderTable);

  loadSample();
}

function loadSample() {
  document.getElementById('input').value = SAMPLE;
  parseAndRender();
}

function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('filterInput').value = '';
  document.getElementById('status').textContent = '';
  document.getElementById('stats').textContent = '';
  document.getElementById('tableWrap').innerHTML = '<p class="empty">로그를 붙여넣고 <strong>표로 보기</strong>를 눌러주세요.</p>';
  parsed = { headers: [], rows: [] };
}

function splitCells(line) {
  return line
    .split(/[|\t]+/)
    .map((cell) => cell.trim());
}

function parseLog(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^[-=|_\s]+$/.test(line));

  if (!lines.length) {
    return { headers: [], rows: [], error: '입력된 로그가 없습니다.' };
  }

  const headers = splitCells(lines[0]);
  if (!headers.length || headers.every((h) => !h)) {
    return { headers: [], rows: [], error: '헤더 행을 찾을 수 없습니다.' };
  }

  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCells(lines[i]);
    if (cells.every((c) => !c)) continue;

    const row = headers.map((_, idx) => cells[idx] ?? '');
    rows.push(row);
  }

  return { headers, rows, error: null };
}

function parseAndRender() {
  const raw = document.getElementById('input').value;
  const result = parseLog(raw);
  const statusEl = document.getElementById('status');

  if (result.error) {
    statusEl.className = 'status error';
    statusEl.textContent = result.error;
    parsed = { headers: [], rows: [] };
    document.getElementById('tableWrap').innerHTML = '<p class="empty">파싱 실패</p>';
    document.getElementById('stats').textContent = '';
    return;
  }

  parsed = { headers: result.headers, rows: result.rows };
  statusEl.className = 'status';
  statusEl.textContent = `파싱 완료: 컬럼 ${result.headers.length}개, 데이터 ${result.rows.length}행`;
  renderTable();
}

function getFilteredRows() {
  const keyword = document.getElementById('filterInput').value.trim().toLowerCase();
  if (!keyword) return parsed.rows;

  return parsed.rows.filter((row) =>
    row.some((cell) => String(cell).toLowerCase().includes(keyword)),
  );
}

function renderTable() {
  const wrap = document.getElementById('tableWrap');
  const { headers } = parsed;
  const rows = getFilteredRows();

  if (!headers.length) {
    wrap.innerHTML = '<p class="empty">표시할 데이터가 없습니다.</p>';
    return;
  }

  const showRowNo = document.getElementById('showRowNo').checked;
  const highlightEmpty = document.getElementById('highlightEmpty').checked;
  const stickyHeader = document.getElementById('stickyHeader').checked;
  const zebra = document.getElementById('zebra').checked;

  const tableClass = [
    'data-table',
    stickyHeader ? 'sticky' : '',
    zebra ? 'zebra' : '',
  ].filter(Boolean).join(' ');

  let html = `<div class="table-scroll"><table class="${tableClass}"><thead><tr>`;

  if (showRowNo) {
    html += '<th class="row-no">#</th>';
  }

  headers.forEach((header, idx) => {
    html += `<th title="${escapeHtml(header)}">${escapeHtml(header)}<span class="col-idx">C${idx + 1}</span></th>`;
  });
  html += '</tr></thead><tbody>';

  if (!rows.length) {
    html += `<tr><td colspan="${headers.length + (showRowNo ? 1 : 0)}" class="empty-cell">검색 결과가 없습니다.</td></tr>`;
  } else {
    rows.forEach((row, rowIdx) => {
      html += '<tr>';
      if (showRowNo) {
        html += `<td class="row-no">${rowIdx + 1}</td>`;
      }
      row.forEach((cell) => {
        const isEmpty = cell === '' || cell === null || cell === undefined;
        const cls = isEmpty && highlightEmpty ? 'empty-cell' : '';
        const text = isEmpty ? '∅' : escapeHtml(String(cell));
        html += `<td class="${cls}" title="${escapeHtml(String(cell))}">${text}</td>`;
      });
      html += '</tr>';
    });
  }

  html += '</tbody></table></div>';
  wrap.innerHTML = html;

  document.getElementById('stats').textContent =
    `표시 중: ${rows.length}행 / 전체 ${parsed.rows.length}행 · 컬럼 ${headers.length}개`;
}

function copyTsv() {
  if (!parsed.headers.length) return;

  const lines = [
    parsed.headers.join('\t'),
    ...parsed.rows.map((row) => row.join('\t')),
  ];

  navigator.clipboard.writeText(lines.join('\n'));
  const statusEl = document.getElementById('status');
  statusEl.className = 'status';
  statusEl.textContent = 'TSV(탭 구분) 형식으로 클립보드에 복사되었습니다. 엑셀에 붙여넣기 가능합니다.';
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
