import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { useTheme } from './hooks/useTheme';
import Home from './pages/Home';
import SelectGameType from './pages/SelectGameType';
import NewGame from './pages/NewGame';
import Game from './pages/Game';
import GameOver from './pages/GameOver';
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

  const actions = {
    updateDeclaration: gameApi.updateDeclaration,
    updateCardsPerRound: gameApi.updateCardsPerRound,
    confirmDeclarations: gameApi.confirmDeclarations,
    startResultEntry: gameApi.startResultEntry,
    updateResult: gameApi.updateResult,
    finalizeRound: gameApi.finalizeRound,
    nextRound: gameApi.nextRound,
    undoLastRound: gameApi.undoLastRound,
  };

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

  if (view === 'new' || confirmNewGame) {
    return (
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
  }

  if (view === 'selectGame') {
    return <SelectGameType onSelect={handleSelectGameType} onBack={goToPreviousGameOrHome} />;
  }

  if (view === 'game' && game) {
    return (
      <Game
        game={game}
        actions={actions}
        theme={theme}
        onToggleTheme={toggleTheme}
        onViewFinalResult={() => setView('gameover')}
        onNewGame={handleGoToNewGame}
      />
    );
  }

  if (view === 'gameover' && game) {
    return <GameOver game={game} onNewGame={handleStartOver} />;
  }

  return (
    <Home
      theme={theme}
      onToggleTheme={toggleTheme}
      onNewGame={handleGoToNewGame}
      onContinue={() => setView(game.finished ? 'gameover' : 'game')}
      hasSavedGame={Boolean(game)}
    />
  );
}

export default App;
