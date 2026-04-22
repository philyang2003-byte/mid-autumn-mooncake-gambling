export default function ControlPanel({ canThrow, throwing, penaltyProb, onThrow, onPenaltyChange, onEndEarly }) {
  return (
    <div style={s.wrap}>
      {/* End early button */}
      <button onClick={onEndEarly} style={s.endBtn}>提前结束</button>

      {/* Throw button */}
      <button
        disabled={!canThrow}
        onClick={onThrow}
        style={{ ...s.throwBtn, ...(canThrow ? {} : s.throwBtnDisabled) }}
      >
        <span style={s.label}>{throwing ? "投掷中" : "掷 骰"}</span>
        <span style={s.hint}>{throwing ? "骰落碗中" : canThrow ? "按空格或点击" : "游戏已结束"}</span>
      </button>

      {/* Penalty prob adjuster */}
      <div style={s.probWrap}>
        <span style={s.probLabel}>掉碗概率</span>
        <input
          type="range" min={0} max={50} step={1}
          value={Math.round(penaltyProb * 100)}
          onChange={e => onPenaltyChange(+e.target.value / 100)}
          style={s.slider}
        />
        <span style={s.probVal}>{Math.round(penaltyProb * 100)}%</span>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    position: "fixed", right: 28, bottom: 28,
    display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10,
    zIndex: 50,
  },
  throwBtn: {
    minWidth: 200, padding: "14px 36px", borderRadius: 60,
    background: "linear-gradient(180deg, #E23A3F 0%, #C8282C 50%, #8E1A1E 100%)",
    border: "2px solid #E8C26A", color: "#FFE9A8",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
    boxShadow: "0 10px 30px rgba(200,40,44,.55), 0 0 40px rgba(232,130,58,.25), inset 0 2px 0 rgba(255,230,180,.5), inset 0 -3px 6px rgba(90,15,18,.7)",
    transition: "transform .15s",
    cursor: "pointer",
  },
  throwBtnDisabled: {
    background: "linear-gradient(180deg, rgba(60,60,70,.75), rgba(30,30,40,.85))",
    borderColor: "rgba(212,168,75,.3)", color: "rgba(245,231,200,.45)",
    cursor: "not-allowed", boxShadow: "0 6px 16px rgba(0,0,0,.5)",
  },
  label: { fontFamily: "Ma Shan Zheng, serif", fontSize: 26, letterSpacing: 10, paddingLeft: 10 },
  hint: { fontFamily: "Noto Serif SC, serif", fontSize: 11, letterSpacing: 3, opacity: .75 },
  probWrap: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 14px", borderRadius: 40,
    background: "rgba(10,16,32,.7)", border: "1px solid rgba(212,168,75,.25)",
    backdropFilter: "blur(8px)",
  },
  probLabel: { fontFamily: "Noto Serif SC, serif", fontSize: 11, color: "rgba(245,231,200,.65)", letterSpacing: 1, whiteSpace: "nowrap" },
  slider: { width: 110, accentColor: "#E8C26A" },
  probVal: { fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#FFE9A8", minWidth: 32 },
  endBtn: {
    padding: "6px 16px", borderRadius: 20,
    background: "rgba(10,16,32,.75)", border: "1px solid rgba(212,168,75,.3)",
    color: "rgba(245,231,200,.55)", fontFamily: "Noto Serif SC, serif",
    fontSize: 12, letterSpacing: 2, cursor: "pointer",
    backdropFilter: "blur(8px)",
    transition: "opacity .15s",
  },
};
