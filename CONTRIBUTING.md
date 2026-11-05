# Contributing

Thanks for looking at s3-eye. Bug reports, small fixes, and clear proposals are welcome.

## Before you start

- Do not open a pull request that contains access keys, secret keys, `.env` files, or a copy of your `profiles.json`.
- Read the install steps in [README.md](README.md) and get `npm run tauri dev` running locally.

## Report a bug

Include:

- Windows or macOS version
- What you clicked, and what you expected
- The exact error text from the app, with secrets removed
- Provider and region (B2, AWS, MinIO, or another endpoint). Do not include the bucket name if it is private, and never include keys.

## Make a change

1. Fork the repository and create a branch from `main`.
2. Keep the change focused. One fix or one feature per pull request.
3. Match the existing layout: Rust commands live in `src-tauri/src`, and the interface lives in `src/`.
4. User-facing copy stays plain. Do not use em dashes or en dashes.

## Checks

From the repository root:

```bash
npm run build
```

From `src-tauri`:

```bash
cargo clippy -- -D warnings
cargo test
```

`npm run build` typechecks the interface and produces the frontend bundle. Clippy must pass with no warnings. GitHub Actions runs the same checks on Windows.

Run the app with `npm run tauri dev` and try the screen you changed.

## Pull requests

Describe what changed and how you tested it. Screenshots help when the interface changed.

By submitting a pull request you agree that your contribution is licensed under the MIT license in [LICENSE](LICENSE).
