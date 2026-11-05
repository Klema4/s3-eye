use crate::error::AppError;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub preset: String,
    pub endpoint: String,
    pub region: String,
    pub bucket: String,
    pub access_key_id: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct ProfileStore {
    profiles: Vec<Profile>,
}

fn store_path() -> Result<PathBuf, AppError> {
    let base = dirs::config_dir()
        .ok_or_else(|| AppError::msg("Unable to locate the application configuration folder."))?;
    Ok(base.join("s3-eye").join("profiles.json"))
}

fn load_store() -> Result<ProfileStore, AppError> {
    let path = store_path()?;
    if !path.exists() {
        return Ok(ProfileStore::default());
    }
    let data = fs::read_to_string(&path)?;
    Ok(serde_json::from_str(&data)?)
}

fn save_store(store: &ProfileStore) -> Result<(), AppError> {
    let path = store_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let data = serde_json::to_string_pretty(store)?;
    fs::write(path, data)?;
    Ok(())
}

pub fn list_profiles() -> Result<Vec<Profile>, AppError> {
    Ok(load_store()?.profiles)
}

pub fn get_profile(id: &str) -> Result<Profile, AppError> {
    load_store()?
        .profiles
        .into_iter()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::msg("Connection not found"))
}

pub fn save_profile(profile: Profile) -> Result<Profile, AppError> {
    let mut store = load_store()?;
    if let Some(existing) = store.profiles.iter_mut().find(|p| p.id == profile.id) {
        *existing = profile.clone();
    } else {
        store.profiles.push(profile.clone());
    }
    save_store(&store)?;
    Ok(profile)
}

pub fn delete_profile(id: &str) -> Result<(), AppError> {
    let mut store = load_store()?;
    store.profiles.retain(|p| p.id != id);
    save_store(&store)?;
    Ok(())
}

pub fn b2_endpoint(region: &str) -> String {
    format!("https://s3.{region}.backblazeb2.com")
}
