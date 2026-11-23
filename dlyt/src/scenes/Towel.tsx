import React from 'react';
import {C, DadHead, Defs, Foot, H, Hand, HeartStream, KidHead, Limb, W, Word, blink, cue, lerp, rand, ramp, sceneRange, smooth, spring, talk, wordAt, Bokeh, bgDepth} from '../lib';

// stanza 2 — out of the bath, wrapped in a big hooded towel on Daddy's lap.

export const Towel: React.FC<{t: number}> = ({t}) => {
  const [s0, s1] = sceneRange('towel');
  const p = smooth((t - s0) / (s1 - s0));
  const zoom = lerp(1.02, 1.1, p);

  const whoosh = spring(t, cue(2, 0) - 0.4, 6, 3.5);
  const by = (1 - whoosh) * 260; // bundle swoops up
  const sway = Math.sin(t * 1.3) * 5;

  const rubFeet = t > cue(2, 1) - 0.2 && t < cue(2, 2) - 0.1;
  const rubHead = t > cue(2, 2) - 0.1 && t < wordAt(2, 2, 'boop') - 0.3;
  const boopT = wordAt(2, 2, 'boop');
  const booping = t > boopT - 0.35 && t < boopT + 0.8;
  const kissT = wordAt(2, 3, 'kiss');
  const kissing = ramp(t, kissT - 0.8, kissT - 0.1) * (1 - ramp(t, kissT + 1.6, kissT + 2.4));

  // positions (inside the bundle group)
  const head: [number, number] = [640, 440];
  const feet: [number, number] = [1210, 540];
  let hand: [number, number] = [1120, 650];
  let rot = 200;
  if (rubFeet) {
    hand = [1170 + Math.sin(t * 10) * 26, 520];
    rot = 160;
  } else if (rubHead) {
    hand = [650 + Math.sin(t * 9) * 30, 330 + Math.cos(t * 9) * 8];
    rot = 150;
  } else if (booping) {
    const b = Math.sin(Math.min(1, (t - boopT + 0.35) / 0.5) * Math.PI);
    hand = [lerp(780, 700, b), lerp(470, 470, b)];
    rot = 185;
  }
  const handSmooth = hand; // positions are already continuous enough with the head rubs

  const talkO = talk(t);
  const dadMouth = kissing > 0.5 ? 'kiss' : talkO >= 0 ? 'talk' : 'smile';
  const kidMouth = rubFeet || rubHead ? 'giggle' : booping ? 'o' : 'smile';
  const kidEyes = rubFeet || rubHead || kissing > 0.3 ? 'happy' : 'open';
  const toeWig = [0, 1, 2, 3, 4].map((i) => (rubFeet || kissing > 0.2 ? 0.5 + 0.5 * Math.sin(t * 12 + i) : 0));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <Defs id="towel" />
      <g transform={`translate(${W / 2},${H / 2 - 110}) scale(${zoom}) translate(${-W / 2 - 40},${-H / 2})`}>
        <g transform={bgDepth(zoom, 0)}>
        <g filter="url(#rough-towel)">
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#a9bba3" />
          {Array.from({length: 9}, (_, r) =>
            Array.from({length: 20}, (_, c) => (
              <rect key={`${r}-${c}`} x={c * 110 - (r % 2) * 55 - 40} y={180 + r * 74} width={104} height={68} rx={8} fill={rand(r * 7 + c) > 0.5 ? '#9db29a' : '#93a990'} />
            )),
          )}
          <rect x={-300} y={-300} width={W + 600} height={480} fill="#e8cf9f" />
          <rect x={-300} y={160} width={W + 600} height={24} fill="#d9b981" />
          <circle cx="1500" cy="160" r="700" fill="url(#warmLight)" />
          {/* blurred bath edge in the background */}
          <g filter="url(#soft4)" opacity="0.9">
            <rect x="-100" y="640" width="520" height="40" rx="20" fill="#f4ecdc" />
            <path d="M-100 680 L 420 680 Q 400 900 240 980 L -100 980Z" fill={C.red} />
            {Array.from({length: 8}, (_, i) => (
              <circle key={i} cx={-60 + i * 60} cy={630 - rand(i) * 30} r={30 + rand(i + 2) * 16} fill="#fbfcfd" />
            ))}
          </g>
          {/* hooks with robe */}
          <circle cx="1720" cy="260" r="10" fill="#c59a4c" />
          <path d="M1720 262 Q 1640 300 1660 560 L 1800 560 Q 1810 300 1720 262Z" fill="#7d8248" />
          {/* stool */}
          <rect x="1150" y="830" width="420" height="40" rx="14" fill="#a8702c" />
          <rect x="1180" y="860" width="26" height="260" fill="#8a5a24" />
          <rect x="1514" y="860" width="26" height="260" fill="#8a5a24" />
        </g>

        </g>
        {/* Daddy, sitting */}
        <g transform="translate(170,0)">
          <path d="M1040 840 Q 1000 1000 1060 1200 L 1400 1200 Q 1440 1000 1380 840Z" fill="#3d4a5f" />
          <path d="M1060 430 Q 1180 370 1320 420 Q 1400 470 1400 640 L 1400 860 Q 1220 900 1040 860 Q 1020 640 1060 430Z" fill={C.tee} />
          <path d="M1320 420 Q 1400 470 1400 640 L 1400 860 L 1340 870 Q 1370 640 1320 420Z" fill={C.teeShade} opacity="0.7" />
          {/* cradling arm behind the bundle */}
          <Limb a={[930, 470]} b={[530, 610 - by]} bend={-60} w={60} fill={C.skin} shade={C.skinShade} />
          <g transform={`translate(${1210 - kissing * 95},${300 + kissing * 120}) rotate(${-14 - kissing * 22 + Math.sin(t * 0.8) * 2}) scale(0.95)`}>
            <DadHead mouth={dadMouth as 'kiss' | 'talk' | 'smile'} open={Math.max(0, talkO)} blinkAmt={blink(t, 2)} look={[-1, 0.8]} />
          </g>
        </g>

        {/* the bundle */}
        <g transform={`translate(0,${by + sway}) rotate(${Math.sin(t * 1.3) * 1.2}, 900, 520)`}>
          {/* feet poking out the end */}
          <g transform={`translate(${feet[0]},${feet[1]}) rotate(${80 + Math.sin(t * 3) * 4}) scale(0.68)`}>
            <Foot toeLift={toeWig} />
          </g>
          <g transform={`translate(${feet[0] + 14},${feet[1] + 74}) rotate(${96 - Math.sin(t * 3) * 4}) scale(0.68)`}>
            <Foot toeLift={toeWig.map((x, i) => toeWig[(i + 2) % 5])} mirror />
          </g>
          {/* towel body */}
          <path d="M560 470 Q 560 380 700 370 Q 900 350 1100 420 Q 1220 460 1210 560 Q 1200 660 1060 680 Q 820 700 650 650 Q 560 600 560 470Z" fill="#f2dccb" />
          <path d="M760 380 Q 740 520 780 680 M880 372 Q 870 520 900 690" stroke="#e7b9a0" strokeWidth="18" fill="none" />
          <path d="M600 600 Q 820 680 1100 660" stroke="#e2c4b0" strokeWidth="10" fill="none" opacity="0.8" />
          <path d="M1000 420 Q 1080 520 1060 670" stroke="#e2c4b0" strokeWidth="8" fill="none" opacity="0.7" />
          {/* little hand peeking out */}
          <g transform={`translate(860, ${400 + Math.sin(t * 2.4) * 4}) rotate(-60)`}>
            <ellipse rx="22" ry="18" fill="url(#kidSkin)" stroke={C.kidShade} strokeWidth="2.5" />
            {[-12, -4, 4, 12].map((x, i) => (
              <ellipse key={i} cx={x} cy={-17 - Math.max(0, Math.sin(t * 5 + i)) * 3} rx="5" ry="8" fill="url(#kidSkin)" stroke={C.kidShade} strokeWidth="2" />
            ))}
          </g>
          {/* hood with bunny ears */}
          <path d="M500 470 Q 480 300 630 280 Q 780 270 800 420 Q 810 560 700 600 Q 560 620 500 470Z" fill="#f2dccb" />
          <g transform={`rotate(${-20 + Math.sin(t * 2) * 4}, 560, 300)`}>
            <ellipse cx="540" cy="220" rx="34" ry="90" fill="#f2dccb" />
            <ellipse cx="540" cy="226" rx="16" ry="66" fill="#efb1a6" />
          </g>
          <g transform={`rotate(${18 + Math.sin(t * 2 + 1) * 4}, 700, 290)`}>
            <ellipse cx="720" cy="210" rx="34" ry="90" fill="#f2dccb" />
            <ellipse cx="720" cy="216" rx="16" ry="66" fill="#efb1a6" />
          </g>
          <g transform={`translate(${head[0]},${head[1]}) rotate(${-8 + Math.sin(t * 1.6) * 3}) scale(0.92)`}>
            <KidHead eyes={kidEyes} mouth={kidMouth} blinkAmt={blink(t, 5)} look={[1, -0.5]} t={t} />
          </g>
          <path d="M520 420 Q 540 320 640 312 Q 750 310 780 420" stroke="#f2dccb" strokeWidth="30" fill="none" strokeLinecap="round" />
        </g>

        {/* Daddy's near arm with hand towel */}
        <Limb a={[1300, 540]} b={[handSmooth[0] + 40, handSmooth[1] + by + 20]} bend={rubHead || booping ? 60 : -40} w={58} fill={C.skin} shade={C.skinShade} />
        <g transform={`translate(0,${by})`}>
          {rubFeet && (
            <path d={`M${handSmooth[0] - 50} ${handSmooth[1] - 30} q 50 -24 100 0 q 10 40 -10 60 q -50 20 -90 0 z`} fill="#e7b9a0" />
          )}
          <Hand x={handSmooth[0]} y={handSmooth[1]} rot={rot} s={0.9} />
          {booping && <Word text="boop!" x={700} y={380} t={t} t0={boopT - 0.1} size={64} />}
        </g>

        <Word text="whoosh!" x={900} y={250} t={t} t0={cue(2, 0) - 0.2} size={86} rot={-6} />
        {/* whoosh swirls */}
        {[0, 1, 2].map((i) => {
          const q = (t - cue(2, 0) + 0.4 - i * 0.12) / 1.0;
          if (q < 0 || q > 1) return null;
          return <path key={i} d={`M${400 + i * 40} ${700 - i * 40} q 200 -${200 + i * 30} 520 -${120 + i * 40}`} stroke="#fff6e2" strokeWidth={10 - i * 2} fill="none" strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 * (1 - q)} opacity={1 - q} />;
        })}
        <HeartStream t={t} x={1200} y={460 + by} strength={kissing} count={10} />
        <Word text="mwah!" x={1300} y={380} t={t} t0={kissT} size={70} rot={8} />
      </g>
      <Bokeh t={t} seed={3} color="#fff6e6" o={0.12} />
      <rect width={W} height={H} fill="url(#vignette)" />
    </svg>
  );
};
