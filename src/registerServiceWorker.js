import { registerSW } from 'virtual:pwa-register';

// Intervalo mínimo entre verificações de atualização.
const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Registra o service worker e mantém o app instalado sempre atualizado.
 *
 * No celular o app instalado quase nunca é "aberto do zero": o sistema só traz
 * de volta do segundo plano, e o navegador não procura versão nova sozinho.
 * Por isso verificamos ao abrir, ao voltar para o app e de tempos em tempos.
 * Quando há versão nova, a página recarrega sozinha (a partida fica salva no
 * localStorage, então nada se perde).
 */
export default function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      let lastCheck = 0;
      const checkForUpdate = async () => {
        if (Date.now() - lastCheck < CHECK_INTERVAL_MS) return;
        if (!navigator.onLine) return;
        lastCheck = Date.now();
        try {
          // Baixa o sw.js de novo; se mudou, instala a versão nova.
          await registration.update();
        } catch {
          // Sem internet ou servidor fora do ar: tenta de novo depois.
        }
      };

      checkForUpdate();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });
      window.addEventListener('focus', checkForUpdate);
      setInterval(checkForUpdate, 30 * 60 * 1000);
    },
  });
}
