# s3-eye

s3-eye is a desktop browser for S3-compatible storage. It is built for Backblaze B2, and it also works with MinIO, Cloudflare R2, and AWS S3.

You can browse a bucket, upload and download files, and inspect object metadata. Connection secrets stay in the system keychain.

Windows and macOS are the supported platforms.

## What you can do

- Save connection profiles. The secret is stored in the system keychain.
- Browse prefixes, with a virtualized list and pagination.
- Upload, download, delete, and create folders.
- Inspect metadata and preview text or images up to 2 MB.
- Open the command palette with Ctrl+K on Windows or Cmd+K on macOS.

## Install from source

There are no signed installers yet. Build the app on your machine.

### What you need

- Windows 10, Windows 11, or macOS 13 or newer
- [Node.js 22](https://nodejs.org/)
- [Rust](https://rustup.rs/) (stable toolchain)
- A C++ build environment, listed per platform below

Check the versions after installation:

```bash
node --version
npm --version
rustc --version
cargo --version
```

### Windows

1. Install Node.js 22 from [nodejs.org](https://nodejs.org/).
2. Install Rust with [rustup](https://rustup.rs/). When rustup asks for a host triple, keep the default.
3. Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/). In the installer, select the workload **Desktop development with C++**. You need MSVC and the Windows SDK.
4. Windows 11 already includes the WebView2 runtime. On Windows 10, install the [Evergreen WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) if the app fails to open a window.
5. Open a new terminal so `cargo` is on your PATH, then clone and run:

```bash
git clone https://github.com/Klema4/s3-eye.git
cd s3-eye
npm install
npm run tauri dev
```

The first Rust compile downloads a large set of crates and can take several minutes.

### macOS

1. Install the Xcode command line tools:

```bash
xcode-select --install
```

2. Install Node.js 22 from [nodejs.org](https://nodejs.org/), or with Homebrew: `brew install node`.
3. Install Rust with [rustup](https://rustup.rs/).
4. Clone and run:

```bash
git clone https://github.com/Klema4/s3-eye.git
cd s3-eye
npm install
npm run tauri dev
```

### Build an installer

```bash
npm run tauri build
```

Installers are written under `src-tauri/target/release/bundle/`.

- Windows: an `.msi` and an NSIS `.exe` setup.
- macOS: a `.dmg` and an `.app` bundle.

These builds are not code signed. Windows SmartScreen and macOS Gatekeeper will warn you on first launch. That is expected until you add your own signing certificates.

## Connect a bucket

### Backblaze B2

1. In the B2 console, create an application key with list, read, and write access to the bucket.
2. In s3-eye, choose **Add connection** and select the Backblaze B2 provider.
3. Enter a name, the region (for example `eu-central-003`), the bucket name, the key ID, and the application key.
4. The endpoint is filled in as `https://s3.<region>.backblazeb2.com`.
5. Choose **Verify connection**, then **Save connection**.

### Any other S3 API

Choose the **S3 compatible** provider and enter the endpoint, region, bucket, and keys yourself. Path-style addressing is used, which is what most compatible services expect.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl+K or Cmd+K | Command palette |
| F5 | Refresh the current folder |
| Delete | Delete the selected object, after confirmation |

## Where your data lives

Profiles (name, endpoint, region, bucket, key ID) are stored in a local file:

- Windows: `%APPDATA%\s3-eye\profiles.json`
- macOS: `~/Library/Application Support/s3-eye/profiles.json`

The secret key is not in that file. It is stored in Windows Credential Manager or the macOS Keychain under the service name `s3-eye`.

Do not commit keys, `.env` files, or copies of `profiles.json`.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for the local checks that pull requests should pass.

## License

MIT. See [LICENSE](LICENSE).
