import { generateMnemonic, validateMnemonic } from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';
import QRCode from 'qrcode';
import { deriveUnifiedAddress } from './zcash/webz';

// ── Emergency exit ──────────────────────────────────────────────────────────
function exitNow() {
  window.history.replaceState(null, '', '/');
  window.location.replace('https://weather.com');
}
document.getElementById('exit-btn')!.addEventListener('click', exitNow);
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 'x') exitNow();
});

// ── View helpers ─────────────────────────────────────────────────────────────
type View = 'seed' | 'loading' | 'wallet' | 'error';

function showView(v: View) {
  const ids: Record<View, string> = {
    seed:    'view-seed',
    loading: 'view-loading',
    wallet:  'view-wallet',
    error:   'view-error',
  };
  for (const [key, id] of Object.entries(ids)) {
    const el = document.getElementById(id)!;
    el.classList.toggle('hidden', key !== v);
  }
}

// ── Wallet open logic ─────────────────────────────────────────────────────────
async function openWallet(mnemonic: string, isNew = false) {
  showView('loading');
  try {
    const zaddr = await deriveUnifiedAddress(mnemonic);

    // Display mnemonic if newly generated
    const warning = document.getElementById('new-wallet-warning')!;
    if (isNew) {
      warning.classList.remove('hidden');
      document.getElementById('mnemonic-display')!.textContent = mnemonic;
    } else {
      warning.classList.add('hidden');
    }

    // Display address
    document.getElementById('address-display')!.textContent = zaddr;

    // Generate QR code
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    await QRCode.toCanvas(canvas, zaddr, {
      width: 200,
      margin: 2,
      color: { dark: '#1a4a3a', light: '#ffffff' },
    });

    showView('wallet');
  } catch (err) {
    document.getElementById('error-message')!.textContent =
      err instanceof Error ? err.message : 'Unknown error';
    showView('error');
  }
}

// ── Open from seed input ───────────────────────────────────────────────────────
document.getElementById('open-btn')!.addEventListener('click', () => {
  const input = (document.getElementById('seed-input') as HTMLTextAreaElement).value.trim();
  const errorEl = document.getElementById('seed-error')!;

  const mnemonic = input.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!validateMnemonic(mnemonic, englishWordlist)) {
    errorEl.textContent = 'Invalid seed phrase. Check your words and try again.';
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');
  openWallet(mnemonic, false);
});

// ── Generate new wallet ───────────────────────────────────────────────────────
document.getElementById('generate-btn')!.addEventListener('click', () => {
  const mnemonic = generateMnemonic(englishWordlist, 256); // 24 words
  openWallet(mnemonic, true);
});

// ── Copy address ─────────────────────────────────────────────────────────────
document.getElementById('copy-btn')!.addEventListener('click', () => {
  const addr = document.getElementById('address-display')!.textContent ?? '';
  navigator.clipboard.writeText(addr).then(() => {
    const confirm = document.getElementById('copy-confirm')!;
    confirm.classList.remove('hidden');
    setTimeout(() => confirm.classList.add('hidden'), 2000);
  });
});

// ── Close wallet ──────────────────────────────────────────────────────────────
document.getElementById('close-btn')!.addEventListener('click', () => {
  // Clear all sensitive data from DOM
  (document.getElementById('seed-input') as HTMLTextAreaElement).value = '';
  document.getElementById('address-display')!.textContent = '';
  document.getElementById('mnemonic-display')!.textContent = '';
  const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  showView('seed');
});

// ── Error retry ───────────────────────────────────────────────────────────────
document.getElementById('error-retry-btn')!.addEventListener('click', () => {
  showView('seed');
});
