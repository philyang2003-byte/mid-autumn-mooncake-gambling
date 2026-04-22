// Players arranged in a ring around the bowl.
// Active player's card glows gold and scales up.

const PlayerRing = ({ players, activeIdx, radiusX=440, radiusY=360, centerX, centerY }) => {
  if (!players.length) return null;
  const n = players.length;
  return (
    <>
      {players.map((p, i) => {
        // Start offset so NO player sits directly at 12 o'clock (collides with header).
        // We rotate by half a slot so the top of the ring has two players flanking the gap.
        const angle = -Math.PI/2 + Math.PI/n + (2*Math.PI*i)/n;
        const x = centerX + Math.cos(angle)*radiusX;
        const y = centerY + Math.sin(angle)*radiusY;
        const active = i === activeIdx;
        return (
          <PlayerCard key={p.id} player={p} active={active} x={x} y={y}/>
        );
      })}
    </>
  );
};

const PlayerCard = ({ player, active, x, y }) => {
  return (
    <div style={{
      position:"absolute",
      left:x, top:y,
      transform:`translate(-50%,-50%) scale(${active?1.12:1})`,
      transition:"transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .3s, filter .3s",
      zIndex: active ? 30 : 15,
      pointerEvents:"auto",
    }}>
      <div style={{
        position:"relative",
        width:150,
        padding:"14px 14px 12px",
        borderRadius:14,
        background: active
          ? "linear-gradient(135deg, rgba(200,40,44,.95), rgba(90,15,18,.95))"
          : "linear-gradient(135deg, rgba(28,40,68,.9), rgba(14,22,44,.92))",
        border: active
          ? "1.5px solid #E8C26A"
          : "1px solid rgba(212,168,75,.35)",
        boxShadow: active
          ? "0 0 0 2px rgba(232,194,106,.4), 0 0 30px rgba(232,130,58,.55), 0 12px 26px rgba(0,0,0,.55)"
          : "0 6px 16px rgba(0,0,0,.5)",
        backdropFilter:"blur(8px)",
      }}>
        {/* Avatar */}
        <div style={{
          display:"flex", alignItems:"center", gap:10,
        }}>
          <div style={{
            width:40, height:40, borderRadius:"50%",
            background: active
              ? "radial-gradient(circle at 35% 30%, #FFE9A8, #D4A84B 60%, #8E6A20)"
              : "radial-gradient(circle at 35% 30%, #7A8AB0, #2D3A5E 60%, #162344)",
            border: active ? "1.5px solid #FFE9A8" : "1px solid rgba(212,168,75,.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"Ma Shan Zheng, serif",
            fontSize:22,
            color: active ? "#5A0F12" : "#E8C26A",
            flexShrink:0,
          }}>
            {player.name ? player.name[0] : "？"}
          </div>
          <div style={{minWidth:0, flex:1}}>
            <div style={{
              fontFamily:"Noto Serif SC, serif",
              fontWeight:700,
              fontSize:15,
              color: active ? "#FFF6DC" : "#F5E7C8",
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              letterSpacing:".5px",
            }}>{player.name}</div>
            <div style={{
              fontSize:11,
              color: active ? "rgba(255,246,220,.75)" : "rgba(245,231,200,.5)",
              fontFamily:"Noto Serif SC, serif",
              marginTop:2,
            }}>{player.age} 岁</div>
          </div>
        </div>

        {/* Prize chips (won prizes) */}
        {player.wins && player.wins.length>0 && (
          <div style={{
            marginTop:8,
            display:"flex", flexWrap:"wrap", gap:3,
          }}>
            {player.wins.slice(-4).map((w,i)=>(
              <span key={i} style={{
                fontFamily:"Ma Shan Zheng, serif",
                fontSize:11,
                padding:"1px 5px",
                borderRadius:3,
                background:"rgba(232,194,106,.2)",
                border:"1px solid rgba(232,194,106,.5)",
                color:"#FFE9A8",
              }}>{w}</span>
            ))}
            {player.wins.length > 4 && (
              <span style={{fontSize:10, color:"rgba(255,246,220,.6)", alignSelf:"center"}}>+{player.wins.length-4}</span>
            )}
          </div>
        )}

        {/* Active indicator - "投掷中" tag */}
        {active && (
          <div style={{
            position:"absolute",
            top:-14, left:"50%",
            transform:"translateX(-50%)",
            background:"linear-gradient(135deg, #E8C26A, #D4A84B)",
            color:"#5A0F12",
            fontFamily:"Ma Shan Zheng, serif",
            fontSize:13,
            padding:"2px 10px",
            borderRadius:10,
            whiteSpace:"nowrap",
            boxShadow:"0 2px 8px rgba(0,0,0,.5)",
            animation:"activePulse 2s ease-in-out infinite",
          }}>即将投掷</div>
        )}
      </div>
    </div>
  );
};

const ringCss = document.createElement("style");
ringCss.textContent = `
  @keyframes activePulse {
    0%,100% { transform: translateX(-50%) scale(1); box-shadow: 0 2px 8px rgba(0,0,0,.5); }
    50%     { transform: translateX(-50%) scale(1.06); box-shadow: 0 2px 14px rgba(232,130,58,.7); }
  }
`;
document.head.appendChild(ringCss);

window.PlayerRing = PlayerRing;
