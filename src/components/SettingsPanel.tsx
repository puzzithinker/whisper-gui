import { WhisperConfig, MODELS, LANGUAGES, Device, ComputeType, OutputFormat, Task } from "../types";
import { open } from "@tauri-apps/plugin-dialog";

interface SettingsPanelProps {
  config: WhisperConfig;
  updateConfig: (partial: Partial<WhisperConfig>) => void;
  disabled: boolean;
}

export function SettingsPanel({ config, updateConfig, disabled }: SettingsPanelProps) {
  return (
    <div className="settings-panel">
      <Section title="Model">
        <SelectField
          label="Model"
          value={config.model}
          options={MODELS.map((m) => ({ value: m, label: m }))}
          onChange={(v) => updateConfig({ model: v })}
          disabled={disabled}
        />
        <SelectField
          label="Device"
          value={config.device}
          options={[
            { value: "cuda", label: "CUDA (GPU)" },
            { value: "cpu", label: "CPU" },
          ]}
          onChange={(v) => updateConfig({ device: v as Device })}
          disabled={disabled}
        />
        <SelectField
          label="Compute Type"
          value={config.compute_type}
          options={[
            { value: "int8", label: "int8 (fast, less accurate)" },
            { value: "float16", label: "float16 (balanced)" },
            { value: "float32", label: "float32 (slow, most accurate)" },
          ]}
          onChange={(v) => updateConfig({ compute_type: v as ComputeType })}
          disabled={disabled}
        />
      </Section>

      <Section title="Language & Task">
        <SelectField
          label="Language"
          value={config.language || ""}
          options={LANGUAGES.map((l) => ({ value: l.code || "", label: l.label }))}
          onChange={(v) => updateConfig({ language: v || null })}
          disabled={disabled}
        />
        <SelectField
          label="Task"
          value={config.task}
          options={[
            { value: "transcribe", label: "Transcribe" },
            { value: "translate", label: "Translate to English" },
          ]}
          onChange={(v) => updateConfig({ task: v as Task })}
          disabled={disabled}
        />
      </Section>

      <Section title="Processing">
        <NumberField
          label="Batch Size"
          value={config.batch_size}
          min={1}
          max={64}
          onChange={(v) => updateConfig({ batch_size: v })}
          disabled={disabled}
        />
        <NumberField
          label="Chunk Size (seconds)"
          value={config.chunk_size}
          min={5}
          max={120}
          onChange={(v) => updateConfig({ chunk_size: v })}
          disabled={disabled}
        />
      </Section>

      <Section title="Alignment & Diarization">
        <CheckboxField
          label="Force Alignment"
          checked={config.align}
          onChange={(v) => updateConfig({ align: v })}
          disabled={disabled}
        />
        <CheckboxField
          label="Speaker Diarization"
          checked={config.diarize}
          onChange={(v) => updateConfig({ diarize: v })}
          disabled={disabled}
        />
        {config.diarize && (
          <div className="sub-options">
            <NumberField
              label="Min Speakers"
              value={config.min_speakers || 0}
              min={0}
              max={50}
              onChange={(v) => updateConfig({ min_speakers: v > 0 ? v : null })}
              disabled={disabled}
              placeholder="Auto"
            />
            <NumberField
              label="Max Speakers"
              value={config.max_speakers || 0}
              min={0}
              max={50}
              onChange={(v) => updateConfig({ max_speakers: v > 0 ? v : null })}
              disabled={disabled}
              placeholder="Auto"
            />
          </div>
        )}
        <CheckboxField
          label="Highlight Words"
          checked={config.highlight_words}
          onChange={(v) => updateConfig({ highlight_words: v })}
          disabled={disabled}
        />
        <CheckboxField
          label="Interpolate NaN Timestamps"
          checked={config.interpolate_nans}
          onChange={(v) => updateConfig({ interpolate_nans: v })}
          disabled={disabled}
        />
        <CheckboxField
          label="Return Character Alignments"
          checked={config.return_char_alignments}
          onChange={(v) => updateConfig({ return_char_alignments: v })}
          disabled={disabled}
        />
      </Section>

      <Section title="Output">
        <OutputDirField
          value={config.output_dir || ""}
          onChange={(v) => updateConfig({ output_dir: v || null })}
          disabled={disabled}
        />
        <SelectField
          label="Format"
          value={config.output_format}
          options={[
            { value: "all", label: "All formats" },
            { value: "json", label: "JSON" },
            { value: "srt", label: "SRT" },
            { value: "vtt", label: "VTT" },
            { value: "tsv", label: "TSV" },
            { value: "txt", label: "TXT" },
          ]}
          onChange={(v) => updateConfig({ output_format: v as OutputFormat })}
          disabled={disabled}
        />
        <NumberField
          label="Max Line Width"
          value={config.max_line_width || 0}
          min={0}
          max={500}
          onChange={(v) => updateConfig({ max_line_width: v > 0 ? v : null })}
          disabled={disabled}
          placeholder="Auto"
        />
        <NumberField
          label="Max Line Count"
          value={config.max_line_count || 0}
          min={0}
          max={100}
          onChange={(v) => updateConfig({ max_line_count: v > 0 ? v : null })}
          disabled={disabled}
          placeholder="Auto"
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="settings-section">
      <legend>{title}</legend>
      <div className="settings-grid">{children}</div>
    </fieldset>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  disabled: boolean;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="number"
        value={value || ""}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(v);
        }}
        disabled={disabled}
      />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="field checkbox-field">
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        {label}
      </label>
    </div>
  );
}

function OutputDirField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const handleBrowse = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected && typeof selected === "string") {
      onChange(selected);
    }
  };

  return (
    <div className="field path-field">
      <label>Output Directory</label>
      <div className="path-input-row">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Same as audio file"
          disabled={disabled}
        />
        <button type="button" onClick={handleBrowse} disabled={disabled} className="btn-browse">
          Browse
        </button>
      </div>
    </div>
  );
}