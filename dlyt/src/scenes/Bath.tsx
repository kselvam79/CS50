import React from 'react';
import {Bubble, C, DadHead, Defs, Foot, H, Hand, HeartStream, KidHead, Limb, Sparkle, W, Word, blink, cue, hop, lerp, rand, ramp, sceneRange, smooth, spring, talk} from '../lib';

// stanza 0 & 1 — bath time. Side view of a cosy bathroom at night.

const Tiles: React.FC = () => {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 17; c++) {
      const x = c * 120 - (r % 2) * 60;
      const y = 330 + r * 80;
      const v = rand(r * 31 + c);
      out.push(<rect key={`${r}-${c}`} x={x + 3} y={y + 3} width={114} height={74} rx={8} fill={v > 0.7 ? '#a8bda4' : v > 0.35 ? '#9db29a' : '#93a990'} />);
    }
  return <g>{out}</g>;
};

const FloorTiles: React.FC = () => {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 22; c++) {
      const x = c * 100 - (r % 2) * 50;
      const y = 800 + r * 72;
      out.push(<rect key={`${r}-${c}`} x={x + 2} y={y + 2} width={96} height={68} rx={4} fill={rand(r * 13 + c * 7) > 0.5 ? '#b9644a' : '#a9583f'} />);
    }
  return <g>{out}</g>;
};

const Window: React.FC<{t: number}> = ({t}) => (
  <g>
    <path d="M1300 440 L1300 190 Q1300 80 1420 80 Q1540 80 1540 190 L1540 440Z" fill="#efe1c3" />
    <path d="M1320 425 L1320 195 Q1320 100 1420 100 Q1520 100 1520 195 L1520 425Z" fill="#1f2a4a" />
    <circle cx="1460" cy="180" r="70" fill="url(#moonGlow)" />
    <circle cx="1460" cy="180" r="28" fill="#fbeec8" />
    <circle cx="1472" cy="172" r="26" fill="#1f2a4a" />
    {[[1360, 150], [1400, 260], [1490, 300], [1350, 340], [1440, 380]].map(([x, y], i) => (
      <Sparkle key={i} x={x} y={y} s={0.5 + 0.2 * Math.sin(t * 2 + i)} o={0.8} />
    ))}
    <path d="M1420 100 L1420 425 M1320 260 L1520 260" stroke="#efe1c3" strokeWidth="10" />
    <rect x="1285" y="430" width="270" height="22" rx="6" fill="#e6d3ae" />
    {/* plant */}
    <path d="M1470 430 q -6 -30 6 -50 q 8 20 -6 50 M1480 430 q 10 -40 34 -46 q -4 30 -34 46 M1470 430 q -20 -30 -40 -30 q 10 26 40 30" fill="#6e7d45" />
    <path d="M1452 404 L1500 404 L1494 432 L1458 432Z" fill="#b9644a" />
  </g>
);

export const Bath: React.FC<{t: number}> = ({t}) => {
  const [s0, s1] = sceneRange('bath');
  const lt = t - s0;
  const zoom = lerp(1.0, 1.07, smooth(lt / (s1 - s0)));
  const panX = lerp(0, -40, smooth(lt / (s1 - s0)));

  const feetUp = spring(t, cue(0, 2) + 1.2, 7, 4);
  const toesWiggle = t > cue(0, 3) - 0.2;
  const kick = t > cue(1, 1) - 0.2 && t < cue(1, 2) ? Math.sin((t - cue(1, 1)) * 9) : 0;
  const scrubbing = t > cue(1, 0) - 0.3 && t < cue(1, 1);
  const happy = toesWiggle || kick !== 0;

  // kid's legs (from the water at the far end) up to the feet
  const legBase1: [number, number] = [1035, 600];
  const legBase2: [number, number] = [1080, 600];
  const foot1: [number, number] = [lerp(1080, 1110, feetUp) + kick * 18, lerp(640, 360, feetUp) - Math.max(0, kick) * 20];
  const foot2: [number, number] = [lerp(1130, 1200, feetUp) - kick * 18, lerp(650, 380, feetUp) + Math.min(0, kick) * 20];

  const wig = (i: number, f: number) => (toesWiggle ? 0.5 + 0.5 * Math.sin(t * 11 + i * 0.9 + f) : 0);
  const toeLift1 = [0, 1, 2, 3, 4].map((i) => wig(i, 0));
  const toeLift2 = [0, 1, 2, 3, 4].map((i) => wig(i, 2));

  // Dad's sponge hand
  const scrub = scrubbing ? [Math.cos(t * 9) * 16, Math.sin(t * 9) * 10] : [0, 0];
  const reach = ramp(t, cue(0, 3), cue(0, 3) + 1.2);
  const handX = lerp(1350, foot2[0] + 30, reach) + scrub[0];
  const handY = lerp(560, foot2[1] + 70, reach) + scrub[1];

  // duck
  const quackT = cue(1, 2) + 0.3;
  const duckJump = hop(t, quackT, 0.6);
  const duckX = 820 + Math.sin(t * 0.6) * 40;
  const duckY = 520 + Math.sin(t * 2.1) * 6 - duckJump * 70;

  const popT = cue(1, 2) + 1.4;
  const talkO = talk(t);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <Defs id="bath" />
      <g transform={`translate(${W / 2 + panX},${H / 2 - 120}) scale(${zoom}) translate(${-W / 2},${-H / 2})`}>
        <g filter="url(#rough-bath)">
          {/* upper wall */}
          <rect y={-200} width={W} height={540} fill="#e8cf9f" />
          <rect y={300} width={W} height={40} fill="#d9b981" />
          <Tiles />
          <rect y={790} width={W} height={14} fill="#7f9478" />
          <FloorTiles />
          <circle cx="260" cy="200" r="520" fill="url(#warmLight)" />
          {/* sconce */}
          <path d="M240 150 h40 v26 h-40z" fill="#a8702c" />
          <path d="M220 176 Q 260 110 300 176 Z" fill="#f6d89a" />
          <circle cx="260" cy="190" r="60" fill="#ffe2a0" opacity="0.4" filter="url(#soft)" />
          <Window t={t} />
          {/* towel rail + red towel */}
          <rect x="70" y="420" width="220" height="10" rx="5" fill="#c59a4c" />
          <path d="M95 425 L 265 425 L 260 640 Q 180 660 100 640Z" fill={C.red} />
          <path d="M100 600 L 262 600 M100 615 L 262 615" stroke="#e7b9a0" strokeWidth="6" />
          {/* shelf with bottles */}
          <rect x="1640" y="380" width="230" height="14" rx="5" fill="#a8702c" />
          <rect x="1660" y="320" width="34" height="60" rx="10" fill="#7d8248" />
          <rect x="1710" y="300" width="40" height="80" rx="12" fill="#e6b45e" />
          <rect x="1766" y="330" width="30" height="50" rx="8" fill="#b9573f" />
          <rect x="1720" y="292" width="20" height="12" rx="3" fill="#f6ead4" />
          {/* bath mat */}
          <ellipse cx="1600" cy="965" rx="290" ry="55" fill="#e8d4a4" />
          <ellipse cx="1600" cy="965" rx="250" ry="40" fill="none" stroke="#c98f45" strokeWidth="10" strokeDasharray="30 14" />
          {/* tub shadow */}
          <ellipse cx="850" cy="905" rx="520" ry="34" fill="#5a2a1c" opacity="0.35" />
        </g>

        {/* steam */}
        {Array.from({length: 7}, (_, i) => {
          const p = ((lt * 0.12 + i / 7) % 1);
          return (
            <path
              key={i}
              d={`M${450 + i * 120 + Math.sin(p * 6 + i) * 30} ${500 - p * 360} q 30 -40 0 -80 q -30 -40 0 -80`}
              stroke="#fffaf0"
              strokeWidth={24}
              fill="none"
              strokeLinecap="round"
              opacity={0.16 * Math.sin(Math.PI * p)}
              filter="url(#soft4)"
            />
          );
        })}

        {/* kid head poking above the foam */}
        <g transform={`translate(560, ${418 + Math.sin(t * 1.8) * 4}) rotate(${Math.sin(t * 1.1) * 4 - 6}) scale(1.0)`}>
          <KidHead
            eyes={happy ? 'happy' : 'open'}
            mouth={kick !== 0 ? 'giggle' : toesWiggle ? 'giggle' : t > cue(0, 2) && t < cue(0, 3) ? 'o' : 'smile'}
            blinkAmt={blink(t, 1)}
            look={[1, 0.2]}
            wet
            crown={ramp(t, s0 + 0.5, s0 + 2)}
            t={t}
          />
        </g>

        {/* legs + feet (behind foam) */}
        <Limb a={legBase1} b={[foot1[0] - 4, foot1[1] + 50]} bend={-20} w={46} fill="#dcaa83" shade={C.kidShade} />
        <Limb a={legBase2} b={[foot2[0] - 4, foot2[1] + 50]} bend={20} w={46} fill="#dcaa83" shade={C.kidShade} />
        <g transform={`translate(${foot1[0]},${foot1[1]}) rotate(${-14 + kick * 8}) scale(0.95)`}>
          <Foot toeLift={toeLift1} toeGlow={toesWiggle ? toeLift1.map((x) => x * 0.4) : undefined} mirror />
        </g>
        <g transform={`translate(${foot2[0]},${foot2[1]}) rotate(${12 - kick * 8}) scale(0.95)`}>
          <Foot toeLift={toeLift2} toeGlow={toesWiggle ? toeLift2.map((x) => x * 0.4) : undefined} />
        </g>
        {/* soapy suds on the feet */}
        <Bubble x={foot1[0] - 20} y={foot1[1] + 30} r={14} />
        <Bubble x={foot2[0] + 22} y={foot2[1] + 10} r={11} />

        {/* tub */}
        <g filter="url(#rough-bath)">
          <path d="M360 560 Q 340 600 380 660 Q 430 830 620 860 L 1110 860 Q 1290 830 1330 660 Q 1360 600 1340 560 Z" fill={C.red} />
          <path d="M400 600 Q 440 800 620 836 L 1080 836 Q 1250 810 1300 640" stroke="#a84a40" strokeWidth="16" fill="none" opacity="0.6" />
          <path d="M380 600 Q 420 720 520 790" stroke="#c46a5a" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.6" />
          <rect x="340" y="540" width="1020" height="40" rx="20" fill="#f4ecdc" />
          <rect x="350" y="546" width="1000" height="10" rx="5" fill="#fffaf0" opacity="0.8" />
          {/* claw feet */}
          {[520, 1180].map((x, i) => (
            <g key={i}>
              <path d={`M${x - 30} 850 Q ${x - 40} 900 ${x - 60} 912 L ${x + 40} 912 Q ${x + 20} 900 ${x + 30} 850Z`} fill="#d9a441" />
              <path d={`M${x - 56} 912 q 10 -12 20 0 q 10 -12 20 0 q 10 -12 20 0 q 10 -12 20 0`} stroke="#a8702c" strokeWidth="5" fill="none" />
            </g>
          ))}
          {/* tap at the left end */}
          <path d="M370 540 L 370 470 Q 370 430 410 430 L 430 430" stroke="#d9a441" strokeWidth="18" fill="none" strokeLinecap="round" />
          <circle cx="352" cy="500" r="14" fill="#d9a441" />
        </g>

        {/* foam */}
        <g>
          {Array.from({length: 42}, (_, i) => {
            const x = 380 + (i / 41) * 940 + (rand(i) - 0.5) * 30;
            const nearHead = Math.abs(x - 560) < 120;
            const y = (nearHead ? 560 : 545) - rand(i + 5) * (nearHead ? 20 : 70) + Math.sin(t * 1.5 + i) * 3;
            const r = nearHead ? 24 + rand(i + 11) * 10 : 26 + rand(i + 11) * 26;
            return <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? '#fbfcfd' : '#eef3f6'} />;
          })}
          {Array.from({length: 26}, (_, i) => {
            const x = 390 + rand(i + 40) * 920;
            if (Math.abs(x - 560) < 110) return null;
            const y = 500 - rand(i + 60) * 60;
            const popped = t > popT + (i % 6) * 0.12 && t < popT + 2.5 && i % 4 === 0;
            return <Bubble key={i} x={x} y={y + Math.sin(t * 2 + i) * 3} r={popped ? 0 : 8 + rand(i + 3) * 12} />;
          })}
          {/* pop rings */}
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const tt = t - (popT + k * 0.12 * 4);
            if (tt < 0 || tt > 0.5) return null;
            const i = k * 4;
            const x = 390 + rand(i + 40) * 920;
            const y = 500 - rand(i + 60) * 60;
            return <circle key={k} cx={x} cy={y} r={10 + tt * 60} fill="none" stroke="#fff" strokeWidth={3} opacity={1 - tt * 2} />;
          })}
        </g>

        {/* the duck */}
        <g transform={`translate(${duckX},${duckY}) rotate(${Math.sin(t * 2.1) * 6 - duckJump * 12})`}>
          <ellipse cx="0" cy="10" rx="44" ry="30" fill="#f2c043" />
          <path d="M34 0 Q 60 -10 48 16Z" fill="#f2c043" />
          <circle cx="-22" cy="-24" r="24" fill="#f2c043" />
          <path d="M-44 -24 Q -66 -22 -62 -14 Q -54 -10 -40 -16Z" fill="#e0763c" />
          <circle cx="-28" cy="-30" r="4.5" fill="#2b1a14" />
          <circle cx="-29.5" cy="-31.5" r="1.5" fill="#fff" />
          <path d="M-10 6 Q 10 20 26 4" stroke="#d9a032" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
        <Word text="Quack!" x={duckX - 40} y={duckY - 110} t={t} t0={quackT} size={70} />
        <Word text="Splish!" x={460} y={350} t={t} t0={cue(0, 0)} size={80} rot={-10} />
        <Word text="Splash!" x={1020} y={300} t={t} t0={cue(0, 0) + 1.2} size={80} rot={8} />

        {/* splash droplets when kicking or splishing */}
        {[cue(0, 0), cue(0, 0) + 1.2, cue(1, 1), cue(1, 1) + 1.1].map((t0, k) => {
          const p = (t - t0) / 0.9;
          if (p < 0 || p > 1) return null;
          const ox = k < 2 ? (k === 0 ? 560 : 1000) : 1120;
          return (
            <g key={k}>
              {Array.from({length: 10}, (_, i) => {
                const a = -Math.PI / 2 + (rand(i + k * 10) - 0.5) * 2.2;
                const v = 340 + rand(i + 3) * 260;
                const x = ox + Math.cos(a) * v * p;
                const y = 520 + Math.sin(a) * v * p + 700 * p * p;
                return <ellipse key={i} cx={x} cy={y} rx={7} ry={10} fill="#d8ecf4" opacity={1 - p} />;
              })}
            </g>
          );
        })}

        {/* rising bubbles */}
        {Array.from({length: 10}, (_, i) => {
          const p = ((lt * 0.18 + i / 10) % 1);
          return <Bubble key={i} x={420 + rand(i + 70) * 880 + Math.sin(p * 8 + i) * 20} y={480 - p * 420} r={6 + rand(i) * 10} o={Math.sin(Math.PI * p) * 0.9} />;
        })}

        {/* Daddy, kneeling on the mat at the right */}
        <g>
          {/* legs kneeling */}
          <path d="M1530 760 Q 1500 900 1560 950 L 1820 950 Q 1840 900 1760 860 L 1700 760Z" fill="#3d4a5f" />
          <path d="M1560 950 L 1830 950 Q 1860 930 1830 912 L 1600 912Z" fill="#2e384a" />
          {/* far arm resting on rim */}
          <Limb a={[1640, 560]} b={[1430, 560]} bend={-30} w={50} fill={C.skin} shade={C.skinShade} />
          <Hand x={1400} y={556} rot={180} s={0.9} />
          {/* torso, leaning left */}
          <path d="M1500 470 Q 1560 420 1680 440 Q 1760 470 1760 600 L 1760 790 Q 1640 820 1510 790 Q 1470 640 1500 470Z" fill={C.tee} />
          <path d="M1700 450 Q 1760 480 1760 600 L 1760 790 Q 1720 800 1690 800 Q 1720 640 1700 450Z" fill={C.teeShade} opacity="0.7" />
          {/* rolled sleeve, near arm reaching to the foot */}
          <Limb a={[1540, 520]} b={[handX + 40, handY + 10]} bend={40} w={54} fill={C.skin} shade={C.skinShade} />
          <path d="M1500 480 Q 1560 470 1580 540 Q 1540 570 1500 560Z" fill={C.tee} />
          <path d="M1505 550 Q 1545 560 1578 534" stroke="#b6c6d8" strokeWidth="10" fill="none" strokeLinecap="round" />
          {/* sponge in hand */}
          <g transform={`translate(${handX},${handY}) rotate(${-20 + scrub[0] * 0.5})`}>
            <rect x="-38" y="-26" width="76" height="46" rx="16" fill="#f0c34c" />
            {[[-20, -8], [4, -14], [18, 4], [-8, 8]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="4" fill="#d99f2c" />
            ))}
          </g>
          <Hand x={handX + 30} y={handY + 14} rot={190} s={0.85} />
          {scrubbing && [0, 1, 2].map((i) => <Bubble key={i} x={handX - 20 + Math.sin(t * 7 + i * 2) * 40} y={handY - 30 - ((t * 60 + i * 30) % 80)} r={8} />)}
          {/* head */}
          <g transform={`translate(1600, 330) rotate(${-8 + Math.sin(t * 0.9) * 2}) scale(0.92)`}>
            <DadHead mouth={talkO >= 0 ? 'talk' : 'smile'} open={Math.max(0, talkO)} blinkAmt={blink(t, 4)} look={[-1, 0.4]} />
          </g>
        </g>

        <HeartStream t={t} x={1280} y={330} strength={ramp(t, cue(1, 3), cue(1, 3) + 0.6)} />
        {toesWiggle && t < cue(1, 0) && [0, 1, 2, 3].map((i) => <Sparkle key={i} x={foot1[0] + 60 * Math.cos(t * 2 + i * 1.6)} y={foot1[1] - 60 + 50 * Math.sin(t * 2 + i * 1.6)} s={0.9} o={0.9} />)}
      </g>
      <rect width={W} height={H} fill="url(#vignette)" />
    </svg>
  );
};
