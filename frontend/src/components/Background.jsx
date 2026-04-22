import { useMemo } from "react";

export default function Background() {
  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 80; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 70,
        s: Math.random() * 1.6 + 0.4,
        o: Math.random() * 0.6 + 0.2,
        d: Math.random() * 4,
      });
    }
    return arr;
  }, []);

  return (
    <div style={s.root}>
      <svg style={s.stars} viewBox="0 0 100 100" preserveAspectRatio="none">
        {stars.map((star, i) => (
          <circle key={i} cx={star.x} cy={star.y} r={star.s * 0.06} fill="#F5E7C8" opacity={star.o}>
            <animate attributeName="opacity" values={`${star.o};${star.o * 0.2};${star.o}`} dur={`${2 + star.d}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      <div style={s.moonHalo} />
      <div style={s.moon}>
        <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
          <defs>
            <radialGradient id="moonGrad" cx="42%" cy="38%">
              <stop offset="0%" stopColor="#FFF6DC" />
              <stop offset="50%" stopColor="#F6E2A6" />
              <stop offset="100%" stopColor="#D9B56B" />
            </radialGradient>
            <radialGradient id="moonInner" cx="50%" cy="50%">
              <stop offset="60%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(120,85,30,.35)" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="98" fill="url(#moonGrad)" />
          <circle cx="100" cy="100" r="98" fill="url(#moonInner)" />
          <circle cx="70" cy="78" r="10" fill="#D9B56B" opacity=".35" />
          <circle cx="125" cy="70" r="6" fill="#D9B56B" opacity=".3" />
          <circle cx="135" cy="120" r="14" fill="#D9B56B" opacity=".3" />
          <circle cx="85" cy="135" r="8" fill="#D9B56B" opacity=".28" />
          <circle cx="110" cy="100" r="4" fill="#D9B56B" opacity=".25" />
          <g opacity=".15" fill="#6B4A1A">
            <ellipse cx="95" cy="110" rx="16" ry="10" />
            <ellipse cx="82" cy="98" rx="3" ry="8" transform="rotate(-20 82 98)" />
            <ellipse cx="88" cy="95" rx="3" ry="8" transform="rotate(-10 88 95)" />
          </g>
        </svg>
      </div>

      <svg style={s.cloud1} viewBox="0 0 300 80">
        <path d="M10,50 Q30,20 70,35 Q100,10 140,30 Q180,15 220,35 Q260,25 290,50 Q260,65 220,55 Q180,70 140,55 Q100,70 70,60 Q40,70 10,50 Z"
          fill="rgba(180,200,230,0.08)" stroke="rgba(200,220,255,.12)" strokeWidth=".5" />
      </svg>
      <svg style={s.cloud2} viewBox="0 0 300 80">
        <path d="M10,50 Q30,20 70,35 Q100,10 140,30 Q180,15 220,35 Q260,25 290,50 Q260,65 220,55 Q180,70 140,55 Q100,70 70,60 Q40,70 10,50 Z"
          fill="rgba(180,200,230,0.06)" />
      </svg>

      <Lantern style={{ left: "6%", top: "4%" }} size={86} delay={0} />
      <Lantern style={{ left: "14%", top: "14%" }} size={66} delay={0.7} />
      <Lantern style={{ right: "8%", top: "6%" }} size={92} delay={0.3} />
      <Lantern style={{ right: "18%", top: "18%" }} size={60} delay={1.1} />
      <Lantern style={{ left: "3%", bottom: "8%" }} size={72} delay={0.5} />
      <Lantern style={{ right: "4%", bottom: "10%" }} size={78} delay={0.9} />

      <div style={s.vignette} />
    </div>
  );
}

function Lantern({ style, size = 70, delay = 0 }) {
  const gradId = `lg${size}${delay}`;
  return (
    <div style={{ position: "absolute", width: size, ...style, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: -60, left: "50%", width: 1,
        height: 60, background: "linear-gradient(to bottom, transparent, rgba(200,160,80,.45))",
      }} />
      <div style={{
        animation: "lanternSway 4.5s ease-in-out infinite",
        animationDelay: `${delay}s`,
        transformOrigin: "top center",
      }}>
        <svg viewBox="0 0 100 130" width={size} height={size * 1.3}
          style={{ filter: `drop-shadow(0 0 ${size * 0.25}px rgba(232,130,58,.45))` }}>
          <defs>
            <radialGradient id={gradId} cx="50%" cy="45%">
              <stop offset="0%" stopColor="#FF8B5A" />
              <stop offset="50%" stopColor="#E23A3F" />
              <stop offset="100%" stopColor="#8E1A1E" />
            </radialGradient>
          </defs>
          <rect x="38" y="8" width="24" height="6" fill="#D4A84B" />
          <rect x="42" y="2" width="16" height="8" fill="#9C7A2E" />
          <ellipse cx="50" cy="55" rx="40" ry="42" fill={`url(#${gradId})`} />
          <path d="M14,55 Q50,50 86,55" stroke="rgba(0,0,0,.2)" fill="none" />
          <path d="M18,40 Q50,35 82,40" stroke="rgba(0,0,0,.15)" fill="none" />
          <path d="M18,70 Q50,75 82,70" stroke="rgba(0,0,0,.15)" fill="none" />
          <rect x="22" y="15" width="56" height="6" fill="#9C7A2E" />
          <rect x="22" y="90" width="56" height="6" fill="#9C7A2E" />
          <line x1="50" y1="96" x2="50" y2="105" stroke="#D4A84B" strokeWidth="1.2" />
          <path d="M44,105 L56,105 L54,115 L46,115 Z" fill="#D4A84B" />
          <line x1="47" y1="115" x2="46" y2="128" stroke="#D4A84B" strokeWidth=".8" />
          <line x1="50" y1="115" x2="50" y2="128" stroke="#D4A84B" strokeWidth=".8" />
          <line x1="53" y1="115" x2="54" y2="128" stroke="#D4A84B" strokeWidth=".8" />
          <text x="50" y="62" textAnchor="middle" fill="#F5E7C8" fontFamily="Ma Shan Zheng" fontSize="26" fontWeight="700">福</text>
        </svg>
      </div>
    </div>
  );
}

const s = {
  root: { position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" },
  stars: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  moonHalo: {
    position: "absolute", top: "-80px", right: "-40px", width: 620, height: 620,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(246,226,166,.28) 0%, rgba(246,226,166,.08) 40%, transparent 70%)",
    filter: "blur(20px)",
  },
  moon: {
    position: "absolute", top: "20px", right: "60px", width: 300, height: 300,
    filter: "drop-shadow(0 0 60px rgba(246,226,166,.5))",
  },
  cloud1: { position: "absolute", top: "14%", left: "-5%", width: 420, height: 120, animation: "cloudDrift 80s linear infinite" },
  cloud2: { position: "absolute", top: "30%", left: "-10%", width: 340, height: 100, animation: "cloudDrift 120s linear infinite", animationDelay: "-40s" },
  vignette: {
    position: "absolute", inset: 0,
    background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.55) 100%)",
  },
};

// Inject keyframes once
const css = document.createElement("style");
css.textContent = `
  @keyframes lanternSway { 0%,100% { transform: rotate(-2.5deg); } 50% { transform: rotate(2.5deg); } }
  @keyframes cloudDrift { from { transform: translateX(0); } to { transform: translateX(1800px); } }
`;
document.head.appendChild(css);
