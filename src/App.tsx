import React, { useState, useEffect, Suspense } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { getToolById, TOOLS } from "./registry";
import { Menu, X, Loader2, Compass } from "lucide-react";
import { DynamicIcon } from "./components/DynamicIcon";
import { useTheme } from "./hooks/useTheme";

export function App() {
  const [currentToolId, setCurrentToolId] = useState<string | null>(() => {
    const hash = window.location.hash.replace("#/", "").replace("#", "");
    return hash && getToolById(hash) ? hash : null;
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const { themeMode, isDark, cycleThemeMode } = useTheme();

  // Sync URL hash with current tool
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "").replace("#", "");
      if (!hash) {
        setCurrentToolId(null);
      } else {
        const found = getToolById(hash);
        setCurrentToolId(found ? found.id : null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSelectTool = (id: string | null) => {
    setCurrentToolId(id);
    if (id) {
      window.location.hash = `#/${id}`;
    } else {
      window.location.hash = "#/";
    }
    setMobileOpen(false);
  };

  const selectedTool = currentToolId ? getToolById(currentToolId) : null;
  const ToolComponent = selectedTool?.component;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar
          currentToolId={currentToolId}
          onSelectTool={handleSelectTool}
          themeMode={themeMode}
          isDark={isDark}
          onCycleTheme={cycleThemeMode}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-4/5 max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl">
            <Sidebar
              currentToolId={currentToolId}
              onSelectTool={handleSelectTool}
              themeMode={themeMode}
              isDark={isDark}
              onCycleTheme={cycleThemeMode}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <button
                onClick={() => handleSelectTool(null)}
                className="flex items-center gap-1.5 font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>工具箱</span>
              </button>

              {selectedTool && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">/</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <DynamicIcon name={selectedTool.iconName} className="w-4 h-4 text-indigo-500" />
                    <span>{selectedTool.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Tool Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {ToolComponent ? (
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs">加载工具模块中...</span>
                </div>
              }
            >
              <ToolComponent />
            </Suspense>
          ) : (
            <Dashboard onSelectTool={handleSelectTool} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
