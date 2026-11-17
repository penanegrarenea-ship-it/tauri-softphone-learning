// 一个最小的只读命令，用来学习前端 invoke -> Rust。
#[tauri::command]
fn runtime_info() -> String {
    format!(
        "Rust 通信正常 · {} / {} · SIP 尚未接入",
        std::env::consts::OS,
        std::env::consts::ARCH
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![runtime_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
