import { useCallback, useEffect, useState } from 'react';
import { calculateRoundScore, applyScoreChange } from '../utils/scoring';
import { isGameOver } from '../utils/gameRules';
import { loadGame, saveGame } from '../utils/storage';

export const PHASES = {
  DECLARATION: 'declaration',
  PLAYING: 'playing',
  RESULT: 'result',
  SUMMARY: 'summary',
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

    const newGame = {
      id: makeId(),
      createdAt: Date.now(),
      players,
      initialScore: config.initialScore,
      cardsPerRound: config.cardsPerRound,
      allowNegative: config.allowNegative,
      endCondition: config.endCondition,
      endConditionValue: config.endConditionValue,
      round: 1,
      phase: PHASES.DECLARATION,
      declarations: createInitialDrafts(players),
      results: {},
      history: [],
      finished: false,
    };

    setGame(newGame);
  }, []);

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

  const undoLastRound = useCallback(() => {
    setGame((prev) => {
      if (!prev.history.length) return prev;
      const lastEntry = prev.history[prev.history.length - 1];
      const restoredPlayers = prev.players.map((p) => ({
        ...p,
        score: lastEntry.scoresBefore[p.id],
      }));
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
    undoLastRound,
    resetGame,
  };
}
