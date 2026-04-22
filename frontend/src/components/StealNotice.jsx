const css = document.createElement("style");
css.textContent = `
  @keyframes stealIn {
    from { opacity: 0; transform: translate(-50%, -20px) scale(.9); }
    to   { opacity: 1; transform: translate(-50%, 0) scale(1); }
  }
`;
document.head.appendChild(css);

export default function StealNotice({ stealer, from, prize }) {
  return (
    <div style={s.wrap}>
      <div style={s.icon}>⚔</div>
      <div>
        <div style={s.title}>抢夺成功！</div>
        <div style={s.body}>
          <span style={s.name}>{stealer}</span>
          <span style={s.mid}> 从 </span>
          <span style={s.name}>{from}</span>
          <span style={s.mid}> 手中抢得 </span>
          <span style={s.prize}>{prize}</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    position: "fixed", left: "50%", top: "30%",
    transform: "translateX(-50%)",
    display: "flex", alignItems: "center", gap: 14,
    padding: "16px 28px",
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(200,40,44,.95), rgba(90,15,18,.97))",
    border: "2px solid #E8C26A",
    boxShadow: "0 0 60px rgba(232,130,58,.6), 0 20px 40px rgba(0,0,0,.7)",
    zIndex: 150,
    animation: "stealIn .35s cubic-bezier(.34,1.56,.64,1)",
    backdropFilter: "blur(10px)",
  },
  icon: { fontSize: 32, lineHeight: 1 },
  title: { fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: 4, color: "rgba(245,231,200,.7)", marginBottom: 4 },
  body: { fontFamily: "Noto Serif SC, serif", fontSize: 15, color: "#F5E7C8" },
  name: { color: "#FFE9A8", fontWeight: 700 },
  mid: { color: "rgba(245,231,200,.75)" },
  prize: { fontFamily: "Ma Shan Zheng, serif", fontSize: 20, color: "#FFE9A8", letterSpacing: 3 },
};
