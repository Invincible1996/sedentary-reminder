#![allow(unexpected_cfgs)]

use std::sync::Mutex;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Emitter, Manager, WindowEvent,
};

struct TrayMenuState {
    info_item: MenuItem<tauri::Wry>,
    toggle_pause_item: MenuItem<tauri::Wry>,
}

#[derive(Default)]
struct MacosPresentationState {
    previous_options: Mutex<Option<usize>>,
}

#[tauri::command]
fn set_macos_kiosk_mode(
    state: tauri::State<'_, MacosPresentationState>,
    enabled: bool,
) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::base::id;
        use objc::{msg_send, sel, sel_impl};

        let mut previous_options = state
            .previous_options
            .lock()
            .map_err(|_| "failed to lock macOS presentation state".to_string())?;

        unsafe {
            let app: id = msg_send![objc::class!(NSApplication), sharedApplication];

            if enabled {
                let previous =
                    *previous_options.get_or_insert_with(|| msg_send![app, presentationOptions]);
                // Hide the Dock is required by AppKit when process switching is disabled.
                let kiosk_options = previous | (1 << 1) | (1 << 5) | (1 << 8);
                let _: () = msg_send![app, setPresentationOptions: kiosk_options];
                let _: () = msg_send![app, activateIgnoringOtherApps: true];
            } else if let Some(previous) = previous_options.take() {
                let _: () = msg_send![app, setPresentationOptions: previous];
            }
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = (state, enabled);
    }

    Ok(())
}

#[tauri::command]
fn update_tray_status(
    state: tauri::State<'_, TrayMenuState>,
    next_break_text: String,
    is_paused: bool,
) -> Result<(), String> {
    let _ = state.info_item.set_text(&next_break_text);
    let text = if is_paused { "恢复提醒" } else { "暂停提醒" };
    let _ = state.toggle_pause_item.set_text(text);
    Ok(())
}

#[tauri::command]
fn setup_overlay_window(
    app: tauri::AppHandle,
    label: String,
    is_fullscreen: bool,
    monitor_pos: Option<(i32, i32)>,
    monitor_size: Option<(u32, u32)>,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&label) {
        if is_fullscreen {
            if let (Some(pos), Some(size)) = (monitor_pos, monitor_size) {
                let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition::new(pos.0, pos.1)));
                let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize::new(size.0, size.1)));
            } else if let Ok(Some(monitor)) = window.current_monitor() {
                let _ = window.set_position(tauri::Position::Physical(*monitor.position()));
                let _ = window.set_size(tauri::Size::Physical(*monitor.size()));
            }
        }

        #[cfg(target_os = "macos")]
        {
            use cocoa::appkit::NSWindowCollectionBehavior;
            use cocoa::base::id;
            use objc::{msg_send, sel, sel_impl};

            if let Ok(ns_win) = window.ns_window() {
                let ns_win = ns_win as id;
                unsafe {
                    // Set collection behavior to:
                    // NSWindowCollectionBehaviorCanJoinAllSpaces | NSWindowCollectionBehaviorStationary | NSWindowCollectionBehaviorFullScreenAuxiliary
                    let behavior = NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
                        | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
                        | NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary;
                    
                    let _: () = msg_send![ns_win, setCollectionBehavior: behavior];
                    
                    // Set window level to NSScreenSaverWindowLevel (value 2000)
                    let _: () = msg_send![ns_win, setLevel: 2000_isize];

                    // Make transparent and clear background to avoid white corners
                    let _: () = msg_send![ns_win, setOpaque: false];
                    let clear: id = msg_send![objc::class!(NSColor), clearColor];
                    let _: () = msg_send![ns_win, setBackgroundColor: clear];
                }
            }
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .on_window_event(|window, event| {
            // 关闭主窗口时隐藏到托盘,保证提醒在后台继续运行
            if let WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap_or_default();
                api.prevent_close();
            }
        })
        .setup(|app| {
            let info_item = MenuItem::with_id(app, "info", "下次休息 大约 -- 分钟后", false, None::<&str>)?;
            let sep1 = PredefinedMenuItem::separator(app)?;
            let skip_item = MenuItem::with_id(app, "skip", "跳到下一次", true, None::<&str>)?;
            let toggle_pause_item = MenuItem::with_id(app, "toggle_pause", "暂停提醒", true, None::<&str>)?;
            let reset_item = MenuItem::with_id(app, "reset", "重置提醒", true, None::<&str>)?;
            let sep2 = PredefinedMenuItem::separator(app)?;
            let show_item = MenuItem::with_id(app, "show", "打开主界面", true, None::<&str>)?;
            let sep3 = PredefinedMenuItem::separator(app)?;
            let quit_item = MenuItem::with_id(app, "quit", "退出 sedentary-reminder", true, None::<&str>)?;

            let menu = Menu::with_items(
                app,
                &[
                    &info_item,
                    &sep1,
                    &skip_item,
                    &toggle_pause_item,
                    &reset_item,
                    &sep2,
                    &show_item,
                    &sep3,
                    &quit_item,
                ],
            )?;

            // Store references in Tauri's state manager
            app.manage(TrayMenuState {
                info_item: info_item.clone(),
                toggle_pause_item: toggle_pause_item.clone(),
            });
            app.manage(MacosPresentationState::default());

            TrayIconBuilder::with_id("main-tray")
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("久坐提醒")
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "skip" => {
                        let _ = app.emit("menu-skip", ());
                    }
                    "toggle_pause" => {
                        let _ = app.emit("menu-toggle-pause", ());
                    }
                    "reset" => {
                        let _ = app.emit("menu-reset", ());
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            update_tray_status,
            setup_overlay_window,
            set_macos_kiosk_mode,
            is_any_app_fullscreen
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn is_any_app_fullscreen() -> bool {
    #[cfg(target_os = "macos")]
    {
        use cocoa::base::id;
        use objc::{msg_send, sel, sel_impl};

        unsafe {
            let shared_app: id = msg_send![objc::class!(NSApplication), sharedApplication];
            let options: usize = msg_send![shared_app, currentSystemPresentationOptions];
            
            // NSApplicationPresentationFullScreen = 1 << 10 (1024)
            // NSApplicationPresentationAutoHideMenuBar = 1 << 2 (4)
            // NSApplicationPresentationHideMenuBar = 1 << 3 (8)
            let is_fullscreen = (options & 1024) != 0;
            let is_menu_hidden = (options & 4) != 0 || (options & 8) != 0;
            
            is_fullscreen || is_menu_hidden
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        false
    }
}
