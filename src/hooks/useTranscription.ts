import { Command, Child } from "@tauri-apps/plugin-shell";
import { WhisperConfig, LogEntry, TranscriptionStatus } from "../types";

interface TranscriptionState {
  status: TranscriptionStatus;
  logs: LogEntry[];
  child: Child | null;
}

export function useTranscription() {
  const [state, setState] = React.useState<TranscriptionState>({
    status: "idle",
    logs: [],
    child: null,
  });

  const start = useCallback(async (config: WhisperConfig) => {
    const args = configToArgs(config);

    setState((prev) => ({
      ...prev,
      status: "running",
      logs: [],
      child: null,
    }));

    try {
      const command = Command.create("whisperx", args);

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

function configToArgs(config: WhisperConfig): string[] {
  const args: string[] = [];

  args.push(config.audio);
  args.push("--model", config.model);

  if (config.model_dir) args.push("--model_dir", config.model_dir);
  args.push("--device", config.device);
  args.push("--compute_type", config.compute_type);
  if (config.output_dir) args.push("--output_dir", config.output_dir);
  args.push("--output_format", config.output_format);
  if (config.language) args.push("--language", config.language);
  if (config.task === "translate") args.push("--task", "translate");
  if (config.batch_size !== 8) args.push("--batch_size", String(config.batch_size));
  if (config.chunk_size !== 30) args.push("--chunk_size", String(config.chunk_size));
  if (config.align) args.push("--align");
  if (config.diarize) args.push("--diarize");
  if (config.min_speakers !== null) args.push("--min_speakers", String(config.min_speakers));
  if (config.max_speakers !== null) args.push("--max_speakers", String(config.max_speakers));
  if (config.highlight_words) args.push("--highlight_words");
  if (config.max_line_width !== null) args.push("--max_line_width", String(config.max_line_width));
  if (config.max_line_count !== null) args.push("--max_line_count", String(config.max_line_count));
  if (config.interpolate_nans) args.push("--interpolate_nans");
  if (config.return_char_alignments) args.push("--return_char_alignments");

  return args;
}

import React, { useCallback } from "react";