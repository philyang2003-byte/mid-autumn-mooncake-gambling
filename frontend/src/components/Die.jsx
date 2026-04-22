const PIP_POSITIONS = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
};

function pipColor(value) {
  return value === 1 || value === 4 ? "#E23A3F" : "#1a1a1a";
}

function transition(phase) {
  if (phase === "rising")   return "transform 0.45s cubic-bezier(.2,.7,.3,1), top 0.45s cubic-bezier(.2,.7,.3,1), left 0.45s cubic-bezier(.2,.7,.3,1), filter 0.45s ease";
  if (phase === "falling")  return "transform 0.4s cubic-bezier(.6,.04,.9,.3), top 0.4s cubic-bezier(.6,.04,.9,.3), left 0.4s cubic-bezier(.6,.04,.9,.3), filter 0.4s ease";
  if (phase === "bouncing") return "transform 0.28s ease-out, top 0.28s ease-out, left 0.28s ease-out, filter 0.28s ease";
  return "transform 0.4s ease-out, top 0.4s ease-out, left 0.4s ease-out, filter 0.4s ease";
}

export default function Die({ die, size = 54 }) {
  const pips = PIP_POSITIONS[die.value] || PIP_POSITIONS[1];
  const scale = die.scale ?? 1;
  const airborne = scale > 1.05;
  const shadowOffset = airborne ? 24 : die.phase === "settled" ? 5 : 12;
  const shadowBlur   = airborne ? 22 : die.phase === "settled" ? 7 : 14;
  const shadowOpacity = airborne ? 0.35 : die.phase === "settled" ? 0.7 : 0.55;
  const r = size * 0.18;

  return (
    <div style={{
      position: "absolute",
      left: `calc(${die.x}% - ${size / 2}px)`,
      top: `calc(${die.y}% - ${size / 2}px)`,
      width: size, height: size,
      transform: `rotate(${die.rot || 0}deg) scale(${scale})`,
      transition: transition(die.phase),
      filter: `drop-shadow(0 ${shadowOffset}px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}))`,
      zIndex: airborne ? 30 : 10,
    }}>
      <div style={{
        position: "relative", width: "100%", height: "100%",
        borderRadius: r,
        background: "linear-gradient(135deg, #FFF1B8 0%, #F0C85A 25%, #D4A84B 55%, #B88A2E 100%)",
        boxShadow: "inset 0 2px 4px rgba(255,255,255,.8), inset 0 -3px 5px rgba(120,80,20,.6), inset 2px 0 3px rgba(255,255,255,.3), inset -2px 0 3px rgba(120,80,20,.3)",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "8%", left: "10%", width: "45%", height: "20%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,230,.7), transparent 70%)", filter: "blur(2px)" }} />
        {pips.map((p, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${p[0]}%`, top: `${p[1]}%`,
            width: size * 0.18, height: size * 0.18,
            marginLeft: -size * 0.09, marginTop: -size * 0.09,
            borderRadius: "50%",
            background: pipColor(die.value),
            boxShadow: "inset 0 1px 2px rgba(0,0,0,.5), inset 0 -1px 1px rgba(255,255,255,.3)",
          }} />
        ))}
        <div style={{ position: "absolute", inset: 0, borderRadius: r, boxShadow: "inset 0 0 0 1px rgba(255,230,150,.4)", pointerEvents: "none" }} />
      </div>
    </div>
  );
}
