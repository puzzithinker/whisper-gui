use tauri_plugin_shell::ShellExt;
use which::which;

use crate::types::{DefaultDevice, WhisperCheckResult, WhisperConfig};

#[tauri::command]
pub async fn check_whisperx() -> WhisperCheckResult {
    match which("whisperx") {
        Ok(path) => WhisperCheckResult {
            available: true,
            path: Some(path.to_string_lossy().to_string()),
            error: None,
        },
        Err(_) => WhisperCheckResult {
            available: false,
            path: None,
            error: Some(
                "whisperx not found. Install it with: pip install whisperx".to_string(),
            ),
        },
    }
}

#[tauri::command]
pub async fn get_default_device(app: tauri::AppHandle) -> DefaultDevice {
    match app
        .shell()
        .command("nvidia-smi")
        .args(["--version"])
        .output()
        .await
    {
        Ok(output) if output.status.success() => DefaultDevice::Cuda,
        _ => DefaultDevice::Cpu,
    }
}

#[tauri::command]
pub fn build_whisperx_args(config: WhisperConfig) -> Vec<String> {
    config.to_args()
}