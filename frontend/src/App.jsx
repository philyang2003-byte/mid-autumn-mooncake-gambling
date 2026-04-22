import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "./api/gameApi.js";
import Background from "./components/Background.jsx";
import Bowl from "./components/Bowl.jsx";
import Die from "./components/Die.jsx";
import PlayerRing from "./components/PlayerRing.jsx";
import PrizePanel from "./components/PrizePanel.jsx";
import SetupPanel from "./components/SetupPanel.jsx";
import ControlPanel from "./components/ControlPanel.jsx";
import StealNotice from "./components/StealNotice.jsx";
import ResultsModal from "./components/ResultsModal.jsx";

// ── Dice helpers ──────────────────────────────────────────────

function restingDice(values) {
  const layout = [
    { x: 30, y: 38 }, { x: 50, y: 32 }, { x: 70, y: 38 },
    { x: 32, y: 62 }, { x: 54, y: 68 }, { x: 72, y: 58 },
  ];
  return values.map((v, i) => ({
    id: i, value: v,
    x: layout[i].x + (Math.random() - .5) * 6,
    y: layout[i].y + (Math.random() - .5) * 6,
    rot: (Math.random() - .5) * 70,
    scale: 1, phase: "settled",
  }));
}

function animateDice(targetValues, setDice, setShaking, onSettled) {
  // Phase 1: rise
  setDice(targetValues.map((_, i) => ({
    id: i,
    value: Math.floor(Math.random() * 6) + 1,
    x: 50 + (Math.random() - .5) * 14,
    y: 50 + (Math.random() - .5) * 14,
    rot: (Math.random() - .5) * 540,
    scale: 1.9, phase: "rising",
  })));

  setTimeout(() => {
    setShaking(true);
    setDice(targetValues.map((_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 6) + 1,
      x: 22 + Math.random() * 56,
      y: 25 + Math.random() * 50,
      rot: (Math.random() - .5) * 900,
      scale: 1.0, phase: "falling",
    })));
  }, 480);

  setTimeout(() => {
    setDice(targetValues.map((_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 6) + 1,
      x: 24 + Math.random() * 52,
      y: 28 + Math.random() * 44,
      rot: (Math.random() - .5) * 360,
      scale: 1.05, phase: "bouncing",
    })));
  }, 900);

  setTimeout(() => {
    setShaking(false);
    setDice(restingDice(targetValues));
    onSettled();
  }, 1600);
}

// ── App ───────────────────────────────────────────────────────

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [dice, setDice] = useState(() => restingDice([4, 1, 4, 2, 5, 3]));
  const [shaking, setShaking] = useState(false);
  const [throwing, setThrowing] = useState(false);
  const [toast, setToast] = useState(null);
  const [stealNotice, setStealNotice] = useState(null);
  const [results, setResults] = useState(null);

  const stageRef = useRef(null);
  const [center, setCenter] = useState({ x: 720, y: 495 });

  // Load initial state
  useEffect(() => {
    api.getState().then(setGameState).catch(console.error);
  }, []);

  // Responsive center
  useEffect(() => {
    const measure = () => {
      if (!stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      setCenter({ x: r.width / 2, y: r.height / 2 + 10 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const handleThrow = useCallback(async () => {
    if (throwing || !gameState || gameState.phase !== "game") return;
    setThrowing(true);
    try {
      const ev = await api.throwDice();
      animateDice(ev.dice, setDice, setShaking, () => {
        setGameState(ev.state);
        if (ev.penalty) {
          const player = ev.state.players.find(p => p.id === ev.penalty_player_id);
          setToast({ type: "penalty", name: player?.name ?? "" });
        } else if (ev.steal_from_id) {
          const stealer = ev.state.players.find(p => p.id === ev.state.current_player_id);
          setStealNotice({
            stealer: stealer?.name ?? "",
            from: ev.steal_from_name ?? "",
            prize: ev.prize_label ?? "",
          });
          setTimeout(() => setStealNotice(null), 2800);
          setToast({ type: "win", title: ev.prize_label, name: stealer?.name ?? "" });
        } else if (ev.prize_key) {
          const player = gameState.players.find(p => p.id === gameState.current_player_id);
          if (ev.zhuangyuan_update) {
            setToast({ type: "zhuangyuan", title: ev.prize_label, name: player?.name ?? "" });
          } else {
            setToast({ type: "win", title: ev.prize_label, name: player?.name ?? "" });
          }
        } else if (ev.no_prize) {
          // no toast for "no prize"
        }
        if (ev.game_over) {
          api.getResults().then(setResults);
        }
        setThrowing(false);
      });
    } catch (err) {
      console.error(err);
      setThrowing(false);
    }
  }, [throwing, gameState]);

  // Spacebar shortcut
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        handleThrow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleThrow]);

  const handleGameStart = async () => {
    const state = await api.startGame();
    setGameState(state);
  };

  const handleReset = async () => {
    await api.reset();
    setResults(null);
    setToast(null);
    setDice(restingDice([4, 1, 4, 2, 5, 3]));
    const state = await api.getState();
    setGameState(state);
  };

  const phase = gameState?.phase ?? "setup";
  const players = gameState?.players ?? [];
  const currentPlayerId = gameState?.current_player_id ?? null;
  const prizePool = gameState?.prize_pool ?? {};
  const penaltyProb = gameState?.penalty_prob ?? 0.05;

  const radiusX = players.length <= 6 ? 360 : players.length <= 9 ? 380 : 395;
  const radiusY = players.length <= 6 ? 230 : players.length <= 9 ? 245 : 255;

  const canThrow = phase === "game" && !throwing;
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  return (
    <div style={{ position: "relative", minHeight: "100vh", width: "100%" }}>
      <Background />

      {/* Header — only shown on setup screen */}
      {phase === "setup" && (
        <header style={hdStyles.wrap}>
          <div style={hdStyles.titleCh}>中秋博饼</div>
          <div style={hdStyles.titleSub}>月圆人团圆 · 博得状元归</div>
        </header>
      )}

      {/* Setup overlay */}
      {phase === "setup" && gameState && (
        <SetupPanel
          players={players}
          penaltyProb={penaltyProb}
          onAdd={async (name, age) => {
            const res = await api.addPlayer(name, age);
            setGameState(s => ({ ...s, players: [...s.players, res.player] }));
            return res;
          }}
          onRemove={async (id) => {
            await api.removePlayer(id);
            setGameState(s => ({ ...s, players: s.players.filter(p => p.id !== id) }));
          }}
          onPenaltyChange={async (prob) => {
            const res = await api.setPenaltyProb(prob);
            setGameState(s => ({ ...s, penalty_prob: res.penalty_prob }));
          }}
          onStart={handleGameStart}
        />
      )}

      {/* Game stage */}
      {phase !== "setup" && (
        <>
          <div style={{ padding: "200px 28px 120px", minHeight: "100vh" }} ref={stageRef}>
            {/* Title above bowl */}
            <div style={{
              position: "absolute",
              left: center.x, top: center.y - 340,
              transform: "translateX(-50%)",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 40,
            }}>
              <div style={hdStyles.titleCh}>中秋博饼</div>
              <div style={hdStyles.titleSub}>月圆人团圆 · 博得状元归</div>
            </div>

            <PlayerRing
              players={players}
              currentPlayerId={currentPlayerId}
              radiusX={radiusX}
              radiusY={radiusY}
              centerX={center.x}
              centerY={center.y}
            />

            <div style={{
              position: "absolute",
              left: center.x, top: center.y,
              transform: "translate(-50%,-50%)",
              zIndex: 10,
            }}>
              <Bowl size={440} shaking={shaking}>
                {dice.map(d => <Die key={d.id} die={d} size={54} />)}
              </Bowl>
            </div>

            <div style={{
              position: "absolute",
              left: center.x, top: center.y + 345,
              transform: "translateX(-50%)",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 5,
            }}>
              <div style={phaseLabel}>
                {throwing ? "—— 骰落碗中 ——"
                  : phase === "results" ? "—— 博饼结束 ——"
                  : currentPlayer ? `—— 轮至 · ${currentPlayer.name} ——`
                  : ""}
              </div>
            </div>
          </div>

          <PrizePanel
            prizePool={prizePool}
            lastDice={dice.map(d => d.value)}
            lastPrize={toast?.type === "win" || toast?.type === "zhuangyuan" ? toast.title : null}
          />

          <ControlPanel
            canThrow={canThrow}
            throwing={throwing}
            penaltyProb={penaltyProb}
            onThrow={handleThrow}
            onPenaltyChange={async (prob) => {
              const res = await api.setPenaltyProb(prob);
              setGameState(s => ({ ...s, penalty_prob: res.penalty_prob }));
            }}
            onEndEarly={handleReset}
          />
        </>
      )}

      {/* Steal notice */}
      {stealNotice && <StealNotice {...stealNotice} />}

      {/* Toast */}
      {toast && <Toast toast={toast} />}

      {/* Results modal */}
      {results && <ResultsModal results={results} onReplay={handleReset} />}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────

function Toast({ toast }) {
  const isWin = toast.type === "win" || toast.type === "zhuangyuan";
  return (
    <div style={{
      ...toastBase,
      ...(isWin ? toastWin : toast.type === "penalty" ? toastPenalty : toastGone),
    }}>
      <div style={toastTitle}>
        {isWin ? "恭喜！" : toast.type === "penalty" ? "可惜！" : ""}
      </div>
      <div>
        {isWin && (
          <>
            <span style={{ fontFamily: "Ma Shan Zheng, serif", fontSize: 32, letterSpacing: 3, color: "#FFE9A8" }}>
              {toast.title}
            </span>
            <div style={{ fontSize: 14, color: "#F5E7C8", marginTop: 4, letterSpacing: 2 }}>
              由 <span style={{ color: "#FFE9A8", fontWeight: 700 }}>{toast.name}</span> 博得
            </div>
          </>
        )}
        {toast.type === "penalty" && (
          <span style={{ fontFamily: "Ma Shan Zheng, serif", fontSize: 24, color: "#F5A5A8" }}>
            {toast.name} · 骰子掉出碗，罚一轮
          </span>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────

const hdStyles = {
  wrap: {
    position: "absolute", top: 22, left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center", zIndex: 40, pointerEvents: "none",
  },
  titleCh: {
    fontFamily: "Ma Shan Zheng, serif",
    fontSize: 44, color: "#FFE9A8", letterSpacing: 14,
    textShadow: "0 0 30px rgba(232,194,106,.45), 0 2px 8px rgba(0,0,0,.8)",
    lineHeight: 1,
  },
  titleSub: {
    fontFamily: "Noto Serif SC, serif",
    fontSize: 13, color: "rgba(245,231,200,.7)", marginTop: 8, letterSpacing: 4,
  },
};

const phaseLabel = {
  fontFamily: "Ma Shan Zheng, serif",
  fontSize: 18, color: "#FFE9A8", letterSpacing: 6,
  textShadow: "0 2px 8px rgba(0,0,0,.8)",
};

const toastBase = {
  position: "fixed", left: "50%", bottom: 100,
  transform: "translateX(-50%)",
  padding: "16px 32px",
  borderRadius: 14,
  backdropFilter: "blur(10px)",
  textAlign: "center",
  zIndex: 100,
  animation: "toastIn .3s ease-out",
  boxShadow: "0 12px 32px rgba(0,0,0,.6)",
};
const toastWin = {
  background: "linear-gradient(135deg, rgba(200,40,44,.95), rgba(90,15,18,.95))",
  border: "1.5px solid #E8C26A",
  boxShadow: "0 0 40px rgba(232,130,58,.5), 0 12px 32px rgba(0,0,0,.6)",
};
const toastGone = {
  background: "linear-gradient(135deg, rgba(30,30,50,.95), rgba(10,10,20,.95))",
  border: "1px solid rgba(226,58,63,.6)",
};
const toastPenalty = {
  background: "linear-gradient(135deg, rgba(30,30,50,.95), rgba(10,10,20,.95))",
  border: "1px solid rgba(212,168,75,.4)",
};
const toastTitle = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 10, letterSpacing: 4,
  color: "rgba(245,231,200,.6)", marginBottom: 4,
};
