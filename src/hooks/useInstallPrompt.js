import { useEffect, useState } from 'react';

// O Chrome/Android dispara `beforeinstallprompt` logo no carregamento, às vezes
// antes de a tela inicial montar. Guardamos o evento no nível do módulo para
// não perdê-lo.
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}

function isIOS() {
  const ua = window.navigator.userAgent;
  // iPadOS se identifica como Mac, mas tem tela touch.
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * mode:
 *  - 'prompt': navegador suporta instalação direta (Android/Chrome/Edge)
 *  - 'ios': precisa mostrar o passo a passo do "Adicionar à Tela de Início"
 *  - null: já instalado ou navegador sem suporte — não mostrar o botão
 */
export default function useInstallPrompt() {
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  let mode = null;
  if (!isStandalone()) {
    if (deferredPrompt) mode = 'prompt';
    else if (isIOS()) mode = 'ios';
  }

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    const event = deferredPrompt;
    deferredPrompt = null;
    event.prompt();
    await event.userChoice.catch(() => null);
    notify();
  };

  return { mode, promptInstall };
}
