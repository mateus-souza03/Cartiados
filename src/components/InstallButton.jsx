import { useState } from 'react';
import useInstallPrompt from '../hooks/useInstallPrompt';

function ShareIcon() {
  return (
    <svg className="install-share-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3v12M12 3l-4 4M12 3l4 4M7 10H5v11h14V10h-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function InstallButton() {
  const { mode, promptInstall } = useInstallPrompt();
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  if (!mode) return null;

  const handleClick = () => {
    if (mode === 'prompt') promptInstall();
    else setShowIOSHelp(true);
  };

  return (
    <>
      <button type="button" className="btn btn-install btn-block" onClick={handleClick}>
        📲 Baixar o app
      </button>

      {showIOSHelp && (
        <div className="modal-overlay" onClick={() => setShowIOSHelp(false)}>
          <div className="modal install-modal" onClick={(e) => e.stopPropagation()}>
            <p>Instalar o Cartiado no iPhone</p>
            <p className="modal-subtext">Leva só 3 toques:</p>
            <ol className="install-steps">
              <li>
                Toque no botão <strong>Compartilhar</strong> <ShareIcon /> na barra do navegador
              </li>
              <li>
                Role e escolha <strong>Adicionar à Tela de Início</strong>
              </li>
              <li>
                Toque em <strong>Adicionar</strong> no canto de cima
              </li>
            </ol>
            <button type="button" className="btn btn-primary btn-block" onClick={() => setShowIOSHelp(false)}>
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
