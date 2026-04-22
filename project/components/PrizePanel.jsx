// Right-side prize panel. 六奖: 状元 对堂 三红 四进 二举 一秀 (总计 63 块)

const PRIZES = [
  { key:"zhuangyuan", name:"状元", total:1,  rank:1, glyph:"狀" },
  { key:"duitang",    name:"对堂", total:2,  rank:2, glyph:"對" },
  { key:"sanhong",    name:"三红", total:4,  rank:3, glyph:"參" },
  { key:"sijin",      name:"四进", total:8,  rank:4, glyph:"肆" },
  { key:"erju",       name:"二举", total:16, rank:5, glyph:"貳" },
  { key:"yixiu",      name:"一秀", total:32, rank:6, glyph:"壹" },
];

const PrizePanel = ({ counts, lastPrize, lastRoll }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  if (collapsed) {
    return (
      <button onClick={()=>setCollapsed(false)} style={ppStyles.tab}>
        <div style={ppStyles.tabLabel}>
          <div style={{fontFamily:"Ma Shan Zheng, serif", fontSize:18, color:"#FFE9A8", letterSpacing:2}}>奖品会饼</div>
          <div style={{fontFamily:"Noto Serif SC, serif", fontSize:11, color:"rgba(245,231,200,.65)", marginTop:2}}>展开</div>
        </div>
        <div style={ppStyles.tabGlyph}>饼</div>
      </button>
    );
  }

  return (
    <div style={ppStyles.panel}>
      <div style={ppStyles.titleRow}>
        <button onClick={()=>setCollapsed(true)} style={ppStyles.hideBtn} title="收起">⇥</button>
        <div style={{textAlign:"right"}}>
          <div style={ppStyles.titleCh}>奖品会饼</div>
          <div style={ppStyles.titleSub}>一套六十三块</div>
        </div>
      </div>
      <div style={ppStyles.divider}/>

      <div style={ppStyles.list}>
        {PRIZES.map(p => {
          const remaining = counts[p.key] ?? p.total;
          const pct = remaining / p.total;
          const empty = remaining <= 0;
          const isLast = lastPrize === p.key;
          return (
            <div key={p.key} style={{
              ...ppStyles.item,
              ...(empty ? ppStyles.itemEmpty : {}),
              ...(isLast ? ppStyles.itemLast : {}),
            }}>
              <div style={{
                ...ppStyles.glyph,
                background: rankBg(p.rank, empty),
                color: empty ? "rgba(255,230,180,.25)" : "#FFF6DC",
                borderColor: empty ? "rgba(212,168,75,.15)" : "rgba(232,194,106,.6)",
              }}>
                {p.glyph}
              </div>

              <div style={{flex:1, minWidth:0}}>
                <div style={{
                  fontFamily:"Ma Shan Zheng, serif",
                  fontSize:22,
                  letterSpacing:3,
                  color: empty ? "rgba(245,231,200,.3)" : "#FFE9A8",
                }}>{p.name}</div>
                <div style={ppStyles.barTrack}>
                  <div style={{
                    ...ppStyles.barFill,
                    width: `${pct*100}%`,
                    background: empty
                      ? "rgba(100,100,110,.3)"
                      : p.rank===1
                        ? "linear-gradient(to right,#FFE9A8,#D4A84B)"
                        : p.rank<=3
                          ? "linear-gradient(to right,#E23A3F,#C8282C)"
                          : "linear-gradient(to right,#E8823A,#C06020)",
                  }}/>
                </div>
              </div>

              <div style={{
                textAlign:"right",
                minWidth:62,
                fontFamily:"Noto Serif SC, serif",
              }}>
                <div style={{
                  fontSize:22,
                  fontWeight:700,
                  color: empty ? "rgba(245,231,200,.3)" : "#FFE9A8",
                  lineHeight:1,
                }}>{remaining}</div>
                <div style={{
                  fontSize:11,
                  color:"rgba(245,231,200,.45)",
                  marginTop:4,
                }}>共 {p.total}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={ppStyles.divider}/>

      <div style={ppStyles.lastTitle}>上一投</div>
      <div style={ppStyles.lastRow}>
        {(lastRoll && lastRoll.length===6) ? (
          lastRoll.map((v,i)=>(
            <div key={i} style={ppStyles.lastDie}><MiniDie value={v}/></div>
          ))
        ) : (
          <div style={ppStyles.lastEmpty}>尚未投掷</div>
        )}
      </div>
      {lastPrize ? (
        <div style={ppStyles.lastPrize}>
          本轮中奖 ·
          <span style={{
            fontFamily:"Ma Shan Zheng, serif", fontSize:20, color:"#FFE9A8",
            marginLeft:6, letterSpacing:3,
          }}>
            {PRIZES.find(p=>p.key===lastPrize)?.name}
          </span>
        </div>
      ) : lastRoll && lastRoll.length===6 ? (
        <div style={ppStyles.lastMiss}>未中奖</div>
      ) : null}
    </div>
  );
};

const rankBg = (rank, empty) => {
  if (empty) return "rgba(30,40,60,.4)";
  if (rank===1) return "linear-gradient(135deg,#E23A3F,#8E1A1E)";
  if (rank===2) return "linear-gradient(135deg,#C8282C,#5A0F12)";
  if (rank===3) return "linear-gradient(135deg,#E8823A,#9C4A18)";
  if (rank===4) return "linear-gradient(135deg,#C06020,#6E3010)";
  if (rank===5) return "linear-gradient(135deg,#8E6A20,#5A4010)";
  return "linear-gradient(135deg,#6B5218,#3A2A08)";
};

const MiniDie = ({ value }) => {
  const pips = window.pipPositions[value] || [];
  const pipCol = (value===1||value===4) ? "#E23A3F" : "#1a1a1a";
  return (
    <div style={{
      width:30, height:30, borderRadius:6,
      background:"linear-gradient(135deg,#FFF1B8 0%,#D4A84B 70%,#9C7A2E)",
      position:"relative",
      boxShadow:"inset 0 1px 2px rgba(255,255,255,.6), inset 0 -1px 2px rgba(120,80,20,.5), 0 2px 4px rgba(0,0,0,.5)",
    }}>
      {pips.map((p,i)=>(
        <div key={i} style={{
          position:"absolute", left:`${p[0]}%`, top:`${p[1]}%`,
          width:5, height:5, marginLeft:-2.5, marginTop:-2.5,
          borderRadius:"50%", background:pipCol,
          boxShadow:"inset 0 0 1px rgba(0,0,0,.6)",
        }}/>
      ))}
    </div>
  );
};

const ppStyles = {
  panel:{
    position:"absolute",
    right:28, top:28,
    width:300,
    padding:"16px 16px 14px",
    borderRadius:16,
    background:"linear-gradient(180deg, rgba(16,24,48,.72), rgba(10,16,32,.78))",
    border:"1px solid rgba(212,168,75,.35)",
    boxShadow:"0 18px 40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,230,180,.1)",
    backdropFilter:"blur(14px)",
    WebkitBackdropFilter:"blur(14px)",
    zIndex:40,
  },
  tab:{
    position:"absolute",
    right:16, top:28,
    display:"flex", alignItems:"center", gap:10,
    padding:"10px 10px 10px 14px",
    borderRadius:40,
    background:"linear-gradient(180deg, rgba(16,24,48,.68), rgba(10,16,32,.74))",
    border:"1px solid rgba(212,168,75,.4)",
    boxShadow:"0 10px 24px rgba(0,0,0,.5)",
    backdropFilter:"blur(10px)",
    WebkitBackdropFilter:"blur(10px)",
    cursor:"pointer",
    color:"#F5E7C8",
    zIndex:40,
  },
  tabGlyph:{
    width:38, height:38, borderRadius:"50%",
    display:"flex", alignItems:"center", justifyContent:"center",
    background:"linear-gradient(135deg,#D4A84B,#8E6A20)",
    border:"1.5px solid rgba(232,194,106,.7)",
    fontFamily:"Ma Shan Zheng, serif",
    fontSize:22,
    color:"#FFF6DC",
    boxShadow:"inset 0 1px 0 rgba(255,230,180,.3)",
  },
  tabLabel:{textAlign:"right"},
  hideBtn:{
    width:26, height:26,
    borderRadius:6,
    background:"rgba(212,168,75,.15)",
    border:"1px solid rgba(212,168,75,.4)",
    color:"#E8C26A",
    fontSize:14,
    lineHeight:"22px",
    cursor:"pointer",
    padding:0,
  },
  titleRow:{display:"flex", alignItems:"baseline", justifyContent:"space-between"},
  titleCh:{fontFamily:"Ma Shan Zheng, serif", fontSize:26, color:"#FFE9A8", letterSpacing:2},
  titleSub:{fontFamily:"Noto Serif SC, serif", fontSize:11, color:"rgba(245,231,200,.6)", marginTop:2, letterSpacing:1},
  divider:{margin:"12px 0", height:1, background:"linear-gradient(to right, transparent, rgba(212,168,75,.4), transparent)"},
  list:{display:"flex", flexDirection:"column", gap:8},
  item:{
    display:"flex", alignItems:"center", gap:12,
    padding:"8px 10px",
    borderRadius:10,
    background:"rgba(255,255,255,.03)",
    border:"1px solid rgba(212,168,75,.15)",
    transition:"all .35s",
  },
  itemEmpty:{opacity:.6, background:"rgba(0,0,0,.2)"},
  itemLast:{
    background:"rgba(232,130,58,.18)",
    border:"1px solid rgba(232,194,106,.7)",
    boxShadow:"0 0 20px rgba(232,130,58,.35)",
  },
  glyph:{
    width:44, height:44, flexShrink:0,
    borderRadius:8,
    border:"1.5px solid",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"Ma Shan Zheng, serif",
    fontSize:26,
    boxShadow:"inset 0 1px 0 rgba(255,230,180,.3), inset 0 -1px 2px rgba(0,0,0,.3)",
  },
  barTrack:{
    marginTop:6,
    height:4,
    borderRadius:2,
    background:"rgba(0,0,0,.45)",
    overflow:"hidden",
    border:"1px solid rgba(212,168,75,.15)",
  },
  barFill:{height:"100%", transition:"width .5s ease"},
  lastTitle:{
    fontFamily:"Noto Serif SC, serif",
    fontSize:12,
    letterSpacing:3,
    color:"rgba(245,231,200,.65)",
    marginBottom:8,
  },
  lastRow:{
    display:"flex", gap:6, justifyContent:"center",
    padding:"10px",
    background:"rgba(0,0,0,.3)",
    borderRadius:8,
    border:"1px solid rgba(212,168,75,.2)",
    minHeight:42,
    alignItems:"center",
  },
  lastDie:{display:"flex"},
  lastEmpty:{
    fontFamily:"Noto Serif SC, serif",
    fontSize:12,
    color:"rgba(245,231,200,.4)",
    fontStyle:"italic",
  },
  lastPrize:{
    marginTop:10,
    padding:"8px",
    textAlign:"center",
    background:"linear-gradient(135deg, rgba(200,40,44,.3), rgba(232,130,58,.25))",
    border:"1px solid rgba(232,194,106,.5)",
    borderRadius:8,
    fontFamily:"Noto Serif SC, serif",
    fontSize:12,
    color:"#F5E7C8",
    letterSpacing:1,
  },
  lastMiss:{
    marginTop:10,
    padding:"6px",
    textAlign:"center",
    fontFamily:"Noto Serif SC, serif",
    fontSize:12,
    color:"rgba(245,231,200,.45)",
    letterSpacing:2,
  },
};

window.PrizePanel = PrizePanel;
window.PRIZES = PRIZES;
window.MiniDie = MiniDie;
