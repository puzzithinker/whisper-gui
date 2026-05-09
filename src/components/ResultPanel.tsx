import { TranscriptionStatus } from "../types";

interface ResultPanelProps {
  status: TranscriptionStatus;
  logs: { text: string; stream: "stdout" | "stderr" }[];
  outputDir: string | null;
}

export function ResultPanel({ status, logs, outputDir }: ResultPanelProps) {
  if (status !== "success") return null;

  const outputLine = [...logs].reverse().find((l) => l.text.includes("Saved") || l.text.includes("output"));
  const detectedDir = outputDir || (outputLine ? extractPath(outputLine.text) : null);

  return (
    <div className="result-panel">
      <h3>Transcription Complete</h3>
      {detectedDir && (
        <div className="result-path">
          <span>Output saved to:</span>
          <code>{detectedDir}</code>
        </div>
      )}
      <div className="result-hint">
        Check the output directory for transcription files.
      </div>
    </div>
  );
}

function extractPath(text: string): string | null {
  const match = text.match(/["']?(\/[^"'\s]+)["']?/);
  return match ? match[1] : null;
}