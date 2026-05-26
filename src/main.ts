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
type View = 'seed' | 'loading' | 'confirm' | 'wallet' | 'error';

function showView(v: View) {
  const ids: Record<View, string> = {
    seed:    'view-seed',
    loading: 'view-loading',
    confirm: 'view-confirm',
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

    if (isNew) {
      // Show mnemonic confirmation step first; reveal address after user confirms
      document.getElementById('mnemonic-display')!.textContent = mnemonic;
      const checkbox = document.getElementById('confirm-checkbox') as HTMLInputElement;
      checkbox.checked = false;
      const confirmBtn = document.getElementById('confirm-btn') as HTMLButtonElement;
      confirmBtn.disabled = true;
      confirmBtn.classList.add('opacity-40', 'cursor-not-allowed');

      // Store derived address for use after confirmation
      confirmBtn.dataset.address = zaddr;
      confirmBtn.dataset.mnemonic = mnemonic;

      showView('confirm');
    } else {
      await revealWallet(zaddr);
    }
  } catch (err) {
    document.getElementById('error-message')!.textContent =
      err instanceof Error ? err.message : 'Unknown error';
    showView('error');
  }
}

async function revealWallet(zaddr: string) {
  document.getElementById('address-display')!.textContent = zaddr;

  const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
  await QRCode.toCanvas(canvas, zaddr, {
    width: 200,
    margin: 2,
    color: { dark: '#1a4a3a', light: '#ffffff' },
  });

  showView('wallet');
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

// ── Confirm seed saved ────────────────────────────────────────────────────────
document.getElementById('confirm-checkbox')!.addEventListener('change', (e) => {
  const checked = (e.target as HTMLInputElement).checked;
  const btn = document.getElementById('confirm-btn') as HTMLButtonElement;
  btn.disabled = !checked;
  btn.classList.toggle('opacity-40', !checked);
  btn.classList.toggle('cursor-not-allowed', !checked);
});

document.getElementById('confirm-btn')!.addEventListener('click', async () => {
  const btn = document.getElementById('confirm-btn') as HTMLButtonElement;
  const zaddr = btn.dataset.address ?? '';
  // Clear sensitive data from confirm view
  document.getElementById('mnemonic-display')!.textContent = '';
  delete btn.dataset.address;
  delete btn.dataset.mnemonic;
  await revealWallet(zaddr);
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
  (document.getElementById('seed-input') as HTMLTextAreaElement).value = '';
  document.getElementById('address-display')!.textContent = '';
  document.getElementById('mnemonic-display')!.textContent = '';
  const confirmBtn = document.getElementById('confirm-btn') as HTMLButtonElement;
  delete confirmBtn.dataset.address;
  delete confirmBtn.dataset.mnemonic;
  const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  showView('seed');
});

// ── Error retry ───────────────────────────────────────────────────────────────
document.getElementById('error-retry-btn')!.addEventListener('click', () => {
  showView('seed');
});
