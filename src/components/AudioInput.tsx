import { useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { ALL_MEDIA_EXTENSIONS, isVideoFile } from "../types";

interface AudioInputProps {
  value: string;
  onChange: (path: string) => void;
  disabled: boolean;
  converting: boolean;
  ffmpegAvailable: boolean | null;
}

export function AudioInput({ value, onChange, disabled, converting, ffmpegAvailable }: AudioInputProps) {
  const handleBrowse = useCallback(async () => {
    const selected = await open({
      multiple: false,
      filters: [
        { name: "Audio & Video files", extensions: ALL_MEDIA_EXTENSIONS },
        { name: "Audio files", extensions: ["mp3", "wav", "flac", "m4a", "ogg", "wma", "aac", "opus"] },
        { name: "Video files", extensions: ["mp4", "mkv", "avi", "mov", "wmv", "flv", "m4v", "webm"] },
      ],
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

  const isVideo = value ? isVideoFile(value) : false;
  const needsFfmpeg = isVideo && ffmpegAvailable === false;

  return (
    <div className="audio-input">
      <label className="section-label">Audio / Video File</label>
      <div className="audio-drop-zone" onDrop={handleDrop} onDragOver={handleDragOver}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Path to audio or video file (MP4, MKV, etc.)..."
          disabled={disabled || converting}
          className="audio-path-input"
        />
        <button
          type="button"
          onClick={handleBrowse}
          disabled={disabled || converting}
          className="btn-browse"
        >
          Browse
        </button>
      </div>
      {converting && (
        <div className="conversion-progress">
          <span className="conversion-spinner" /> Converting video to audio with ffmpeg...
        </div>
      )}
      {needsFfmpeg && (
        <div className="conversion-warning">
          ⚠ ffmpeg not found — video files require ffmpeg for conversion.
          Install from <a href="https://ffmpeg.org/download.html" target="_blank" rel="noreferrer">ffmpeg.org</a>
        </div>
      )}
      {isVideo && !needsFfmpeg && !converting && ffmpegAvailable && (
        <div className="conversion-note">
          Video file detected — will be converted to WAV before transcription.
        </div>
      )}
    </div>
  );
}