import { useEffect, useRef } from "react";
import { LogEntry } from "../types";

interface LogViewerProps {
  logs: LogEntry[];
  status: "idle" | "running" | "success" | "error" | "cancelled";
}

export function LogViewer({ logs, status }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  if (status === "idle" && logs.length === 0) {
    return (
      <div className="log-viewer empty">
        <p>Output will appear here when transcription starts.</p>
      </div>
    );
  }

  return (
    <div className="log-viewer">
      <div className="log-header">
        <span className="log-title">Output Log</span>
        <span className={`log-status status-${status}`}>
          {status === "running" && "● Running"}
          {status === "success" && "✓ Complete"}
          {status === "error" && "✗ Error"}
          {status === "cancelled" && "⊘ Cancelled"}
        </span>
      </div>
      <div className="log-content" ref={containerRef}>
        {logs.map((entry, i) => (
          <div key={i} className={`log-line log-${entry.stream}`}>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}