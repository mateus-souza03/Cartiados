import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { useTheme } from './hooks/useTheme';
import Home from './pages/Home';
import SelectGameType from './pages/SelectGameType';
import NewGame from './pages/NewGame';
import Game from './pages/Game';
import CachetaGame from './pages/CachetaGame';
import TrucoGame from './pages/TrucoGame';
import GameOver from './pages/GameOver';
import Watermark from './components/Watermark';
import './App.css';

function initialView(game) {
  if (!game) return 'home';
  if (game.finished) return 'gameover';
  return 'game';
}

function App() {
  const gameApi = useGame();
  const { game } = gameApi;
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState(() => initialView(game));
  const [selectedGameType, setSelectedGameType] = useState(game?.gameType ?? null);
  const [confirmNewGame, setConfirmNewGame] = useState(false);

  const { game: _game, ...actions } = gameApi;

  const goToPreviousGameOrHome = () => setView(game ? (game.finished ? 'gameover' : 'game') : 'home');

  const handleGoToNewGame = () => {
    if (game && !game.finished) {
      setConfirmNewGame(true);
      return;
    }
    setView('selectGame');
  };

  const handleConfirmDiscard = () => {
    setConfirmNewGame(false);
    setView('selectGame');
  };

  const handleSelectGameType = (id) => {
    setSelectedGameType(id);
    setView('new');
  };

  const handleCreateGame = (config) => {
    gameApi.createGame(config);
    setView('game');
  };

  const handleStartOver = () => {
    gameApi.resetGame();
    setView('selectGame');
  };

  let content;

  if (view === 'new' || confirmNewGame) {
    content = (
      <>
        {confirmNewGame && (
          <div className="modal-overlay">
            <div className="modal">
              <p>Tem certeza que deseja iniciar uma nova partida?</p>
              <p className="modal-subtext">O progresso atual será perdido.</p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-danger" onClick={handleConfirmDiscard}>
                  Sim, iniciar nova partida
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmNewGame(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        {view === 'new' && (
          <NewGame
            gameType={selectedGameType}
            onCreate={handleCreateGame}
            onCancel={() => setView('selectGame')}
          />
        )}
      </>
    );
  } else if (view === 'selectGame') {
    content = <SelectGameType onSelect={handleSelectGameType} onBack={goToPreviousGameOrHome} />;
  } else if (view === 'game' && game) {
    const GamePage =
      game.gameType === 'cacheta' ? CachetaGame : game.gameType === 'truco' ? TrucoGame : Game;
    content = (
      <GamePage
        game={game}
        actions={actions}
        theme={theme}
        onToggleTheme={toggleTheme}
        onViewFinalResult={() => setView('gameover')}
        onNewGame={handleGoToNewGame}
      />
    );
  } else if (view === 'gameover' && game) {
    content = <GameOver game={game} onNewGame={handleStartOver} />;
  } else {
    content = (
      <Home
        theme={theme}
        onToggleTheme={toggleTheme}
        onNewGame={handleGoToNewGame}
        onContinue={() => setView(game.finished ? 'gameover' : 'game')}
        hasSavedGame={Boolean(game)}
      />
    );
  }

  return (
    <>
      {content}
      <Watermark />
    </>
  );
}

export default App;
