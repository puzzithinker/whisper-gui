use std::process::Command as StdCommand;
use tauri_plugin_shell::ShellExt;
use which::which;

use crate::types::{DefaultDevice, PythonCheckResult, WhisperCheckResult, WhisperConfig};

#[tauri::command]
pub async fn check_whisperx() -> WhisperCheckResult {
    // Try 1: direct whisperx on PATH
    if let Ok(path) = which("whisperx") {
        return WhisperCheckResult {
            available: true,
            path: Some(path.to_string_lossy().to_string()),
            python_path: None,
            fallback_available: false,
            error: None,
        };
    }

    // Try 2: python -m whisperx as fallback
    let python_info = find_python();

    if let Some(ref python_path) = python_info.path {
        if can_run_whisperx_module(python_path) {
            return WhisperCheckResult {
                available: true,
                path: None,
                python_path: Some(python_path.clone()),
                fallback_available: true,
                error: None,
            };
        }
    }

    WhisperCheckResult {
        available: false,
        path: None,
        python_path: python_info.path.clone(),
        fallback_available: false,
        error: Some(format_whisperx_install_hint(&python_info)),
    }
}

#[tauri::command]
pub async fn check_python() -> PythonCheckResult {
    find_python()
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

fn find_python() -> PythonCheckResult {
    for cmd in &["python3", "python"] {
        if let Ok(path) = which(cmd) {
            let version = get_python_version(&path.to_string_lossy());
            return PythonCheckResult {
                found: true,
                path: Some(path.to_string_lossy().to_string()),
                version,
            };
        }
    }
    PythonCheckResult {
        found: false,
        path: None,
        version: None,
    }
}

fn get_python_version(python_path: &str) -> Option<String> {
    StdCommand::new(python_path)
        .args(["--version"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                String::from_utf8(o.stdout).ok().map(|s| s.trim().to_string())
            } else {
                String::from_utf8(o.stderr).ok().map(|s| s.trim().to_string())
            }
        })
}

fn can_run_whisperx_module(python_path: &str) -> bool {
    StdCommand::new(python_path)
        .args(["-m", "whisperx", "--help"])
        .output()
        .ok()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

fn format_whisperx_install_hint(python_info: &PythonCheckResult) -> String {
    match python_info {
        PythonCheckResult {
            found: true,
            path: Some(p),
            version: Some(v),
            ..
        } => {
            format!(
                "whisperx not found. Python detected ({v}) at: {p}\n\
                 Install with: {p} -m pip install whisperx"
            )
        }
        PythonCheckResult {
            found: true,
            path: Some(p),
            ..
        } => {
            format!(
                "whisperx not found. Python detected at: {p}\n\
                 Install with: {p} -m pip install whisperx"
            )
        }
        _ => "whisperx not found and no Python installation detected.\n\
              Install Python from https://python.org, then: pip install whisperx"
            .to_string(),
    }
}