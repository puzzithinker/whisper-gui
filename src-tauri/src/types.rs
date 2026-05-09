use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Supported Whisper model sizes
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "kebab-case")]
pub enum WhisperModel {
    Tiny,
    TinyEn,
    Base,
    BaseEn,
    Small,
    SmallEn,
    Medium,
    MediumEn,
    LargeV1,
    LargeV2,
    #[default]
    LargeV3,
}

impl WhisperModel {
    pub fn as_str(&self) -> &'static str {
        match self {
            WhisperModel::Tiny => "tiny",
            WhisperModel::TinyEn => "tiny.en",
            WhisperModel::Base => "base",
            WhisperModel::BaseEn => "base.en",
            WhisperModel::Small => "small",
            WhisperModel::SmallEn => "small.en",
            WhisperModel::Medium => "medium",
            WhisperModel::MediumEn => "medium.en",
            WhisperModel::LargeV1 => "large-v1",
            WhisperModel::LargeV2 => "large-v2",
            WhisperModel::LargeV3 => "large-v3",
        }
    }

    pub fn all() -> Vec<&'static str> {
        vec![
            "tiny",
            "tiny.en",
            "base",
            "base.en",
            "small",
            "small.en",
            "medium",
            "medium.en",
            "large-v1",
            "large-v2",
            "large-v3",
        ]
    }
}

/// Compute device
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "kebab-case")]
pub enum Device {
    Cuda,
    #[default]
    Cpu,
}

impl Device {
    pub fn as_str(&self) -> &'static str {
        match self {
            Device::Cuda => "cuda",
            Device::Cpu => "cpu",
        }
    }
}

/// Compute type for inference
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ComputeType {
    Int8,
    #[serde(rename = "float16")]
    Float16,
    #[serde(rename = "float32")]
    Float32,
}

impl Default for ComputeType {
    fn default() -> Self {
        ComputeType::Float16
    }
}

impl ComputeType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ComputeType::Int8 => "int8",
            ComputeType::Float16 => "float16",
            ComputeType::Float32 => "float32",
        }
    }
}

/// Output format
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "kebab-case")]
pub enum OutputFormat {
    Json,
    Srt,
    Vtt,
    Tsv,
    Txt,
    #[default]
    All,
}

impl OutputFormat {
    pub fn as_str(&self) -> &'static str {
        match self {
            OutputFormat::Json => "json",
            OutputFormat::Srt => "srt",
            OutputFormat::Vtt => "vtt",
            OutputFormat::Tsv => "tsv",
            OutputFormat::Txt => "txt",
            OutputFormat::All => "all",
        }
    }
}

/// Transcription task
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "kebab-case")]
pub enum Task {
    #[default]
    Transcribe,
    Translate,
}

impl Task {
    pub fn as_str(&self) -> &'static str {
        match self {
            Task::Transcribe => "transcribe",
            Task::Translate => "translate",
        }
    }
}

/// Full configuration for a whisperX transcription run
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhisperConfig {
    pub audio: String,
    pub model: WhisperModel,
    #[serde(default)]
    pub model_dir: Option<String>,
    pub device: Device,
    pub compute_type: ComputeType,
    #[serde(default)]
    pub output_dir: Option<String>,
    pub output_format: OutputFormat,
    #[serde(default)]
    pub language: Option<String>,
    pub task: Task,
    #[serde(default = "default_batch_size")]
    pub batch_size: u32,
    #[serde(default = "default_chunk_size")]
    pub chunk_size: u32,
    #[serde(default)]
    pub align: bool,
    #[serde(default)]
    pub diarize: bool,
    #[serde(default)]
    pub min_speakers: Option<u32>,
    #[serde(default)]
    pub max_speakers: Option<u32>,
    #[serde(default)]
    pub highlight_words: bool,
    #[serde(default)]
    pub max_line_width: Option<u32>,
    #[serde(default)]
    pub max_line_count: Option<u32>,
    #[serde(default)]
    pub interpolate_nans: bool,
    #[serde(default)]
    pub return_char_alignments: bool,
}

fn default_batch_size() -> u32 {
    8
}

fn default_chunk_size() -> u32 {
    30
}

/// Convert WhisperConfig to CLI argument vector
impl WhisperConfig {
    pub fn to_args(&self) -> Vec<String> {
        let mut args = Vec::new();

        args.push(self.audio.clone());
        args.push("--model".into());
        args.push(self.model.as_str().into());

        if let Some(ref dir) = self.model_dir {
            args.push("--model_dir".into());
            args.push(dir.clone());
        }

        args.push("--device".into());
        args.push(self.device.as_str().into());
        args.push("--compute_type".into());
        args.push(self.compute_type.as_str().into());

        if let Some(ref dir) = self.output_dir {
            args.push("--output_dir".into());
            args.push(dir.clone());
        }

        args.push("--output_format".into());
        args.push(self.output_format.as_str().into());

        if let Some(ref lang) = self.language {
            args.push("--language".into());
            args.push(lang.clone());
        }

        if matches!(self.task, Task::Translate) {
            args.push("--task".into());
            args.push(self.task.as_str().into());
        }

        if self.batch_size != 8 {
            args.push("--batch_size".into());
            args.push(self.batch_size.to_string());
        }

        if self.chunk_size != 30 {
            args.push("--chunk_size".into());
            args.push(self.chunk_size.to_string());
        }

        if self.align {
            args.push("--align".into());
        }

        if self.diarize {
            args.push("--diarize".into());
        }

        if let Some(min) = self.min_speakers {
            args.push("--min_speakers".into());
            args.push(min.to_string());
        }
        if let Some(max) = self.max_speakers {
            args.push("--max_speakers".into());
            args.push(max.to_string());
        }

        if self.highlight_words {
            args.push("--highlight_words".into());
        }

        if let Some(w) = self.max_line_width {
            args.push("--max_line_width".into());
            args.push(w.to_string());
        }
        if let Some(c) = self.max_line_count {
            args.push("--max_line_count".into());
            args.push(c.to_string());
        }

        if self.interpolate_nans {
            args.push("--interpolate_nans".into());
        }

        if self.return_char_alignments {
            args.push("--return_char_alignments".into());
        }

        args
    }
}

/// Result of checking whether whisperX is available
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhisperCheckResult {
    pub available: bool,
    pub path: Option<String>,
    pub error: Option<String>,
}

/// Result of getting the default device
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DefaultDevice {
    Cuda,
    Cpu,
}

impl DefaultDevice {
    pub fn as_str(&self) -> &'static str {
        match self {
            DefaultDevice::Cuda => "cuda",
            DefaultDevice::Cpu => "cpu",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn minimal_config() -> WhisperConfig {
        WhisperConfig {
            audio: "/path/to/audio.mp3".to_string(),
            model: WhisperModel::LargeV3,
            model_dir: None,
            device: Device::Cpu,
            compute_type: ComputeType::Float16,
            output_dir: None,
            output_format: OutputFormat::All,
            language: None,
            task: Task::Transcribe,
            batch_size: 8,
            chunk_size: 30,
            align: false,
            diarize: false,
            min_speakers: None,
            max_speakers: None,
            highlight_words: false,
            max_line_width: None,
            max_line_count: None,
            interpolate_nans: false,
            return_char_alignments: false,
        }
    }

    #[test]
    fn minimal_args_contain_required_flags() {
        let config = minimal_config();
        let args = config.to_args();

        assert_eq!(args[0], "/path/to/audio.mp3");
        assert!(args.contains(&"--model".to_string()));
        assert!(args.contains(&"large-v3".to_string()));
        assert!(args.contains(&"--device".to_string()));
        assert!(args.contains(&"cpu".to_string()));
        assert!(args.contains(&"--compute_type".to_string()));
        assert!(args.contains(&"float16".to_string()));
        assert!(args.contains(&"--output_format".to_string()));
        assert!(args.contains(&"all".to_string()));
    }

    #[test]
    fn default_transcribe_task_is_omitted() {
        let config = minimal_config();
        let args = config.to_args();
        assert!(!args.contains(&"--task".to_string()));
    }

    #[test]
    fn translate_task_is_included() {
        let mut config = minimal_config();
        config.task = Task::Translate;
        let args = config.to_args();
        let task_idx = args.iter().position(|a| a == "--task").unwrap();
        assert_eq!(args[task_idx + 1], "translate");
    }

    #[test]
    fn default_batch_and_chunk_omitted() {
        let config = minimal_config();
        let args = config.to_args();
        assert!(!args.contains(&"--batch_size".to_string()));
        assert!(!args.contains(&"--chunk_size".to_string()));
    }

    #[test]
    fn non_default_batch_and_chunk_included() {
        let mut config = minimal_config();
        config.batch_size = 16;
        config.chunk_size = 10;
        let args = config.to_args();
        assert!(args.contains(&"--batch_size".to_string()));
        assert!(args.contains(&"16".to_string()));
        assert!(args.contains(&"--chunk_size".to_string()));
        assert!(args.contains(&"10".to_string()));
    }

    #[test]
    fn none_fields_are_omitted() {
        let config = minimal_config();
        let args = config.to_args();
        assert!(!args.contains(&"--model_dir".to_string()));
        assert!(!args.contains(&"--output_dir".to_string()));
        assert!(!args.contains(&"--language".to_string()));
        assert!(!args.contains(&"--min_speakers".to_string()));
        assert!(!args.contains(&"--max_speakers".to_string()));
        assert!(!args.contains(&"--max_line_width".to_string()));
        assert!(!args.contains(&"--max_line_count".to_string()));
    }

    #[test]
    fn some_fields_are_included() {
        let mut config = minimal_config();
        config.model_dir = Some("/models".to_string());
        config.output_dir = Some("/output".to_string());
        config.language = Some("en".to_string());
        config.min_speakers = Some(2);
        config.max_speakers = Some(5);
        config.max_line_width = Some(80);
        config.max_line_count = Some(2);
        let args = config.to_args();

        assert!(args.contains(&"--model_dir".to_string()));
        assert!(args.contains(&"/models".to_string()));
        assert!(args.contains(&"--output_dir".to_string()));
        assert!(args.contains(&"/output".to_string()));
        assert!(args.contains(&"--language".to_string()));
        assert!(args.contains(&"en".to_string()));
        assert!(args.contains(&"--min_speakers".to_string()));
        assert!(args.contains(&"2".to_string()));
        assert!(args.contains(&"--max_speakers".to_string()));
        assert!(args.contains(&"5".to_string()));
        assert!(args.contains(&"--max_line_width".to_string()));
        assert!(args.contains(&"80".to_string()));
        assert!(args.contains(&"--max_line_count".to_string()));
        assert!(args.contains(&"2".to_string()));
    }

    #[test]
    fn boolean_flags_default_off() {
        let config = minimal_config();
        let args = config.to_args();
        assert!(!args.contains(&"--align".to_string()));
        assert!(!args.contains(&"--diarize".to_string()));
        assert!(!args.contains(&"--highlight_words".to_string()));
        assert!(!args.contains(&"--interpolate_nans".to_string()));
        assert!(!args.contains(&"--return_char_alignments".to_string()));
    }

    #[test]
    fn boolean_flags_when_enabled() {
        let mut config = minimal_config();
        config.align = true;
        config.diarize = true;
        config.highlight_words = true;
        config.interpolate_nans = true;
        config.return_char_alignments = true;
        let args = config.to_args();
        assert!(args.contains(&"--align".to_string()));
        assert!(args.contains(&"--diarize".to_string()));
        assert!(args.contains(&"--highlight_words".to_string()));
        assert!(args.contains(&"--interpolate_nans".to_string()));
        assert!(args.contains(&"--return_char_alignments".to_string()));
    }

    #[test]
    fn all_model_variants_produce_correct_strings() {
        let models = vec![
            (WhisperModel::Tiny, "tiny"),
            (WhisperModel::TinyEn, "tiny.en"),
            (WhisperModel::Base, "base"),
            (WhisperModel::BaseEn, "base.en"),
            (WhisperModel::Small, "small"),
            (WhisperModel::SmallEn, "small.en"),
            (WhisperModel::Medium, "medium"),
            (WhisperModel::MediumEn, "medium.en"),
            (WhisperModel::LargeV1, "large-v1"),
            (WhisperModel::LargeV2, "large-v2"),
            (WhisperModel::LargeV3, "large-v3"),
        ];
        for (model, expected) in models {
            let mut config = minimal_config();
            config.model = model;
            let args = config.to_args();
            let model_idx = args.iter().position(|a| a == "--model").unwrap();
            assert_eq!(args[model_idx + 1], expected);
        }
    }

    #[test]
    fn serde_deserializes_from_json() {
        let json = r#"{
            "audio": "/test/audio.wav",
            "model": "small",
            "device": "cuda",
            "compute_type": "int8",
            "output_format": "srt",
            "task": "translate",
            "batch_size": 16,
            "chunk_size": 15,
            "align": true,
            "diarize": true,
            "min_speakers": 2,
            "max_speakers": 4,
            "highlight_words": true,
            "interpolate_nans": true,
            "return_char_alignments": true
        }"#;
        let config: WhisperConfig = serde_json::from_str(json).unwrap();
        assert_eq!(config.audio, "/test/audio.wav");
        assert!(matches!(config.model, WhisperModel::Small));
        assert!(matches!(config.device, Device::Cuda));
        assert!(matches!(config.compute_type, ComputeType::Int8));
        assert!(matches!(config.output_format, OutputFormat::Srt));
        assert!(matches!(config.task, Task::Translate));
        assert_eq!(config.batch_size, 16);
        assert!(config.align);
        assert!(config.diarize);
        assert_eq!(config.min_speakers, Some(2));
        assert_eq!(config.max_speakers, Some(4));
    }

    #[test]
    fn serde_roundtrip_preserves_args() {
        let mut config = minimal_config();
        config.language = Some("ja".to_string());
        config.diarize = true;
        config.max_speakers = Some(3);
        let args_before = config.to_args();

        let json = serde_json::to_string(&config).unwrap();
        let deserialized: WhisperConfig = serde_json::from_str(&json).unwrap();
        let args_after = deserialized.to_args();

        assert_eq!(args_before, args_after);
    }

    #[test]
    fn full_config_produces_all_args() {
        let mut config = minimal_config();
        config.model = WhisperModel::Medium;
        config.model_dir = Some("/custom/models".to_string());
        config.device = Device::Cuda;
        config.compute_type = ComputeType::Int8;
        config.output_dir = Some("/output/dir".to_string());
        config.output_format = OutputFormat::Srt;
        config.language = Some("ja".to_string());
        config.task = Task::Translate;
        config.batch_size = 16;
        config.chunk_size = 15;
        config.align = true;
        config.diarize = true;
        config.min_speakers = Some(2);
        config.max_speakers = Some(5);
        config.highlight_words = true;
        config.max_line_width = Some(80);
        config.max_line_count = Some(2);
        config.interpolate_nans = true;
        config.return_char_alignments = true;

        let args = config.to_args();

        let s = |v: &str| v.to_string();
        assert!(args.contains(&s("/path/to/audio.mp3")));
        assert!(args.contains(&s("--model")));
        assert!(args.contains(&s("medium")));
        assert!(args.contains(&s("--model_dir")));
        assert!(args.contains(&s("/custom/models")));
        assert!(args.contains(&s("--device")));
        assert!(args.contains(&s("cuda")));
        assert!(args.contains(&s("--compute_type")));
        assert!(args.contains(&s("int8")));
        assert!(args.contains(&s("--output_dir")));
        assert!(args.contains(&s("/output/dir")));
        assert!(args.contains(&s("--output_format")));
        assert!(args.contains(&s("srt")));
        assert!(args.contains(&s("--language")));
        assert!(args.contains(&s("ja")));
        assert!(args.contains(&s("--task")));
        assert!(args.contains(&s("translate")));
        assert!(args.contains(&s("--batch_size")));
        assert!(args.contains(&s("16")));
        assert!(args.contains(&s("--chunk_size")));
        assert!(args.contains(&s("15")));
        assert!(args.contains(&s("--align")));
        assert!(args.contains(&s("--diarize")));
        assert!(args.contains(&s("--min_speakers")));
        assert!(args.contains(&s("2")));
        assert!(args.contains(&s("--max_speakers")));
        assert!(args.contains(&s("5")));
        assert!(args.contains(&s("--highlight_words")));
        assert!(args.contains(&s("--max_line_width")));
        assert!(args.contains(&s("80")));
        assert!(args.contains(&s("--max_line_count")));
        assert!(args.contains(&s("2")));
        assert!(args.contains(&s("--interpolate_nans")));
        assert!(args.contains(&s("--return_char_alignments")));
    }
}
