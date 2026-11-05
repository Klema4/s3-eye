use crate::error::AppError;
use crate::s3::S3Context;
use aws_sdk_s3::types::Object;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct S3ObjectRow {
    pub key: String,
    pub name: String,
    pub size: i64,
    pub last_modified: Option<String>,
    pub is_folder: bool,
    pub content_type: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListPage {
    pub parent_prefix: String,
    pub rows: Vec<S3ObjectRow>,
    pub next_continuation_token: Option<String>,
    pub is_truncated: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HeadResult {
    pub key: String,
    pub size: i64,
    pub etag: Option<String>,
    pub content_type: Option<String>,
    pub storage_class: Option<String>,
    pub last_modified: Option<String>,
    pub metadata: HashMap<String, String>,
}

fn display_name(key: &str, prefix: &str) -> String {
    let rest = key.strip_prefix(prefix).unwrap_or(key);
    rest.trim_end_matches('/').to_string()
}

pub async fn list_objects(
    ctx: &S3Context,
    prefix: &str,
    continuation_token: Option<String>,
) -> Result<ListPage, AppError> {
    let mut req = ctx
        .client
        .list_objects_v2()
        .bucket(&ctx.bucket)
        .delimiter("/")
        .prefix(prefix)
        .max_keys(500);

    if let Some(token) = continuation_token {
        req = req.continuation_token(token);
    }

    let out = req.send().await?;

    let mut rows = Vec::new();

    if !out.common_prefixes().is_empty() {
        for cp in out.common_prefixes() {
            if let Some(p) = cp.prefix() {
                let name = display_name(p, prefix);
                rows.push(S3ObjectRow {
                    key: p.to_string(),
                    name,
                    size: 0,
                    last_modified: None,
                    is_folder: true,
                    content_type: Some("folder".into()),
                });
            }
        }
    }

    if !out.contents().is_empty() {
        for obj in out.contents() {
            if let Some(key) = obj.key() {
                if key == prefix || key.ends_with('/') && key.len() == prefix.len() + 1 {
                    continue;
                }
                rows.push(object_row(obj, key));
            }
        }
    }

    rows.sort_by(|a, b| {
        b.is_folder
            .cmp(&a.is_folder)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(ListPage {
        parent_prefix: prefix.to_string(),
        rows,
        next_continuation_token: out.next_continuation_token().map(String::from),
        is_truncated: out.is_truncated().unwrap_or(false),
    })
}

fn object_row(obj: &Object, key: &str) -> S3ObjectRow {
    let name = key.rsplit('/').next().unwrap_or(key).to_string();
    S3ObjectRow {
        key: key.to_string(),
        name,
        size: obj.size().unwrap_or(0),
        last_modified: obj.last_modified().map(|t| t.to_string()),
        is_folder: false,
        content_type: None,
    }
}

pub async fn head_object(ctx: &S3Context, key: &str) -> Result<HeadResult, AppError> {
    let out = ctx
        .client
        .head_object()
        .bucket(&ctx.bucket)
        .key(key)
        .send()
        .await?;

    let metadata = out
        .metadata()
        .map(|m| m.iter().map(|(k, v)| (k.clone(), v.clone())).collect())
        .unwrap_or_default();

    Ok(HeadResult {
        key: key.to_string(),
        size: out.content_length().unwrap_or(0),
        etag: out.e_tag().map(String::from),
        content_type: out.content_type().map(String::from),
        storage_class: out.storage_class().map(|s| s.as_str().to_string()),
        last_modified: out.last_modified().map(|t| t.to_string()),
        metadata,
    })
}

pub async fn download_object(ctx: &S3Context, key: &str, dest_path: &str) -> Result<(), AppError> {
    let out = ctx
        .client
        .get_object()
        .bucket(&ctx.bucket)
        .key(key)
        .send()
        .await?;

    let data = out.body.collect().await.map_err(|e| AppError::S3(e.to_string()))?;
    let bytes = data.into_bytes();
    if let Some(parent) = std::path::Path::new(dest_path).parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(dest_path, bytes)?;
    Ok(())
}

pub async fn put_object(ctx: &S3Context, key: &str, local_path: &str) -> Result<(), AppError> {
    let body = aws_sdk_s3::primitives::ByteStream::from_path(std::path::Path::new(local_path))
        .await
        .map_err(|e| AppError::S3(e.to_string()))?;

    ctx.client
        .put_object()
        .bucket(&ctx.bucket)
        .key(key)
        .body(body)
        .send()
        .await?;
    Ok(())
}

pub async fn put_prefix_marker(ctx: &S3Context, prefix: &str) -> Result<(), AppError> {
    let key = if prefix.ends_with('/') {
        prefix.to_string()
    } else {
        format!("{prefix}/")
    };
    ctx.client
        .put_object()
        .bucket(&ctx.bucket)
        .key(&key)
        .body(aws_sdk_s3::primitives::ByteStream::from_static(b""))
        .send()
        .await?;
    Ok(())
}

pub async fn delete_object(ctx: &S3Context, key: &str) -> Result<(), AppError> {
    ctx.client
        .delete_object()
        .bucket(&ctx.bucket)
        .key(key)
        .send()
        .await?;
    Ok(())
}

const PREVIEW_MAX_BYTES: usize = 2 * 1024 * 1024;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PreviewResult {
    pub mime: Option<String>,
    pub text: Option<String>,
    pub base64: Option<String>,
    pub too_large: bool,
}

pub async fn preview_object(ctx: &S3Context, key: &str) -> Result<PreviewResult, AppError> {
    let head = head_object(ctx, key).await?;
    if head.size as usize > PREVIEW_MAX_BYTES {
        return Ok(PreviewResult {
            mime: head.content_type,
            text: None,
            base64: None,
            too_large: true,
        });
    }

    let out = ctx
        .client
        .get_object()
        .bucket(&ctx.bucket)
        .key(key)
        .send()
        .await?;

    let data = out.body.collect().await.map_err(|e| AppError::S3(e.to_string()))?;
    let bytes = data.into_bytes();
    let mime = head.content_type.clone();

    let is_text = mime
        .as_deref()
        .map(|m| m.starts_with("text/") || m.contains("json") || m.contains("xml"))
        .unwrap_or(false);

    if is_text {
        let text = String::from_utf8_lossy(&bytes).to_string();
        return Ok(PreviewResult {
            mime,
            text: Some(text),
            base64: None,
            too_large: false,
        });
    }

    use base64::{engine::general_purpose::STANDARD, Engine as _};
    Ok(PreviewResult {
        mime,
        text: None,
        base64: Some(STANDARD.encode(bytes)),
        too_large: false,
    })
}
