mod client;
mod ops;

pub use client::{from_profile, test_connection, S3Context};
pub use ops::{
    delete_object, download_object, head_object, list_objects, preview_object, put_object,
    put_prefix_marker, HeadResult, ListPage, PreviewResult,
};
