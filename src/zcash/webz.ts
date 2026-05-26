import initWasm, { WebWallet } from './wasm/webzjs_wallet.js';

let initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = initWasm('/wasm/webzjs_wallet_bg.wasm').then(() => undefined);
  }
  return initPromise;
}

export async function deriveUnifiedAddress(mnemonic: string): Promise<string> {
  await ensureInit();
  const wallet = new WebWallet('main', 'https://zcash-mainnet.chainsafe.dev', 1);
  try {
    const accountId = await wallet.create_account('default', mnemonic, 0, 3150000);
    return await wallet.get_current_address(accountId);
  } finally {
    wallet.free();
  }
}
