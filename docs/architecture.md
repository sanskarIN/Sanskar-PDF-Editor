# Hybrid Architecture

The Sanskar PDF Editor utilizes an advanced "Isomorphic Hybrid" architecture. This means the application can dynamically switch its processing engine based on the environment it's running in, maximizing performance and compatibility.

## The Two Engines

### 1. Native Rust Engine (Tauri Desktop)
When running as a native desktop application (Windows, macOS, Linux) or a mobile application (Android, iOS), the frontend communicates with the blazing-fast Rust backend.
- **Library**: `lopdf`
- **Advantages**: Near-instant processing, zero memory limits, can handle 10,000+ page PDFs seamlessly. Military-grade AES encryption using native OS cryptography APIs.
- **Communication**: Frontend calls Rust via `@tauri-apps/api/core` using IPC (Inter-Process Communication).

### 2. JavaScript Web Engine (Web Fallback)
When compiled to the standalone `Web-Version.html`, there is no Rust backend available. The application detects this and automatically routes all PDF manipulation requests to a client-side JavaScript engine.
- **Library**: `pdf-lib` and `pdf.js`
- **Advantages**: Runs 100% locally in the browser with zero server required. Highly portable.
- **Drawbacks**: Slower processing for very large files; limited to browser memory constraints.

## The Core Abstraction Layer (`pdfCore.ts`)

To prevent writing duplicate code for both engines, the application uses an abstraction layer located at `src/lib/pdfCore.ts`.

When a user clicks "Merge PDF", the UI component doesn't care whether it's running on Desktop or Web. It simply calls `mergePdfs(files)`. 
The `pdfCore.ts` file detects the environment using Tauri's `isTauri()` utility:
- If `true`, it invokes the Rust IPC command.
- If `false`, it executes the pure JS implementation.

This ensures 100% feature parity across all platforms without duplicating UI logic!
