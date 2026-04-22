// Red & gold 3D bowl, top-down perspective.
// Uses layered radial gradients to fake depth — an outer rim (gold), bowl wall (red), and a darker interior floor.
const Bowl = ({ size = 520, shaking = false, children }) => {
  const s = size;
  return (
    <div style={{
      position:"relative",
      width:s, height:s,
      transform: shaking ? "translate(var(--sx,0), var(--sy,0))" : "none",
      animation: shaking ? "bowlShake 0.5s ease-in-out infinite" : "none",
    }}>
      {/* Outer ground shadow */}
      <div style={{
        position:"absolute", inset:-20,
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(0,0,0,.7) 40%, transparent 70%)",
        filter:"blur(30px)",
        transform:"translateY(20px) scaleY(.6)",
      }}/>

      {/* Outer gold ring (widest) */}
      <div style={{
        position:"absolute", inset:0,
        borderRadius:"50%",
        background: `
          radial-gradient(circle at 38% 30%, #F8DE90 0%, #D4A84B 25%, #9C7A2E 55%, #6B4A1A 100%)
        `,
        boxShadow:`
          0 30px 60px rgba(0,0,0,.6),
          inset 0 4px 12px rgba(255,240,200,.4),
          inset 0 -6px 18px rgba(0,0,0,.4)
        `,
      }}/>

      {/* Decorative gold ring with motif */}
      <div style={{
        position:"absolute", inset:"3%",
        borderRadius:"50%",
        background:`conic-gradient(
          from 0deg,
          #D4A84B 0deg, #E8C26A 10deg, #9C7A2E 20deg,
          #D4A84B 30deg, #E8C26A 40deg, #9C7A2E 50deg,
          #D4A84B 60deg, #E8C26A 70deg, #9C7A2E 80deg,
          #D4A84B 90deg, #E8C26A 100deg, #9C7A2E 110deg,
          #D4A84B 120deg, #E8C26A 130deg, #9C7A2E 140deg,
          #D4A84B 150deg, #E8C26A 160deg, #9C7A2E 170deg,
          #D4A84B 180deg, #E8C26A 190deg, #9C7A2E 200deg,
          #D4A84B 210deg, #E8C26A 220deg, #9C7A2E 230deg,
          #D4A84B 240deg, #E8C26A 250deg, #9C7A2E 260deg,
          #D4A84B 270deg, #E8C26A 280deg, #9C7A2E 290deg,
          #D4A84B 300deg, #E8C26A 310deg, #9C7A2E 320deg,
          #D4A84B 330deg, #E8C26A 340deg, #9C7A2E 350deg,
          #D4A84B 360deg
        )`,
        opacity:.6,
        mixBlendMode:"overlay",
      }}/>

      {/* Gold rim highlight (thin inner bevel) */}
      <div style={{
        position:"absolute", inset:"5%",
        borderRadius:"50%",
        background:"linear-gradient(135deg, #FFE9A8 0%, #D4A84B 40%, #8E6A20 100%)",
        boxShadow:`
          inset 0 2px 6px rgba(255,255,255,.6),
          inset 0 -2px 6px rgba(0,0,0,.5)
        `,
      }}/>

      {/* Red bowl wall (sloping inward) — outer */}
      <div style={{
        position:"absolute", inset:"8%",
        borderRadius:"50%",
        background: `
          radial-gradient(circle at 45% 35%, #E23A3F 0%, #C8282C 35%, #8E1A1E 70%, #5A0F12 100%)
        `,
        boxShadow:`
          inset 0 8px 24px rgba(255,150,120,.15),
          inset 0 -8px 24px rgba(0,0,0,.6)
        `,
      }}/>

      {/* Inner gold decorative band */}
      <div style={{
        position:"absolute", inset:"14%",
        borderRadius:"50%",
        border:"2px solid transparent",
        background:"linear-gradient(#8E1A1E,#8E1A1E) padding-box, linear-gradient(135deg,#E8C26A,#9C7A2E,#E8C26A) border-box",
        boxShadow:"inset 0 0 0 1px rgba(212,168,75,.4)",
      }}/>

      {/* Red wall mid */}
      <div style={{
        position:"absolute", inset:"15%",
        borderRadius:"50%",
        background: `
          radial-gradient(circle at 50% 40%, #A82024 0%, #7A1518 50%, #4A0A0D 100%)
        `,
      }}/>

      {/* Inner floor (darkest, the 'base' you see from above) */}
      <div style={{
        position:"absolute", inset:"22%",
        borderRadius:"50%",
        background: `
          radial-gradient(circle at 50% 45%, #6B1216 0%, #3A080B 55%, #1F0305 100%)
        `,
        boxShadow:`
          inset 0 10px 30px rgba(0,0,0,.7),
          inset 0 -4px 10px rgba(200,40,44,.15)
        `,
      }}/>

      {/* Central faint gold 福/圆 calligraphy watermark */}
      <div style={{
        position:"absolute", inset:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        pointerEvents:"none",
      }}>
        <span style={{
          fontFamily:"Ma Shan Zheng, serif",
          fontSize: s*0.22,
          color:"rgba(212,168,75,.08)",
          textShadow:"0 0 20px rgba(212,168,75,.15)",
        }}>博</span>
      </div>

      {/* Specular highlight swoosh */}
      <div style={{
        position:"absolute", left:"18%", top:"12%", width:"40%", height:"18%",
        borderRadius:"50%",
        background:"radial-gradient(ellipse, rgba(255,240,210,.35), transparent 70%)",
        filter:"blur(6px)",
        pointerEvents:"none",
      }}/>

      {/* Children slot (dice) */}
      <div style={{position:"absolute", inset:"22%", borderRadius:"50%", overflow:"hidden"}}>
        {children}
      </div>
    </div>
  );
};

const bowlCss = document.createElement("style");
bowlCss.textContent = `
  @keyframes bowlShake {
    0%,100% { transform: translate(0,0); }
    25% { transform: translate(-3px, 2px); }
    50% { transform: translate(3px, -2px); }
    75% { transform: translate(-2px, -3px); }
  }
`;
document.head.appendChild(bowlCss);

window.Bowl = Bowl;
