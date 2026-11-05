use crate::error::AppError;
use crate::profiles::Profile;
use aws_config::BehaviorVersion;
use aws_credential_types::Credentials;
use aws_sdk_s3::config::{Region, SharedCredentialsProvider};
use aws_sdk_s3::Client;

pub struct S3Context {
    pub client: Client,
    pub bucket: String,
}

pub async fn from_profile(profile_id: &str) -> Result<S3Context, AppError> {
    let profile = crate::profiles::get_profile(profile_id)?;
    let secret = crate::credentials::get_secret(profile_id)?;
    build_context(&profile, &secret).await
}

async fn build_context(profile: &Profile, secret: &str) -> Result<S3Context, AppError> {
    let creds = Credentials::new(
        profile.access_key_id.clone(),
        secret.to_string(),
        None,
        None,
        "s3-eye",
    );
    let cred_provider = SharedCredentialsProvider::new(creds);

    let base = aws_config::defaults(BehaviorVersion::latest())
        .region(Region::new(profile.region.clone()))
        .credentials_provider(cred_provider)
        .load()
        .await;

    let conf = aws_sdk_s3::config::Builder::from(&base)
        .endpoint_url(profile.endpoint.clone())
        .force_path_style(true)
        .build();

    Ok(S3Context {
        client: Client::from_conf(conf),
        bucket: profile.bucket.clone(),
    })
}

pub async fn test_connection(profile_id: &str) -> Result<(), AppError> {
    let ctx = from_profile(profile_id).await?;
    ctx.client
        .head_bucket()
        .bucket(&ctx.bucket)
        .send()
        .await?;
    Ok(())
}
