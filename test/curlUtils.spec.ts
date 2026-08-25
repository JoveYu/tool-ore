import { describe, it, expect } from "vitest";
import { parseCurl, generateCodeFromCurl } from "../src/tools/dev/curlUtils";

describe("cURL Converter Utilities", () => {
  it("parses standard POST curl command with headers and json body", () => {
    const cmd = `curl -X POST "https://api.example.com/v1/users" \\
      -H "Authorization: Bearer token123" \\
      -H "Content-Type: application/json" \\
      -d '{"name": "alice", "age": 25}'`;

    const parsed = parseCurl(cmd);

    expect(parsed.url).toBe("https://api.example.com/v1/users");
    expect(parsed.method).toBe("POST");
    expect(parsed.headers["Authorization"]).toBe("Bearer token123");
    expect(parsed.headers["Content-Type"]).toBe("application/json");
    expect(parsed.data).toContain('"name": "alice"');
  });

  it("generates code across JS Fetch, Python Requests and Go accurately", () => {
    const cmd = `curl https://api.example.com/data -H "X-Key: 123"`;
    const parsed = parseCurl(cmd);

    const fetchCode = generateCodeFromCurl(parsed, "js_fetch");
    expect(fetchCode).toContain("fetch('https://api.example.com/data'");
    expect(fetchCode).toContain('"X-Key": "123"');

    const pyCode = generateCodeFromCurl(parsed, "python_requests");
    expect(pyCode).toContain("requests.get('https://api.example.com/data'");
    expect(pyCode).toContain('"X-Key": "123"');

    const goCode = generateCodeFromCurl(parsed, "go_http");
    expect(goCode).toContain('http.NewRequest("GET", "https://api.example.com/data", nil)');
    expect(goCode).toContain('req.Header.Set("X-Key", "123")');
  });
});
