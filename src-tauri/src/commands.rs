use crate::credentials;
use crate::error::AppError;
use crate::profiles::{self, Profile};
use crate::s3::{self, PreviewResult};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileInput {
    pub id: Option<String>,
    pub name: String,
    pub preset: String,
    pub endpoint: String,
    pub region: String,
    pub bucket: String,
    pub access_key_id: String,
    pub secret_access_key: Option<String>,
}

#[tauri::command]
pub fn profile_list() -> Result<Vec<Profile>, String> {
    profiles::list_profiles().map_err(Into::into)
}

#[tauri::command]
pub fn profile_save(input: ProfileInput) -> Result<Profile, String> {
    let id = input
        .id
        .clone()
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    if let Some(secret) = &input.secret_access_key {
        if !secret.is_empty() {
            credentials::set_secret(&id, secret).map_err(|e: AppError| e.to_string())?;
        }
    } else if input.id.is_none() {
        return Err("A secret access key is required for new connections.".into());
    }

    let profile = Profile {
        id,
        name: input.name,
        preset: input.preset,
        endpoint: input.endpoint,
        region: input.region,
        bucket: input.bucket,
        access_key_id: input.access_key_id,
    };

    profiles::save_profile(profile).map_err(Into::into)
}

#[tauri::command]
pub fn profile_delete(profile_id: String) -> Result<(), String> {
    credentials::delete_secret(&profile_id).ok();
    profiles::delete_profile(&profile_id).map_err(Into::into)
}

#[tauri::command]
pub async fn profile_test_connection(profile_id: String) -> Result<(), String> {
    s3::test_connection(&profile_id)
        .await
        .map_err(|e: AppError| e.to_string())
}

#[tauri::command]
pub async fn object_list(
    profile_id: String,
    prefix: String,
    continuation_token: Option<String>,
) -> Result<s3::ListPage, String> {
    let ctx = s3::from_profile(&profile_id)
        .await
        .map_err(|e: AppError| e.to_string())?;
    s3::list_objects(&ctx, &prefix, continuation_token)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn object_head(profile_id: String, key: String) -> Result<s3::HeadResult, String> {
    let ctx = s3::from_profile(&profile_id)
        .await
        .map_err(|e: AppError| e.to_string())?;
    s3::head_object(&ctx, &key).await.map_err(Into::into)
}

#[tauri::command]
pub async fn object_download(
    profile_id: String,
    key: String,
    dest_path: String,
) -> Result<(), String> {
    let ctx = s3::from_profile(&profile_id)
        .await
        .map_err(|e: AppError| e.to_string())?;
    s3::download_object(&ctx, &key, &dest_path)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn object_upload(
    profile_id: String,
    key: String,
    local_path: String,
) -> Result<(), String> {
    let ctx = s3::from_profile(&profile_id)
        .await
        .map_err(|e: AppError| e.to_string())?;
    s3::put_object(&ctx, &key, &local_path)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn object_delete(profile_id: String, key: String) -> Result<(), String> {
    let ctx = s3::from_profile(&profile_id)
        .await
        .map_err(|e: AppError| e.to_string())?;
    s3::delete_object(&ctx, &key).await.map_err(Into::into)
}

#[tauri::command]
pub async fn object_create_folder(profile_id: String, prefix: String) -> Result<(), String> {
    let ctx = s3::from_profile(&profile_id)
        .await
        .map_err(|e: AppError| e.to_string())?;
    s3::put_prefix_marker(&ctx, &prefix)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn preview_prepare(profile_id: String, key: String) -> Result<PreviewResult, String> {
    let ctx = s3::from_profile(&profile_id)
        .await
        .map_err(|e: AppError| e.to_string())?;
    s3::preview_object(&ctx, &key).await.map_err(Into::into)
}

#[tauri::command]
pub fn b2_default_endpoint(region: String) -> String {
    profiles::b2_endpoint(&region)
}
