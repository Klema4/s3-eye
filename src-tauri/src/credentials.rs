use crate::error::AppError;

const SERVICE: &str = "s3-eye";

pub fn set_secret(profile_id: &str, secret: &str) -> Result<(), AppError> {
    let entry = keyring::Entry::new(SERVICE, profile_id)
        .map_err(|e| AppError::Credentials(e.to_string()))?;
    entry
        .set_password(secret)
        .map_err(|e| AppError::Credentials(e.to_string()))
}

pub fn get_secret(profile_id: &str) -> Result<String, AppError> {
    let entry = keyring::Entry::new(SERVICE, profile_id)
        .map_err(|e| AppError::Credentials(e.to_string()))?;
    entry
        .get_password()
        .map_err(|e| AppError::Credentials(format!("Stored credentials are unavailable: {e}")))
}

pub fn delete_secret(profile_id: &str) -> Result<(), AppError> {
    let entry = keyring::Entry::new(SERVICE, profile_id)
        .map_err(|e| AppError::Credentials(e.to_string()))?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(AppError::Credentials(e.to_string())),
    }
}
