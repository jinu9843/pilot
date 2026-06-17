/**
 * Eclipse 디버그 컬럼 로그 → Response DTO Java 변환기
 */

const SAMPLE = `scm_family_cd | subun | gubun_nm | font_gbn | m202601 | m202602`;

function snakeToCamel(name) {
  const lower = name.trim().toLowerCase();
  if (!lower) return '';
  return lower.replace(/_([a-z0-9])/g, (_, ch) => ch.toUpperCase());
}

function toClassName(name) {
  const camel = snakeToCamel(name.replace(/Dto$/i, ''));
  if (!camel) return 'XxxResponseDto';
  return camel.charAt(0).toUpperCase() + camel.slice(1) + 'ResponseDto';
}

function splitColumns(raw) {
  return raw
    .split(/\r?\n/)
    .flatMap((line) => line.split(/[|\t,;]+/))
    .map((col) => col.trim())
    .filter((col) => col && !/^[-=]+$/.test(col));
}

function isPivotColumn(col) {
  return /^m\d{6}$/i.test(col) || /^\d{6}$/.test(col);
}

function parseColumns(raw, skipPivot) {
  const cols = splitColumns(raw);
  const unique = [];
  const seen = new Set();

  cols.forEach((col) => {
    const key = col.toLowerCase();
    if (seen.has(key)) return;
    if (skipPivot && isPivotColumn(col)) return;
    seen.add(key);
    unique.push(col);
  });

  return unique;
}

function buildFields(columns, fieldType) {
  return columns.map((col) => ({
    column: col,
    field: snakeToCamel(col),
    type: fieldType,
  }));
}

function generateLombokDto(className, packageName, fields) {
  const lines = [];
  if (packageName.trim()) {
    lines.push(`package ${packageName.trim()};`, '');
  }
  lines.push(
    'import lombok.AllArgsConstructor;',
    'import lombok.Getter;',
    'import lombok.NoArgsConstructor;',
    'import lombok.Setter;',
    '',
    '@Getter',
    '@Setter',
    '@NoArgsConstructor',
    '@AllArgsConstructor',
    `public class ${className} {`,
    '',
  );

  fields.forEach(({ field, type }) => {
    lines.push(`    private ${type} ${field};`);
  });

  lines.push('}', '');
  return lines.join('\n');
}

function generateRecordDto(className, packageName, fields) {
  const lines = [];
  if (packageName.trim()) {
    lines.push(`package ${packageName.trim()};`, '');
  }
  const params = fields.map(({ field, type }) => `${type} ${field}`).join(', ');
  lines.push(`public record ${className.replace('ResponseDto', 'ResponseDto')}(${params}) {}`, '');
  return lines.join('\n');
}

function generatePlainDto(className, packageName, fields) {
  const lines = [];
  if (packageName.trim()) {
    lines.push(`package ${packageName.trim()};`, '');
  }
  lines.push(`public class ${className} {`, '');

  fields.forEach(({ field, type }) => {
    lines.push(`    private ${type} ${field};`, '');
  });

  fields.forEach(({ field, type }) => {
    const cap = field.charAt(0).toUpperCase() + field.slice(1);
    lines.push(
      `    public ${type} get${cap}() {`,
      `        return ${field};`,
      '    }',
      '',
      `    public void set${cap}(${type} ${field}) {`,
      `        this.${field} = ${field};`,
      '    }',
      '',
    );
  });

  lines.push('}', '');
  return lines.join('\n');
}

function renderPreview(fields) {
  const previewBody = document.getElementById('previewBody');
  if (!fields.length) {
    previewBody.innerHTML = '<tr><td colspan="3" style="color:#9ca3af;">컬럼이 없습니다.</td></tr>';
    return;
  }

  previewBody.innerHTML = fields.map((f, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><code>${escapeHtml(f.column)}</code></td>
      <td><code>${escapeHtml(f.type)} ${escapeHtml(f.field)}</code></td>
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
  const raw = document.getElementById('input').value;
  const className = document.getElementById('className').value.trim() || 'XxxResponseDto';
  const packageName = document.getElementById('packageName').value;
  const fieldType = document.getElementById('fieldType').value;
  const style = document.querySelector('input[name="dtoStyle"]:checked').value;
  const skipPivot = document.getElementById('skipPivot').checked;
  const statusEl = document.getElementById('status');
  const outputEl = document.getElementById('output');

  const columns = parseColumns(raw, skipPivot);
  if (!columns.length) {
    statusEl.className = 'status error';
    statusEl.textContent = '컬럼을 찾을 수 없습니다. | 또는 줄바꿈으로 구분된 컬럼명을 넣어주세요.';
    outputEl.value = '';
    renderPreview([]);
    return;
  }

  const fields = buildFields(columns, fieldType);
  let code = '';

  if (style === 'record') {
    code = generateRecordDto(className, packageName, fields);
  } else if (style === 'plain') {
    code = generatePlainDto(className, packageName, fields);
  } else {
    code = generateLombokDto(className, packageName, fields);
  }

  outputEl.value = code;
  renderPreview(fields);
  statusEl.className = 'status';
  statusEl.textContent = `변환 완료: ${fields.length}개 필드`;
}

function init() {
  document.getElementById('convertBtn').addEventListener('click', convert);
  document.getElementById('sampleBtn').addEventListener('click', () => {
    document.getElementById('input').value = SAMPLE;
    document.getElementById('className').value = 'Kpi046SearchResponseDto';
    convert();
  });
  document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('input').value = '';
    document.getElementById('output').value = '';
    document.getElementById('status').textContent = '';
    renderPreview([]);
  });
  document.getElementById('copyBtn').addEventListener('click', async () => {
    const output = document.getElementById('output').value;
    if (!output) return;
    await navigator.clipboard.writeText(output);
    document.getElementById('status').className = 'status';
    document.getElementById('status').textContent = 'Java 코드가 클립보드에 복사되었습니다.';
  });

  document.getElementById('input').value = SAMPLE;
  document.getElementById('className').value = 'Kpi046SearchResponseDto';
  document.getElementById('packageName').value = 'com.skhynix.gscm.d.kp.kpi.dto';
  convert();
}

document.addEventListener('DOMContentLoaded', init);
