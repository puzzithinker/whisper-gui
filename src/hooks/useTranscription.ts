import { Command, Child } from "@tauri-apps/plugin-shell";
import { useState, useCallback } from "react";
import { WhisperConfig, LogEntry, TranscriptionStatus } from "../types";
import { invoke } from "@tauri-apps/api/core";

interface TranscriptionState {
  status: TranscriptionStatus;
  logs: LogEntry[];
  child: Child | null;
}

interface StartOptions {
  config: WhisperConfig;
  pythonPath?: string | null;
}

export function useTranscription() {
  const [state, setState] = useState<TranscriptionState>({
    status: "idle",
    logs: [],
    child: null,
  });

  const start = useCallback(async ({ config, pythonPath }: StartOptions) => {
    let args: string[];
    try {
      args = await invoke<string[]>("build_whisperx_args", { config });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        logs: [
          { stream: "stderr", text: `Failed to build args: ${err}`, timestamp: Date.now() },
        ],
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "running",
      logs: [],
      child: null,
    }));

    try {
      const command = pythonPath
        ? Command.create(pythonPath, ["-m", "whisperx", ...args])
        : Command.create("whisperx", args);

      command.on("close", (data) => {
        setState((prev) => {
          const isCancelled = prev.status === "cancelled";
          return {
            ...prev,
            status: isCancelled ? "cancelled" : data.code === 0 ? "success" : "error",
            child: null,
          };
        });
      });

      command.on("error", (error) => {
        setState((prev) => ({
          ...prev,
          logs: [
            ...prev.logs,
            { stream: "stderr", text: `Process error: ${error}`, timestamp: Date.now() },
          ],
        }));
      });

      command.stdout.on("data", (line) => {
        setState((prev) => ({
          ...prev,
          logs: [...prev.logs, { stream: "stdout", text: line, timestamp: Date.now() }],
        }));
      });

      command.stderr.on("data", (line) => {
        setState((prev) => ({
          ...prev,
          logs: [...prev.logs, { stream: "stderr", text: line, timestamp: Date.now() }],
        }));
      });

      const child = await command.spawn();

      setState((prev) => ({ ...prev, child }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        logs: [
          ...prev.logs,
          { stream: "stderr", text: `Failed to start: ${err}`, timestamp: Date.now() },
        ],
      }));
    }
  }, []);

  const cancel = useCallback(async () => {
    if (state.child) {
      try {
        await state.child.kill();
        setState((prev) => ({ ...prev, status: "cancelled", child: null }));
      } catch {
        setState((prev) => ({ ...prev, status: "cancelled", child: null }));
      }
    }
  }, [state.child]);

  const reset = useCallback(() => {
    setState({ status: "idle", logs: [], child: null });
  }, []);

  return { ...state, start, cancel, reset };
}