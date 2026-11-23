import React from 'react';
import {Burst, C, DadHead, Defs, Foot, H, Hand, HeartStream, KidHead, Limb, Sparkle, W, Word, blink, cue, hop, lerp, rand, ramp, sceneRange, smooth, spring, talk, wordAt, Bokeh, bgDepth} from '../lib';

// stanzas 3 & 4 — pyjamas on Daddy's lap, on the rug in a warm red bedroom.

type P = [number, number];
const along = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

/** a kid leg from hip to foot, with a PJ tube that may extend past the foot (empty end) */
const Leg: React.FC<{
  hip: P;
  foot: P;
  tube: number; // 0 none, 1 visible
  extra: number; // empty fabric beyond the foot, px
  showFoot: number; // 0..1 (scale)
  wiggle: number;
  toeLift: number[];
  mirror?: boolean;
  t: number;
}> = ({hip, foot, tube, extra, showFoot, wiggle, toeLift, mirror, t}) => {
  const dx = foot[0] - hip[0];
  const dy = foot[1] - hip[1];
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const wob = Math.sin(t * 14) * wiggle * 10;
  return (
    <g>
      <Limb a={hip} b={foot} w={54} fill="#dcaa83" shade={C.kidShade} />
      {showFoot > 0.01 && (
        <g transform={`translate(${foot[0]},${foot[1]}) rotate(${ang + 90}) scale(${0.78 * showFoot})`}>
          <Foot toeLift={toeLift} mirror={mirror} />
        </g>
      )}
      {tube > 0.01 && (
        <g transform={`translate(${hip[0]},${hip[1]}) rotate(${ang})`} opacity={Math.min(1, tube * 3)}>
          <path
            d={`M0 -40 L ${len - 30} -36 Q ${len + extra * 0.5} ${-40 + wob} ${len + extra} ${-20 + wob} Q ${len + extra + 18} ${wob} ${len + extra} ${20 + wob} Q ${len + extra * 0.5} ${40 + wob} ${len - 30} 36 L 0 40 Z`}
            fill="url(#pjPattern)"
            stroke={C.pjShade}
            strokeWidth="4"
          />
          <path d={`M${len - 30 + extra * 0.4} -38 Q ${len - 22 + extra * 0.4} 0 ${len - 30 + extra * 0.4} 38`} stroke="#e8dcc0" strokeWidth="10" fill="none" opacity={extra > 4 ? 0 : 0.9} />
          <path d={`M30 -30 Q ${len / 2} -42 ${len - 40} -30`} stroke="#8fa588" strokeWidth="6" fill="none" opacity="0.6" />
        </g>
      )}
    </g>
  );
};

export const Pjs: React.FC<{t: number}> = ({t}) => {
  const [s0, s1] = sceneRange('pjs');
  const p = smooth((t - s0) / (s1 - s0));
  const zoom = lerp(0.9, 0.98, p) - 0.04 * ramp(t, cue(4, 3) - 0.5, cue(4, 3) + 2);
  const panX = lerp(20, -30, p) - 120 * ramp(t, cue(4, 3) - 0.5, cue(4, 3) + 2.5);

  const topOn = spring(t, cue(3, 1) + 0.6, 8, 5);
  const armsUp = Math.min(ramp(t, cue(3, 1) - 0.3, cue(3, 1) + 0.4), 1 - ramp(t, cue(3, 1) + 1.4, cue(3, 1) + 2.2));

  // leg 1 (left): stanza 3 line 2 wiggle, line 3 pop
  const pop1 = cue(3, 3) - 0.05;
  const leg1Up = ramp(t, cue(3, 2) - 0.6, cue(3, 2) + 0.3);
  const tube1 = ramp(t, cue(3, 2) - 0.4, cue(3, 2));
  const wig1 = t > cue(3, 2) && t < pop1 ? 1 : 0;
  const extra1 = t < pop1 ? 70 : 70 * (1 - spring(t, pop1, 16, 9));
  const foot1Show = t < pop1 ? 0 : spring(t, pop1, 14, 5);

  // leg 2 (right): stanza 4 line 0 "tug, tug, and whee!"
  const tug1 = wordAt(4, 0, 'tug,');
  const tug2 = wordAt(4, 0, 'tug, and');
  const pop2 = wordAt(4, 0, 'whee');
  const leg2Up = ramp(t, cue(4, 0) - 0.8, cue(4, 0) + 0.1);
  const tube2 = ramp(t, cue(4, 0) - 0.6, cue(4, 0) - 0.1);
  const tugPull = hop(t, tug1, 0.35) + hop(t, tug2, 0.35);
  const extra2 = t < pop2 ? 70 - tugPull * 18 : 70 * (1 - spring(t, pop2, 16, 9));
  const foot2Show = t < pop2 ? 0 : spring(t, pop2, 14, 5);

  const legsDown = ramp(t, cue(4, 2) - 0.3, cue(4, 2) + 0.6);
  const hip1: P = [850, 640];
  const hip2: P = [950, 640];
  const foot1: P = along(along([780, 790], [600, 470], leg1Up), [730, 800], legsDown);
  const foot2: P = along(along([1020, 800], [1210, 480], leg2Up), [1080, 800], legsDown);

  const wave = t > pop2 + 0.4 && t < cue(4, 2);
  const toes = (f: number, on: boolean) => [0, 1, 2, 3, 4].map((i) => (on ? 0.5 + 0.5 * Math.sin(t * 12 + i * 0.9 + f) : 0));

  // cuddle spin
  const cuddle = Math.min(ramp(t, cue(4, 2) - 0.2, cue(4, 2) + 0.5), 1 - ramp(t, cue(4, 3), cue(4, 3) + 0.8));
  const spin = Math.sin(Math.max(0, t - cue(4, 2)) * 3.2) * 6 * cuddle;
  const bounce = Math.abs(Math.sin(t * 4)) * 10 * cuddle;

  // Daddy's hands follow the active cuff
  const end1 = along(hip1, foot1, 1.18);
  const end2 = along(hip2, foot2, 1.18);
  let hands: [P, P];
  if (t < cue(3, 2) - 0.5) hands = [[770, 640], [1040, 650]];
  else if (t < cue(3, 3) + 1.4) hands = [[end1[0] + 10, end1[1]], [1010, 610]];
  else if (t < cue(4, 0) - 0.8) hands = [[770, 620], [1040, 630]];
  else if (t < pop2 + 0.8) hands = [[800, 610], [end2[0] - 10, end2[1] + tugPull * 20]];
  else hands = [[780 - cuddle * 10, 560], [1030 + cuddle * 10, 570]];

  const talkO = talk(t);
  const giggle = foot1Show > 0.5 && t < pop1 + 2.5 || foot2Show > 0.5 && t < pop2 + 2.5 || cuddle > 0.3;
  const kidMouth = giggle ? 'giggle' : t > pop1 - 1.5 && t < pop1 ? 'o' : 'smile';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <Defs id="pjs" />
      <g transform={`translate(${W / 2 + panX},${H / 2 - 95}) scale(${zoom}) translate(${-W / 2},${-H / 2})`}>
        <g transform={bgDepth(zoom, panX)}>
        <g filter="url(#rough-pjs)">
          <rect x={-300} y={-300} width={W + 600} height={1000} fill={C.red} />
          {/* wallpaper sprigs */}
          {Array.from({length: 12}, (_, r) =>
            Array.from({length: 22}, (_, c) => {
              const x = c * 100 + (r % 2) * 50 - 100;
              const y = r * 70 - 120;
              return (
                <g key={`${r}-${c}`} transform={`translate(${x},${y})`} opacity="0.45">
                  <circle r="4" fill="#d39a45" />
                  <path d="M0 4 q -8 10 -14 8 M0 4 q 8 10 14 8" stroke="#b5634a" strokeWidth="3" fill="none" />
                </g>
              );
            }),
          )}
          {/* wainscot */}
          <rect x={-300} y={520} width={W + 600} height={200} fill="#6e2b26" />
          {Array.from({length: 14}, (_, i) => (
            <rect key={i} x={i * 160 - 80} y={545} width={130} height={150} rx={6} fill="none" stroke="#5a2420" strokeWidth="6" />
          ))}
          <rect x={-300} y={510} width={W + 600} height={18} fill="#c98f45" />
          {/* floor */}
          <rect x={-300} y={710} width={W + 600} height={700} fill="#8a5a34" />
          {Array.from({length: 8}, (_, i) => (
            <rect key={i} x={-300} y={720 + i * 60} width={W + 600} height={4} fill="#6f4426" />
          ))}
          {/* rug */}
          <ellipse cx="930" cy="840" rx="720" ry="150" fill="#c98f45" />
          <ellipse cx="930" cy="840" rx="640" ry="118" fill="none" stroke="#8a3a32" strokeWidth="22" />
          <ellipse cx="930" cy="840" rx="560" ry="90" fill="none" stroke="#f0dcae" strokeWidth="6" strokeDasharray="20 16" />
          {/* window */}
          <rect x="140" y="60" width="300" height="380" rx="14" fill="#efe1c3" />
          <rect x="160" y="80" width="260" height="340" fill="#1f2a4a" />
          <circle cx="330" cy="170" r="80" fill="url(#moonGlow)" />
          <circle cx="330" cy="170" r="34" fill="#fbeec8" />
          <path d="M290 80 V420 M160 250 H420" stroke="#efe1c3" strokeWidth="10" />
          <path d="M120 50 Q 160 260 120 470 L 80 470 L 80 50Z" fill="#7d8248" />
          <path d="M460 50 Q 420 260 460 470 L 500 470 L 500 50Z" fill="#7d8248" />
          {/* dresser + lamp */}
          <rect x="1460" y="380" width="360" height="330" rx="10" fill="#5e3a22" />
          <rect x="1480" y="410" width="320" height="120" rx="6" fill="#6e4628" />
          <rect x="1480" y="550" width="320" height="140" rx="6" fill="#6e4628" />
          <circle cx="1640" cy="470" r="9" fill="#d39a45" />
          <circle cx="1640" cy="620" r="9" fill="#d39a45" />
          <rect x="1560" y="300" width="20" height="80" fill="#c98f45" />
          <path d="M1500 300 L 1640 300 L 1610 210 L 1530 210Z" fill="#f2cf86" />
          <circle cx="1570" cy="290" r="300" fill="url(#warmLight)" />
          {/* stacked books + teddy */}
          <rect x="1680" y="350" width="110" height="30" fill="#7d8248" />
          <rect x="1690" y="322" width="96" height="28" fill="#d39a45" />
          {/* picture frame */}
          <rect x="1120" y="110" width="180" height="140" fill="#c98f45" />
          <rect x="1135" y="125" width="150" height="110" fill="#f0dcae" />
          <path d="M1150 220 Q 1200 150 1240 200 Q 1260 170 1275 220Z" fill="#7d8248" />
          <circle cx="1250" cy="150" r="14" fill="#e8826f" />
          {/* big bed peeking in from the right (for "off to the big bed") */}
          <rect x="1900" y="430" width="700" height="280" rx="20" fill="#c98f45" />
          <rect x="1880" y="360" width="40" height="360" rx="10" fill="#6e4628" />
          <rect x="1930" y="420" width="200" height="90" rx="40" fill="#f6ead4" />
        </g>

        </g>
        <g transform={`translate(930,700) rotate(${spin}) translate(-930,-700) translate(0,${-bounce})`}>
          {/* Daddy behind */}
          <g>
            <path d="M780 360 Q 930 300 1110 360 Q 1190 420 1190 560 L 1200 720 L 700 720 L 720 520 Q 720 400 780 360Z" fill={C.tee} />
            <path d="M1110 360 Q 1190 420 1190 560 L 1200 720 L 1130 720 Q 1150 520 1110 360Z" fill={C.teeShade} opacity="0.7" />
            <path d="M890 330 L 900 380 L 990 380 L 1000 320Z" fill={C.skinShade} />
            <g transform={`translate(1010, 200) rotate(${-10 + Math.sin(t * 0.8) * 3}) scale(0.95)`}>
              <DadHead mouth={giggle && talkO < 0 ? 'laugh' : talkO >= 0 ? 'talk' : 'smile'} open={Math.max(0, talkO)} blinkAmt={blink(t, 7)} look={[-1, 1]} />
            </g>
            {/* crossed legs */}
            <path d="M600 700 Q 760 640 940 720 Q 1100 650 1270 700 Q 1320 760 1250 800 Q 1100 820 940 780 Q 780 830 640 800 Q 570 760 600 700Z" fill="#3d4a5f" />
            <path d="M940 720 Q 1000 760 1050 790" stroke="#2e384a" strokeWidth="8" fill="none" />
          </g>

          {/* the kid on Daddy's lap */}
          <g>
            {/* diaper */}
            <path d="M820 600 Q 900 580 980 600 L 990 670 Q 900 700 810 670Z" fill="#f4efe4" />
            <Leg hip={hip1} foot={foot1} tube={tube1} extra={extra1} showFoot={Math.max(foot1Show, t < cue(3, 2) - 0.4 ? 1 : 0)} wiggle={wig1} toeLift={toes(0, foot1Show > 0.5 && (t < pop1 + 2 || wave))} mirror t={t} />
            <Leg hip={hip2} foot={foot2} tube={tube2} extra={extra2} showFoot={Math.max(foot2Show, t < cue(4, 0) - 0.6 ? 1 : 0)} wiggle={t > cue(4, 0) && t < pop2 ? 0.5 + tugPull : 0} toeLift={toes(2, foot2Show > 0.5 && (t < pop2 + 2 || wave))} t={t} />
            {/* torso: vest then PJ top */}
            <path d="M800 470 Q 900 430 1000 470 L 1000 620 Q 900 640 800 620Z" fill="#f4efe4" />
            <g transform={`translate(0,${(1 - topOn) * -300})`} opacity={ramp(t, cue(3, 1) - 0.1, cue(3, 1) + 0.4)}>
              <path d="M790 466 Q 900 424 1010 466 L 1014 630 Q 900 650 786 630Z" fill="url(#pjPattern)" stroke={C.pjShade} strokeWidth="4" />
              <path d="M860 452 Q 900 474 940 452" stroke="#e8dcc0" strokeWidth="8" fill="none" />
            </g>
            {/* arms */}
            {(() => {
              const up = Math.max(armsUp, cuddle * 0.3, giggle ? 0.55 + 0.15 * Math.sin(t * 8) : 0);
              const l: P = along([760, 590], [700, 330], up);
              const r: P = along([1040, 590], [1100, 330], up);
              const sleeve = topOn > 0.5 ? 'url(#pjPattern)' : '#dcaa83';
              return (
                <g>
                  <Limb a={[815, 490]} b={l} bend={-20} w={40} fill={sleeve === '#dcaa83' ? '#dcaa83' : C.pj} shade={sleeve === '#dcaa83' ? C.kidShade : C.pjShade} />
                  <Limb a={[985, 490]} b={r} bend={20} w={40} fill={sleeve === '#dcaa83' ? '#dcaa83' : C.pj} shade={sleeve === '#dcaa83' ? C.kidShade : C.pjShade} />
                  <circle cx={l[0]} cy={l[1]} r="22" fill="url(#kidSkin)" stroke={C.kidShade} strokeWidth="3" />
                  <circle cx={r[0]} cy={r[1]} r="22" fill="url(#kidSkin)" stroke={C.kidShade} strokeWidth="3" />
                </g>
              );
            })()}
            <g transform={`translate(900, ${360 - hop(t, pop1, 0.5) * 20 - hop(t, pop2, 0.5) * 20}) rotate(${Math.sin(t * 1.4) * 4}) scale(0.92)`}>
              <KidHead eyes={giggle ? 'happy' : 'open'} mouth={kidMouth} blinkAmt={blink(t, 3)} look={t > cue(3, 2) && t < cue(4, 2) ? (t < cue(4, 0) - 0.5 ? [-1, 0.8] : [1, 0.8]) : [0, 0]} t={t} />
            </g>
          </g>

          {/* Daddy's hands on top */}
          <Limb a={[740, 470]} b={[hands[0][0] + 10, hands[0][1] + 20]} bend={60} w={52} fill={C.skin} shade={C.skinShade} />
          <Limb a={[1130, 470]} b={[hands[1][0] - 10, hands[1][1] + 20]} bend={-60} w={52} fill={C.skin} shade={C.skinShade} />
          <Hand x={hands[0][0]} y={hands[0][1]} rot={200} s={0.85} />
          <Hand x={hands[1][0]} y={hands[1][1]} rot={-20} s={0.85} />
        </g>

        <Word text="Pop!" x={foot1[0] - 60} y={foot1[1] - 80} t={t} t0={pop1} size={120} rot={-10} />
        <Burst t={t} t0={pop1} x={foot1[0]} y={foot1[1]} r={170} n={12} />
        <Word text="tug!" x={1200} y={300} t={t} t0={tug1} dur={0.8} size={64} rot={8} />
        <Word text="tug!" x={1260} y={360} t={t} t0={tug2} dur={0.8} size={64} rot={-6} />
        <Word text="Wheee!" x={foot2[0] + 40} y={foot2[1] - 90} t={t} t0={pop2} size={110} rot={8} />
        <Burst t={t} t0={pop2} x={foot2[0]} y={foot2[1]} r={170} n={12} />
        {wave && [0, 1, 2].map((i) => <Sparkle key={i} x={foot2[0] + 70 * Math.cos(t * 2 + i * 2)} y={foot2[1] - 40 + 50 * Math.sin(t * 2 + i * 2)} s={0.9} o={0.8} />)}
        <HeartStream t={t} x={950} y={260} strength={cuddle} count={10} spread={200} />
        {/* stars drifting up from the PJs at the start */}
        {t < cue(3, 1) + 3 &&
          Array.from({length: 8}, (_, i) => {
            const q = ((t - s0) * 0.25 + i / 8) % 1;
            return <Sparkle key={i} x={200 + rand(i) * 1500} y={700 - q * 600} s={0.8} o={Math.sin(Math.PI * q) * 0.7} color="#f2cf86" />;
          })}
      </g>
      <Bokeh t={t} dx={-panX * 3} seed={4} color="#ffd98f" o={0.13} />
      <rect width={W} height={H} fill="url(#vignette)" />
    </svg>
  );
};
