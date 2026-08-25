import { describe, it, expect } from "vitest";
import {
  GIT_SCENARIOS,
  GIT_SCENARIO_CATEGORIES,
  filterGitScenarios,
} from "../src/tools/dev/gitCommandUtils";

describe("Git Command Generator Utilities", () => {
  it("provides comprehensive Git scenario categories", () => {
    expect(GIT_SCENARIO_CATEGORIES.length).toBeGreaterThan(4);
    expect(GIT_SCENARIOS.length).toBeGreaterThan(10);
  });

  it("builds commit command with custom message accurately", () => {
    const commitScenario = GIT_SCENARIOS.find((s) => s.id === "commit_basic");
    expect(commitScenario).toBeDefined();

    const cmd = commitScenario?.buildCommand({ message: "feat: add payment gateway" });
    expect(cmd).toBe('git add . && git commit -m "feat: add payment gateway"');
  });

  it("filters scenarios by category and keyword correctly", () => {
    const undoList = filterGitScenarios("undo", "");
    expect(undoList.every((s) => s.category === "undo")).toBe(true);

    const logSearch = filterGitScenarios("all", "graph");
    expect(logSearch.some((s) => s.id === "log_pretty_graph")).toBe(true);
  });
});
