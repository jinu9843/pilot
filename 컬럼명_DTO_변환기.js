/**
 * 파이프(|) 구분 컬럼명 → Java DTO 변환기
 * 예: AAA | BBB | CCC | DDD
 */

const SAMPLE = "ITEM_CD | ITEM_NM | GUBUN | PROF_AMT | YM | CHART_VALUE";

function splitColumns(raw) {
  return String(raw || "")
    .split(/\r?\n/)
    .flatMap(function (line) {
      return line.split(/[|\t,;]+/);
    })
    .map(function (col) {
      return col.trim();
    })
    .filter(function (col) {
      return col && !/^[-=]+$/.test(col);
    });
}

function uniqueColumns(columns) {
  const unique = [];
  const seen = new Set();
  columns.forEach(function (col) {
    const key = col.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    unique.push(col);
  });
  return unique;
}

function toJavaFieldName(column) {
  const name = String(column || "").trim();
  if (!name) {
    return "";
  }

  if (name.includes("_")) {
    return name
      .toLowerCase()
      .replace(/_([a-z0-9])/gi, function (_match, ch) {
        return ch.toUpperCase();
      });
  }

  if (/^[A-Z0-9]+$/.test(name)) {
    return name.toLowerCase();
  }

  return name.charAt(0).toLowerCase() + name.slice(1);
}

function isPivotColumn(column) {
  return /^m?\d{6}$/i.test(column.trim());
}

function buildFields(columns, fieldType) {
  return columns.map(function (column) {
    return {
      column: column,
      field: toJavaFieldName(column),
      type: fieldType,
    };
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function classBlock(className, fields, useLombok, isStaticInner) {
  const lines = [];

  if (useLombok) {
    lines.push("@Getter", "@Setter", "@NoArgsConstructor");
  }

  lines.push(
    (isStaticInner ? "public static class " : "public class ") + className + " {",
    ""
  );

  fields.forEach(function (field) {
    lines.push("    private " + field.type + " " + field.field + ";");
  });

  if (!useLombok) {
    lines.push("");
    fields.forEach(function (field) {
      const cap = field.field.charAt(0).toUpperCase() + field.field.slice(1);
      lines.push(
        "    public " + field.type + " get" + cap + "() {",
        "        return " + field.field + ";",
        "    }",
        "",
        "    public void set" + cap + "(" + field.type + " " + field.field + ") {",
        "        this." + field.field + " = " + field.field + ";",
        "    }",
        ""
      );
    });
  }

  lines.push("}", "");
  return lines;
}

function generateDto(packageName, className, fields, options) {
  const lines = [];
  const useLombok = options.style === "lombok";
  const innerClassName = options.innerClassName.trim() || "MainItem";

  if (packageName.trim()) {
    lines.push("package " + packageName.trim() + ";", "");
  }

  if (options.outputMode === "wrapper") {
    lines.push("import java.util.List;", "");
  }

  if (useLombok) {
    lines.push(
      "import lombok.Getter;",
      "import lombok.NoArgsConstructor;",
      "import lombok.Setter;",
      ""
    );
  }

  if (options.outputMode === "wrapper") {
    if (useLombok) {
      lines.push("@Getter", "@Setter", "@NoArgsConstructor");
    }
    lines.push("public class " + className + " {", "");
    lines.push("    private List<" + innerClassName + "> mainList;", "");
    lines.push("    private List<" + innerClassName + "> chartList;", "");
    lines.push("");
    lines.push.apply(lines, indentLines(classBlock(innerClassName, fields, useLombok, true), "    "));
    lines.push("}", "");
    return lines.join("\n").trim() + "\n";
  }

  lines.push.apply(lines, classBlock(className, fields, useLombok));
  return lines.join("\n").trim() + "\n";
}

function indentLines(blockLines, prefix) {
  return blockLines.map(function (line) {
    return line ? prefix + line : "";
  });
}

function generateServiceMapping(fields, dtoClass, itemClass) {
  const targetClass = itemClass || dtoClass;
  const lines = [
    "// Map row -> " + targetClass,
    targetClass + " dto = new " + targetClass + "();",
  ];

  fields.forEach(function (field) {
    const key = field.column.toUpperCase().includes("_")
      ? field.column.toUpperCase()
      : field.column;
    lines.push(
      'dto.set' +
        field.field.charAt(0).toUpperCase() +
        field.field.slice(1) +
        '(toStr(row.get("' +
        key +
        '")));'
    );
  });

  lines.push("response.add(dto);", "");
  return lines.join("\n");
}

function generateMyBatisAliases(fields) {
  return fields
    .map(function (field) {
      return "        " + field.column + " AS " + field.field;
    })
    .join(",\n");
}

function renderPreview(fields) {
  const previewBody = document.getElementById("previewBody");
  if (!fields.length) {
    previewBody.innerHTML =
      '<tr><td colspan="3" style="color:#9ca3af;">컬럼이 없습니다.</td></tr>';
    return;
  }

  previewBody.innerHTML = fields
    .map(function (field, index) {
      return (
        "<tr>" +
        "<td>" +
        (index + 1) +
        "</td>" +
        "<td><code>" +
        escapeHtml(field.column) +
        "</code></td>" +
        "<td><code>" +
        escapeHtml(field.type) +
        " " +
        escapeHtml(field.field) +
        "</code></td>" +
        "</tr>"
      );
    })
    .join("");
}

function convert() {
  const raw = document.getElementById("input").value;
  const className = document.getElementById("className").value.trim() || "XxxResponseDto";
  const innerClassName = document.getElementById("innerClassName").value.trim();
  const packageName = document.getElementById("packageName").value;
  const fieldType = document.getElementById("fieldType").value;
  const style = document.querySelector('input[name="dtoStyle"]:checked').value;
  const outputMode = document.querySelector('input[name="outputMode"]:checked').value;
  const extra = document.querySelector('input[name="extraOutput"]:checked').value;
  const skipPivot = document.getElementById("skipPivot").checked;
  const statusEl = document.getElementById("status");
  const outputEl = document.getElementById("output");

  let columns = uniqueColumns(splitColumns(raw));
  if (skipPivot) {
    columns = columns.filter(function (col) {
      return !isPivotColumn(col);
    });
  }

  if (!columns.length) {
    statusEl.className = "status error";
    statusEl.textContent =
      "컬럼을 찾을 수 없습니다. AAA | BBB | CCC 형식으로 붙여넣어 주세요.";
    outputEl.value = "";
    renderPreview([]);
    return;
  }

  const fields = buildFields(columns, fieldType);
  const options = {
    style: style,
    outputMode: outputMode,
    innerClassName: innerClassName || "MainItem",
  };

  let code = generateDto(packageName, className, fields, options);

  if (extra === "service") {
    code +=
      "\n// ----- ServiceDb 매핑 예시 -----\n" +
      generateServiceMapping(
        fields,
        className,
        outputMode === "wrapper" ? options.innerClassName : ""
      );
  } else if (extra === "mybatis") {
    code +=
      "\n// ----- MyBatis SELECT AS 예시 -----\n" +
      generateMyBatisAliases(fields);
  }

  outputEl.value = code;
  renderPreview(fields);
  statusEl.className = "status";
  statusEl.textContent = "변환 완료: " + fields.length + "개 필드";
}

function init() {
  document.getElementById("convertBtn").addEventListener("click", convert);
  document.getElementById("sampleBtn").addEventListener("click", function () {
    document.getElementById("input").value = SAMPLE;
    document.getElementById("className").value = "Kpi046MainItem";
    convert();
  });
  document.getElementById("clearBtn").addEventListener("click", function () {
    document.getElementById("input").value = "";
    document.getElementById("output").value = "";
    document.getElementById("status").textContent = "";
    renderPreview([]);
  });
  document.getElementById("copyBtn").addEventListener("click", async function () {
    const output = document.getElementById("output").value;
    if (!output) {
      return;
    }
    await navigator.clipboard.writeText(output);
    document.getElementById("status").className = "status";
    document.getElementById("status").textContent = "Java 코드가 클립보드에 복사되었습니다.";
  });

  [
    "input",
    "className",
    "innerClassName",
    "packageName",
    "fieldType",
    "skipPivot",
  ].forEach(function (id) {
    document.getElementById(id).addEventListener("input", convert);
    document.getElementById(id).addEventListener("change", convert);
  });

  document.querySelectorAll('input[name="dtoStyle"]').forEach(function (el) {
    el.addEventListener("change", convert);
  });
  document.querySelectorAll('input[name="outputMode"]').forEach(function (el) {
    el.addEventListener("change", convert);
  });
  document.querySelectorAll('input[name="extraOutput"]').forEach(function (el) {
    el.addEventListener("change", convert);
  });

  document.getElementById("input").value = "AAA | BBB | CCC | DDD";
  document.getElementById("className").value = "Kpi046MainItem";
  document.getElementById("packageName").value = "com.skhynix.gscm.d.kp.kpi.dto";
  convert();
}

document.addEventListener("DOMContentLoaded", init);
