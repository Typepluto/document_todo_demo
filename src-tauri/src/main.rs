// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{error::Error, fs::File, path::Path, io::BufReader};
use serde::{Deserialize, Serialize};
use chrono::prelude::*;
use tauri::Manager;


#[derive(Serialize, Deserialize, Default, Debug)]
struct Document {
    document_name: String,
    document_version: String,
    document_status: String,
    start_date: String,
    target_date: String,
}

fn save_Document_to_json_file<P: AsRef<Path>>(path: P, book: &Vec<Document>) -> Result<(), Box<dyn Error>> {
  let file = File::create(path)?; // std::io::Error の可能性
  serde_json::to_writer_pretty(file, book)?; // serde_json::Error の可能性
  Ok(())
}

fn load_Document_from_json_file<P: AsRef<Path>>(path: P) -> Result<Vec<Document>, Box<dyn Error>> {
  let file = File::open(path)?; // std::io::Error の可能性
  let reader = BufReader::new(file); // 読み込み時は明示的にバッファリング
  let book = serde_json::from_reader(reader)?; // serde_json::Error の可能性
  Ok(book)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![load, save])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}


#[tauri::command]
fn load() -> Vec<Document> {
  let now:chrono::NaiveDate = Utc::now().date_naive();
  if let Ok(mut res) = load_Document_from_json_file("./save.json"){
    return res;
  } else{
    return Vec::<Document>::default();
  }
}

#[tauri::command]
fn save(req:Vec<Document>) {
  save_Document_to_json_file("./save.json", &req);
}