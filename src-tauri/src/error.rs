use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("{0}")]
    Message(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("credentials: {0}")]
    Credentials(String),
    #[error("S3 error: {0}")]
    S3(String),
}

impl AppError {
    pub fn msg(s: impl Into<String>) -> Self {
        Self::Message(s.into())
    }
}

impl From<AppError> for String {
    fn from(e: AppError) -> String {
        e.to_string()
    }
}

impl From<aws_sdk_s3::Error> for AppError {
    fn from(e: aws_sdk_s3::Error) -> AppError {
        AppError::S3(e.to_string())
    }
}

impl<E> From<aws_sdk_s3::error::SdkError<E>> for AppError
where
    E: std::fmt::Debug + std::fmt::Display + 'static,
{
    fn from(e: aws_sdk_s3::error::SdkError<E>) -> AppError {
        AppError::S3(e.to_string())
    }
}
