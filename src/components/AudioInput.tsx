import { useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";

interface AudioInputProps {
  value: string;
  onChange: (path: string) => void;
  disabled: boolean;
}

const AUDIO_EXTENSIONS = ["mp3", "wav", "flac", "m4a", "ogg", "wma", "aac", "opus", "webm"];

export function AudioInput({ value, onChange, disabled }: AudioInputProps) {
  const handleBrowse = useCallback(async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Audio files", extensions: AUDIO_EXTENSIONS }],
    });
    if (selected && typeof selected === "string") {
      onChange(selected);
    }
  }, [onChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        onChange(file.name);
      }
    },
    [onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="audio-input">
      <label className="section-label">Audio File</label>
      <div
        className={`audio-drop-zone ${value ? "has-file" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Path to audio file..."
          disabled={disabled}
          className="audio-path-input"
        />
        <button
          type="button"
          onClick={handleBrowse}
          disabled={disabled}
          className="btn-browse"
        >
          Browse
        </button>
      </div>
    </div>
  );
}