const PRIZE_NAMES = {
  zhuangyuan: "状元", duitang: "对堂", sanhong: "三红",
  sijin: "四进", erju: "二举", yixiu: "一秀",
};

const css = document.createElement("style");
css.textContent = `
  @keyframes resultsIn { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
`;
document.head.appendChild(css);

export default function ResultsModal({ results, onReplay }) {
  const { results: list, zhuangyuan_winner_id, zhuangyuan_label } = results;
  const winner = list.find(r => r.player.id === zhuangyuan_winner_id);

  return (
    <div style={s.backdrop}>
      <div style={s.modal}>
        <div style={s.title}>博饼结束</div>
        {winner && (
          <div style={s.heroWrap}>
            <div style={s.heroLabel}>状元得主</div>
            <div style={s.heroName}>{winner.player.name}</div>
            <div style={s.heroSub}>{zhuangyuan_label}</div>
          </div>
        )}

        <div style={s.divider} />
        <div style={s.listTitle}>获奖统计</div>

        <div style={s.list}>
          {list.map((r, i) => (
            <div key={r.player.id} style={{ ...s.row, ...(r.player.id === zhuangyuan_winner_id ? s.rowWinner : {}) }}>
              <span style={s.rank}>#{i + 1}</span>
              <div style={s.playerInfo}>
                <span style={s.pName}>{r.player.name}</span>
                <span style={s.pAge}>{r.player.age} 岁</span>
              </div>
              <div style={s.prizes}>
                {r.items.length === 0
                  ? <span style={s.noPrize}>未中奖</span>
                  : r.items.map(item => (
                    <span key={item.key} style={{ ...s.chip, ...(item.key === "zhuangyuan" ? s.chipGold : {}) }}>
                      {item.name} ×{item.count}
                    </span>
                  ))}
              </div>
              <span style={s.total}>{r.total > 0 ? `共 ${r.total} 份` : ""}</span>
            </div>
          ))}
        </div>

        <div style={s.divider} />
        <button onClick={onReplay} style={s.replayBtn}>再博一局</button>
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(5,8,16,.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { width: 520, maxHeight: "88vh", overflowY: "auto", padding: "28px 28px 24px", borderRadius: 20, background: "linear-gradient(180deg, rgba(18,28,54,.97), rgba(10,16,32,.99))", border: "1.5px solid rgba(212,168,75,.5)", boxShadow: "0 40px 80px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,230,180,.12)", color: "#F5E7C8", animation: "resultsIn .35s cubic-bezier(.34,1.56,.64,1)" },
  title: { fontFamily: "Ma Shan Zheng, serif", fontSize: 40, color: "#FFE9A8", letterSpacing: 12, textAlign: "center", lineHeight: 1 },
  heroWrap: { margin: "20px 0 0", padding: "16px", background: "linear-gradient(135deg, rgba(200,40,44,.35), rgba(90,15,18,.35))", border: "1.5px solid #E8C26A", borderRadius: 12, textAlign: "center", boxShadow: "0 0 30px rgba(232,194,106,.2)" },
  heroLabel: { fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: 4, color: "rgba(245,231,200,.6)", marginBottom: 6 },
  heroName: { fontFamily: "Ma Shan Zheng, serif", fontSize: 36, color: "#FFE9A8", letterSpacing: 6 },
  heroSub: { fontFamily: "Noto Serif SC, serif", fontSize: 13, color: "rgba(245,231,200,.7)", marginTop: 4, letterSpacing: 2 },
  divider: { margin: "16px 0", height: 1, background: "linear-gradient(to right, transparent, rgba(212,168,75,.4), transparent)" },
  listTitle: { fontFamily: "Noto Serif SC, serif", fontSize: 12, letterSpacing: 3, color: "rgba(245,231,200,.65)", marginBottom: 10 },
  list: { display: "flex", flexDirection: "column", gap: 6 },
  row: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(212,168,75,.12)" },
  rowWinner: { background: "rgba(232,194,106,.1)", border: "1px solid rgba(232,194,106,.5)" },
  rank: { fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "rgba(212,168,75,.8)", width: 24 },
  playerInfo: { display: "flex", flexDirection: "column", minWidth: 80 },
  pName: { fontFamily: "Noto Serif SC, serif", fontWeight: 700, fontSize: 15, color: "#F5E7C8" },
  pAge: { fontFamily: "Noto Serif SC, serif", fontSize: 11, color: "rgba(245,231,200,.5)" },
  prizes: { flex: 1, display: "flex", flexWrap: "wrap", gap: 4 },
  chip: { fontFamily: "Ma Shan Zheng, serif", fontSize: 12, padding: "2px 7px", borderRadius: 4, background: "rgba(232,194,106,.15)", border: "1px solid rgba(232,194,106,.4)", color: "#FFE9A8" },
  chipGold: { background: "rgba(200,40,44,.3)", border: "1px solid #E8C26A", color: "#FFE9A8" },
  noPrize: { fontFamily: "Noto Serif SC, serif", fontSize: 12, color: "rgba(245,231,200,.3)", fontStyle: "italic" },
  total: { fontFamily: "Noto Serif SC, serif", fontSize: 11, color: "rgba(245,231,200,.5)", whiteSpace: "nowrap" },
  replayBtn: { width: "100%", padding: "14px", borderRadius: 10, background: "linear-gradient(180deg, #E23A3F 0%, #C8282C 50%, #8E1A1E 100%)", border: "2px solid #E8C26A", color: "#FFE9A8", fontFamily: "Ma Shan Zheng, serif", fontSize: 22, letterSpacing: 6, cursor: "pointer", boxShadow: "0 8px 24px rgba(200,40,44,.5), inset 0 2px 0 rgba(255,230,180,.4)" },
};
