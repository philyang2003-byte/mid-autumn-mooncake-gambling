// Two floating controls:
//   AddPlayerControl — compact pill at top-left; click to open modal with 姓名/年龄 form
//   ThrowButton       — standalone red-gold "掷骰" button at bottom center
// All copy is Chinese-only (no English).

const MAX_PLAYERS = 12;

const AddPlayerControl = ({ players, onAdd, onRemove }) => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState("");
  const full = players.length >= MAX_PLAYERS;
  const canAdd = !full && name.trim() && /^\d+$/.test(age) && +age>0 && +age<120;

  const submit = () => {
    if (!canAdd) return;
    onAdd({ name: name.trim(), age: +age });
    setName(""); setAge("");
  };

  return (
    <>
      {/* Pill trigger */}
      <button onClick={()=>setOpen(true)} style={cpStyles.pill}>
        <span style={cpStyles.pillGlyph}>席</span>
        <span style={cpStyles.pillText}>
          <span style={cpStyles.pillTitle}>人物添加</span>
          <span style={cpStyles.pillCount}>{players.length} / {MAX_PLAYERS} 人</span>
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div style={cpStyles.backdrop} onClick={()=>setOpen(false)}>
          <div style={cpStyles.modal} onClick={e=>e.stopPropagation()}>
            <div style={cpStyles.modalHeader}>
              <div>
                <div style={cpStyles.modalTitle}>人物添加</div>
                <div style={cpStyles.modalSub}>席位 {players.length} / {MAX_PLAYERS}</div>
              </div>
              <button onClick={()=>setOpen(false)} style={cpStyles.closeBtn}>×</button>
            </div>

            <div style={cpStyles.divider}/>

            <div style={cpStyles.fieldLabel}>姓名</div>
            <input
              disabled={full}
              value={name}
              maxLength={10}
              onChange={e=>setName(e.target.value)}
              onKeyDown={e=>e.key==="Enter" && submit()}
              placeholder={full ? "—" : "请输入姓名"}
              style={{...cpStyles.input, ...(full?cpStyles.inputDisabled:{})}}
            />

            <div style={cpStyles.fieldLabel}>年龄</div>
            <input
              disabled={full}
              value={age}
              maxLength={3}
              onChange={e=>setAge(e.target.value.replace(/[^\d]/g,""))}
              onKeyDown={e=>e.key==="Enter" && submit()}
              placeholder={full ? "—" : "请输入年龄"}
              style={{...cpStyles.input, ...(full?cpStyles.inputDisabled:{})}}
            />

            <button
              disabled={!canAdd}
              onClick={submit}
              style={{
                ...cpStyles.addBtn,
                ...(canAdd ? {} : cpStyles.addBtnDisabled),
              }}
            >
              {full ? "已达到最多 12 人" : "＋ 添加玩家"}
            </button>

            {full && (
              <div style={cpStyles.warn}>已达到最多 12 人</div>
            )}

            {players.length>0 && (
              <>
                <div style={cpStyles.divider}/>
                <div style={cpStyles.listTitle}>已入座玩家</div>
                <div style={cpStyles.list}>
                  {players.map((p, i)=>(
                    <div key={p.id} style={cpStyles.row}>
                      <span style={cpStyles.seatNum}>{String(i+1).padStart(2,"0")}</span>
                      <span style={cpStyles.rowName}>{p.name}</span>
                      <span style={cpStyles.rowAge}>{p.age} 岁</span>
                      <button onClick={()=>onRemove(p.id)} style={cpStyles.removeBtn} title="移除">×</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const ThrowButton = ({ canThrow, onThrow, phase }) => (
  <button
    disabled={!canThrow}
    onClick={onThrow}
    style={{
      ...cpStyles.throwBtn,
      ...(canThrow?{}:cpStyles.throwBtnDisabled),
    }}
  >
    <span style={cpStyles.throwLabel}>
      {phase==="rolling" ? "投掷中" : "掷 骰"}
    </span>
    <span style={cpStyles.throwHint}>
      {phase==="rolling" ? "骰落碗中" : canThrow ? "按空格或点击" : "请先添加玩家"}
    </span>
  </button>
);

const cpStyles = {
  // Pill trigger (top-left)
  pill:{
    position:"absolute",
    left:28, top:28,
    display:"flex", alignItems:"center", gap:12,
    padding:"10px 18px 10px 10px",
    borderRadius:40,
    background:"linear-gradient(180deg, rgba(16,24,48,.72), rgba(10,16,32,.78))",
    border:"1px solid rgba(212,168,75,.4)",
    boxShadow:"0 10px 24px rgba(0,0,0,.5)",
    backdropFilter:"blur(12px)",
    WebkitBackdropFilter:"blur(12px)",
    cursor:"pointer",
    color:"#F5E7C8",
    zIndex:40,
  },
  pillGlyph:{
    width:38, height:38, borderRadius:"50%",
    display:"flex", alignItems:"center", justifyContent:"center",
    background:"linear-gradient(135deg,#E23A3F,#8E1A1E)",
    border:"1.5px solid rgba(232,194,106,.7)",
    fontFamily:"Ma Shan Zheng, serif",
    fontSize:22,
    color:"#FFE9A8",
    boxShadow:"inset 0 1px 0 rgba(255,230,180,.3)",
  },
  pillText:{display:"flex", flexDirection:"column", alignItems:"flex-start", lineHeight:1.15},
  pillTitle:{fontFamily:"Ma Shan Zheng, serif", fontSize:18, color:"#FFE9A8", letterSpacing:2},
  pillCount:{fontFamily:"Noto Serif SC, serif", fontSize:11, color:"rgba(245,231,200,.65)", marginTop:2, letterSpacing:1},

  // Modal
  backdrop:{
    position:"fixed", inset:0,
    background:"rgba(5,8,16,.55)",
    backdropFilter:"blur(4px)",
    WebkitBackdropFilter:"blur(4px)",
    display:"flex", alignItems:"center", justifyContent:"center",
    zIndex:200,
    animation:"backdropIn .2s ease-out",
  },
  modal:{
    width:340,
    maxHeight:"86vh",
    overflowY:"auto",
    padding:"20px 22px 18px",
    borderRadius:16,
    background:"linear-gradient(180deg, rgba(18,28,54,.96), rgba(10,16,32,.98))",
    border:"1.5px solid rgba(212,168,75,.5)",
    boxShadow:"0 30px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(232,194,106,.1), inset 0 1px 0 rgba(255,230,180,.12)",
    color:"#F5E7C8",
    animation:"modalIn .25s cubic-bezier(.34,1.56,.64,1)",
  },
  modalHeader:{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10},
  modalTitle:{fontFamily:"Ma Shan Zheng, serif", fontSize:28, color:"#FFE9A8", letterSpacing:3, lineHeight:1},
  modalSub:{fontFamily:"Noto Serif SC, serif", fontSize:12, color:"rgba(245,231,200,.6)", marginTop:4, letterSpacing:1},
  closeBtn:{
    width:28, height:28, borderRadius:"50%",
    background:"rgba(255,255,255,.06)",
    border:"1px solid rgba(212,168,75,.35)",
    color:"#E8C26A", fontSize:18, lineHeight:"22px",
    cursor:"pointer", padding:0,
  },
  divider:{margin:"14px 0", height:1, background:"linear-gradient(to right, transparent, rgba(212,168,75,.4), transparent)"},
  fieldLabel:{
    fontFamily:"Noto Serif SC, serif",
    fontSize:13,
    letterSpacing:2,
    color:"rgba(245,231,200,.75)",
    marginBottom:6,
    marginTop:10,
  },
  input:{
    width:"100%",
    padding:"10px 12px",
    background:"rgba(8,12,24,.75)",
    border:"1px solid rgba(212,168,75,.4)",
    borderRadius:8,
    color:"#F5E7C8",
    fontFamily:"Noto Serif SC, serif",
    fontSize:15,
    outline:"none",
    boxSizing:"border-box",
  },
  inputDisabled:{
    opacity:.35, cursor:"not-allowed",
    borderColor:"rgba(212,168,75,.15)",
  },
  addBtn:{
    marginTop:16,
    width:"100%",
    padding:"11px",
    borderRadius:8,
    background:"linear-gradient(135deg, #D4A84B, #9C7A2E)",
    border:"1px solid #E8C26A",
    color:"#1A1208",
    fontFamily:"Noto Serif SC, serif",
    fontWeight:700,
    fontSize:15,
    letterSpacing:2,
    cursor:"pointer",
    boxShadow:"0 4px 12px rgba(212,168,75,.3), inset 0 1px 0 rgba(255,255,255,.3)",
  },
  addBtnDisabled:{
    background:"rgba(60,60,70,.5)",
    color:"rgba(245,231,200,.3)",
    borderColor:"rgba(212,168,75,.2)",
    cursor:"not-allowed",
    boxShadow:"none",
  },
  warn:{
    marginTop:10,
    padding:"8px",
    background:"rgba(200,40,44,.15)",
    border:"1px solid rgba(226,58,63,.5)",
    borderRadius:6,
    color:"#F5A5A8",
    fontSize:13,
    fontFamily:"Noto Serif SC, serif",
    textAlign:"center",
    letterSpacing:1,
  },
  listTitle:{
    fontFamily:"Noto Serif SC, serif",
    fontSize:12,
    letterSpacing:2,
    color:"rgba(245,231,200,.65)",
    marginBottom:8,
  },
  list:{
    maxHeight:180,
    overflowY:"auto",
    display:"flex", flexDirection:"column", gap:4,
  },
  row:{
    display:"flex", alignItems:"center", gap:10,
    padding:"7px 10px",
    borderRadius:6,
    background:"rgba(255,255,255,.03)",
    border:"1px solid rgba(212,168,75,.12)",
    fontSize:13,
  },
  seatNum:{
    fontFamily:"Noto Serif SC, serif",
    fontSize:11,
    color:"rgba(212,168,75,.7)",
    width:22,
  },
  rowName:{
    flex:1,
    fontFamily:"Noto Serif SC, serif",
    color:"#F5E7C8",
    overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis",
  },
  rowAge:{
    fontFamily:"Noto Serif SC, serif",
    fontSize:12,
    color:"rgba(245,231,200,.55)",
  },
  removeBtn:{
    width:22, height:22,
    borderRadius:"50%",
    background:"rgba(226,58,63,.2)",
    border:"1px solid rgba(226,58,63,.4)",
    color:"#F5A5A8",
    fontSize:14,
    lineHeight:"18px",
    cursor:"pointer",
    padding:0,
  },

  // Standalone throw button at bottom center
  throwBtn:{
    position:"fixed",
    left:"50%", bottom:36,
    transform:"translateX(-50%)",
    minWidth:200,
    padding:"14px 36px",
    borderRadius:60,
    background:"linear-gradient(180deg, #E23A3F 0%, #C8282C 50%, #8E1A1E 100%)",
    border:"2px solid #E8C26A",
    color:"#FFE9A8",
    cursor:"pointer",
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    gap:2,
    boxShadow:`
      0 10px 30px rgba(200,40,44,.55),
      0 0 40px rgba(232,130,58,.25),
      inset 0 2px 0 rgba(255,230,180,.5),
      inset 0 -3px 6px rgba(90,15,18,.7)
    `,
    transition:"transform .15s",
    zIndex:50,
  },
  throwBtnDisabled:{
    background:"linear-gradient(180deg, rgba(60,60,70,.75), rgba(30,30,40,.85))",
    borderColor:"rgba(212,168,75,.3)",
    color:"rgba(245,231,200,.45)",
    cursor:"not-allowed",
    boxShadow:"0 6px 16px rgba(0,0,0,.5)",
  },
  throwLabel:{
    fontFamily:"Ma Shan Zheng, serif",
    fontSize:26,
    letterSpacing:10,
    paddingLeft:10, // balance the letter-spacing on the right side
  },
  throwHint:{
    fontFamily:"Noto Serif SC, serif",
    fontSize:11,
    letterSpacing:3,
    opacity:.75,
  },
};

const cpCss = document.createElement("style");
cpCss.textContent = `
  @keyframes modalIn { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
  @keyframes backdropIn { from { opacity:0 } to { opacity:1 } }
`;
document.head.appendChild(cpCss);

window.AddPlayerControl = AddPlayerControl;
window.ThrowButton = ThrowButton;
window.MAX_PLAYERS = MAX_PLAYERS;
