import React from 'react';
import {C, DadHead, Defs, Foot, H, Hand, Heart, HeartStream, KidHead, Limb, Sparkle, W, Word, blink, cue, hop, lerp, rand, ramp, sceneRange, smooth, talk, wordAt} from '../lib';

// stanzas 5–8 — the pose from the photo, seen from above.
// Daddy on his back (head left), toddler on top the other way (head by Daddy's knees),
// Daddy holding both little feet by his face.

type Shot = {at: number; x: number; y: number; z: number};

const camAt = (shots: Shot[], t: number) => {
  if (t <= shots[0].at) return shots[0];
  for (let i = 1; i < shots.length; i++) {
    const a = shots[i - 1];
    const b = shots[i];
    if (t <= b.at) {
      const p = smooth((t - a.at) / (b.at - a.at));
      return {at: t, x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: lerp(a.z, b.z, p)};
    }
  }
  return shots[shots.length - 1];
};

const Cloud: React.FC<{x: number; y: number; w: number; h: number; o: number; children?: React.ReactNode}> = ({x, y, w, h, o, children}) => {
  if (o <= 0.01) return null;
  const bumps = 9;
  return (
    <g transform={`translate(${x},${y}) scale(${0.8 + 0.2 * o})`} opacity={o}>
      {Array.from({length: bumps}, (_, i) => {
        const a = (i / bumps) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * w * 0.45} cy={Math.sin(a) * h * 0.42} r={h * 0.3} fill="#fbf3e2" />;
      })}
      <ellipse rx={w * 0.47} ry={h * 0.44} fill="#fbf3e2" />
      <circle cx={-w * 0.25} cy={h * 0.68} r={20} fill="#fbf3e2" />
      <circle cx={-w * 0.32} cy={h * 0.86} r={11} fill="#fbf3e2" />
      <g>{children}</g>
    </g>
  );
};

/** a tiny side-view toddler for the thought bubbles */
const MiniKid: React.FC<{x: number; y: number; t: number; mode: 'run' | 'dance' | 'stand'; s?: number}> = ({x, y, t, mode, s = 1}) => {
  const ph = t * (mode === 'run' ? 12 : 6);
  const legA = mode === 'stand' ? 0 : Math.sin(ph) * 30;
  const armA = mode === 'dance' ? -120 + Math.sin(ph) * 30 : Math.sin(ph + Math.PI) * 40;
  const bob = mode === 'stand' ? 0 : Math.abs(Math.sin(ph)) * -6;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${s})`}>
      <g transform={`rotate(${legA})`}>
        <rect x="-7" y="20" width="14" height="40" rx="7" fill={C.pj} />
        <ellipse cx="6" cy="62" rx="12" ry="7" fill={C.kidSkin} />
      </g>
      <g transform={`rotate(${-legA})`}>
        <rect x="-7" y="20" width="14" height="40" rx="7" fill={C.pjShade} />
        <ellipse cx="6" cy="62" rx="12" ry="7" fill={C.kidShade} />
      </g>
      <rect x="-18" y="-20" width="36" height="48" rx="14" fill={C.pj} />
      <g transform={`translate(0,-10) rotate(${armA})`}>
        <rect x="-5" y="0" width="10" height="32" rx="5" fill={C.pj} />
        <circle cx="0" cy="34" r="6" fill={C.kidSkin} />
      </g>
      <circle cx="0" cy="-42" r="26" fill={C.kidSkin} />
      <path d="M-26 -46 Q -24 -72 0 -70 Q 26 -70 26 -46 Q 10 -58 -26 -46Z" fill={C.hair} />
      <circle cx="10" cy="-42" r="3" fill={C.ink} />
      <path d="M8 -32 q 8 4 14 -2" stroke={C.ink} strokeWidth="2.5" fill="none" />
      <circle cx="14" cy="-34" r="5" fill={C.cheek} opacity="0.5" />
    </g>
  );
};

export const Toes: React.FC<{t: number}> = ({t}) => {
  const [s0] = sceneRange('toes');

  // ---- counting cues ----
  const c1 = wordAt(5, 2, 'one');
  const c2 = wordAt(5, 2, 'two');
  const middle = cue(5, 3);
  const other = cue(6, 0);
  const otherCounts = [0, 1, 2, 3, 4].map((i) => other + 0.4 + i * 0.42);
  const ten = cue(6, 1);
  const giggleT = cue(6, 2);
  const stinky = wordAt(6, 3, 'stinky');
  const sweet = wordAt(6, 3, 'sweet');
  const bigFeet = cue(7, 0);
  const kissT = cue(7, 1);
  const eatT = wordAt(7, 1, 'eat');
  const steady = cue(7, 2);
  const door = cue(8, 0);
  const laugh = cue(8, 2);

  const glowA = [0, 0, 0, 0, 0];
  const liftA = [0, 0, 0, 0, 0];
  const glowB = [0, 0, 0, 0, 0];
  const liftB = [0, 0, 0, 0, 0];
  // foot A = Daddy's upper hand; toes counted from the big toe
  [c1, c2].forEach((tc, i) => {
    glowA[i] = ramp(t, tc - 0.1, tc + 0.2) * (1 - ramp(t, ten + 4, ten + 5));
    liftA[i] = hop(t, tc - 0.05, 0.5);
  });
  // the "three in the middle" wiggle with question marks
  const midWig = t > middle && t < other ? 1 : 0;
  [2, 3, 4].forEach((i) => {
    liftA[i] += midWig * (0.5 + 0.5 * Math.sin(t * 13 + i * 1.3));
  });
  otherCounts.forEach((tc, i) => {
    glowB[i] = ramp(t, tc - 0.1, tc + 0.2) * (1 - ramp(t, ten + 4, ten + 5));
    liftB[i] = hop(t, tc - 0.05, 0.5);
  });
  const allTen = ramp(t, ten, ten + 0.4) * (1 - ramp(t, ten + 4, ten + 5));
  for (let i = 0; i < 5; i++) {
    glowA[i] = Math.max(glowA[i], allTen);
    glowB[i] = Math.max(glowB[i], allTen);
    const w = t > ten && t < ten + 2.6 ? 0.5 + 0.5 * Math.sin(t * 14 + i) : 0;
    liftA[i] += w;
    liftB[i] += w;
  }
  // general wiggles while laughing / tickling
  const tickling = t > giggleT - 0.2 && t < stinky - 0.3;
  const laughing = t > laugh - 0.2;
  if (tickling || laughing || (t > kissT && t < steady)) {
    for (let i = 0; i < 5; i++) {
      liftA[i] += 0.4 + 0.4 * Math.sin(t * 12 + i);
      liftB[i] += 0.4 + 0.4 * Math.sin(t * 12 + i + 2);
    }
  }

  // ---- bodies ----
  const breathe = Math.sin(t * 1.4);
  const squirm = tickling || laughing ? Math.sin(t * 9) * 8 : 0;
  const kidHeadLift = hop(t, bigFeet, 1.4) * 1; // kid looks up when asking
  const feetToMouth = Math.min(ramp(t, kissT - 0.3, kissT + 0.4), 1 - ramp(t, steady - 0.6, steady));
  const footA: [number, number] = [lerp(640, 520, feetToMouth), lerp(470, 500, feetToMouth) + squirm * 0.5];
  const footB: [number, number] = [lerp(640, 520, feetToMouth), lerp(615, 590, feetToMouth) - squirm * 0.5];
  const dadBigFeet = ramp(t, bigFeet + 0.2, bigFeet + 0.9) * (1 - ramp(t, kissT + 2, kissT + 3));

  const talkO = talk(t);
  const dadMouth = laughing && talkO < 0 ? 'laugh' : feetToMouth > 0.6 ? 'kiss' : talkO >= 0 ? 'talk' : 'smile';
  const kidMouth = tickling || laughing || (t > kissT && t < steady) ? 'giggle' : t > bigFeet && t < bigFeet + 2.2 ? 'o' : 'smile';
  const kidEyes = tickling || laughing || (t > kissT && t < steady) || (t > ten && t < ten + 3) ? 'happy' : 'open';

  // ---- camera ----
  const shots: Shot[] = [
    {at: s0 - 2, x: 960, y: 540, z: 1.0},
    {at: s0 + 1.5, x: 960, y: 540, z: 1.0},
    {at: cue(5, 1) + 1.5, x: 900, y: 540, z: 1.05},
    {at: c1 - 0.3, x: 610, y: 540, z: 1.75},
    {at: other + 3, x: 620, y: 545, z: 1.8},
    {at: giggleT - 0.4, x: 760, y: 540, z: 1.35},
    {at: stinky, x: 760, y: 540, z: 1.4},
    {at: stinky + 0.6, x: 620, y: 540, z: 1.8},
    {at: bigFeet - 0.4, x: 1160, y: 540, z: 0.95},
    {at: kissT - 0.2, x: 1160, y: 540, z: 0.95},
    {at: kissT + 0.4, x: 520, y: 540, z: 1.6},
    {at: steady - 0.4, x: 520, y: 540, z: 1.6},
    {at: steady + 0.4, x: 960, y: 560, z: 1.0},
    {at: laugh - 0.3, x: 960, y: 560, z: 1.0},
    {at: laugh + 3, x: 900, y: 560, z: 1.15},
    {at: laugh + 30, x: 900, y: 560, z: 1.15},
  ];
  const cam = camAt(shots, t);
  const focusY = 430;

  const bubble1 = Math.min(ramp(t, steady - 0.1, steady + 0.5), 1 - ramp(t, door - 0.6, door - 0.1));
  const bubble2 = Math.min(ramp(t, door, door + 0.5), 1 - ramp(t, laugh - 0.6, laugh));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <Defs id="toes" />
      <g transform={`translate(${W / 2},${focusY}) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
        <g filter="url(#rough-toes)">
          {/* wooden floor */}
          <rect x={-600} y={-600} width={W + 1200} height={H + 1200} fill="#6b3f26" />
          {Array.from({length: 16}, (_, i) => (
            <rect key={i} x={-600} y={-600 + i * 150} width={W + 1200} height={6} fill="#57311c" />
          ))}
          {Array.from({length: 30}, (_, i) => (
            <rect key={`k${i}`} x={-600 + rand(i) * (W + 1200)} y={-600 + Math.floor(rand(i + 3) * 16) * 150} width={6} height={150} fill="#57311c" />
          ))}
          {/* rug corner + slippers */}
          <rect x={-200} y={960} width={700} height={300} rx={30} fill="#7d8248" />
          <ellipse cx={180} cy={1010} rx={60} ry={28} fill="#c98f45" />
          <ellipse cx={290} cy={1030} rx={60} ry={28} fill="#c98f45" />
          {/* bed frame */}
          <rect x={40} y={40} width={1840} height={1000} rx={30} fill="#5a301c" />
          <rect x={70} y={70} width={1780} height={940} rx={24} fill="#f3e6cc" />
          {/* sheet folds */}
          {Array.from({length: 14}, (_, i) => (
            <path key={i} d={`M${120 + rand(i) * 1600} ${100 + rand(i + 4) * 860} q 40 ${-10 + rand(i + 7) * 20} 90 0`} stroke="#dccbb0" strokeWidth="5" fill="none" strokeLinecap="round" />
          ))}
          {/* Daddy's pillow */}
          <rect x={110} y={300} width={300} height={480} rx={80} fill="#fbf5e8" />
          <path d="M140 340 Q 200 540 150 740" stroke="#e8dcc6" strokeWidth="8" fill="none" />
          {/* bunny plush */}
          <g transform="translate(220, 930) rotate(-20)">
            <ellipse cx="0" cy="0" rx="46" ry="40" fill="#b9a6c4" />
            <ellipse cx="-18" cy="-56" rx="12" ry="34" fill="#b9a6c4" />
            <ellipse cx="18" cy="-56" rx="12" ry="34" fill="#b9a6c4" />
            <circle cx="-12" cy="-4" r="4" fill={C.ink} />
            <circle cx="12" cy="-4" r="4" fill={C.ink} />
            <ellipse cx="0" cy="8" rx="5" ry="3.5" fill="#e8826f" />
          </g>
          <circle cx="1600" cy="300" r="600" fill="url(#warmLight)" opacity="0.6" />
        </g>

        {/* Daddy's big feet poking out of the duvet end */}
        <g opacity={1}>
          {[440, 640].map((y, i) => (
            <g key={i} transform={`translate(${1795 + dadBigFeet * 70},${y}) rotate(${90 + Math.sin(t * 6 + i) * 8 * dadBigFeet}) scale(1.6)`}>
              <Foot toeLift={[0, 1, 2, 3, 4].map((k) => dadBigFeet * (0.5 + 0.5 * Math.sin(t * 10 + k + i)))} mirror={i === 1} />
            </g>
          ))}
        </g>

        {/* Daddy: tee, under the duvet from the hips */}
        <g transform={`translate(0,0)`}>
          <path d={`M400 ${330 - breathe * 4} Q 470 ${300 - breathe * 4} 600 300 L 920 300 Q 960 540 920 780 L 600 780 Q 470 ${780 + breathe * 4} 400 ${750 + breathe * 4} Q 360 540 400 ${330 - breathe * 4}Z`} fill={C.tee} />
          <path d="M600 300 Q 760 290 920 300 L 920 360 Q 760 350 600 360Z" fill={C.teeShade} opacity="0.5" />
          <path d="M410 470 Q 380 540 410 610" stroke={C.skinShade} strokeWidth="40" fill="none" strokeLinecap="round" />
        </g>
        {/* duvet over Daddy's legs */}
        <g filter="url(#rough-toes)">
          <path d="M880 230 Q 1300 200 1800 230 Q 1850 540 1800 850 Q 1300 880 880 850 Q 840 540 880 230Z" fill="url(#quiltPattern)" />
          <path d="M880 230 Q 1300 200 1800 230 Q 1850 540 1800 850 Q 1300 880 880 850 Q 840 540 880 230Z" fill="#000" opacity="0.06" />
          {/* knee bumps */}
          <ellipse cx="1420" cy="430" rx="150" ry="70" fill="#fff" opacity="0.12" />
          <ellipse cx="1420" cy="650" rx="150" ry="70" fill="#fff" opacity="0.12" />
          <path d="M890 240 Q 860 540 890 840" stroke="#a8702c" strokeWidth="14" fill="none" opacity="0.6" />
        </g>
        {/* little pillow by Daddy's knees */}
        <rect x={1360} y={410} width={240} height={260} rx={60} fill="#fbf5e8" />
        <path d="M1380 430 Q 1420 540 1380 650" stroke="#e8dcc6" strokeWidth="6" fill="none" />

        {/* Daddy's head on his pillow */}
        <g transform={`translate(270, 545) rotate(${-82 + Math.sin(t * 0.7) * 2 + (laughing ? Math.sin(t * 10) * 3 : 0)}) scale(1.05)`}>
          <DadHead mouth={dadMouth} open={Math.max(0, talkO)} blinkAmt={blink(t, 9)} look={[0, -1]} />
        </g>

        {/* the toddler, lying the other way on top */}
        <g transform={`translate(0, ${squirm * 0.6})`}>
          {/* legs */}
          <Limb a={[1080, 490]} b={[footA[0] + 60, footA[1]]} bend={-10} w={62} fill={C.pj} shade={C.pjShade} />
          <Limb a={[1080, 590]} b={[footB[0] + 60, footB[1]]} bend={10} w={62} fill={C.pj} shade={C.pjShade} />
          <path d={`M${footA[0] + 70} ${footA[1] - 30} L ${footA[0] + 70} ${footA[1] + 30}`} stroke="#e8dcc0" strokeWidth="12" strokeLinecap="round" />
          <path d={`M${footB[0] + 70} ${footB[1] - 30} L ${footB[0] + 70} ${footB[1] + 30}`} stroke="#e8dcc0" strokeWidth="12" strokeLinecap="round" />
          {/* body */}
          <path d={`M1060 430 Q 1180 ${410 - breathe * 3} 1300 440 L 1320 640 Q 1180 ${670 + breathe * 3} 1060 650 Q 1030 540 1060 430Z`} fill="url(#pjPattern)" stroke={C.pjShade} strokeWidth="4" />
          {/* arms: one up by the head, one out */}
          <Limb a={[1270, 450]} b={[1330 + squirm, 330]} bend={-30} w={40} fill={C.pj} shade={C.pjShade} />
          <circle cx={1335 + squirm} cy={320} r={24} fill="url(#kidSkin)" stroke={C.kidShade} strokeWidth="3" />
          <Limb a={[1270, 630]} b={[1250 - squirm, 760]} bend={30} w={40} fill={C.pj} shade={C.pjShade} />
          <circle cx={1245 - squirm} cy={770} r={24} fill="url(#kidSkin)" stroke={C.kidShade} strokeWidth="3" />
          {/* head on the little pillow */}
          <g transform={`translate(${1440 - kidHeadLift * 20}, 540) rotate(${90 + Math.sin(t * 1.2) * 3 + (tickling || laughing ? Math.sin(t * 9) * 6 : 0)}) scale(0.95)`}>
            <KidHead eyes={kidEyes} mouth={kidMouth} blinkAmt={blink(t, 6)} look={[0, 1]} t={t} />
          </g>
        </g>

        {/* Daddy's arms holding the feet */}
        <Limb a={[470, 340]} b={[footA[0] - 10, footA[1] - 40]} bend={-40} w={60} fill={C.skin} shade={C.skinShade} />
        <Limb a={[470, 740]} b={[footB[0] - 10, footB[1] + 40]} bend={40} w={60} fill={C.skin} shade={C.skinShade} />

        {/* the little feet: soles toward Daddy's face */}
        <g transform={`translate(${footA[0]},${footA[1]}) rotate(-90) scale(1.25)`}>
          <Foot toeLift={liftA} toeGlow={glowA} />
        </g>
        <g transform={`translate(${footB[0]},${footB[1]}) rotate(-90) scale(1.25)`}>
          <Foot toeLift={liftB} toeGlow={glowB} mirror />
        </g>
        {/* Daddy's hands wrapped round the heels */}
        <Hand x={footA[0] + 40} y={footA[1] - 30} rot={30} s={0.9} />
        <Hand x={footB[0] + 40} y={footB[1] + 30} rot={-30} s={0.9} />

        {/* counting numbers */}
        {[c1, c2].map((tc, i) => (
          <Word key={i} text={String(i + 1)} x={footA[0] - 110 + i * 10} y={footA[1] - 70 + i * 22} t={t} t0={tc} dur={1.5} size={54} rot={0} />
        ))}
        {otherCounts.map((tc, i) => (
          <Word key={`b${i}`} text={String(i + 1)} x={footB[0] - 125} y={footB[1] + 60 - i * 6} t={t} t0={tc} dur={1.2} size={50} rot={0} />
        ))}
        {midWig > 0 &&
          [0, 1, 2].map((i) => (
            <text key={i} x={footA[0] - 100 - i * 8} y={footA[1] - 40 + i * 30 + Math.sin(t * 6 + i) * 6} fontFamily="Fraunces" fontWeight={800} fontSize={40} fill="#fff4d8" stroke="#5e2420" strokeWidth={4} paintOrder="stroke" opacity={0.9}>
              ?
            </text>
          ))}
        <Word text="ten!" x={footA[0] - 160} y={footA[1] + 80} t={t} t0={ten + 0.6} dur={2} size={70} rot={-8} />
        <HeartStream t={t} x={460} y={540} strength={Math.max(allTen, ramp(t, sweet, sweet + 0.4) * (1 - ramp(t, bigFeet - 1, bigFeet)), feetToMouth, laughing ? 1 : 0)} count={10} spread={120} rise={260} />

        {/* stinky lines that turn into hearts */}
        {t > stinky - 0.2 && t < sweet + 0.3 &&
          [0, 1, 2].map((i) => (
            <path key={i} d={`M${footA[0] - 90} ${footA[1] + 20 + i * 40} q -20 -14 -40 0 q -20 14 -40 0 q -20 -14 -40 0`} stroke="#9fb34a" strokeWidth="7" fill="none" strokeLinecap="round" opacity={ramp(t, stinky - 0.2, stinky + 0.2) * (1 - ramp(t, sweet - 0.2, sweet + 0.3))} transform={`translate(${Math.sin(t * 8 + i) * 6},0)`} />
          ))}
        <Word text="hee hee!" x={1440} y={330} t={t} t0={giggleT + 0.3} dur={2.4} size={56} rot={-8} />
        <Word text="nom nom!" x={360} y={360} t={t} t0={eatT - 0.1} dur={1.8} size={60} rot={-6} />
        <Word text="nom nom nom!" x={420} y={340} t={t} t0={wordAt(8, 3, 'Nom') - 0.1} dur={2.2} size={64} rot={-6} />
        <Word text="yum!" x={600} y={300} t={t} t0={wordAt(8, 2, 'yummy')} dur={1.6} size={60} rot={8} />
        <Word text="ha ha ha!" x={1450} y={300} t={t} t0={laugh + 0.2} dur={2.4} size={60} rot={8} />
        <Word text="ha ha!" x={300} y={320} t={t} t0={laugh + 1.4} dur={2.4} size={56} rot={-8} />
        <Word text="big feet!" x={1700} y={300} t={t} t0={bigFeet + 1.6} dur={2} size={58} rot={6} />
        {laughing && [0, 1, 2, 3].map((i) => <Sparkle key={i} x={1440 + Math.cos(t * 2 + i * 1.6) * 150} y={540 + Math.sin(t * 2 + i * 1.6) * 150} s={0.9} o={0.8} />)}
      </g>

      {/* thought bubbles (screen space) */}
      <Cloud x={830} y={215} w={720} h={320} o={bubble1}>
        {/* tozies keep you steady / running all over town */}
        <rect x={-340} y={60} width={680} height={14} rx={7} fill="#c9b48e" />
        {[[-300, 20, 60, 50], [-200, 0, 70, 70], [180, 10, 70, 60], [270, -10, 60, 80]].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y + 60 - h} width={w} height={h} fill={i % 2 ? '#d39a45' : '#b9644a'} />
            <path d={`M${x - 6} ${y + 60 - h} L ${x + w / 2} ${y + 30 - h} L ${x + w + 6} ${y + 60 - h}Z`} fill="#7a3430" />
          </g>
        ))}
        <MiniKid x={lerp(-260, 240, ((t - steady) / 6) % 1)} y={-10} t={t} mode={t < wordAt(7, 3, 'fall') + 0.6 ? 'stand' : 'run'} s={1.1} />
      </Cloud>
      <Cloud x={830} y={215} w={720} h={320} o={bubble2}>
        {t < cue(8, 1) ? (
          <g>
            {/* door */}
            <rect x={170} y={-130} width={120} height={200} rx={8} fill="#8a5a34" />
            <circle cx={270} cy={-30} r={7} fill="#d39a45" />
            {/* a tall daddy silhouette coming in */}
            <g transform={`translate(${230 - ramp(t, door, door + 1.5) * 40}, 0)`} opacity={ramp(t, door, door + 0.6)}>
              <rect x={-20} y={-110} width={40} height={110} rx={14} fill={C.tee} />
              <circle cx={0} cy={-130} r={22} fill={C.skin} />
              <path d="M-22 -134 Q -18 -158 4 -156 Q 22 -152 22 -134Z" fill={C.hair} />
              <rect x={-18} y={0} width={14} height={70} fill="#3d4a5f" />
              <rect x={4} y={0} width={14} height={70} fill="#3d4a5f" />
            </g>
            <MiniKid x={lerp(-280, 110, ramp(t, door, door + 2.6))} y={2} t={t} mode={t < door + 2.6 ? 'run' : 'stand'} s={1.1} />
          </g>
        ) : (
          <g>
            {/* kitchen */}
            <rect x={-320} y={-60} width={240} height={130} fill="#9db29a" />
            <rect x={-320} y={-80} width={240} height={22} fill="#f3e6cc" />
            <circle cx={-260} cy={-110} r={20} fill="#b9644a" />
            <MiniKid x={60} y={-4} t={t} mode="dance" s={1.15} />
            {[0, 1, 2].map((i) => {
              const q = ((t * 0.6 + i / 3) % 1);
              return (
                <text key={i} x={140 + i * 40 + Math.sin(q * 6) * 10} y={-40 - q * 80} fontSize={42} fill="#7a3430" opacity={Math.sin(Math.PI * q)}>
                  ♪
                </text>
              );
            })}
            {/* stomp marks */}
            {[0, 1].map((i) => {
              const k = hop(t, wordAt(8, 1, 'stomped') + i * 0.45, 0.4);
              return <path key={i} d={`M${30 + i * 60} 72 l -16 10 M${44 + i * 60} 74 l 0 14 M${58 + i * 60} 72 l 16 10`} stroke="#7a3430" strokeWidth="4" opacity={k} />;
            })}
          </g>
        )}
      </Cloud>
      <rect width={W} height={H} fill="url(#vignette)" />
    </svg>
  );
};
