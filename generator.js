(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.NexacroSpringbootGenerator = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const GENERATOR_VERSION = "2025-06-16c";
  const MYBATIS_DOCTYPE =
    '<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "https://mybatis.org/dtd/mybatis-3-mapper.dtd">';

  function unique(array) {
    return Array.from(new Set(array));
  }

  function toWords(value) {
    return String(value || "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[^A-Za-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function capitalize(word) {
    const lower = String(word || "").toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  function toPascalCase(value) {
    const words = toWords(value);
    if (words.length === 0) {
      return "Generated";
    }

    return words.map(capitalize).join("");
  }

  function toCamelCase(value) {
    const pascal = toPascalCase(value);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  function toKebabCase(value) {
    const words = toWords(value);
    if (words.length === 0) {
      return "generated";
    }

    return words.map(function (word) {
      return String(word).toLowerCase();
    }).join("-");
  }

  function toPackageSegment(value) {
    const words = toWords(value);
    if (words.length === 0) {
      return "generated";
    }

    return words.map(function (word) {
      return String(word).toLowerCase();
    }).join("");
  }

  function parseAttributes(attributeText) {
    const attributes = {};
    const regex = /([A-Za-z_:][\w:.-]*)\s*=\s*(['"])(.*?)\2/g;
    let match = regex.exec(attributeText || "");

    while (match) {
      attributes[match[1]] = match[3];
      match = regex.exec(attributeText || "");
    }

    return attributes;
  }

  function buildAttributeString(attributes, preferredOrder) {
    const keys = Object.keys(attributes || {});
    const ordered = [];
    const used = {};

    (preferredOrder || []).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(attributes, key) && attributes[key] !== "") {
        ordered.push(key);
        used[key] = true;
      }
    });

    keys.forEach(function (key) {
      if (!used[key] && attributes[key] !== "") {
        ordered.push(key);
      }
    });

    return ordered.map(function (key) {
      return ' ' + key + '="' + String(attributes[key]).replace(/"/g, "&quot;") + '"';
    }).join("");
  }

  function isBlank(value) {
    return String(value || "").trim() === "";
  }

  function looksLikeJavaType(token) {
    return /^(String|Integer|Long|Double|Float|Boolean|BigDecimal|LocalDate|LocalDateTime|List<.*>|Map<.*>|HashMap<.*>|int|long|double|float|boolean|BigDecimal|Date|Timestamp)$/i.test(
      String(token || "").trim()
    );
  }

  function normalizeComment(line) {
    return String(line || "")
      .replace(/\/\/.*$/, "")
      .replace(/#.*$/, "")
      .trim();
  }

  function stripQuotes(value) {
    return String(value || "").replace(/^['"]|['"]$/g, "");
  }

  function inferJavaType(rawType, sampleValue, options) {
    const raw = String(rawType || "").trim().toLowerCase();
    const sample = stripQuotes(sampleValue).trim();
    const dateType = (options && options.dateType) || "String";

    if (raw) {
      if (/bigdecimal|decimal|numeric|number\(.*,\s*[1-9]\d*\)/i.test(raw)) {
        return "BigDecimal";
      }
      if (/bigint|long/i.test(raw)) {
        return "Long";
      }
      if (/int|integer|short|number/i.test(raw) && !/point|decimal/i.test(raw)) {
        return "Integer";
      }
      if (/double|float/i.test(raw)) {
        return "Double";
      }
      if (/bool/i.test(raw)) {
        return "Boolean";
      }
      if (/timestamp|datetime/i.test(raw)) {
        return dateType === "LocalDateTime" ? "LocalDateTime" : "String";
      }
      if (/date|time/i.test(raw)) {
        if (dateType === "LocalDateTime") {
          return "LocalDateTime";
        }
        if (dateType === "LocalDate") {
          return "LocalDate";
        }
        return "String";
      }
      if (/char|string|text|varchar|nvarchar|clob|blob|map|object/i.test(raw)) {
        return "String";
      }
    }

    if (/^(true|false)$/i.test(sample)) {
      return "Boolean";
    }

    if (/^-?\d+$/.test(sample)) {
      return sample.length > 9 ? "Long" : "Integer";
    }

    if (/^-?\d+\.\d+$/.test(sample)) {
      return "BigDecimal";
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(sample)) {
      return dateType === "LocalDateTime" ? "LocalDateTime" : "String";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(sample) || /^\d{8}$/.test(sample)) {
      if (dateType === "LocalDateTime") {
        return "LocalDateTime";
      }
      if (dateType === "LocalDate") {
        return "LocalDate";
      }
      return "String";
    }

    return "String";
  }

  function createField(rawName, rawType, sampleValue, options) {
    const safeName = String(rawName || "").trim();
    if (!safeName) {
      return null;
    }

    return {
      rawName: safeName,
      javaName: toCamelCase(safeName),
      javaType: inferJavaType(rawType, sampleValue, options),
      rawType: String(rawType || "").trim(),
      sampleValue: stripQuotes(sampleValue || ""),
    };
  }

  function parseFieldLine(line, options) {
    const cleaned = normalizeComment(line);
    if (!cleaned) {
      return null;
    }

    let match = cleaned.match(
      /<\s*(?:Column|column|col|Field|field|Parameter|parameter)\b[^>]*(?:id|name)=["']([^"']+)["'][^>]*(?:type|dataType|datatype)=["']([^"']+)["'][^>]*\/?>/i
    );
    if (match) {
      return createField(match[1], match[2], "", options);
    }

    match = cleaned.match(
      /<\s*(?:Column|column|col|Field|field|Parameter|parameter)\b[^>]*(?:id|name)=["']([^"']+)["'][^>]*\/?>/i
    );
    if (match) {
      return createField(match[1], "", "", options);
    }

    match = cleaned.match(
      /^(?:private|protected|public)?\s*(?:static\s+)?(?:final\s+)?([A-Za-z_][\w<>.?]*)\s+([A-Za-z_][\w]*)\s*;?$/
    );
    if (match) {
      return createField(match[2], match[1], "", options);
    }

    match = cleaned.match(/^["']?([A-Za-z_][\w-]*)["']?\s*:\s*(.+)$/);
    if (match) {
      const rhs = match[2].trim();
      const rhsToken = rhs.replace(/[,;]$/, "").trim();
      const rhsIsType = looksLikeJavaType(rhsToken) || /^[A-Z_]+$/.test(rhsToken);
      return createField(match[1], rhsIsType ? rhsToken : "", rhsIsType ? "" : rhsToken, options);
    }

    match = cleaned.match(/^([A-Za-z_][\w-]*)\s*=\s*(.+)$/);
    if (match) {
      return createField(match[1], "", match[2].replace(/[,;]$/, "").trim(), options);
    }

    match = cleaned.match(/^([A-Za-z_][\w-]*)\s+([A-Za-z_][\w<>.?]*)$/);
    if (match) {
      if (looksLikeJavaType(match[1])) {
        return createField(match[2], match[1], "", options);
      }
      if (looksLikeJavaType(match[2]) || /^[A-Z_]+$/.test(match[2])) {
        return createField(match[1], match[2], "", options);
      }
    }

    match = cleaned.match(/^([A-Za-z_][\w-]*)$/);
    if (match) {
      return createField(match[1], "", "", options);
    }

    return null;
  }

  function parseFieldText(text, options, warnings, label) {
    const lines = String(text || "").split(/\r?\n/);
    const fields = [];
    const seen = {};

    lines.forEach(function (line) {
      const field = parseFieldLine(line, options);
      if (!field) {
        return;
      }

      if (!seen[field.javaName]) {
        fields.push(field);
        seen[field.javaName] = true;
      }
    });

    if (!isBlank(text) && fields.length === 0) {
      warnings.push(label + "에서 필드를 해석하지 못했습니다. 한 줄에 한 항목씩 붙여넣어 주세요.");
    }

    return fields;
  }

  function parseServiceMethod(serviceSource) {
    const source = String(serviceSource || "");
    const regex =
      /^\s*(?:@\w+(?:\([^)]*\))?\s*)*(?:public|protected|private)?\s*(?:static\s+)?([\w<>\[\], ?.$]+)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/m;
    const match = source.match(regex);

    if (!match) {
      return {
        methodName: "",
        returnTypeRaw: "",
        parametersRaw: "",
      };
    }

    return {
      returnTypeRaw: match[1].replace(/\s+/g, " ").trim(),
      methodName: match[2].trim(),
      parametersRaw: match[3].trim(),
    };
  }

  function normalizeLegacyKey(rawKey) {
    const key = String(rawKey || "").trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      return "";
    }
    return key;
  }

  function analyzeLegacyServiceSource(serviceSource) {
    const source = String(serviceSource || "");
    const requestFields = [];
    const paramKeys = [];
    const xmlCalls = [];
    const recordSets = [];
    const requestSeen = {};
    const paramSeen = {};
    const xmlSeen = {};
    const recordSeen = {};
    let dataUnitClassName = "";
    let dataUnitVariable = "";
    let methodBody = source;
    let match;

    match = source.match(/lookupDataUnit\(\s*([A-Za-z_]\w*)\.class\s*\)/);
    if (match) {
      dataUnitClassName = match[1];
    }

    match = source.match(/\b[A-Za-z_]\w*\s+([A-Za-z_]\w*)\s*=\s*\([A-Za-z_]\w*\)\s*lookupDataUnit\(/);
    if (match) {
      dataUnitVariable = match[1];
    }

    const bodyMatch = source.match(/\{([\s\S]*)\}$/);
    if (bodyMatch) {
      methodBody = bodyMatch[1];
    }

    const requestRegex = /requestData\.getField\(\s*"([^"]+)"\s*\)/g;
    match = requestRegex.exec(source);
    while (match) {
      const key = normalizeLegacyKey(match[1]);
      if (key && !requestSeen[key]) {
        requestFields.push(key);
        requestSeen[key] = true;
      }
      match = requestRegex.exec(source);
    }

    const paramRegex = /paramMap\.put\(\s*"([^"]+)"/g;
    match = paramRegex.exec(source);
    while (match) {
      const key = normalizeLegacyKey(match[1]);
      if (key && !paramSeen[key]) {
        paramKeys.push(key);
        paramSeen[key] = true;
      }
      match = paramRegex.exec(source);
    }

    const xmlCallRegex = /IDataSet\s+([A-Za-z_]\w*)\s*=\s*([A-Za-z_]\w*)\.([A-Za-z_]\w*)\(([\s\S]*?)\);/g;
    match = xmlCallRegex.exec(source);
    while (match) {
      const receiver = match[2];
      const callKey = receiver + "." + match[3];
      if (!xmlSeen[callKey]) {
        xmlCalls.push({
          resultVar: match[1],
          receiver: receiver,
          methodName: match[3],
          argumentsRaw: match[4].replace(/\s+/g, " ").trim(),
        });
        xmlSeen[callKey] = true;
      }
      match = xmlCallRegex.exec(source);
    }

    const recordSetRegex =
      /responseData\.putRecordSet\(\s*(?:"([^"]+)"|([A-Za-z_]\w*))\s*,\s*([A-Za-z_]\w*)\.getRecordSet\(\s*"([^"]+)"\s*\)\s*\)/g;
    match = recordSetRegex.exec(source);
    while (match) {
      const targetName = match[1] || match[2] || "";
      const recordKey = targetName + "|" + match[3] + "|" + match[4];
      if (!recordSeen[recordKey]) {
        recordSets.push({
          targetName: targetName,
          sourceVar: match[3],
          sourceRecordSet: match[4],
        });
        recordSeen[recordKey] = true;
      }
      match = recordSetRegex.exec(source);
    }

    const conditionLines = [];
    methodBody.split(/\r?\n/).forEach(function (line) {
      const trimmed = line.trim();
      if (/^(if|else if|else)\b/.test(trimmed) || /StringBuilder\b/.test(trimmed)) {
        conditionLines.push(trimmed);
      }
    });

    return {
      hasLegacySource: !isBlank(source),
      dataUnitClassName: dataUnitClassName,
      dataUnitVariable: dataUnitVariable,
      requestFields: requestFields,
      paramKeys: paramKeys,
      xmlCalls: xmlCalls,
      recordSets: recordSets,
      conditionLines: unique(conditionLines),
    };
  }

  function mergeFieldLists(primaryFields, secondaryFields) {
    const merged = [];
    const seen = {};

    (primaryFields || []).concat(secondaryFields || []).forEach(function (field) {
      if (!field || !field.javaName || seen[field.javaName]) {
        return;
      }
      merged.push(field);
      seen[field.javaName] = true;
    });

    return merged;
  }

  function buildFieldsFromLegacyKeys(keys, options) {
    return (keys || []).map(function (key) {
      return createField(key, "", "", options);
    }).filter(Boolean);
  }

  function generateLegacyServiceAnalysis(legacyAnalysis) {
    if (!legacyAnalysis || !legacyAnalysis.hasLegacySource) {
      return "서비스단 원문이 없어서 분석 결과가 없습니다.\n";
    }

    const lines = [];
    lines.push("[AS-IS 서비스 분석]");
    lines.push("DataUnit 클래스: " + (legacyAnalysis.dataUnitClassName || "(미확인)"));
    lines.push("DataUnit 변수: " + (legacyAnalysis.dataUnitVariable || "(미확인)"));
    lines.push("requestData.getField 수: " + legacyAnalysis.requestFields.length);
    lines.push("paramMap.put 수: " + legacyAnalysis.paramKeys.length);
    lines.push("XML 호출 수: " + legacyAnalysis.xmlCalls.length);
    lines.push("responseData.putRecordSet 수: " + legacyAnalysis.recordSets.length);
    lines.push("");

    lines.push("[requestData.getField]");
    if (legacyAnalysis.requestFields.length === 0) {
      lines.push("- 없음");
    } else {
      legacyAnalysis.requestFields.forEach(function (field) {
        lines.push("- " + field + " -> " + toCamelCase(field));
      });
    }
    lines.push("");

    lines.push("[paramMap.put]");
    if (legacyAnalysis.paramKeys.length === 0) {
      lines.push("- 없음");
    } else {
      legacyAnalysis.paramKeys.forEach(function (field) {
        lines.push("- " + field + " -> " + toCamelCase(field));
      });
    }
    lines.push("");

    lines.push("[XML 호출 순서]");
    if (legacyAnalysis.xmlCalls.length === 0) {
      lines.push("- 없음");
    } else {
      legacyAnalysis.xmlCalls.forEach(function (call, index) {
        lines.push(
          (index + 1) + ". " + call.methodName +
          " (resultVar=" + call.resultVar +
          ", args=" + call.argumentsRaw + ")"
        );
      });
    }
    lines.push("");

    lines.push("[RecordSet 응답]");
    if (legacyAnalysis.recordSets.length === 0) {
      lines.push("- 없음");
    } else {
      legacyAnalysis.recordSets.forEach(function (recordSet) {
        lines.push(
          "- " + recordSet.targetName +
          " <= " + recordSet.sourceVar +
          ".getRecordSet(\"" + recordSet.sourceRecordSet + "\")"
        );
      });
    }
    lines.push("");

    lines.push("[조건/가공 로직 힌트]");
    if (legacyAnalysis.conditionLines.length === 0) {
      lines.push("- 없음");
    } else {
      legacyAnalysis.conditionLines.forEach(function (line) {
        lines.push("- " + line);
      });
    }
    lines.push("");

    return lines.join("\n");
  }

  function parseSqlMeta(xmlSource) {
    const source = String(xmlSource || "");
    const regex = /<\s*(select|insert|update|delete)\b([^>]*)>/gi;
    const statements = [];
    let match = regex.exec(source);

    while (match) {
      statements.push({
        action: match[1].toLowerCase(),
        attrs: parseAttributes(match[2] || ""),
      });
      match = regex.exec(source);
    }

    return {
      statements: statements,
      first: statements[0] || null,
    };
  }

  function inferAction(methodName, sqlMeta, actionOption) {
    if (actionOption && actionOption !== "auto") {
      return actionOption;
    }

    const sqlAction = sqlMeta && sqlMeta.first ? sqlMeta.first.action : "";
    if (sqlAction) {
      return sqlAction;
    }

    const name = String(methodName || "").toLowerCase();
    if (/^(save|insert|add|create|regist)/.test(name)) {
      return "insert";
    }
    if (/^(update|modify|change)/.test(name)) {
      return "update";
    }
    if (/^(delete|remove)/.test(name)) {
      return "delete";
    }
    return "select";
  }

  function inferResponseMode(action, responseOption, serviceMeta) {
    if (responseOption && responseOption !== "auto") {
      return responseOption;
    }

    if (action !== "select") {
      return "int";
    }

    const returnType = String((serviceMeta && serviceMeta.returnTypeRaw) || "");
    if (/List<|Collection<|DataSetMap/i.test(returnType)) {
      return "list";
    }

    return "list";
  }

  function guessFeatureName(featureName, serviceMeta, sqlMeta) {
    if (!isBlank(featureName)) {
      return toPascalCase(featureName);
    }

    if (serviceMeta && serviceMeta.methodName) {
      return toPascalCase(serviceMeta.methodName.replace(/^(get|search|select|save|insert|update|delete|list)/i, ""));
    }

    if (sqlMeta && sqlMeta.first && sqlMeta.first.attrs.id) {
      return toPascalCase(sqlMeta.first.attrs.id);
    }

    return "Generated";
  }

  function guessMethodName(serviceMeta, sqlMeta, featureClassName, action, responseMode) {
    if (serviceMeta && serviceMeta.methodName) {
      return serviceMeta.methodName;
    }

    if (sqlMeta && sqlMeta.first && sqlMeta.first.attrs.id) {
      return sqlMeta.first.attrs.id;
    }

    if (action === "select" && responseMode === "list") {
      return "get" + featureClassName + "List";
    }
    if (action === "select") {
      return "get" + featureClassName;
    }
    if (action === "insert") {
      return "save" + featureClassName;
    }
    if (action === "update") {
      return "update" + featureClassName;
    }
    return "delete" + featureClassName;
  }

  function buildClassNames(featureClassName) {
    return {
      featureClassName: featureClassName,
      requestDto: featureClassName + "RequestDto",
      queryDto: featureClassName + "QueryDto",
      responseDto: featureClassName + "ResponseDto",
      service: featureClassName + "Service",
      serviceImpl: featureClassName + "ServiceImpl",
      mapper: featureClassName + "Mapper",
      controller: featureClassName + "Controller",
    };
  }

  function buildPackages(basePackage, featureClassName) {
    const root = String(basePackage || "com.example.demo").trim();
    const featurePackage = toPackageSegment(featureClassName);

    return {
      root: root,
      dto: root + "." + featurePackage + ".dto",
      service: root + "." + featurePackage + ".service",
      impl: root + "." + featurePackage + ".service.impl",
      mapper: root + "." + featurePackage + ".mapper",
      controller: root + "." + featurePackage + ".controller",
    };
  }

  function getReturnType(responseMode, classNames) {
    if (responseMode === "single") {
      return classNames.responseDto;
    }
    if (responseMode === "void") {
      return "void";
    }
    if (responseMode === "int") {
      return "int";
    }
    return "List<" + classNames.responseDto + ">";
  }

  function collectTypeImports(fields) {
    const imports = [];

    fields.forEach(function (field) {
      if (field.javaType === "BigDecimal") {
        imports.push("java.math.BigDecimal");
      }
      if (field.javaType === "LocalDate") {
        imports.push("java.time.LocalDate");
      }
      if (field.javaType === "LocalDateTime") {
        imports.push("java.time.LocalDateTime");
      }
    });

    return unique(imports).sort();
  }

  function generateDto(packageName, className, fields) {
    const imports = collectTypeImports(fields);
    const importLines = []
      .concat(imports)
      .concat([
        "lombok.AllArgsConstructor",
        "lombok.Builder",
        "lombok.Getter",
        "lombok.NoArgsConstructor",
        "lombok.Setter",
      ])
      .map(function (line) {
        return "import " + line + ";";
      })
      .join("\n");

    const body = fields.length > 0
      ? fields.map(function (field) {
          return "    private " + field.javaType + " " + field.javaName + ";";
        }).join("\n")
      : "    // TODO: 필드를 확인해 주세요.";

    return [
      "package " + packageName + ";",
      "",
      importLines,
      "",
      "@Getter",
      "@Setter",
      "@Builder",
      "@NoArgsConstructor",
      "@AllArgsConstructor",
      "public class " + className + " {",
      body,
      "}",
      "",
    ].join("\n");
  }

  function generateLegacyServiceDraft(packages, classNames, methodName, legacyAnalysis, responseMode) {
    if (!legacyAnalysis || !legacyAnalysis.hasLegacySource) {
      return "서비스단 원문이 없어서 변환 초안을 만들지 못했습니다.\n";
    }

    const lines = [
      "package " + packages.impl + ";",
      "",
      "import " + packages.dto + "." + classNames.requestDto + ";",
      "import " + packages.dto + "." + classNames.queryDto + ";",
      "import " + packages.dto + "." + classNames.responseDto + ";",
      "import " + packages.mapper + "." + classNames.mapper + ";",
      "import " + packages.service + "." + classNames.service + ";",
      "import lombok.RequiredArgsConstructor;",
      "import org.springframework.beans.BeanUtils;",
      "import org.springframework.stereotype.Service;",
      "import org.springframework.transaction.annotation.Transactional;",
      "import java.util.List;",
      "import java.util.Map;",
      "",
      "@Service",
      "@RequiredArgsConstructor",
      "@Transactional(readOnly = true)",
      "public class " + classNames.serviceImpl + " implements " + classNames.service + " {",
      "    private final " + classNames.mapper + " " + toCamelCase(classNames.mapper) + ";",
      "",
      "    @Override",
      "    public " + getReturnType(responseMode, classNames) + " " + methodName + "(" + classNames.requestDto + " requestDto) {",
      "        " + classNames.queryDto + " queryDto = new " + classNames.queryDto + "();",
      "        BeanUtils.copyProperties(requestDto, queryDto);",
      "",
      "        // AS-IS requestData.getField(...) 에서 사용한 프론트 입력",
    ];

    if (legacyAnalysis.requestFields.length === 0) {
      lines.push("        // TODO: requestData.getField(...) 항목을 확인해 주세요.");
    } else {
      legacyAnalysis.requestFields.forEach(function (field) {
        const javaName = toCamelCase(field);
        lines.push("        String " + javaName + " = requestDto.get" + toPascalCase(field) + "();");
      });
    }

    lines.push("", "        // AS-IS paramMap.put(...) 로 계산하던 내부 파라미터");

    if (legacyAnalysis.paramKeys.length === 0) {
      lines.push("        // TODO: paramMap.put(...) 항목을 확인해 주세요.");
    } else {
      legacyAnalysis.paramKeys.forEach(function (field) {
        lines.push("        // queryDto.set" + toPascalCase(field) + "(/* TODO: 기존 서비스 로직 이관 */);");
      });
    }

    lines.push("", "        // AS-IS XML 호출 순서");

    if (legacyAnalysis.xmlCalls.length === 0) {
      lines.push("        // TODO: DataUnit XML 호출을 확인해 주세요.");
    } else {
      legacyAnalysis.xmlCalls.forEach(function (call, index) {
        const isLast = index === legacyAnalysis.xmlCalls.length - 1;
        const variableName = toCamelCase(call.resultVar || call.methodName + "Rows");
        const returnType = isLast && responseMode === "list"
          ? "List<" + classNames.responseDto + ">"
          : "List<Map<String, Object>>";
        lines.push(
          "        " + returnType + " " + variableName + " = " +
          toCamelCase(classNames.mapper) + "." + call.methodName + "(queryDto);"
        );
      });
    }

    if (legacyAnalysis.recordSets.length > 0) {
      lines.push("", "        // AS-IS responseData.putRecordSet(...) 구조");
      legacyAnalysis.recordSets.forEach(function (recordSet) {
        lines.push(
          "        // TODO: " + recordSet.targetName + " <= " +
          recordSet.sourceVar + ".getRecordSet(\"" + recordSet.sourceRecordSet + "\")"
        );
      });
    }

    lines.push("", "        // TODO: 복수 RecordSet 응답이면 단일 ResponseDto 래퍼로 조합해 주세요.");

    if (legacyAnalysis.xmlCalls.length > 0) {
      const lastCall = legacyAnalysis.xmlCalls[legacyAnalysis.xmlCalls.length - 1];
      const lastVar = toCamelCase(lastCall.resultVar || lastCall.methodName + "Rows");
      if (responseMode === "void") {
        lines.push("        return;");
      } else if (responseMode === "single") {
        lines.push("        return " + lastVar + ".isEmpty() ? null : " + lastVar + ".get(0);");
      } else if (responseMode === "list") {
        lines.push("        return " + lastVar + ";");
      } else {
        lines.push("        return " + lastVar + ".size();");
      }
    } else if (responseMode === "void") {
      lines.push("        return;");
    } else if (responseMode === "single") {
      lines.push("        return null;");
    } else if (responseMode === "list") {
      lines.push("        return java.util.Collections.emptyList();");
    } else {
      lines.push("        return 0;");
    }

    lines.push("    }", "}", "");

    return lines.join("\n");
  }

  function generateService(packages, classNames, methodName, responseMode) {
    const lines = [
      "package " + packages.service + ";",
      "",
      "import " + packages.dto + "." + classNames.requestDto + ";",
    ];

    if (responseMode === "list" || responseMode === "single") {
      lines.push("import " + packages.dto + "." + classNames.responseDto + ";");
    }
    if (responseMode === "list") {
      lines.push("import java.util.List;");
    }

    lines.push(
      "",
      "public interface " + classNames.service + " {",
      "    " + getReturnType(responseMode, classNames) + " " + methodName + "(" + classNames.requestDto + " requestDto);",
      "}",
      ""
    );

    return lines.join("\n");
  }

  function generateServiceImpl(packages, classNames, methodName, responseMode, action) {
    const lines = [
      "package " + packages.impl + ";",
      "",
      "import " + packages.dto + "." + classNames.requestDto + ";",
    ];

    if (responseMode === "list" || responseMode === "single") {
      lines.push("import " + packages.dto + "." + classNames.responseDto + ";");
    }
    lines.push(
      "import " + packages.mapper + "." + classNames.mapper + ";",
      "import " + packages.service + "." + classNames.service + ";",
      "import lombok.RequiredArgsConstructor;",
      "import org.springframework.stereotype.Service;",
      "import org.springframework.transaction.annotation.Transactional;"
    );
    if (responseMode === "list") {
      lines.push("import java.util.List;");
    }

    const bodyLines = [];
    if (responseMode === "void") {
      bodyLines.push("        " + toCamelCase(classNames.mapper) + "." + methodName + "(requestDto);");
    } else {
      bodyLines.push("        return " + toCamelCase(classNames.mapper) + "." + methodName + "(requestDto);");
    }

    lines.push(
      "",
      "@Service",
      "@RequiredArgsConstructor",
      "@Transactional(readOnly = " + (action === "select" ? "true" : "false") + ")",
      "public class " + classNames.serviceImpl + " implements " + classNames.service + " {",
      "    private final " + classNames.mapper + " " + toCamelCase(classNames.mapper) + ";",
      "",
      "    @Override",
      "    public " + getReturnType(responseMode, classNames) + " " + methodName + "(" + classNames.requestDto + " requestDto) {",
      bodyLines.join("\n"),
      "    }",
      "}",
      ""
    );

    return lines.join("\n");
  }

  function generateMapper(packages, classNames, methodName, responseMode, legacyAnalysis) {
    const lines = [
      "package " + packages.mapper + ";",
      "",
      "import " + packages.dto + "." + classNames.requestDto + ";",
    ];

    if (responseMode === "list" || responseMode === "single") {
      lines.push("import " + packages.dto + "." + classNames.responseDto + ";");
    }
    if (legacyAnalysis && legacyAnalysis.hasLegacySource && legacyAnalysis.xmlCalls.length > 0) {
      lines.push("import " + packages.dto + "." + classNames.queryDto + ";");
    }
    if (responseMode === "list" || (legacyAnalysis && legacyAnalysis.xmlCalls.length > 0)) {
      lines.push("import java.util.List;");
    }
    if (legacyAnalysis && legacyAnalysis.xmlCalls.length > 1) {
      lines.push("import java.util.Map;");
    }
    lines.push("import org.apache.ibatis.annotations.Mapper;");

    const methodLines = [
      "    " + getReturnType(responseMode, classNames) + " " + methodName + "(" + classNames.requestDto + " requestDto);",
    ];

    if (legacyAnalysis && legacyAnalysis.hasLegacySource && legacyAnalysis.xmlCalls.length > 0) {
      methodLines.push("", "    // AS-IS XML helper methods");
      legacyAnalysis.xmlCalls.forEach(function (call, index) {
        const isLast = index === legacyAnalysis.xmlCalls.length - 1;
        const helperReturnType = isLast
          ? getReturnType(responseMode, classNames)
          : "List<Map<String, Object>>";
        methodLines.push(
          "    " + helperReturnType + " " + call.methodName + "(" + classNames.queryDto + " queryDto);"
        );
      });
    }

    lines.push("", "@Mapper", "public interface " + classNames.mapper + " {");
    methodLines.forEach(function (line) {
      lines.push(line);
    });
    lines.push("}", "");

    return lines.join("\n");
  }

  function buildSkeletonMapperXml(namespace, methodName, action, responseMode, requestDtoFqn, responseDtoFqn) {
    const statementAttrs = {
      id: methodName,
      parameterType: requestDtoFqn,
    };

    if (action === "select" && (responseMode === "list" || responseMode === "single")) {
      statementAttrs.resultType = responseDtoFqn;
    }

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      MYBATIS_DOCTYPE,
      '<mapper namespace="' + namespace + '">',
      "  <" + action + buildAttributeString(statementAttrs, ["id", "parameterType", "resultType"]) + ">",
      "    -- TODO: SQL을 붙여 넣어 주세요.",
      "  </" + action + ">",
      "</mapper>",
      "",
    ].join("\n");
  }

  function ensureXmlDeclaration(source) {
    const withoutBom = String(source || "").replace(/^\uFEFF/, "");
    if (/^\s*<\?xml\b/i.test(withoutBom)) {
      return withoutBom.replace(/^\s*<\?xml\b[^>]*\?>/i, '<?xml version="1.0" encoding="UTF-8"?>');
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + withoutBom.trimStart();
  }

  function replaceDoctype(source) {
    const regex = /<!DOCTYPE\s+(sqlMap|mapper)[\s\S]*?>/i;
    if (regex.test(source)) {
      return source.replace(regex, MYBATIS_DOCTYPE);
    }
    return source.replace(/^\s*<\?xml\b[^>]*\?>/i, function (match) {
      return match + "\n" + MYBATIS_DOCTYPE;
    });
  }

  function wrapStatementsWithMapper(source, namespace) {
    const trimmed = String(source || "").trim();
    if (!trimmed) {
      return '<mapper namespace="' + namespace + '"></mapper>';
    }
    if (/<\s*(sqlMap|mapper)\b/i.test(trimmed)) {
      return trimmed;
    }
    return '<mapper namespace="' + namespace + '">\n' + trimmed + "\n</mapper>";
  }

  function resolveBindingName(rawName, fieldNameMap) {
    const trimmed = String(rawName || "").trim();
    if (!trimmed) {
      return "";
    }

    if (fieldNameMap && fieldNameMap[trimmed]) {
      return fieldNameMap[trimmed];
    }
    if (fieldNameMap && fieldNameMap[trimmed.toUpperCase()]) {
      return fieldNameMap[trimmed.toUpperCase()];
    }

    if (/^[A-Z][A-Z0-9_]*$/.test(trimmed) || trimmed.indexOf("_") >= 0) {
      return toCamelCase(trimmed);
    }

    return trimmed;
  }

  // MyBatis OGNL: test='prop != "Y"' (바깥 홑따옴표, 문자열은 쌍따옴표)
  function wrapIfTestExpression(expression) {
    return "<if test='" + expression + "'>";
  }

  function quoteOgnlLiteral(value) {
    if (value == null || value === "") {
      return '""';
    }
    if (/^-?\d+(\.\d+)?$/.test(String(value))) {
      return String(value);
    }
    if (/^(true|false|null)$/i.test(String(value))) {
      return String(value).toLowerCase();
    }
    return '"' + String(value).replace(/"/g, '\\"') + '"';
  }

  function normalizeIfTestAttributes(source, warnings) {
    return source.replace(/<if\s+test\s*=\s*(['"])([\s\S]*?)\1\s*>/gi, function (_full, quote, rawInner) {
      let inner = String(rawInner || "").replace(/\s+/g, " ").trim();
      inner = inner.replace(/\s*!=\s*!=\s*/g, " != ");

      const notEqualMatch = inner.match(/^([A-Za-z_][\w.]*)\s*!=\s*["']([^"']*)["']\s*$/);
      if (notEqualMatch) {
        return wrapIfTestExpression(notEqualMatch[1] + ' != "' + notEqualMatch[2] + '"');
      }

      const equalMatch = inner.match(/^([A-Za-z_][\w.]*)\s*==\s*["']([^"']*)["']\s*$/);
      if (equalMatch) {
        return wrapIfTestExpression(equalMatch[1] + ' == "' + equalMatch[2] + '"');
      }

      if (quote === '"') {
        if (warnings) {
          warnings.push("if test 큰따옴표 속성을 홑따옴표 형식으로 교정했습니다: " + inner);
        }
        return wrapIfTestExpression(inner);
      }

      return wrapIfTestExpression(inner);
    });
  }

  function buildCompareExpression(property, attrs, fieldNameMap) {
    if (attrs.compareProperty) {
      return resolveBindingName(attrs.compareProperty, fieldNameMap);
    }
    return quoteOgnlLiteral(attrs.compareValue);
  }

  function buildIfTest(tagName, attrs, fieldNameMap) {
    const property = resolveBindingName(attrs.property, fieldNameMap);

    if (tagName === "isParameterPresent") {
      return "_parameter != null";
    }
    if (tagName === "isNotParameterPresent") {
      return "_parameter == null";
    }

    if (!property) {
      return "";
    }

    switch (tagName) {
      case "isNotNull":
        return property + " != null";
      case "isNull":
        return property + " == null";
      case "isNotEmpty":
        return property + " != null and " + property + ' != ""';
      case "isEmpty":
        return property + " == null or " + property + ' == ""';
      case "isEqual":
        return property + " == " + buildCompareExpression(property, attrs, fieldNameMap);
      case "isNotEqual":
        return property + " != " + buildCompareExpression(property, attrs, fieldNameMap);
      case "isGreaterThan":
        return property + " > " + buildCompareExpression(property, attrs, fieldNameMap);
      case "isGreaterEqual":
        return property + " >= " + buildCompareExpression(property, attrs, fieldNameMap);
      case "isLessThan":
        return property + " < " + buildCompareExpression(property, attrs, fieldNameMap);
      case "isLessEqual":
        return property + " <= " + buildCompareExpression(property, attrs, fieldNameMap);
      default:
        return "";
    }
  }

  function convertRootMapper(source, namespace) {
    const sqlMapMatch = source.match(/<sqlMap\b([^>]*)>/i);
    if (sqlMapMatch) {
      return source
        .replace(/<sqlMap\b([^>]*)>/i, '<mapper namespace="' + namespace + '">')
        .replace(/<\/sqlMap>/gi, "</mapper>");
    }

    const mapperMatch = source.match(/<mapper\b([^>]*)>/i);
    if (mapperMatch) {
      return source.replace(/<mapper\b([^>]*)>/i, '<mapper namespace="' + namespace + '">');
    }

    return source;
  }

  function replaceCommonAttributes(source) {
    return source
      .replace(/\bparameterCalss\s*=/gi, "parameterType=")
      .replace(/\bparameterClass\s*=/gi, "parameterType=")
      .replace(/\bresultClass\s*=/gi, "resultType=")
      .replace(/\s+remapResults\s*=\s*(["']).*?\1/gi, "");
  }

  function convertIterateBodyReferences(source) {
    return source
      .replace(/\$([A-Za-z_][\w]*)\[\]\.([A-Za-z_][\w]*)\$/g, function (_match, _listName, fieldName) {
        return "${item." + fieldName + "}";
      })
      .replace(/#([A-Za-z_][\w]*)\[\]\.([A-Za-z_][\w]*)\#/g, function (_match, _listName, fieldName) {
        return "#{" + "item." + fieldName + "}";
      });
  }

  function replacePlaceholders(source, fieldNameMap) {
    return source
      .replace(/#\[\]#/g, "#{item}")
      .replace(/\$\[\]\$/g, "${item}")
      .replace(/#(?!\{)([^#\r\n]+?)#/g, function (_match, inner) {
        return "#{" + resolveBindingName(inner, fieldNameMap) + "}";
      })
      .replace(/\$(?!\{)([^$\r\n]+?)\$/g, function (_match, inner) {
        return "${" + resolveBindingName(inner, fieldNameMap) + "}";
      });
  }

  function buildFieldNameMap(fields) {
    const fieldMap = {};

    (fields || []).forEach(function (field) {
      const variants = unique([
        field.rawName,
        String(field.rawName || "").toUpperCase(),
        field.javaName,
        toPascalCase(field.rawName),
      ].filter(Boolean));

      variants.forEach(function (variant) {
        fieldMap[String(variant).trim()] = field.javaName;
      });
    });

    return fieldMap;
  }

  function applyFieldNameMappings(source, fieldNameMap) {
    let converted = source;

    converted = converted.replace(/([#$])\{([^}]+)\}/g, function (_full, prefix, inner) {
      const trimmed = inner.trim();
      const mapped = fieldNameMap[trimmed] || trimmed;
      return prefix + "{" + mapped + "}";
    });

    converted = converted.replace(
      /\b(property|compareProperty)\s*=\s*(['"])(.*?)\2/gi,
      function (_full, attrName, quote, value) {
        const mapped = fieldNameMap[String(value).trim()] || value;
        return attrName + "=" + quote + mapped + quote;
      }
    );

    return converted;
  }

  function convertIterate(source, fieldNameMap) {
    return source
      .replace(/<\s*iterate\b([^>]*)>/gi, function (_full, attrText) {
        const attrs = parseAttributes(attrText || "");
        const collection = resolveBindingName(attrs.property || "items", fieldNameMap);
        const open = attrs.open ? ' open="' + attrs.open + '"' : "";
        const close = attrs.close ? ' close="' + attrs.close + '"' : "";
        const separator = attrs.conjunction ? ' separator="' + attrs.conjunction + '"' : "";
        return '<foreach collection="' + collection + '" item="item"' + open + close + separator + ">";
      })
      .replace(/<\/iterate>/gi, "</foreach>");
  }

  function convertDynamicTags(source, warnings, fieldNameMap) {
    let converted = source.replace(
      /<\s*(dynamic|isNotNull|isNull|isNotEmpty|isEmpty|isEqual|isNotEqual|isGreaterThan|isGreaterEqual|isLessThan|isLessEqual|isParameterPresent|isNotParameterPresent)\b([^>]*)>/gi,
      function (fullMatch, tagName, attrText) {
        const attrs = parseAttributes(attrText || "");

        if (tagName === "dynamic") {
          const prefix = attrs.prepend ? ' prefix="' + attrs.prepend + '"' : "";
          const prefixOverrides = attrs.prepend ? ' prefixOverrides="AND |OR "' : "";
          return "<trim" + prefix + prefixOverrides + ">";
        }

        const test = buildIfTest(tagName, attrs, fieldNameMap);
        if (!test) {
          warnings.push(tagName + " 태그의 조건식을 완전히 해석하지 못했습니다.");
          return fullMatch;
        }

        const prepend = attrs.prepend ? attrs.prepend + " " : "";
        return wrapIfTestExpression(test) + prepend;
      }
    );

    converted = converted.replace(/<\/dynamic>/gi, "</trim>");
    converted = converted.replace(
      /<\/(isNotNull|isNull|isNotEmpty|isEmpty|isEqual|isNotEqual|isGreaterThan|isGreaterEqual|isLessThan|isLessEqual|isParameterPresent|isNotParameterPresent)>/gi,
      "</if>"
    );

    return converted;
  }

  function updateStatementAttributes(source, options, warnings) {
    const statementRegex = /<\s*(select|insert|update|delete)\b([^>]*)>/gi;
    const statements = source.match(statementRegex) || [];

    return source.replace(statementRegex, function (_full, tagName, attrText) {
      const attrs = parseAttributes(attrText || "");
      const originalId = attrs.id || "";

      if (statements.length === 1) {
        attrs.id = options.methodName || originalId || options.defaultStatementId;
      } else {
        attrs.id = originalId || options.defaultStatementId;
        if (options.methodName && originalId && originalId !== options.methodName) {
          warnings.push("SQL에 여러 statement가 있어 id는 원본 값을 유지했습니다.");
        }
      }

      attrs.parameterType = options.requestDtoFqn;

      if (tagName.toLowerCase() === "select") {
        attrs.resultType = options.responseDtoFqn;
      } else {
        delete attrs.resultType;
      }

      return "<" + tagName + buildAttributeString(attrs, [
        "id",
        "parameterType",
        "resultType",
        "fetchSize",
        "statementType",
        "useCache",
      ]) + ">";
    });
  }

  function findRemainingLegacyTags(source) {
    const tags = [];
    source.replace(/<\s*\/?\s*([A-Za-z][\w.-]*)\b/g, function (_full, tagName) {
      if (/^is[A-Z]/.test(tagName) || tagName === "dynamic" || tagName === "iterate") {
        if (tags.indexOf(tagName) === -1) {
          tags.push(tagName);
        }
      }
      return _full;
    });
    return tags.sort();
  }

  function convertIbatisToMybatis(xmlSource, options, warnings) {
    if (isBlank(xmlSource)) {
      warnings.push("SQL XML이 없어 Mapper.xml은 TODO 템플릿으로 생성했습니다.");
      return buildSkeletonMapperXml(
        options.namespace,
        options.methodName,
        options.action,
        options.responseMode,
        options.requestDtoFqn,
        options.responseDtoFqn
      );
    }

    let converted = wrapStatementsWithMapper(xmlSource, options.namespace);
    converted = ensureXmlDeclaration(converted);
    converted = replaceDoctype(converted);
    converted = convertRootMapper(converted, options.namespace);
    converted = replaceCommonAttributes(converted);
    converted = convertIterateBodyReferences(converted);
    converted = replacePlaceholders(converted, options.fieldNameMap || {});
    converted = applyFieldNameMappings(converted, options.fieldNameMap || {});
    converted = convertIterate(converted, options.fieldNameMap || {});
    converted = convertDynamicTags(converted, warnings, options.fieldNameMap || {});
    converted = normalizeIfTestAttributes(converted, warnings);
    converted = updateStatementAttributes(converted, options, warnings);

    const legacyTags = findRemainingLegacyTags(converted);
    if (legacyTags.length > 0) {
      warnings.push("자동 변환 후에도 남은 레거시 태그: " + legacyTags.join(", "));
    }

    return converted.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }

  function generateController(packages, classNames, methodName, responseMode, endpointPath, featureClassName) {
    const lines = [
      "package " + packages.controller + ";",
      "",
      "import " + packages.dto + "." + classNames.requestDto + ";",
    ];

    if (responseMode === "list" || responseMode === "single") {
      lines.push("import " + packages.dto + "." + classNames.responseDto + ";");
    }

    lines.push(
      "import " + packages.service + "." + classNames.service + ";",
      "import io.swagger.v3.oas.annotations.Operation;",
      "import io.swagger.v3.oas.annotations.tags.Tag;",
      "import lombok.RequiredArgsConstructor;",
      "import org.springframework.http.ResponseEntity;",
      "import org.springframework.web.bind.annotation.PostMapping;",
      "import org.springframework.web.bind.annotation.RequestBody;",
      "import org.springframework.web.bind.annotation.RequestMapping;",
      "import org.springframework.web.bind.annotation.RestController;"
    );

    if (responseMode === "list") {
      lines.push("import java.util.List;");
    }

    const responseType = responseMode === "void"
      ? "Void"
      : getReturnType(responseMode, classNames);

    const methodPath = "/" + toKebabCase(methodName);
    const serviceField = toCamelCase(classNames.service);
    const operationSummary = featureClassName + " " + methodName + " API";
    const requestMapping = endpointPath || "/api/" + toKebabCase(featureClassName);

    const methodBody = [];
    if (responseMode === "void") {
      methodBody.push("        " + serviceField + "." + methodName + "(requestDto);");
      methodBody.push("        return ResponseEntity.ok().build();");
    } else {
      methodBody.push("        return ResponseEntity.ok(" + serviceField + "." + methodName + "(requestDto));");
    }

    lines.push(
      "",
      '@Tag(name = "' + featureClassName + '")',
      "@RestController",
      "@RequiredArgsConstructor",
      '@RequestMapping("' + requestMapping + '")',
      "public class " + classNames.controller + " {",
      "    private final " + classNames.service + " " + serviceField + ";",
      "",
      '    @Operation(summary = "' + operationSummary + '")',
      '    @PostMapping("' + methodPath + '")',
      "    public ResponseEntity<" + responseType + "> " + methodName + "(@RequestBody " + classNames.requestDto + " requestDto) {",
      methodBody.join("\n"),
      "    }",
      "}",
      ""
    );

    return lines.join("\n");
  }

  function buildExampleValue(javaType, fieldName) {
    if (javaType === "Integer" || javaType === "Long" || javaType === "Double") {
      return 0;
    }
    if (javaType === "BigDecimal") {
      return 0;
    }
    if (javaType === "Boolean") {
      return false;
    }
    if (javaType === "LocalDate") {
      return "2026-01-01";
    }
    if (javaType === "LocalDateTime") {
      return "2026-01-01T00:00:00";
    }
    if (/yn$/i.test(fieldName)) {
      return "Y";
    }
    return "";
  }

  function buildExampleJson(fields) {
    const payload = {};
    fields.forEach(function (field) {
      payload[field.javaName] = buildExampleValue(field.javaType, field.javaName);
    });
    return JSON.stringify(payload, null, 2) + "\n";
  }

  function generateSummary(featureClassName, packages, methodName, action, responseMode, requestFields, responseFields, sqlMeta, legacyAnalysis) {
    return [
      "도메인명: " + featureClassName,
      "메서드명: " + methodName,
      "액션: " + action,
      "응답형태: " + responseMode,
      "요청 필드 수: " + requestFields.length,
      "응답 필드 수: " + responseFields.length,
      "SQL statement 수: " + ((sqlMeta && sqlMeta.statements && sqlMeta.statements.length) || 0),
      "AS-IS requestData.getField 수: " + ((legacyAnalysis && legacyAnalysis.requestFields.length) || 0),
      "AS-IS paramMap.put 수: " + ((legacyAnalysis && legacyAnalysis.paramKeys.length) || 0),
      "AS-IS XML 호출 수: " + ((legacyAnalysis && legacyAnalysis.xmlCalls.length) || 0),
      "DTO 패키지: " + packages.dto,
      "Service 패키지: " + packages.service,
      "Mapper 패키지: " + packages.mapper,
      "Controller 패키지: " + packages.controller,
      "",
    ].join("\n");
  }

  function generateBackendArtifacts(input, options) {
    const warnings = [];
    const mergedOptions = {
      basePackage: "com.example.demo",
      featureName: "",
      endpointPath: "",
      action: "auto",
      responseMode: "auto",
      dateType: "String",
      requestFieldsText: "",
      responseFieldsText: "",
      serviceMethodText: "",
      sqlXmlText: "",
    };

    Object.keys(options || {}).forEach(function (key) {
      mergedOptions[key] = options[key];
    });

    if (input && typeof input === "object") {
      Object.keys(input).forEach(function (key) {
        mergedOptions[key] = input[key];
      });
    }

    const parsedRequestFields = parseFieldText(mergedOptions.requestFieldsText, mergedOptions, warnings, "요청값");
    const responseFields = parseFieldText(mergedOptions.responseFieldsText, mergedOptions, warnings, "응답값");
    const serviceMeta = parseServiceMethod(mergedOptions.serviceMethodText);
    const legacyAnalysis = analyzeLegacyServiceSource(mergedOptions.serviceMethodText);
    const legacyRequestFields = buildFieldsFromLegacyKeys(legacyAnalysis.requestFields, mergedOptions);
    const requestFields = mergeFieldLists(parsedRequestFields, legacyRequestFields);
    const queryFields = mergeFieldLists(
      requestFields,
      buildFieldsFromLegacyKeys(legacyAnalysis.paramKeys, mergedOptions)
    );
    const sqlMeta = parseSqlMeta(mergedOptions.sqlXmlText);

    const featureClassName = guessFeatureName(mergedOptions.featureName, serviceMeta, sqlMeta);
    const classNames = buildClassNames(featureClassName);
    const packages = buildPackages(mergedOptions.basePackage, featureClassName);
    const action = inferAction(serviceMeta.methodName, sqlMeta, mergedOptions.action);
    const responseMode = inferResponseMode(action, mergedOptions.responseMode, serviceMeta);
    const methodName = guessMethodName(serviceMeta, sqlMeta, featureClassName, action, responseMode);
    const fieldNameMap = buildFieldNameMap(requestFields);

    const mapperXml = convertIbatisToMybatis(mergedOptions.sqlXmlText, {
      namespace: packages.mapper + "." + classNames.mapper,
      methodName: methodName,
      defaultStatementId: methodName,
      action: action,
      responseMode: responseMode,
      fieldNameMap: fieldNameMap,
      requestDtoFqn: packages.dto + "." + classNames.requestDto,
      responseDtoFqn: packages.dto + "." + classNames.responseDto,
    }, warnings);

    if (requestFields.length === 0) {
      warnings.push("요청 DTO 필드가 비어 있습니다. 필요하면 수동으로 추가해 주세요.");
    }
    if (responseMode !== "int" && responseMode !== "void" && responseFields.length === 0) {
      warnings.push("응답 DTO 필드가 비어 있습니다. 필요하면 수동으로 추가해 주세요.");
    }
    if (!serviceMeta.methodName) {
      warnings.push("서비스 메서드를 완전히 해석하지 못해 메서드명을 자동 생성했습니다.");
    }
    if (legacyAnalysis.hasLegacySource && legacyAnalysis.xmlCalls.length > 1) {
      warnings.push("AS-IS 서비스에서 XML을 여러 번 호출합니다. ServiceImpl은 '서비스변환초안' 탭을 기준으로 수동 마무리하세요.");
    }
    if (legacyAnalysis.recordSets.length > 1) {
      warnings.push("복수 RecordSet 응답 구조입니다. ResponseDto 래퍼 구조는 수동 보강이 필요합니다.");
    }

    return {
      meta: {
        featureClassName: featureClassName,
        methodName: methodName,
        action: action,
        responseMode: responseMode,
      },
      warnings: unique(warnings),
      artifacts: {
        summary: generateSummary(featureClassName, packages, methodName, action, responseMode, requestFields, responseFields, sqlMeta, legacyAnalysis),
        requestDto: generateDto(packages.dto, classNames.requestDto, requestFields),
        queryDto: generateDto(packages.dto, classNames.queryDto, queryFields),
        responseDto: generateDto(packages.dto, classNames.responseDto, responseFields),
        service: generateService(packages, classNames, methodName, responseMode),
        serviceImpl: generateServiceImpl(packages, classNames, methodName, responseMode, action),
        serviceSourceAnalysis: generateLegacyServiceAnalysis(legacyAnalysis),
        legacyServiceDraft: generateLegacyServiceDraft(packages, classNames, methodName, legacyAnalysis, responseMode),
        mapper: generateMapper(packages, classNames, methodName, responseMode, legacyAnalysis),
        mapperXml: mapperXml,
        controller: generateController(packages, classNames, methodName, responseMode, mergedOptions.endpointPath, featureClassName),
        requestExampleJson: buildExampleJson(requestFields),
      },
    };
  }

  return {
    GENERATOR_VERSION: GENERATOR_VERSION,
    generateBackendArtifacts: generateBackendArtifacts,
  };
});
