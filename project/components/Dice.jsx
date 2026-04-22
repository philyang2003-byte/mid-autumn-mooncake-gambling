// Gold 3D dice with white pips. Top-down view — we only need to show one face (top).
// Animation: falls from above, bounces off inner bowl wall, settles.
// Each die has: value (1..6), position {x,y} in % of floor, rotation deg, phase ("falling" | "bouncing" | "settled").

const pipPositions = {
  1: [[50,50]],
  2: [[28,28],[72,72]],
  3: [[25,25],[50,50],[75,75]],
  4: [[28,28],[72,28],[28,72],[72,72]],
  5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]],
};

// Pip color: the '1' and '4' on traditional 博饼 dice are RED; others black.
// (Chinese dice tradition — and it adds a lovely pop of red.)
const pipColor = (value, idx) => {
  if (value === 1) return "#E23A3F";
  if (value === 4) return "#E23A3F";
  return "#1a1a1a";
};

const Die = ({ die, size=54 }) => {
  const pips = pipPositions[die.value] || pipPositions[1];
  const s = size;

  // Top-down perspective: "throwing up" = scale up (toward camera), "falling" = scale back down.
  // Scale also correlates with shadow distance: bigger die = more airborne = bigger, blurrier shadow.
  const scale = die.scale ?? 1;
  const airborne = scale > 1.05;

  // Shadow grows and softens as die rises; tightens when it lands
  const shadowOffset = airborne ? 24 : (die.phase === "settled" ? 5 : 12);
  const shadowBlur   = airborne ? 22 : (die.phase === "settled" ? 7 : 14);
  const shadowOpacity= airborne ? 0.35 : (die.phase === "settled" ? 0.7 : 0.55);

  // Transition curves tuned per phase
  let transition;
  if (die.phase === "rising") {
    // going up fast — ease-out-ish (decelerating as it peaks)
    transition = "transform 0.45s cubic-bezier(.2,.7,.3,1), top 0.45s cubic-bezier(.2,.7,.3,1), left 0.45s cubic-bezier(.2,.7,.3,1), filter 0.45s ease";
  } else if (die.phase === "falling") {
    // coming down — ease-in (accelerating as it falls)
    transition = "transform 0.4s cubic-bezier(.6,.04,.9,.3), top 0.4s cubic-bezier(.6,.04,.9,.3), left 0.4s cubic-bezier(.6,.04,.9,.3), filter 0.4s ease";
  } else if (die.phase === "bouncing") {
    transition = "transform 0.28s ease-out, top 0.28s ease-out, left 0.28s ease-out, filter 0.28s ease";
  } else {
    transition = "transform 0.4s ease-out, top 0.4s ease-out, left 0.4s ease-out, filter 0.4s ease";
  }

  const style = {
    position:"absolute",
    left:`calc(${die.x}% - ${s/2}px)`,
    top:`calc(${die.y}% - ${s/2}px)`,
    width:s, height:s,
    transform: `rotate(${die.rot||0}deg) scale(${scale})`,
    transition,
    filter: `drop-shadow(0 ${shadowOffset}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}))`,
    zIndex: airborne ? 30 : 10,
  };

  return (
    <div style={style}>
      <div style={{
        position:"relative", width:"100%", height:"100%",
        borderRadius: s*0.18,
        background: `
          linear-gradient(135deg, #FFF1B8 0%, #F0C85A 25%, #D4A84B 55%, #B88A2E 100%)
        `,
        boxShadow:`
          inset 0 2px 4px rgba(255,255,255,.8),
          inset 0 -3px 5px rgba(120,80,20,.6),
          inset 2px 0 3px rgba(255,255,255,.3),
          inset -2px 0 3px rgba(120,80,20,.3)
        `,
        overflow:"hidden",
      }}>
        {/* face specular */}
        <div style={{
          position:"absolute", top:"8%", left:"10%", width:"45%", height:"20%",
          borderRadius:"50%",
          background:"radial-gradient(ellipse, rgba(255,255,230,.7), transparent 70%)",
          filter:"blur(2px)",
        }}/>
        {/* pips */}
        {pips.map((p,i)=>(
          <div key={i} style={{
            position:"absolute",
            left:`${p[0]}%`, top:`${p[1]}%`,
            width:s*0.18, height:s*0.18,
            marginLeft:-s*0.09, marginTop:-s*0.09,
            borderRadius:"50%",
            background: pipColor(die.value, i),
            boxShadow:`
              inset 0 1px 2px rgba(0,0,0,.5),
              inset 0 -1px 1px rgba(255,255,255,.3)
            `,
          }}/>
        ))}
        {/* edge highlight */}
        <div style={{
          position:"absolute", inset:0, borderRadius: s*0.18,
          boxShadow:"inset 0 0 0 1px rgba(255,230,150,.4)",
          pointerEvents:"none",
        }}/>
      </div>
    </div>
  );
};

window.Die = Die;
window.pipPositions = pipPositions;
