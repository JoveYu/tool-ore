export interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  data?: string;
  auth?: { username?: string; password?: string };
}

export type TargetLanguage =
  | "js_fetch"
  | "js_axios"
  | "python_requests"
  | "python_httpx"
  | "go_http"
  | "java_httpclient"
  | "php_curl"
  | "rust_reqwest"
  | "dart_http";

/**
 * 词法解析 cURL 命令行参数
 */
function tokenizeCurlCommand(command: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escapeNext = false;

  // 清洗反斜杠换行符
  const cleanCmd = command.replace(/\\\r?\n/g, " ");

  for (let i = 0; i < cleanCmd.length; i++) {
    const char = cleanCmd[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === "\\" && !inSingleQuote) {
      escapeNext = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * 解析 cURL 命令结构
 */
export function parseCurl(command: string): ParsedCurl {
  const clean = command.trim();
  if (!clean) {
    return { url: "", method: "GET", headers: {} };
  }

  const tokens = tokenizeCurlCommand(clean);
  let url = "";
  let method = "";
  const headers: Record<string, string> = {};
  const dataParts: string[] = [];
  let auth: { username?: string; password?: string } | undefined;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.toLowerCase() === "curl") {
      continue;
    }

    // 匹配请求方法 -X / --request
    if (token === "-X" || token === "--request") {
      if (i + 1 < tokens.length) {
        method = tokens[++i].toUpperCase();
      }
      continue;
    }

    // 匹配请求头 -H / --header
    if (token === "-H" || token === "--header") {
      if (i + 1 < tokens.length) {
        const headerStr = tokens[++i];
        const colonIdx = headerStr.indexOf(":");
        if (colonIdx > -1) {
          const k = headerStr.slice(0, colonIdx).trim();
          const v = headerStr.slice(colonIdx + 1).trim();
          headers[k] = v;
        }
      }
      continue;
    }

    // 匹配数据体 -d / --data / --data-raw / --data-urlencode / --json
    if (
      token === "-d" ||
      token === "--data" ||
      token === "--data-raw" ||
      token === "--data-urlencode" ||
      token === "--json"
    ) {
      if (token === "--json") {
        headers["Content-Type"] = "application/json";
        headers["Accept"] = "application/json";
      }
      if (i + 1 < tokens.length) {
        dataParts.push(tokens[++i]);
      }
      continue;
    }

    // 匹配用户认证 -u / --user
    if (token === "-u" || token === "--user") {
      if (i + 1 < tokens.length) {
        const authStr = tokens[++i];
        const [u, p] = authStr.split(":");
        auth = { username: u, password: p || "" };
      }
      continue;
    }

    // 匹配 URL（若尚未赋值且看起来像 URL 路径）
    if (!url && !token.startsWith("-")) {
      url = token;
    }
  }

  // 默认请求方法判断
  if (!method) {
    method = dataParts.length > 0 ? "POST" : "GET";
  }

  const data = dataParts.length > 0 ? dataParts.join("&") : undefined;

  return {
    url,
    method,
    headers,
    data,
    auth,
  };
}

/**
 * 将解析出的 cURL 对象转换为指定编程语言代码
 */
export function generateCodeFromCurl(parsed: ParsedCurl, lang: TargetLanguage): string {
  const { url, method, headers, data, auth } = parsed;
  if (!url) return "// 请输入有效的 cURL 命令";

  const isJsonData = (() => {
    if (!data) return false;
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  })();

  switch (lang) {
    case "js_fetch": {
      const options: any = { method };
      if (Object.keys(headers).length > 0) options.headers = headers;
      if (data) options.body = isJsonData ? JSON.parse(data) : data;

      const optsStr =
        method === "GET" && Object.keys(headers).length === 0
          ? ""
          : `, {\n  method: '${method}',\n` +
            (Object.keys(headers).length > 0
              ? `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},\n`
              : "") +
            (data
              ? isJsonData
                ? `  body: JSON.stringify(${JSON.stringify(JSON.parse(data), null, 4).replace(/\n/g, "\n  ")}),\n`
                : `  body: '${data}',\n`
              : "") +
            `}`;

      return `async function sendRequest() {\n  const response = await fetch('${url}'${optsStr});\n  const result = await response.json();\n  console.log(result);\n}\n\nsendRequest();`;
    }

    case "js_axios": {
      const headersObj = Object.keys(headers).length > 0 ? headers : undefined;
      const dataObj = data ? (isJsonData ? JSON.parse(data) : data) : undefined;

      return `import axios from 'axios';\n\nasync function sendRequest() {\n  const response = await axios({\n    method: '${method.toLowerCase()}',\n    url: '${url}',\n` +
        (headersObj ? `    headers: ${JSON.stringify(headersObj, null, 6).replace(/\n/g, "\n    ")},\n` : "") +
        (dataObj
          ? isJsonData
            ? `    data: ${JSON.stringify(dataObj, null, 6).replace(/\n/g, "\n    ")},\n`
            : `    data: '${dataObj}',\n`
          : "") +
        `  });\n  console.log(response.data);\n}\n\nsendRequest();`;
    }

    case "python_requests": {
      let pyHeaders = "";
      if (Object.keys(headers).length > 0) {
        pyHeaders = `headers = ${JSON.stringify(headers, null, 4)}\n`;
      }

      let pyData = "";
      if (data) {
        if (isJsonData) {
          pyData = `json_data = ${JSON.stringify(JSON.parse(data), null, 4)}\n`;
        } else {
          pyData = `data = '${data}'\n`;
        }
      }

      let reqCall = `response = requests.${method.toLowerCase()}('${url}'`;
      if (pyHeaders) reqCall += `, headers=headers`;
      if (data) reqCall += isJsonData ? `, json=json_data` : `, data=data`;
      reqCall += `)\n`;

      return `import requests\n\n${pyHeaders}${pyData}${reqCall}\nprint(response.status_code)\nprint(response.text)`;
    }

    case "python_httpx": {
      let pyHeaders = "";
      if (Object.keys(headers).length > 0) {
        pyHeaders = `headers = ${JSON.stringify(headers, null, 4)}\n`;
      }

      let pyData = "";
      if (data) {
        if (isJsonData) {
          pyData = `json_data = ${JSON.stringify(JSON.parse(data), null, 4)}\n`;
        } else {
          pyData = `data = '${data}'\n`;
        }
      }

      return `import httpx\nimport asyncio\n\nasync def main():\n  ${pyHeaders ? pyHeaders.replace(/\n/g, "\n  ") : ""}${pyData ? pyData.replace(/\n/g, "\n  ") : ""}  async with httpx.AsyncClient() as client:\n    response = await client.${method.toLowerCase()}('${url}'${pyHeaders ? ", headers=headers" : ""}${data ? (isJsonData ? ", json=json_data" : ", data=data") : ""})\n    print(response.status_code)\n    print(response.text)\n\nasyncio.run(main())`;
    }

    case "go_http": {
      let bodyReader = "nil";
      let bodyInit = "";
      if (data) {
        bodyInit = `\n\tbody := []byte(\`${data}\`)\n`;
        bodyReader = "bytes.NewBuffer(body)";
      }

      let setHeaders = "";
      for (const [k, v] of Object.entries(headers)) {
        setHeaders += `\treq.Header.Set("${k}", "${v}")\n`;
      }

      return `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n` +
        (data ? `\t"bytes"\n` : "") +
        `)\n\nfunc main() {${bodyInit}\treq, err := http.NewRequest("${method}", "${url}", ${bodyReader})\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\n${setHeaders}\tclient := &http.Client{}\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tout, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(out))\n}`;
    }

    case "java_httpclient": {
      let bodyCode = `HttpRequest.BodyPublishers.noBody()`;
      if (data) {
        bodyCode = `HttpRequest.BodyPublishers.ofString("${data.replace(/"/g, '\\"')}")`;
      }

      let headerChain = "";
      for (const [k, v] of Object.entries(headers)) {
        headerChain += `\n            .header("${k}", "${v}")`;
      }

      return `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class App {\n    public static void main(String[] args) throws Exception {\n        HttpClient client = HttpClient.newHttpClient();\n        HttpRequest request = HttpRequest.newBuilder()\n            .uri(URI.create("${url}"))${headerChain}\n            .method("${method}", ${bodyCode})\n            .build();\n\n        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n        System.out.println(response.body());\n    }\n}`;
    }

    case "php_curl": {
      let headerArray = "";
      if (Object.keys(headers).length > 0) {
        const arr = Object.entries(headers).map(([k, v]) => `'${k}: ${v}'`);
        headerArray = `  CURLOPT_HTTPHEADER => [\n    ${arr.join(",\n    ")}\n  ],\n`;
      }

      let postData = "";
      if (data) {
        postData = `  CURLOPT_POSTFIELDS => '${data}',\n`;
      }

      return `<?php\n\n$ch = curl_init();\n\ncurl_setopt_array($ch, [\n  CURLOPT_URL => '${url}',\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_CUSTOMREQUEST => '${method}',\n${headerArray}${postData}]);\n\n$response = curl_exec($ch);\ncurl_close($ch);\n\necho $response;`;
    }

    case "rust_reqwest": {
      let headerCalls = "";
      for (const [k, v] of Object.entries(headers)) {
        headerCalls += `        .header("${k}", "${v}")\n`;
      }

      let bodyCall = "";
      if (data) {
        bodyCall = isJsonData
          ? `        .body(r#"${data}"#)\n`
          : `        .body("${data}")\n`;
      }

      return `use reqwest::Client;\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn std::error::Error>> {\n    let client = Client::new();\n    let response = client\n        .${method.toLowerCase()}("${url}")\n${headerCalls}${bodyCall}        .send()\n        .await?;\n\n    println!("{}", response.text().await?);\n    Ok(())\n}`;
    }

    case "dart_http": {
      let headersStr = "";
      if (Object.keys(headers).length > 0) {
        headersStr = `  final headers = ${JSON.stringify(headers, null, 2)};\n`;
      }

      let bodyStr = "";
      if (data) {
        bodyStr = `  final body = '${data}';\n`;
      }

      return `import 'package:http/http.dart' as http;\n\nvoid main() async {\n  final url = Uri.parse('${url}');\n${headersStr}${bodyStr}  final response = await http.${method.toLowerCase()}(\n    url,\n${headersStr ? "    headers: headers,\n" : ""}${bodyStr ? "    body: body,\n" : ""}  );\n\n  print(response.body);\n}`;
    }

    default:
      return "// 语言类型暂不支持";
  }
}
