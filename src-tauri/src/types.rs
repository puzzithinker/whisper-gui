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
