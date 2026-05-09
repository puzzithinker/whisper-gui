import { useState, useEffect, useCallback } from "react";
import { load } from "@tauri-apps/plugin-store";
import { WhisperConfig, DEFAULT_CONFIG } from "../types";

const STORE_KEY = "whisper-config";

export function useSettings() {
  const [config, setConfig] = useState<WhisperConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const store = await load(STORE_KEY, { autoSave: true, defaults: {} });
        const saved = await store.get<WhisperConfig>("config");
        if (saved) {
          setConfig({ ...DEFAULT_CONFIG, ...saved, audio: "" });
        }
      } catch {
        // Store file doesn't exist yet — use defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const save = useCallback(async (updated: WhisperConfig) => {
    setConfig(updated);
    try {
      const store = await load(STORE_KEY, { autoSave: true, defaults: {} });
      await store.set("config", { ...updated, audio: "" });
    } catch {
      // Silently fail — settings are best-effort persistence
    }
  }, []);

  const updateConfig = useCallback(
    (partial: Partial<WhisperConfig>) => {
      const updated = { ...config, ...partial };
      save(updated);
    },
    [config, save]
  );

  return { config, updateConfig, loaded };
}