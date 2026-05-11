mod commands;
mod types;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::check_whisperx,
            commands::check_python,
            commands::check_ffmpeg,
            commands::convert_to_audio,
            commands::get_default_device,
            commands::build_whisperx_args
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}