import { useState } from "react";
import { WhisperCheckResult, PythonCheckResult } from "../types";

interface InstallDialogProps {
  whisperCheck: WhisperCheckResult;
  pythonCheck: PythonCheckResult | null;
  onRetry: () => void;
}

export function InstallDialog({ whisperCheck, pythonCheck, onRetry }: InstallDialogProps) {
  const [copied, setCopied] = useState(false);

  const installCommand = whisperCheck.python_path
    ? `"${whisperCheck.python_path}" -m pip install whisperx`
    : "pip install whisperx";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="install-dialog">
      <div className="install-card">
        <h2>⚠ whisperX Not Found</h2>

        <p className="install-description">
          This app requires <strong>whisperX</strong> to transcribe audio.
          Please install it before continuing.
        </p>

        {pythonCheck?.found && (
          <div className="python-info">
            <span className="label">Python detected</span>
            <code>{pythonCheck.path}</code>
            {pythonCheck.version && (
              <span className="version">{pythonCheck.version}</span>
            )}
          </div>
        )}

        {!pythonCheck?.found && (
          <div className="python-info warning">
            <span className="label">No Python detected</span>
            <span>Install Python from <a href="https://python.org" target="_blank" rel="noreferrer">python.org</a>, then install whisperX.</span>
          </div>
        )}

        <div className="install-command">
          <code>{installCommand}</code>
          <button onClick={handleCopy} className="btn-copy">
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        {whisperCheck.fallback_available && (
          <div className="fallback-note">
            <strong>Note:</strong> whisperX was found as a Python module
            (<code>{whisperCheck.python_path} -m whisperx</code>)
            but not as a standalone command.
            Transcription will use this Python module directly.
          </div>
        )}

        <button onClick={onRetry} className="btn-retry">
          Re-check Installation
        </button>
      </div>
    </div>
  );
}