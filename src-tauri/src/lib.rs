mod commands;
mod credentials;
mod error;
mod profiles;
mod s3;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::profile_list,
            commands::profile_save,
            commands::profile_delete,
            commands::profile_test_connection,
            commands::object_list,
            commands::object_head,
            commands::object_download,
            commands::object_upload,
            commands::object_delete,
            commands::object_create_folder,
            commands::preview_prepare,
            commands::b2_default_endpoint,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
