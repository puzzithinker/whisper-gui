import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AudioInput } from "./components/AudioInput";
import { SettingsPanel } from "./components/SettingsPanel";
import { LogViewer } from "./components/LogViewer";
import { ResultPanel } from "./components/ResultPanel";
import { useTranscription } from "./hooks/useTranscription";
import { useSettings } from "./hooks/useSettings";
import { WhisperCheckResult, DEFAULT_CONFIG } from "./types";
import "./App.css";

function App() {
  const { config, updateConfig, loaded } = useSettings();
  const { status, logs, start, cancel, reset } = useTranscription();
  const [whisperAvailable, setWhisperAvailable] = useState<boolean | null>(null);
  const [whisperPath, setWhisperPath] = useState<string | null>(null);

  useEffect(() => {
    invoke<WhisperCheckResult>("check_whisperx").then((result) => {
      setWhisperAvailable(result.available);
      setWhisperPath(result.path);
    });
  }, []);

  if (!loaded) {
    return <div className="app-loading">Loading...</div>;
  }

  const isRunning = status === "running";
  const canStart = config.audio.trim() !== "" && !isRunning && whisperAvailable === true;

  const handleStart = () => {
    start(config);
  };

  const handleCancel = () => {
    cancel();
  };

  const handleReset = () => {
    reset();
    updateConfig({ ...DEFAULT_CONFIG, audio: "" });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>WhisperX GUI</h1>
        <div className="whisper-status">
          {whisperAvailable === null && <span className="checking">Checking whisperx...</span>}
          {whisperAvailable === true && (
            <span className="available">✓ whisperx available{whisperPath ? ` (${whisperPath})` : ""}</span>
          )}
          {whisperAvailable === false && (
            <span className="unavailable">✗ whisperx not found — install with: pip install whisperx</span>
          )}
        </div>
      </header>

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