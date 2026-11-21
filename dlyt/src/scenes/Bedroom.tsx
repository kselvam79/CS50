import React from 'react';
import {C, DadHead, Defs, Foot, H, Hand, HeartStream, KidHead, Limb, Sparkle, W, Word, blink, cue, lerp, rand, ramp, sceneRange, smooth, talk, wordAt} from '../lib';

// stanzas 9–12 — song time and goodnight. Side view of the toddler's bed at night.

const Note: React.FC<{x: number; y: number; s: number; o: number; kind: number}> = ({x, y, s, o, kind}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    {kind ? (
      <g>
        <ellipse cx="-10" cy="16" rx="11" ry="8" fill="#f6dfa4" transform="rotate(-20 -10 16)" />
        <ellipse cx="18" cy="10" rx="11" ry="8" fill="#f6dfa4" transform="rotate(-20 18 10)" />
        <path d="M0 14 L0 -22 L28 -28 L28 8" stroke="#f6dfa4" strokeWidth="5" fill="none" />
      </g>
    ) : (
      <g>
        <ellipse cx="-4" cy="14" rx="12" ry="9" fill="#f6dfa4" transform="rotate(-20 -4 14)" />
        <path d="M6 12 L6 -26 Q 18 -18 22 -6" stroke="#f6dfa4" strokeWidth="5" fill="none" />
      </g>
    )}
  </g>
);

export const Bedroom: React.FC<{t: number; mode: 'song' | 'night'}> = ({t, mode}) => {
  const [song0] = sceneRange('song');
  const [night0, night1] = sceneRange('night');
  const isNight = mode === 'night';

  // lighting: the lamp goes down through the song and the goodnight
  const lamp = isNight ? lerp(0.45, 0.08, ramp(t, night0, cue(12, 0))) : lerp(1, 0.5, ramp(t, cue(9, 0), cue(10, 3)));
  const dark = 1 - lamp; // 0..1
  const singing = t > cue(9, 1) - 0.2 && (isNight ? false : true);
  const songStanza = !isNight && t > cue(10, 0) - 0.3;

  // kid's sleepiness
  let eyes: 'open' | 'sleepy' | 'closed' | 'happy' = 'open';
  let mouth: 'smile' | 'yawn' | 'sleep' = 'smile';
  if (!isNight) {
    if (t > cue(10, 2)) eyes = 'sleepy';
    else if (t > cue(9, 3) - 0.2 && t < cue(10, 0)) eyes = 'happy';
  } else {
    eyes = t < cue(11, 2) ? 'sleepy' : 'closed';
    const yawnT = wordAt(11, 0, 'yawn');
    if (t > yawnT - 0.2 && t < yawnT + 1.6) {
      mouth = 'yawn';
      eyes = 'closed';
    } else if (t > cue(11, 2)) mouth = 'sleep';
  }

  // tuck: Daddy's hand smooths the quilt from top down to toe
  const tuck0 = cue(11, 1);
  const tuckP = ramp(t, tuck0, tuck0 + 2.6);
  const kissT = isNight ? cue(11, 2) + 0.4 : 1e9;
  const lean = isNight ? Math.min(ramp(t, kissT - 0.8, kissT), 1 - ramp(t, kissT + 2.2, kissT + 3.2)) : 0;
  const coverToes = isNight ? ramp(t, kissT + 2.6, kissT + 3.6) : 0;
  const dadSleep = isNight ? ramp(t, cue(12, 0) - 1, cue(12, 0)) : 0;

  // camera
  let cx = 960;
  let cy = 470;
  let z = 1;
  if (!isNight) {
    const p = smooth((t - song0) / (cue(10, 3) + 4 - song0));
    cx = lerp(960, 820, p);
    z = lerp(1.0, 1.12, p);
  } else {
    const toToes = Math.min(ramp(t, kissT - 1.5, kissT - 0.3), 1 - ramp(t, kissT + 3.6, kissT + 5));
    cx = lerp(900, 1240, toToes);
    z = lerp(1.05, 1.35, toToes) - 0.08 * ramp(t, cue(12, 0) - 1, night1);
    cy = lerp(470, 440, toToes);
  }

  const talkO = talk(t);
  const sing = songStanza && talkO >= 0 ? talkO : singing && talkO >= 0 ? talkO : -1;
  const dadMouth = lean > 0.6 ? 'kiss' : sing >= 0 ? (songStanza ? 'sing' : 'talk') : 'smile';

  const toeWig = (f: number) =>
    [0, 1, 2, 3, 4].map((i) => {
      const active = (!isNight && t > cue(9, 3) - 0.2) || (isNight && t < kissT + 2);
      const sleepy = isNight ? 0.4 : !isNight && t > cue(10, 2) ? 0.6 : 1;
      return active ? sleepy * (0.5 + 0.5 * Math.sin(t * (isNight ? 5 : 9) + i + f)) : 0;
    });

  // Daddy's position (kneeling behind the bed, leans right for the kiss)
  const dadX = lerp(960, 1250, lean);
  const dadY = lerp(0, 60, lean) + dadSleep * 70;

  const starRot = t * 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <Defs id={mode} />
      <g transform={`translate(${W / 2},${430}) scale(${z}) translate(${-cx},${-cy})`}>
        <g filter={`url(#rough-${mode})`}>
          <rect x={-400} y={-400} width={W + 800} height={1100} fill="#6e2f2c" />
          {/* wallpaper stripes */}
          {Array.from({length: 30}, (_, i) => (
            <rect key={i} x={-400 + i * 100} y={-400} width={36} height={1100} fill="#7a3430" opacity="0.6" />
          ))}
          <rect x={-400} y={640} width={W + 800} height={700} fill="#5a3420" />
          {Array.from({length: 6}, (_, i) => (
            <rect key={i} x={-400} y={660 + i * 70} width={W + 800} height={5} fill="#462817" />
          ))}
          {/* window with moon */}
          <rect x="1460" y="20" width="330" height="360" rx="160" fill="#efe1c3" />
          <rect x="1480" y="40" width="290" height="320" rx="145" fill="#1c2546" />
          <circle cx="1650" cy="150" r="110" fill="url(#moonGlow)" />
          <circle cx="1650" cy="150" r="44" fill="#fbeec8" />
          <circle cx="1632" cy="140" r="8" fill="#ecdcae" />
          <circle cx="1666" cy="168" r="6" fill="#ecdcae" />
          <path d="M1625 40 V360 M1480 200 H1770" stroke="#efe1c3" strokeWidth="10" />
          <path d="M1430 0 Q 1480 200 1440 420 L 1400 420 L 1400 0Z" fill="#c98f45" />
          <path d="M1820 0 Q 1770 200 1810 420 L 1850 420 L 1850 0Z" fill="#c98f45" />
          {/* nightstand with lamp and star projector */}
          <rect x="40" y="440" width="220" height="220" rx="10" fill="#4e2e1c" />
          <rect x="56" y="470" width="188" height="70" rx="6" fill="#5e3a22" />
          <circle cx="150" cy="505" r="8" fill="#d39a45" />
          <rect x="80" y="380" width="16" height="60" fill="#c98f45" />
          <path d="M40 380 L 136 380 L 116 310 L 60 310Z" fill={`rgb(${Math.round(lerp(150, 242, lamp))},${Math.round(lerp(110, 207, lamp))},${Math.round(lerp(80, 134, lamp))})`} />
          <path d="M170 440 Q 170 396 206 396 Q 242 396 242 440Z" fill="#2f3d6b" />
          {[[186, 420], [206, 410], [226, 422]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#f6dfa4" />
          ))}
          {/* framed moon picture */}
          <rect x="560" y="100" width="150" height="190" fill="#c98f45" />
          <rect x="574" y="114" width="122" height="162" fill="#1f2a4a" />
          <path d="M650 160 a 28 28 0 1 0 14 40 a 22 22 0 1 1 -14 -40z" fill="#fbeec8" />
        </g>

        {/* lamp glow (fades) */}
        <circle cx="88" cy="350" r="560" fill="url(#warmLight)" opacity={lamp * 1.1} />

        {/* projected stars on the wall (brighter as the room darkens) */}
        <g transform={`rotate(${starRot}, 206, 420)`} opacity={0.25 + 0.75 * dark}>
          {Array.from({length: 34}, (_, i) => {
            const a = rand(i) * Math.PI * 2;
            const r = 300 + rand(i + 1) * 1300;
            const x = 206 + Math.cos(a) * r;
            const y = 420 + Math.sin(a) * r * 0.55;
            if (y > 640 || y < -200) return null;
            return <Sparkle key={i} x={x} y={y} s={0.7 + rand(i + 2) * 0.9} o={0.5 + 0.5 * Math.sin(t * 1.5 + i)} color={i % 4 === 0 ? '#bcd3f5' : '#f6dfa4'} />;
          })}
        </g>

        {/* Daddy kneeling behind the bed */}
        <g transform={`translate(${dadX - 960},${dadY})`}>
          <path d="M800 400 Q 960 340 1120 400 Q 1170 450 1170 560 L 750 560 Q 750 450 800 400Z" fill={C.tee} />
          <g transform={`translate(960, ${290 + Math.sin(t * 1.2) * 4}) rotate(${-18 + Math.sin(t * 0.9) * (songStanza ? 5 : 2) - lean * 20 - dadSleep * 14}) scale(0.9)`}>
            <DadHead mouth={dadMouth} open={Math.max(0, sing)} blinkAmt={dadSleep > 0.5 ? 1 : blink(t, 11)} look={[-1, 0.8]} sleepyEyes={isNight} />
          </g>
        </g>

        {/* the bed */}
        <g filter={`url(#rough-${mode})`}>
          <rect x="250" y="360" width="50" height="340" rx="16" fill="#8a5a34" />
          <rect x="230" y="340" width="90" height="34" rx="16" fill="#9a6a3c" />
          <rect x="1510" y="450" width="44" height="250" rx="14" fill="#8a5a34" />
          <rect x="1494" y="434" width="76" height="30" rx="14" fill="#9a6a3c" />
          <rect x="290" y="560" width="1230" height="90" rx="20" fill="#f3e6cc" />
          <rect x="300" y="640" width="1210" height="40" fill="#8a5a34" />
          {/* pillow */}
          <rect x="300" y="440" width="270" height="130" rx="60" fill="#fbf5e8" />
        </g>

        {/* the toddler */}
        <g transform={`translate(440, ${470 + Math.sin(t * 1.3) * 2}) rotate(${-14 + (mouth === 'yawn' ? -4 : 0)}) scale(0.8)`}>
          <KidHead eyes={eyes} mouth={mouth} blinkAmt={eyes === 'open' ? blink(t, 13) : 0} look={[1, -0.4]} t={t} />
        </g>
        {/* toes peeking out at the foot end */}
        <g opacity={1 - coverToes}>
          <g transform={`translate(1420, ${492 + coverToes * 40}) rotate(-8) scale(0.62)`}>
            <Foot toeLift={toeWig(0)} />
          </g>
          <g transform={`translate(1468, ${500 + coverToes * 40}) rotate(6) scale(0.62)`}>
            <Foot toeLift={toeWig(2)} mirror />
          </g>
        </g>
        {/* quilt */}
        <g filter={`url(#rough-${mode})`}>
          <path
            d={`M540 ${560} Q 520 500 600 488 Q 800 470 1000 486 Q 1200 ${468 - coverToes * 20} ${1400 + coverToes * 60} ${520 - coverToes * 40} L ${1500 + coverToes * 10} 560 L 1510 720 L 520 720 Z`}
            fill="url(#quiltPattern)"
          />
          <path d={`M540 560 Q 520 500 600 488 Q 800 470 1000 486 Q 1200 ${468 - coverToes * 20} ${1400 + coverToes * 60} ${520 - coverToes * 40}`} stroke="#f6ead4" strokeWidth="10" fill="none" strokeDasharray="16 12" opacity="0.7" />
          <path d="M600 488 Q 620 520 600 560" stroke="#000" strokeWidth="8" opacity="0.1" fill="none" />
        </g>
        {/* little hand on the quilt edge */}
        <ellipse cx="610" cy="500" rx="24" ry="18" fill="url(#kidSkin)" stroke={C.kidShade} strokeWidth="3" />

        {/* Daddy's arms resting on the quilt; one does the tucking */}
        {(() => {
          const restL: [number, number] = [820 + (dadX - 960), 500 + dadY * 0.4];
          let restR: [number, number] = [1090 + (dadX - 960), 505 + dadY * 0.4];
          if (isNight && tuckP > 0 && tuckP < 1) restR = [lerp(620, 1400, tuckP), 500 + Math.sin(tuckP * Math.PI * 4) * 8];
          if (isNight && coverToes > 0 && coverToes < 1) restR = [1440, 470];
          return (
            <g>
              <Limb a={[820 + (dadX - 960), 420 + dadY]} b={restL} bend={-30} w={54} fill={C.skin} shade={C.skinShade} />
              <Hand x={restL[0] - 10} y={restL[1]} rot={170} s={0.85} />
              <Limb a={[1100 + (dadX - 960), 420 + dadY]} b={restR} bend={30} w={54} fill={C.skin} shade={C.skinShade} />
              <Hand x={restR[0]} y={restR[1]} rot={-10} s={0.85} />
            </g>
          );
        })()}

        {/* music notes drifting to the toddler */}
        {(singing || songStanza) &&
          Array.from({length: 8}, (_, i) => {
            const period = 4.2;
            const q = (((t - cue(9, 1)) + (i * period) / 8) % period) / period;
            // aim: nose / hair / toes depending on the line
            let tx = 470;
            let ty = 420;
            if (t > cue(9, 2) && t < cue(9, 3)) [tx, ty] = i % 2 ? [450, 470] : [440, 360];
            else if (t > cue(9, 3) && t < cue(10, 0)) [tx, ty] = [1440, 440];
            else if (i % 3 === 0) [tx, ty] = [1440, 440];
            const sx = dadX - 60;
            const sy = 380;
            const x = lerp(sx, tx, q) + Math.sin(q * 9 + i) * 26;
            const y = lerp(sy, ty, q) - Math.sin(Math.PI * q) * 140;
            return <Note key={i} x={x} y={y} s={0.9 + rand(i) * 0.6} o={Math.sin(Math.PI * q) * (0.7 + 0.3 * lamp)} kind={i % 2} />;
          })}

        <HeartStream t={t} x={1440} y={430} strength={lean} count={8} spread={60} rise={180} />
        {isNight && <Word text="mwah!" x={1500} y={330} t={t} t0={kissT} size={64} rot={6} />}
        {isNight && <Word text="yaaawn" x={420} y={300} t={t} t0={wordAt(11, 0, 'yawn') - 0.1} size={54} rot={-6} dur={1.8} />}
        {/* Zzz */}
        {isNight && t > cue(11, 3) &&
          [0, 1, 2].map((i) => {
            const q = ((t * 0.35 + i / 3) % 1);
            return (
              <text key={i} x={500 + q * 80 + i * 10} y={380 - q * 160} fontFamily="Fraunces" fontWeight={800} fontSize={36 + q * 30} fill="#f6dfa4" opacity={Math.sin(Math.PI * q) * 0.9}>
                z
              </text>
            );
          })}
      </g>
      {/* night tint */}
      <rect width={W} height={H} fill="#0e1430" opacity={dark * 0.55} />
      {/* ending: extra dark so the words read */}
      {isNight && <rect width={W} height={H} fill="#080a18" opacity={0.55 * ramp(t, cue(12, 0) - 1.5, cue(12, 0))} />}
      <rect width={W} height={H} fill="url(#vignette)" />
    </svg>
  );
};
