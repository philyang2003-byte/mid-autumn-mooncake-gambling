// Main app - orchestrates state, dice roll animations, turn management.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

const INITIAL_COUNTS = {
  zhuangyuan:1, duitang:2, sanhong:4, sijin:8, erju:16, yixiu:32,
};

// Seed players so the design reads fully on load
const SEED_PLAYERS = [
  {id:1, name:"阿明",   age:28, wins:["一秀"]},
  {id:2, name:"小雅",   age:24, wins:[]},
  {id:3, name:"志强",   age:35, wins:["二举","一秀"]},
  {id:4, name:"美玲",   age:30, wins:["四进"]},
  {id:5, name:"建华",   age:42, wins:[]},
  {id:6, name:"晓彤",   age:26, wins:["三红"]},
  {id:7, name:"文杰",   age:31, wins:[]},
  {id:8, name:"佩珊",   age:29, wins:["一秀"]},
];

// Compute prize counts remaining given a list of players & their wins
function remainingCounts(players){
  const counts = {...INITIAL_COUNTS};
  players.forEach(p => (p.wins||[]).forEach(w => {
    const key = labelToKey(w);
    if (key && counts[key]>0) counts[key]--;
  }));
  return counts;
}
function labelToKey(label){
  switch(label){
    case "状元": return "zhuangyuan";
    case "对堂": return "duitang";
    case "三红": return "sanhong";
    case "四进": return "sijin";
    case "二举": return "erju";
    case "一秀": return "yixiu";
    default: return null;
  }
}
function keyToLabel(k){
  return window.PRIZES.find(p=>p.key===k)?.name;
}

// Build an initial dice layout inside the bowl floor (in %)
function restingDice(values){
  // Place dice in a loose 2x3 cluster near bottom-center of floor
  const layout = [
    {x:30, y:38}, {x:50, y:32}, {x:70, y:38},
    {x:32, y:62}, {x:54, y:68}, {x:72, y:58},
  ];
  return values.map((v,i)=>({
    id:i, value:v,
    x:layout[i].x + (Math.random()-.5)*6,
    y:layout[i].y + (Math.random()-.5)*6,
    rot:(Math.random()-.5)*70,
    fallY:0, scale:1, phase:"settled",
  }));
}

const App = () => {
  const [players, setPlayers] = useState(SEED_PLAYERS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | rolling | resolving
  const [dice, setDice] = useState(()=> restingDice([4,1,4,2,5,3]));
  const [lastRoll, setLastRoll] = useState([4,1,4,2,5,3]);
  const [lastPrize, setLastPrize] = useState("erju");
  const [shaking, setShaking] = useState(false);
  const [toast, setToast] = useState(null);

  const counts = useMemo(()=>remainingCounts(players), [players]);

  const addPlayer = (p) => {
    if (players.length >= window.MAX_PLAYERS) return;
    setPlayers(prev => [...prev, {id: Date.now()+Math.random(), name:p.name, age:p.age, wins:[]}]);
  };
  const removePlayer = (id) => {
    setPlayers(prev => {
      const idx = prev.findIndex(p=>p.id===id);
      const next = prev.filter(p=>p.id!==id);
      if (next.length === 0){ setActiveIdx(0); return next; }
      if (activeIdx >= next.length) setActiveIdx(0);
      else if (idx < activeIdx) setActiveIdx(activeIdx-1);
      return next;
    });
  };

  const throwDice = useCallback(()=>{
    if (phase !== "idle") return;
    if (players.length === 0) return;
    if (Object.values(counts).every(v=>v===0)) return;

    setPhase("rolling");
    setLastPrize(null);

    const targetValues = Array.from({length:6},()=>Math.floor(Math.random()*6)+1);

    // Phase 1: RISING — dice cluster at bowl center and grow large (toward camera)
    // This simulates the overhead view of a hand tossing dice upward.
    const rising = targetValues.map((v,i)=>({
      id:i,
      value:Math.floor(Math.random()*6)+1,
      // clustered near the bowl center with small jitter
      x: 50 + (Math.random()-.5)*14,
      y: 50 + (Math.random()-.5)*14,
      rot: (Math.random()-.5)*540,
      scale: 1.9,           // BIG — rising up toward the camera
      phase: "rising",
    }));
    setDice(rising);

    // Phase 2: FALLING — dice shrink back and scatter outward to scattered positions in bowl
    setTimeout(()=>{
      setShaking(true);
      const falling = targetValues.map((v,i)=>({
        id:i,
        value:Math.floor(Math.random()*6)+1,
        x: 22 + Math.random()*56,
        y: 25 + Math.random()*50,
        rot: (Math.random()-.5)*900,
        scale: 1.0,          // back to normal — has landed
        phase: "falling",
      }));
      setDice(falling);
    }, 480);

    // Phase 3: bounce / jitter once they've landed
    setTimeout(()=>{
      const bouncing = targetValues.map((v,i)=>({
        id:i,
        value:Math.floor(Math.random()*6)+1,
        x: 24 + Math.random()*52,
        y: 28 + Math.random()*44,
        rot: (Math.random()-.5)*360,
        scale: 1.05,
        phase: "bouncing",
      }));
      setDice(bouncing);
    }, 900);

    // Phase 4: settled in final values & positions
    setTimeout(()=>{
      setShaking(false);
      setDice(restingDice(targetValues));
      setLastRoll(targetValues);

      const judged = window.judgeRoll(targetValues);
      if (judged){
        // Is that prize still available?
        if (counts[judged.key] > 0){
          // award
          const label = keyToLabel(judged.key);
          setLastPrize(judged.key);
          setPlayers(prev => prev.map((p,idx)=>
            idx===activeIdx ? {...p, wins:[...(p.wins||[]), label]} : p
          ));
          setToast({type:"win", title:judged.label, name:players[activeIdx]?.name});
        } else {
          setLastPrize(null);
          setToast({type:"gone", title:judged.label + " · 已无剩余"});
        }
      } else {
        setLastPrize(null);
      }

      setPhase("idle");
      // advance to next player
      setTimeout(()=>{
        setActiveIdx(i => players.length ? (i+1) % players.length : 0);
      }, 1200);
    }, 1600);

  }, [phase, players, activeIdx, counts]);

  // Toast auto-dismiss
  useEffect(()=>{
    if (!toast) return;
    const t = setTimeout(()=>setToast(null), 2600);
    return ()=>clearTimeout(t);
  }, [toast]);

  // Spacebar to throw
  useEffect(()=>{
    const onKey = (e) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT"){
        e.preventDefault();
        throwDice();
      }
    };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  }, [throwDice]);

  // Responsive center tracking. Small downward offset keeps top of ring below header;
  // horizontal-wide ellipse makes side players clear the left (280px) / right (320px) panels
  // while keeping the bottom row inside the 900px viewport.
  const stageRef = useRef(null);
  const [center, setCenter] = useState({x:720, y:495});
  useEffect(()=>{
    const measure = ()=>{
      if (!stageRef.current) return;
      const r = stageRef.current.getBoundingClientRect();
      setCenter({x:r.width/2, y:r.height/2 + 10});
    };
    measure();
    window.addEventListener("resize", measure);
    return ()=>window.removeEventListener("resize", measure);
  },[]);

  const canThrow = phase==="idle" && players.length>0 && Object.values(counts).some(v=>v>0);
  const allDone = players.length>0 && Object.values(counts).every(v=>v===0);

  // Ellipse radii — tuned to sit INSIDE the gap between the 280px left panel
  // and 320px right panel at 1440×900. Side players must clear the panels
  // without extending past the viewport edge.
  // Vertical radius is intentionally tighter so bottom players don't collide
  // with the "轮至" caption below the bowl.
  const radiusX = players.length <= 6 ? 360 : players.length <= 9 ? 380 : 395;
  const radiusY = players.length <= 6 ? 230 : players.length <= 9 ? 245 : 255;

  return (
    <div style={{position:"relative", minHeight:"100vh", width:"100%", overflow:"hidden"}}>
      <window.Background/>

      {/* Header */}
      <header style={hdStyles.wrap}>
        <div style={hdStyles.titleCh}>中秋博饼</div>
        <div style={hdStyles.titleSub}>月圆人团圆 · 博得状元归</div>
      </header>

      {/* Main stage */}
      <div style={{padding:"200px 28px 120px", minHeight:"100vh"}} ref={stageRef}>
        {/* Player ring */}
        <window.PlayerRing
          players={players}
          activeIdx={activeIdx}
          radiusX={radiusX}
          radiusY={radiusY}
          centerX={center.x}
          centerY={center.y}
        />

        {/* Bowl at center */}
        <div style={{
          position:"absolute",
          left:center.x, top:center.y,
          transform:"translate(-50%,-50%)",
          zIndex:10,
        }}>
          <window.Bowl size={440} shaking={shaking}>
            {dice.map(d => <window.Die key={d.id} die={d} size={54}/>)}
          </window.Bowl>
        </div>

        {/* Instructions/phase label below bowl */}
        <div style={{
          position:"absolute",
          left:center.x, top:center.y + 345,
          transform:"translateX(-50%)",
          textAlign:"center",
          pointerEvents:"none",
          zIndex:5,
        }}>
          <div style={{
            fontFamily:"Ma Shan Zheng, serif",
            fontSize:18,
            color:"#FFE9A8",
            letterSpacing:6,
            textShadow:"0 2px 8px rgba(0,0,0,.8)",
          }}>
            {phase==="rolling" ? "—— 骰落碗中 ——" :
             allDone ? "—— 博饼结束 ——" :
             players.length===0 ? "—— 请先添加玩家 ——" :
             `—— 轮至 · ${players[activeIdx]?.name} ——`}
          </div>
        </div>
      </div>

      {/* Floating controls — no side panels covering the scene */}
      <window.AddPlayerControl
        players={players}
        onAdd={addPlayer}
        onRemove={removePlayer}
      />
      <window.PrizePanel
        counts={counts}
        lastPrize={lastPrize}
        lastRoll={lastRoll}
      />
      <window.ThrowButton
        canThrow={canThrow}
        onThrow={throwDice}
        phase={phase}
      />

      {/* Toast */}
      {toast && (
        <div style={{
          ...toastStyles.wrap,
          ...(toast.type==="gone" ? toastStyles.gone : toastStyles.win),
        }}>
          <div style={toastStyles.title}>
            {toast.type==="gone" ? "可惜！" : "恭喜！"}
          </div>
          <div style={toastStyles.body}>
            {toast.type==="win" ? (
              <>
                <span style={{fontFamily:"Ma Shan Zheng, serif", fontSize:32, letterSpacing:3, color:"#FFE9A8"}}>
                  {toast.title}
                </span>
                <div style={{fontSize:14, color:"#F5E7C8", marginTop:4, letterSpacing:2}}>
                  由 <span style={{color:"#FFE9A8", fontWeight:700}}>{toast.name}</span> 博得
                </div>
              </>
            ) : (
              <span style={{fontFamily:"Ma Shan Zheng, serif", fontSize:24, color:"#F5A5A8"}}>{toast.title}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const hdStyles = {
  wrap:{
    position:"absolute", top:22, left:"50%",
    transform:"translateX(-50%)",
    textAlign:"center",
    zIndex:40,
    pointerEvents:"none",
  },
  titleCh:{
    fontFamily:"Ma Shan Zheng, serif",
    fontSize:44,
    color:"#FFE9A8",
    letterSpacing:14,
    textShadow:"0 0 30px rgba(232,194,106,.45), 0 2px 8px rgba(0,0,0,.8)",
    lineHeight:1,
  },
  titleSub:{
    fontFamily:"Noto Serif SC, serif",
    fontSize:13,
    color:"rgba(245,231,200,.7)",
    marginTop:8,
    letterSpacing:4,
  },
};

const stageStyles = {
  stage:{
    position:"relative",
    width:"100%",
    minHeight:"100vh",
    padding:"200px 360px 120px",
    boxSizing:"border-box",
  },
};

const toastStyles = {
  wrap:{
    position:"fixed", left:"50%", bottom:60,
    transform:"translateX(-50%)",
    padding:"16px 32px",
    borderRadius:14,
    backdropFilter:"blur(10px)",
    textAlign:"center",
    zIndex:100,
    animation:"toastIn .3s ease-out",
    boxShadow:"0 12px 32px rgba(0,0,0,.6)",
  },
  win:{
    background:"linear-gradient(135deg, rgba(200,40,44,.95), rgba(90,15,18,.95))",
    border:"1.5px solid #E8C26A",
    boxShadow:"0 0 40px rgba(232,130,58,.5), 0 12px 32px rgba(0,0,0,.6)",
  },
  gone:{
    background:"linear-gradient(135deg, rgba(30,30,50,.95), rgba(10,10,20,.95))",
    border:"1px solid rgba(226,58,63,.6)",
  },
  title:{
    fontFamily:"JetBrains Mono, monospace",
    fontSize:10,
    letterSpacing:4,
    color:"rgba(245,231,200,.6)",
    marginBottom:4,
  },
  body:{},
};

const toastCss = document.createElement("style");
toastCss.textContent = `
  @keyframes toastIn {
    from { opacity:0; transform:translate(-50%, 20px); }
    to   { opacity:1; transform:translate(-50%, 0); }
  }
`;
document.head.appendChild(toastCss);

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App/>);
