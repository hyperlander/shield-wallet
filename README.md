# Shield Wallet

A privacy-focused, browser-based Zcash wallet for viewing your Unified Address (UA). No data is saved, no server is contacted, and your seed phrase never leaves the device.

## Features

- Generate or import a BIP-39 24-word seed phrase
- Derives a correct **Unified Address** (Sapling + Orchard) via the [WebZjs](https://github.com/ChainSafe/WebZjs) WASM library
- QR code display and one-click copy
- Emergency exit button (also `Alt+X`) — instantly redirects away from the page
- Designed for use in a private/incognito browser window

## Tech stack

| Layer | Library |
|-------|---------|
| UI | Vite + TypeScript + Tailwind CSS |
| Mnemonic | `@scure/bip39` |
| Zcash crypto | `@chainsafe/webzjs-wallet` (WASM) |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Obtain the WASM binary

The file `public/wasm/webzjs_wallet_bg.wasm` (~60 MB) is the WebZjs Rust WASM binary.
It is **not included in git** due to its size. Obtain it from one of:

- Build from source: [github.com/ChainSafe/WebZjs](https://github.com/ChainSafe/WebZjs)

Place the file at `public/wasm/webzjs_wallet_bg.wasm`.

### 3. Run

```bash
npm run dev
```

Open `http://localhost:5173` in a private/incognito window.

> The dev server sets `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers required for `SharedArrayBuffer` (used by the WASM module).

### 4. Build

```bash
npm run build
```

The production server must also send the same COOP/COEP headers.

## Project structure

```
src/
  main.ts              — UI logic, event handling
  style.css            — Tailwind CSS entry
  zcash/
    webz.ts            — WASM wrapper (init + deriveUnifiedAddress)
    wasm/
      webzjs_wallet.js — wasm-bindgen JS glue
      webzjs_wallet.d.ts
public/
  wasm/
    webzjs_wallet_bg.wasm   — WASM binary (not in git, see Setup)
```

## Security notes

- All cryptography runs locally in the browser via WebAssembly.
- No network requests are made for address derivation (the lightwalletd URL in the code is only used if you call `wallet.sync()`).
- The page sets `<meta name="robots" content="noindex">` and `<meta name="referrer" content="no-referrer">`.
- For maximum safety, use in a private/incognito window and press **Exit** or `Alt+X` when done.

## License

[MIT](LICENSE)
