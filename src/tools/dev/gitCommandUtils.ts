export type GitScenarioCategory = "commit" | "undo" | "branch" | "stash" | "remote" | "log";

export interface GitScenario {
  id: string;
  category: GitScenarioCategory;
  title: string;
  description: string;
  isDangerous?: boolean;
  dangerWarning?: string;
  params: {
    key: string;
    label: string;
    placeholder: string;
    defaultValue: string;
  }[];
  buildCommand: (params: Record<string, string>) => string;
}

export const GIT_SCENARIO_CATEGORIES: { id: GitScenarioCategory; name: string }[] = [
  { id: "commit", name: "提交与暂存" },
  { id: "undo", name: "撤销与回退" },
  { id: "branch", name: "分支与合并" },
  { id: "stash", name: "代码储藏" },
  { id: "remote", name: "远程与推送" },
  { id: "log", name: "日志与排错" },
];

export const GIT_SCENARIOS: GitScenario[] = [
  // 1. 提交与暂存
  {
    id: "commit_basic",
    category: "commit",
    title: "暂存并提交代码",
    description: "将所有已修改和新增的文件加入暂存区，并提交到本地仓库",
    params: [
      { key: "message", label: "提交说明信息", placeholder: "feat: 新增功能描述", defaultValue: "feat: update project features" },
    ],
    buildCommand: (p) => `git add . && git commit -m "${p.message || "update"}"`,
  },
  {
    id: "commit_amend",
    category: "commit",
    title: "修改最近一次提交说明（不新增 Commit）",
    description: "修正上一次提交的 message，或把遗漏的文件补充到上一次提交中",
    params: [
      { key: "message", label: "新的提交说明", placeholder: "修正后的提交信息", defaultValue: "fix: correct previous commit message" },
    ],
    buildCommand: (p) => `git add . && git commit --amend -m "${p.message || "amend previous commit"}"`,
  },
  {
    id: "unstage_all",
    category: "commit",
    title: "将文件从暂存区撤出（保留工作区修改）",
    description: "不小心执行了 git add . 后的反悔操作，代码修改依然完好保留",
    params: [],
    buildCommand: () => `git restore --staged .`,
  },

  // 2. 撤销与回退
  {
    id: "undo_last_commit_soft",
    category: "undo",
    title: "撤销上一次提交（保留全部代码改动）",
    description: "回退一次 commit 操作，代码将回到暂存区/工作区状态，可以重新调整后再提交",
    params: [],
    buildCommand: () => `git reset --soft HEAD~1`,
  },
  {
    id: "discard_all_changes_hard",
    category: "undo",
    title: "彻底丢弃所有本地未提交的修改",
    description: "强力重置工作区和暂存区至上一次提交状态，清空所有未跟踪新增文件",
    isDangerous: true,
    dangerWarning: "此操作具有破坏性，本地所有未保存提交的代码将被彻底抹去，无法找回！",
    params: [],
    buildCommand: () => `git reset --hard HEAD && git clean -fd`,
  },
  {
    id: "revert_specific_commit",
    category: "undo",
    title: "安全反转指定的历史提交",
    description: "生成一个新的反向提交来抵消指定历史提交的内容，适合已推送到公共分支的场景",
    params: [
      { key: "commitHash", label: "目标提交哈希值", placeholder: "例如: a1b2c3d", defaultValue: "HEAD" },
    ],
    buildCommand: (p) => `git revert ${p.commitHash || "HEAD"}`,
  },

  // 3. 分支与合并
  {
    id: "create_and_switch_branch",
    category: "branch",
    title: "新建并切换到新分支",
    description: "基于当前分支创建新特性分支并立即切换进入",
    params: [
      { key: "branchName", label: "新分支名称", placeholder: "例如: feature/login", defaultValue: "feature/new-feature" },
    ],
    buildCommand: (p) => `git checkout -b ${p.branchName || "new-branch"}`,
  },
  {
    id: "delete_local_and_remote_branch",
    category: "branch",
    title: "同时删除本地与远程分支",
    description: "功能开发上线后清理废弃的特性分支",
    params: [
      { key: "branchName", label: "待删除的分支名", placeholder: "例如: feature/login", defaultValue: "feature/old-feature" },
      { key: "remote", label: "远程仓库名称", placeholder: "origin", defaultValue: "origin" },
    ],
    buildCommand: (p) => `git branch -d ${p.branchName} && git push ${p.remote || "origin"} --delete ${p.branchName}`,
  },
  {
    id: "rename_current_branch",
    category: "branch",
    title: "重命名当前分支",
    description: "修改当前所在分支的名字并推送到远程",
    params: [
      { key: "newName", label: "新分支名称", placeholder: "main", defaultValue: "main" },
    ],
    buildCommand: (p) => `git branch -m ${p.newName || "main"}`,
  },
  {
    id: "merge_squash",
    category: "branch",
    title: "压缩合并分支（将多个提交压扁为一个）",
    description: "将特性分支上的十几次零散提交压缩为单一整洁的提交合并到主干",
    params: [
      { key: "targetBranch", label: "待合并的来源分支", placeholder: "feature/login", defaultValue: "feature/login" },
    ],
    buildCommand: (p) => `git merge --squash ${p.targetBranch || "feature-branch"}`,
  },

  // 4. 代码储藏
  {
    id: "stash_with_message",
    category: "stash",
    title: "带备注储藏当前临时工作进度",
    description: "临时切换分支修紧急 Bug 前，将未完成的代码安全存入暂存箱",
    params: [
      { key: "stashName", label: "储藏备注说明", placeholder: "例如: wip_login_form", defaultValue: "wip: halfway through login" },
    ],
    buildCommand: (p) => `git stash push -u -m "${p.stashName || "wip"}"`,
  },
  {
    id: "stash_pop_latest",
    category: "stash",
    title: "恢复最近一次储藏的代码并移出暂存箱",
    description: "切回原分支后还原之前暂存的工作进度",
    params: [],
    buildCommand: () => `git stash pop`,
  },

  // 5. 远程与推送
  {
    id: "force_pull_overwrite_local",
    category: "remote",
    title: "强制拉取远程覆盖本地分支",
    description: "本地代码杂乱且无需保留时，强制同步对齐远程仓库的最新提交",
    isDangerous: true,
    dangerWarning: "本地尚未推送到远程的改动将被强制重置对齐远程！",
    params: [
      { key: "remote", label: "远程名称", placeholder: "origin", defaultValue: "origin" },
      { key: "branch", label: "分支名称", placeholder: "master", defaultValue: "master" },
    ],
    buildCommand: (p) => `git fetch ${p.remote || "origin"} && git reset --hard ${p.remote || "origin"}/${p.branch || "master"}`,
  },
  {
    id: "prune_remote_branches",
    category: "remote",
    title: "清理远程已删除分支的本地残留引用",
    description: "同步远程分支列表，移除在 GitHub/GitLab 上已被同事删除的废弃远端分支缓存",
    params: [
      { key: "remote", label: "远程名称", placeholder: "origin", defaultValue: "origin" },
    ],
    buildCommand: (p) => `git remote prune ${p.remote || "origin"}`,
  },

  // 6. 日志与排错
  {
    id: "log_pretty_graph",
    category: "log",
    title: "美化输出分支拓扑树状图日志",
    description: "以清晰的彩色单行图表形式展示全部分支的合并提交历史",
    params: [],
    buildCommand: () => `git log --graph --oneline --decorate --all`,
  },
  {
    id: "find_commit_by_keyword",
    category: "log",
    title: "按关键词检索提交历史或代码增减",
    description: "检索哪一次 commit 包含了某个特定的函数名或配置项",
    params: [
      { key: "keyword", label: "搜索关键词", placeholder: "例如: calculateTotal", defaultValue: "handleSubmit" },
    ],
    buildCommand: (p) => `git log -S "${p.keyword || "keyword"}" --oneline`,
  },
];

/**
 * 依据分类和搜索词过滤 Git 场景列表
 */
export function filterGitScenarios(
  category: GitScenarioCategory | "all",
  searchQuery: string
): GitScenario[] {
  const clean = searchQuery.trim().toLowerCase();

  return GIT_SCENARIOS.filter((s) => {
    if (category !== "all" && s.category !== category) return false;
    if (!clean) return true;

    return (
      s.title.toLowerCase().includes(clean) ||
      s.description.toLowerCase().includes(clean) ||
      s.buildCommand({}).toLowerCase().includes(clean)
    );
  });
}
