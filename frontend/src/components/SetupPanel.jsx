import { useState } from "react";

export default function SetupPanel({ players, penaltyProb, onAdd, onRemove, onPenaltyChange, onStart }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [warn, setWarn] = useState("");
  const [error, setError] = useState("");

  const full = players.length >= 12;
  const canAdd = !full && name.trim() && /^\d+$/.test(age) && +age > 0 && +age < 120;

  const handleAdd = async () => {
    if (!canAdd) return;
    setError("");
    setWarn("");
    try {
      const res = await onAdd(name.trim(), +age);
      if (res.warned) {
        setWarn(`"${name.trim()}" 已存在，已自动改名为 "${res.actual_name}"`);
      }
      setName("");
      setAge("");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        {/* Title */}
        <div style={s.title}>中秋博饼</div>
        <div style={s.sub}>添加玩家，开始博饼</div>
        <div style={s.divider} />

        {/* Add form */}
        <div style={s.row}>
          <div style={s.field}>
            <label style={s.label}>姓名</label>
            <input
              value={name}
              maxLength={10}
              disabled={full}
              onChange={e => { setName(e.target.value); setWarn(""); setError(""); }}
              onKeyDown={handleKey}
              placeholder={full ? "—" : "请输入姓名"}
              style={{ ...s.input, ...(full ? s.inputDisabled : {}) }}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>年龄</label>
            <input
              value={age}
              maxLength={3}
              disabled={full}
              onChange={e => setAge(e.target.value.replace(/[^\d]/g, ""))}
              onKeyDown={handleKey}
              placeholder={full ? "—" : "0-120"}
              style={{ ...s.input, ...(full ? s.inputDisabled : {}), width: 80 }}
            />
          </div>
          <button
            disabled={!canAdd}
            onClick={handleAdd}
            style={{ ...s.addBtn, ...(canAdd ? {} : s.addBtnDisabled) }}
          >＋ 添加</button>
        </div>

        {warn && <div style={s.warnBox}>{warn}</div>}
        {error && <div style={s.errorBox}>{error}</div>}
        {full && <div style={s.errorBox}>已达最多 12 人</div>}

        {/* Player list */}
        {players.length > 0 && (
          <>
            <div style={s.divider} />
            <div style={s.listTitle}>已入座玩家 ({players.length}/12)</div>
            <div style={s.list}>
              {players.map((p, i) => (
                <div key={p.id} style={s.playerRow}>
                  <span style={s.seat}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={s.pName}>{p.name}</span>
                  <span style={s.pAge}>{p.age} 岁</span>
                  <button onClick={() => onRemove(p.id)} style={s.removeBtn}>×</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Penalty prob */}
        <div style={s.divider} />
        <div style={s.penaltyRow}>
          <span style={s.label}>骰子掉出碗概率</span>
          <input
            type="range" min={0} max={50} step={1}
            value={Math.round(penaltyProb * 100)}
            onChange={e => onPenaltyChange(+e.target.value / 100)}
            style={s.slider}
          />
          <span style={s.probVal}>{Math.round(penaltyProb * 100)}%</span>
        </div>
        <div style={s.penaltyDesc}>触发时当前玩家罚一轮（跳过本次投掷）</div>

        {/* Start */}
        <div style={s.divider} />
        <button
          disabled={players.length < 2}
          onClick={onStart}
          style={{ ...s.startBtn, ...(players.length < 2 ? s.startBtnDisabled : {}) }}
        >
          {players.length < 2 ? "请至少添加 2 名玩家" : "开始博饼 →"}
        </button>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100,
  },
  card: {
    width: 480, maxHeight: "88vh", overflowY: "auto",
    padding: "28px 28px 24px",
    borderRadius: 20,
    background: "linear-gradient(180deg, rgba(18,28,54,.97), rgba(10,16,32,.99))",
    border: "1.5px solid rgba(212,168,75,.5)",
    boxShadow: "0 40px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(232,194,106,.1), inset 0 1px 0 rgba(255,230,180,.12)",
    color: "#F5E7C8",
  },
  title: { fontFamily: "Ma Shan Zheng, serif", fontSize: 38, color: "#FFE9A8", letterSpacing: 12, textAlign: "center", lineHeight: 1 },
  sub: { fontFamily: "Noto Serif SC, serif", fontSize: 13, color: "rgba(245,231,200,.6)", textAlign: "center", marginTop: 8, letterSpacing: 3 },
  divider: { margin: "16px 0", height: 1, background: "linear-gradient(to right, transparent, rgba(212,168,75,.4), transparent)" },
  row: { display: "flex", alignItems: "flex-end", gap: 10 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontFamily: "Noto Serif SC, serif", fontSize: 12, letterSpacing: 2, color: "rgba(245,231,200,.75)" },
  input: {
    padding: "10px 12px", background: "rgba(8,12,24,.75)",
    border: "1px solid rgba(212,168,75,.4)", borderRadius: 8,
    color: "#F5E7C8", fontFamily: "Noto Serif SC, serif", fontSize: 15,
    outline: "none", width: "100%",
  },
  inputDisabled: { opacity: .35, cursor: "not-allowed" },
  addBtn: {
    padding: "10px 18px", borderRadius: 8,
    background: "linear-gradient(135deg, #D4A84B, #9C7A2E)",
    border: "1px solid #E8C26A", color: "#1A1208",
    fontFamily: "Noto Serif SC, serif", fontWeight: 700, fontSize: 15,
    letterSpacing: 1, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
    boxShadow: "0 4px 12px rgba(212,168,75,.3), inset 0 1px 0 rgba(255,255,255,.3)",
    alignSelf: "flex-end",
  },
  addBtnDisabled: { background: "rgba(60,60,70,.5)", color: "rgba(245,231,200,.3)", borderColor: "rgba(212,168,75,.2)", cursor: "not-allowed", boxShadow: "none" },
  warnBox: { marginTop: 8, padding: "7px 10px", background: "rgba(212,168,75,.15)", border: "1px solid rgba(212,168,75,.4)", borderRadius: 6, fontFamily: "Noto Serif SC, serif", fontSize: 12, color: "#FFE9A8", letterSpacing: 0.5 },
  errorBox: { marginTop: 8, padding: "7px 10px", background: "rgba(200,40,44,.15)", border: "1px solid rgba(226,58,63,.5)", borderRadius: 6, fontFamily: "Noto Serif SC, serif", fontSize: 12, color: "#F5A5A8" },
  listTitle: { fontFamily: "Noto Serif SC, serif", fontSize: 12, letterSpacing: 2, color: "rgba(245,231,200,.65)", marginBottom: 8 },
  list: { maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 },
  playerRow: { display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6, background: "rgba(255,255,255,.03)", border: "1px solid rgba(212,168,75,.12)", fontSize: 13 },
  seat: { fontFamily: "Noto Serif SC, serif", fontSize: 11, color: "rgba(212,168,75,.7)", width: 22 },
  pName: { flex: 1, fontFamily: "Noto Serif SC, serif", color: "#F5E7C8", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  pAge: { fontFamily: "Noto Serif SC, serif", fontSize: 12, color: "rgba(245,231,200,.55)" },
  removeBtn: { width: 22, height: 22, borderRadius: "50%", background: "rgba(226,58,63,.2)", border: "1px solid rgba(226,58,63,.4)", color: "#F5A5A8", fontSize: 14, cursor: "pointer", padding: 0 },
  penaltyRow: { display: "flex", alignItems: "center", gap: 10 },
  slider: { flex: 1, accentColor: "#E8C26A" },
  probVal: { fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: "#FFE9A8", minWidth: 36, textAlign: "right" },
  penaltyDesc: { fontFamily: "Noto Serif SC, serif", fontSize: 11, color: "rgba(245,231,200,.45)", marginTop: 4, letterSpacing: 0.5 },
  startBtn: {
    width: "100%", padding: "14px",
    borderRadius: 10,
    background: "linear-gradient(180deg, #E23A3F 0%, #C8282C 50%, #8E1A1E 100%)",
    border: "2px solid #E8C26A", color: "#FFE9A8",
    fontFamily: "Ma Shan Zheng, serif", fontSize: 22, letterSpacing: 6,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(200,40,44,.5), inset 0 2px 0 rgba(255,230,180,.4)",
  },
  startBtnDisabled: { background: "rgba(40,40,55,.8)", borderColor: "rgba(212,168,75,.25)", color: "rgba(245,231,200,.3)", cursor: "not-allowed", boxShadow: "none" },
};
