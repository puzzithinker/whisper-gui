import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AudioInput } from "./components/AudioInput";
import { SettingsPanel } from "./components/SettingsPanel";
import { LogViewer } from "./components/LogViewer";
import { ResultPanel } from "./components/ResultPanel";
import { InstallDialog } from "./components/InstallDialog";
import { useTranscription } from "./hooks/useTranscription";
import { useSettings } from "./hooks/useSettings";
import { WhisperCheckResult, PythonCheckResult, DEFAULT_CONFIG } from "./types";
import "./App.css";

function App() {
  const { config, updateConfig, loaded } = useSettings();
  const { status, logs, start, cancel, reset } = useTranscription();
  const [whisperCheck, setWhisperCheck] = useState<WhisperCheckResult | null>(null);
  const [pythonCheck, setPythonCheck] = useState<PythonCheckResult | null>(null);

  const runChecks = async () => {
    const [wResult, pResult] = await Promise.all([
      invoke<WhisperCheckResult>("check_whisperx"),
      invoke<PythonCheckResult>("check_python"),
    ]);
    setWhisperCheck(wResult);
    setPythonCheck(pResult);
  };

  useEffect(() => { runChecks(); }, []);

  if (!loaded || !whisperCheck) {
    return <div className="app-loading">Loading...</div>;
  }

  const isRunning = status === "running";
  const canStart = config.audio.trim() !== "" && !isRunning && whisperCheck.available;

  const handleStart = () => {
    start({ config, pythonPath: whisperCheck.python_path });
  };

  const handleCancel = () => { cancel(); };

  const handleReset = () => {
    reset();
    updateConfig({ ...DEFAULT_CONFIG, audio: "" });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>WhisperX GUI</h1>
        <div className="whisper-status">
          {whisperCheck.available ? (
            <span className="available">
              ✓ {whisperCheck.path
                ? `whisperx available (${whisperCheck.path})`
                : `whisperx available via ${whisperCheck.python_path} -m whisperx`}
            </span>
          ) : (
            <span className="unavailable">✗ whisperx not found</span>
          )}
        </div>
      </header>

      {!whisperCheck.available && (
        <InstallDialog
          whisperCheck={whisperCheck}
          pythonCheck={pythonCheck}
          onRetry={runChecks}
        />
      )}

      <main className="app-main">
        <AudioInput
          value={config.audio}
          onChange={(path) => updateConfig({ audio: path })}
          disabled={isRunning}
        />

        <SettingsPanel
          config={config}
          updateConfig={updateConfig}
          disabled={isRunning}
        />

        <div className="action-bar">
          {!isRunning ? (
            <button
              className="btn-start"
              onClick={handleStart}
              disabled={!canStart}
            >
              ▶ Transcribe
            </button>
          ) : (
            <button className="btn-cancel" onClick={handleCancel}>
              ■ Cancel
            </button>
          )}
          {status !== "idle" && status !== "running" && (
            <button className="btn-reset" onClick={handleReset}>
              Reset
            </button>
          )}
        </div>

        <LogViewer logs={logs} status={status} />

        <ResultPanel
          status={status}
          logs={logs}
          outputDir={config.output_dir}
        />
      </main>
    </div>
  );
}

export default App;