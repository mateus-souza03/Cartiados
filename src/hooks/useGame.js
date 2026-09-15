import { useCallback, useEffect, useState } from 'react';
import { calculateRoundScore, applyScoreChange } from '../utils/scoring';
import { calculateCachetaRound } from '../utils/cachetaScoring';
import { TRUCO_TARGET_SCORE } from '../utils/trucoScoring';
import { isGameOver } from '../utils/gameRules';
import { loadGame, saveGame } from '../utils/storage';

export const PHASES = {
  DECLARATION: 'declaration',
  PLAYING: 'playing',
  RESULT: 'result',
  SUMMARY: 'summary',
};

export const CACHETA_PHASES = {
  ROUND: 'round',
  SUMMARY: 'summary',
};

export const TRUCO_PHASES = {
  ROUND: 'round',
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function createInitialDrafts(players) {
  const declarations = {};
  players.forEach((p) => {
    declarations[p.id] = { declared: 0 };
  });
  return declarations;
}

function createParticipationDraft(players) {
  const participation = {};
  players.filter((p) => p.score > 0).forEach((p) => {
    participation[p.id] = true;
  });
  return participation;
}

export function useGame() {
  const [game, setGame] = useState(() => loadGame());

  useEffect(() => {
    saveGame(game);
  }, [game]);

  const createGame = useCallback((config) => {
    const players = config.players.map((name) => ({
      id: makeId(),
      name,
      score: config.initialScore,
    }));

    const base = {
      id: makeId(),
      createdAt: Date.now(),
      gameType: config.gameType,
      players,
      initialScore: config.initialScore,
      allowNegative: config.allowNegative,
      endCondition: config.endCondition,
      endConditionValue: config.endConditionValue,
      round: 1,
      history: [],
      finished: false,
    };

    if (config.gameType === 'cacheta') {
      setGame({
        ...base,
        phase: CACHETA_PHASES.ROUND,
        participation: createParticipationDraft(players),
        winnerId: null,
      });
      return;
    }

    if (config.gameType === 'truco') {
      const trucoPlayers = players.map((p) => ({ ...p, matchWins: 0 }));
      setGame({
        ...base,
        players: trucoPlayers,
        phase: TRUCO_PHASES.ROUND,
      });
      return;
    }

    setGame({
      ...base,
      cardsPerRound: config.cardsPerRound,
      phase: PHASES.DECLARATION,
      declarations: createInitialDrafts(players),
      results: {},
    });
  }, []);

  // ---------- F#dinha ----------

  const updateDeclaration = useCallback((playerId, field, value) => {
    setGame((prev) => ({
      ...prev,
      declarations: {
        ...prev.declarations,
        [playerId]: { ...prev.declarations[playerId], [field]: value },
      },
    }));
  }, []);

  const updateCardsPerRound = useCallback((value) => {
    setGame((prev) => ({ ...prev, cardsPerRound: value }));
  }, []);

  const confirmDeclarations = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      cardsPerRound: Math.max(1, Number(prev.cardsPerRound) || 1),
      phase: PHASES.PLAYING,
    }));
  }, []);

  const startResultEntry = useCallback(() => {
    setGame((prev) => {
      const results = {};
      prev.players.forEach((p) => {
        results[p.id] = '';
      });
      return { ...prev, phase: PHASES.RESULT, results };
    });
  }, []);

  const updateResult = useCallback((playerId, value) => {
    setGame((prev) => ({
      ...prev,
      results: { ...prev.results, [playerId]: value },
    }));
  }, []);

  const finalizeRound = useCallback(() => {
    setGame((prev) => {
      const scoresBefore = {};
      prev.players.forEach((p) => {
        scoresBefore[p.id] = p.score;
      });

      const entries = prev.players.map((p) => {
        const declared = Number(prev.declarations[p.id]?.declared ?? 0);
        const achieved = Number(prev.results[p.id] ?? 0);
        const outcome = calculateRoundScore(declared, achieved);
        return {
          playerId: p.id,
          playerName: p.name,
          ...outcome,
        };
      });

      const updatedPlayers = prev.players.map((p) => {
        const entry = entries.find((e) => e.playerId === p.id);
        const nextScore = applyScoreChange(p.score, entry.scoreChange, prev.allowNegative);
        return { ...p, score: nextScore };
      });

      const scoresAfter = {};
      updatedPlayers.forEach((p) => {
        scoresAfter[p.id] = p.score;
      });

      const historyEntry = {
        round: prev.round,
        cardsPerRound: prev.cardsPerRound,
        entries,
        scoresBefore,
        scoresAfter,
      };

      const nextGame = {
        ...prev,
        players: updatedPlayers,
        history: [...prev.history, historyEntry],
        phase: PHASES.SUMMARY,
      };

      nextGame.finished = isGameOver(nextGame);

      return nextGame;
    });
  }, []);

  const nextRound = useCallback(() => {
    setGame((prev) => {
      if (prev.finished) return prev;
      return {
        ...prev,
        round: prev.round + 1,
        phase: PHASES.DECLARATION,
        declarations: createInitialDrafts(prev.players),
        results: {},
      };
    });
  }, []);

  // ---------- Cacheta ----------

  const updateParticipation = useCallback((playerId, playing) => {
    setGame((prev) => {
      const participation = { ...prev.participation, [playerId]: playing };
      const winnerId = !playing && prev.winnerId === playerId ? null : prev.winnerId;
      return { ...prev, participation, winnerId };
    });
  }, []);

  const setWinner = useCallback((playerId) => {
    setGame((prev) => ({
      ...prev,
      winnerId: prev.winnerId === playerId ? null : playerId,
    }));
  }, []);

  const finalizeCachetaRound = useCallback(() => {
    setGame((prev) => {
      const scoresBefore = {};
      prev.players.forEach((p) => {
        scoresBefore[p.id] = p.score;
      });

      const activePlayers = prev.players.filter((p) => p.score > 0);
      const entries = calculateCachetaRound(activePlayers, prev.participation, prev.winnerId);

      const updatedPlayers = prev.players.map((p) => {
        const entry = entries.find((e) => e.playerId === p.id);
        if (!entry) return p;
        const nextScore = applyScoreChange(p.score, entry.scoreChange, prev.allowNegative);
        return { ...p, score: nextScore };
      });

      const scoresAfter = {};
      updatedPlayers.forEach((p) => {
        scoresAfter[p.id] = p.score;
      });

      const historyEntry = {
        round: prev.round,
        entries,
        scoresBefore,
        scoresAfter,
      };

      const nextGame = {
        ...prev,
        players: updatedPlayers,
        history: [...prev.history, historyEntry],
        phase: CACHETA_PHASES.SUMMARY,
      };

      nextGame.finished = isGameOver(nextGame);

      return nextGame;
    });
  }, []);

  const nextCachetaRound = useCallback(() => {
    setGame((prev) => {
      if (prev.finished) return prev;
      return {
        ...prev,
        round: prev.round + 1,
        phase: CACHETA_PHASES.ROUND,
        participation: createParticipationDraft(prev.players),
        winnerId: null,
      };
    });
  }, []);

  // ---------- Truco ----------

  const addTrucoPoints = useCallback((teamId, points) => {
    setGame((prev) => {
      const scoresBefore = {};
      const matchWinsBefore = {};
      prev.players.forEach((p) => {
        scoresBefore[p.id] = p.score;
        matchWinsBefore[p.id] = p.matchWins;
      });

      const team = prev.players.find((p) => p.id === teamId);
      const newScore = team.score + points;
      const wonMao = newScore >= TRUCO_TARGET_SCORE;

      const updatedPlayers = prev.players.map((p) => {
        if (wonMao) {
          return { ...p, score: 0, matchWins: p.id === teamId ? p.matchWins + 1 : p.matchWins };
        }
        return p.id === teamId ? { ...p, score: newScore } : p;
      });

      const historyEntry = {
        round: prev.round,
        teamId,
        teamName: team.name,
        points,
        scoreAfter: newScore,
        wonMao,
        scoresBefore,
        matchWinsBefore,
      };

      return {
        ...prev,
        players: updatedPlayers,
        round: prev.round + (wonMao ? 1 : 0),
        history: [...prev.history, historyEntry],
      };
    });
  }, []);

  // ---------- Comuns ----------

  const undoLastRound = useCallback(() => {
    setGame((prev) => {
      if (!prev.history.length) return prev;
      const lastEntry = prev.history[prev.history.length - 1];
      const restoredPlayers = prev.players.map((p) => ({
        ...p,
        score: lastEntry.scoresBefore[p.id] ?? p.score,
      }));

      if (prev.gameType === 'cacheta') {
        const participation = {};
        let winnerId = null;
        lastEntry.entries.forEach((e) => {
          participation[e.playerId] = e.playing;
          if (e.won) winnerId = e.playerId;
        });

        return {
          ...prev,
          players: restoredPlayers,
          history: prev.history.slice(0, -1),
          round: lastEntry.round,
          phase: CACHETA_PHASES.ROUND,
          participation,
          winnerId,
          finished: false,
        };
      }

      if (prev.gameType === 'truco') {
        const trucoPlayers = prev.players.map((p) => ({
          ...p,
          score: lastEntry.scoresBefore[p.id] ?? p.score,
          matchWins: lastEntry.matchWinsBefore[p.id] ?? p.matchWins,
        }));

        return {
          ...prev,
          players: trucoPlayers,
          history: prev.history.slice(0, -1),
          round: lastEntry.round,
          phase: TRUCO_PHASES.ROUND,
          finished: false,
        };
      }

      const declarations = {};
      lastEntry.entries.forEach((e) => {
        declarations[e.playerId] = { declared: e.declared };
      });

      return {
        ...prev,
        players: restoredPlayers,
        history: prev.history.slice(0, -1),
        round: lastEntry.round,
        cardsPerRound: lastEntry.cardsPerRound,
        phase: PHASES.DECLARATION,
        declarations,
        results: {},
        finished: false,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGame(null);
  }, []);

  return {
    game,
    createGame,
    updateDeclaration,
    updateCardsPerRound,
    confirmDeclarations,
    startResultEntry,
    updateResult,
    finalizeRound,
    nextRound,
    updateParticipation,
    setWinner,
    finalizeCachetaRound,
    nextCachetaRound,
    addTrucoPoints,
    undoLastRound,
    resetGame,
  };
}
