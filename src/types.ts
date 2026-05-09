export type Device = "cuda" | "cpu";
export type ComputeType = "int8" | "float16" | "float32";
export type OutputFormat = "json" | "srt" | "vtt" | "tsv" | "txt" | "all";
export type Task = "transcribe" | "translate";

export interface WhisperConfig {
  audio: string;
  model: string;
  model_dir: string | null;
  device: Device;
  compute_type: ComputeType;
  output_dir: string | null;
  output_format: OutputFormat;
  language: string | null;
  task: Task;
  batch_size: number;
  chunk_size: number;
  align: boolean;
  diarize: boolean;
  min_speakers: number | null;
  max_speakers: number | null;
  highlight_words: boolean;
  max_line_width: number | null;
  max_line_count: number | null;
  interpolate_nans: boolean;
  return_char_alignments: boolean;
}

export const DEFAULT_CONFIG: WhisperConfig = {
  audio: "",
  model: "large-v3",
  model_dir: null,
  device: "cpu",
  compute_type: "float16",
  output_dir: null,
  output_format: "all",
  language: null,
  task: "transcribe",
  batch_size: 8,
  chunk_size: 30,
  align: false,
  diarize: false,
  min_speakers: null,
  max_speakers: null,
  highlight_words: false,
  max_line_width: null,
  max_line_count: null,
  interpolate_nans: false,
  return_char_alignments: false,
};

export const MODELS = [
  "tiny", "tiny.en", "base", "base.en", "small", "small.en",
  "medium", "medium.en", "large-v1", "large-v2", "large-v3",
] as const;

export const LANGUAGES = [
  { code: null, label: "Auto-detect" },
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "ru", label: "Russian" },
  { code: "ko", label: "Korean" },
  { code: "fr", label: "French" },
  { code: "ja", label: "Japanese" },
  { code: "pt", label: "Portuguese" },
  { code: "tr", label: "Turkish" },
  { code: "pl", label: "Polish" },
  { code: "ca", label: "Catalan" },
  { code: "nl", label: "Dutch" },
  { code: "ar", label: "Arabic" },
  { code: "sv", label: "Swedish" },
  { code: "it", label: "Italian" },
  { code: "id", label: "Indonesian" },
  { code: "hi", label: "Hindi" },
  { code: "fi", label: "Finnish" },
  { code: "vi", label: "Vietnamese" },
  { code: "he", label: "Hebrew" },
  { code: "uk", label: "Ukrainian" },
  { code: "el", label: "Greek" },
  { code: "ms", label: "Malay" },
  { code: "cs", label: "Czech" },
  { code: "ro", label: "Romanian" },
  { code: "da", label: "Danish" },
  { code: "hu", label: "Hungarian" },
  { code: "ta", label: "Tamil" },
  { code: "no", label: "Norwegian" },
  { code: "th", label: "Thai" },
  { code: "ur", label: "Urdu" },
  { code: "hr", label: "Croatian" },
  { code: "bg", label: "Bulgarian" },
  { code: "lt", label: "Lithuanian" },
  { code: "la", label: "Latin" },
  { code: "mi", label: "Maori" },
  { code: "ml", label: "Malayalam" },
  { code: "cy", label: "Welsh" },
  { code: "sk", label: "Slovak" },
  { code: "te", label: "Telugu" },
  { code: "fa", label: "Persian" },
  { code: "lv", label: "Latvian" },
  { code: "bn", label: "Bengali" },
  { code: "sr", label: "Serbian" },
  { code: "az", label: "Azerbaijani" },
  { code: "sl", label: "Slovenian" },
  { code: "kn", label: "Kannada" },
  { code: "et", label: "Estonian" },
  { code: "mk", label: "Macedonian" },
  { code: "br", label: "Breton" },
  { code: "eu", label: "Basque" },
  { code: "is", label: "Icelandic" },
  { code: "hy", label: "Armenian" },
  { code: "ne", label: "Nepali" },
  { code: "mn", label: "Mongolian" },
  { code: "bs", label: "Bosnian" },
  { code: "kk", label: "Kazakh" },
  { code: "sq", label: "Albanian" },
  { code: "sw", label: "Swahili" },
  { code: "gl", label: "Galician" },
  { code: "mr", label: "Marathi" },
  { code: "pa", label: "Punjabi" },
  { code: "si", label: "Sinhala" },
  { code: "km", label: "Khmer" },
  { code: "sn", label: "Shona" },
  { code: "yo", label: "Yoruba" },
  { code: "so", label: "Somali" },
  { code: "af", label: "Afrikaans" },
  { code: "oc", label: "Occitan" },
  { code: "ka", label: "Georgian" },
  { code: "be", label: "Belarusian" },
  { code: "tg", label: "Tajik" },
  { code: "sd", label: "Sindhi" },
  { code: "gu", label: "Gujarati" },
  { code: "am", label: "Amharic" },
  { code: "yi", label: "Yiddish" },
  { code: "lo", label: "Lao" },
  { code: "uz", label: "Uzbek" },
  { code: "fo", label: "Faroese" },
  { code: "ht", label: "Haitian Creole" },
  { code: "ps", label: "Pashto" },
  { code: "tk", label: "Turkmen" },
  { code: "nn", label: "Nynorsk" },
  { code: "mt", label: "Maltese" },
  { code: "sa", label: "Sanskrit" },
  { code: "lb", label: "Luxembourgish" },
  { code: "my", label: "Myanmar" },
  { code: "bo", label: "Tibetan" },
  { code: "tl", label: "Tagalog" },
  { code: "mg", label: "Malagasy" },
  { code: "as", label: "Assamese" },
  { code: "tt", label: "Tatar" },
  { code: "haw", label: "Hawaiian" },
  { code: "ln", label: "Lingala" },
  { code: "ha", label: "Hausa" },
  { code: "ba", label: "Bashkir" },
  { code: "jw", label: "Javanese" },
  { code: "su", label: "Sundanese" },
] as const;

export interface WhisperCheckResult {
  available: boolean;
  path: string | null;
  python_path: string | null;
  fallback_available: boolean;
  error: string | null;
}

export interface PythonCheckResult {
  found: boolean;
  path: string | null;
  version: string | null;
}

export type TranscriptionStatus = "idle" | "running" | "success" | "error" | "cancelled";

export interface LogEntry {
  stream: "stdout" | "stderr";
  text: string;
  timestamp: number;
}