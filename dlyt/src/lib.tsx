import React from 'react';
import timing from './timing.json';

export const W = 1920;
export const H = 1080;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const smooth = (x: number) => {
  const p = clamp01(x);
  return p * p * (3 - 2 * p);
};
/** 0→1 over [a, b] with smoothstep */
export const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/** up then down: 0 at a, 1 between b..c, 0 at d */
export const pulse = (t: number, a: number, b: number, c: number, d: number) =>
  Math.min(ramp(t, a, b), 1 - ramp(t, c, d));
/** damped spring 0→1 starting at t0 */
export const spring = (t: number, t0: number, freq = 9, damp = 5) => {
  const x = t - t0;
  if (x <= 0) return 0;
  return 1 - Math.exp(-damp * x) * Math.cos(freq * x);
};
/** a quick bounce: 0 → 1 → 0, lasting dur */
export const hop = (t: number, t0: number, dur = 0.45) => {
  const x = (t - t0) / dur;
  return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x);
};
export const rand = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** blink: returns eyelid closedness 0..1, blinking every few seconds */
export const blink = (t: number, seed = 0, every = 3.7) => {
  const period = every + rand(seed) * 1.5;
  const local = (t + seed * 1.3) % period;
  const x = local / 0.16;
  return x < 1 ? Math.sin(Math.PI * x) : 0;
};

type Line = {stanza: number; line: number; start: number; end: number; text: string};
export const LINES = timing.lines as Line[];
export const SCENES = timing.scenes as {scene: string; start: number; end: number}[];
export const STANZAS = timing.stanzas as {start: number; end: number; scene: string}[];
/** when a line starts (global seconds) */
export const cue = (stanza: number, line: number) =>
  LINES.find((l) => l.stanza === stanza && l.line === line)!.start;
export const cueEnd = (stanza: number, line: number) =>
  LINES.find((l) => l.stanza === stanza && l.line === line)!.end;
/** time a word is spoken, roughly, inside a line (by character position) */
export const wordAt = (stanza: number, line: number, word: string) => {
  const l = LINES.find((x) => x.stanza === stanza && x.line === line)!;
  const i = l.text.toLowerCase().indexOf(word.toLowerCase());
  return l.start + (Math.max(0, i) / l.text.length) * (l.end - l.start);
};
export const sceneRange = (name: string) => {
  const s = SCENES.find((x) => x.scene === name)!;
  return [s.start, s.end] as const;
};

// ---------- palette ----------
export const C = {
  skin: '#c08560',
  skinShade: '#9a613f',
  kidSkin: '#dcaa83',
  kidShade: '#bb835d',
  hair: '#231b17',
  hairHi: '#4a3a30',
  cheek: '#d9705e',
  tee: '#9fa3ab',
  teeShade: '#7d818a',
  pj: '#7d8fbb',
  pjShade: '#5f6f98',
  cream: '#f6ead4',
  ochre: '#d39a45',
  ochreDark: '#a8702c',
  red: '#8a3a32',
  redDark: '#5e2420',
  navy: '#1f2a4a',
  olive: '#7d8248',
  sage: '#9db29a',
  terracotta: '#b9644a',
  ink: '#3b2620',
};

/** Shared SVG defs: textures, gradients, patterns. One copy per scene svg. */
export const Defs: React.FC<{id: string}> = ({id}) => (
  <defs>
    <filter id={`rough-${id}`} x={-300} y={-400} width={W + 600} height={H + 800} filterUnits="userSpaceOnUse">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <filter id="soft4" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="30" />
    </filter>
    <radialGradient id="kidSkin" cx="0.42" cy="0.38" r="0.7">
      <stop offset="0" stopColor="#ebc19c" />
      <stop offset="0.65" stopColor={C.kidSkin} />
      <stop offset="1" stopColor={C.kidShade} />
    </radialGradient>
    <radialGradient id="dadSkin" cx="0.38" cy="0.35" r="0.75">
      <stop offset="0" stopColor="#d59f78" />
      <stop offset="0.6" stopColor={C.skin} />
      <stop offset="1" stopColor={C.skinShade} />
    </radialGradient>
    <linearGradient id="limbKid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#e6b892" />
      <stop offset="1" stopColor={C.kidShade} />
    </linearGradient>
    <radialGradient id="cheek" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor={C.cheek} stopOpacity="0.75" />
      <stop offset="1" stopColor={C.cheek} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="warmLight" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffd796" stopOpacity="0.55" />
      <stop offset="1" stopColor="#ffd796" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#fff3cf" stopOpacity="0.7" />
      <stop offset="1" stopColor="#fff3cf" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.48" r="0.75">
      <stop offset="0.55" stopColor="#1a0d08" stopOpacity="0" />
      <stop offset="1" stopColor="#1a0d08" stopOpacity="0.55" />
    </radialGradient>
    <pattern id="pjPattern" width="70" height="70" patternUnits="userSpaceOnUse">
      <rect width="70" height="70" fill={C.pj} />
      <path d="M18 14 a9 9 0 1 0 8 12 a7 7 0 1 1 -8 -12z" fill={C.cream} opacity="0.9" />
      <path d="M50 44 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="#e2b04f" />
      <circle cx="52" cy="14" r="2.4" fill="#e2b04f" />
      <circle cx="16" cy="54" r="2" fill={C.cream} opacity="0.8" />
    </pattern>
    <pattern id="quiltPattern" width="160" height="160" patternUnits="userSpaceOnUse">
      <rect width="80" height="80" fill="#c98f45" />
      <rect x="80" width="80" height="80" fill="#b9573f" />
      <rect y="80" width="80" height="80" fill="#7f8a55" />
      <rect x="80" y="80" width="80" height="80" fill="#d9b47a" />
      <g stroke="#f6ead4" strokeWidth="2" strokeDasharray="7 6" fill="none" opacity="0.7">
        <rect x="6" y="6" width="68" height="68" rx="6" />
        <rect x="86" y="6" width="68" height="68" rx="6" />
        <rect x="6" y="86" width="68" height="68" rx="6" />
        <rect x="86" y="86" width="68" height="68" rx="6" />
      </g>
      <circle cx="40" cy="40" r="9" fill="#f6ead4" opacity="0.35" />
      <path d="M120 112 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1z" fill="#f6ead4" opacity="0.5" />
    </pattern>
  </defs>
);

// ---------- characters ----------

export type KidEyes = 'open' | 'happy' | 'sleepy' | 'closed';
export type KidMouth = 'smile' | 'giggle' | 'o' | 'sleep' | 'yawn';

/** Toddler head, front view. Radius ~100 around (0,0). */
export const KidHead: React.FC<{
  eyes?: KidEyes;
  mouth?: KidMouth;
  blinkAmt?: number;
  look?: [number, number];
  wet?: boolean;
  crown?: number; // bubble crown amount
  t?: number;
}> = ({eyes = 'open', mouth = 'smile', blinkAmt = 0, look = [0, 0], wet = false, crown = 0, t = 0}) => {
  const ex = 38;
  const ey = 14;
  const eye = (sx: number) => {
    const x = sx * ex + look[0] * 5;
    const y = ey + look[1] * 4;
    if (eyes === 'happy')
      return <path d={`M${x - 14} ${y + 4} Q ${x} ${y - 14} ${x + 14} ${y + 4}`} stroke={C.ink} strokeWidth="6" fill="none" strokeLinecap="round" />;
    if (eyes === 'closed' || blinkAmt > 0.6)
      return (
        <g>
          <path d={`M${x - 14} ${y} Q ${x} ${y + 11} ${x + 14} ${y}`} stroke={C.ink} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d={`M${x + sx * 12} ${y + 3} l${sx * 7} ${-4}`} stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    const lid = eyes === 'sleepy' ? 0.5 : blinkAmt;
    return (
      <g>
        <ellipse cx={x} cy={y} rx="15" ry="16" fill="#1e120d" />
        <path d={`M${x - 18} ${y - 6} Q ${x} ${y - 22} ${x + 18} ${y - 6}`} stroke="#1e120d" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx={x - 5} cy={y - 6} r="5.5" fill="#fff" />
        <circle cx={x + 5} cy={y + 6} r="2.4" fill="#fff" opacity="0.8" />
        {lid > 0 && (
          <path d={`M${x - 18} ${y - 19} L ${x + 18} ${y - 19} L ${x + 18} ${y - 19 + 36 * lid} Q ${x} ${y - 13 + 36 * lid} ${x - 18} ${y - 19 + 36 * lid} Z`} fill="url(#kidSkin)" stroke={C.ink} strokeWidth="3" />
        )}
      </g>
    );
  };
  const mouthEl = () => {
    switch (mouth) {
      case 'giggle':
        return (
          <g>
            <path d="M-22 56 Q 0 58 22 56 Q 18 86 0 88 Q -18 86 -22 56 Z" fill="#7a2a26" />
            <path d="M-12 78 Q 0 70 12 78 Q 6 88 0 88 Q -6 88 -12 78Z" fill="#e5847a" />
          </g>
        );
      case 'o':
        return <ellipse cx="0" cy="66" rx="10" ry="12" fill="#7a2a26" />;
      case 'yawn':
        return <ellipse cx="0" cy="68" rx="15" ry="20" fill="#7a2a26" />;
      case 'sleep':
        return <path d="M-8 62 Q 0 67 8 62" stroke="#8a3a32" strokeWidth="4" fill="none" strokeLinecap="round" />;
      default:
        return (
          <g>
            <path d="M-32 54 Q 0 62 32 54 Q 26 86 0 88 Q -26 86 -32 54Z" fill="#6a2420" />
            <path d="M-28 56 Q 0 63 28 56 L 26 67 Q 0 72 -26 67Z" fill="#fffaf2" />
            <path d="M-40 50 q -4 6 2 10 M40 50 q 4 6 -2 10" stroke={C.kidShade} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        );
    }
  };
  const hair = wet ? '#24170f' : C.hair;
  return (
    <g>
      {/* back hair */}
      <path d="M-104 -6 Q -110 -96 -20 -112 Q 70 -122 104 -40 Q 112 -10 102 8 Q 60 -60 -20 -58 Q -80 -50 -104 -6Z" fill={hair} />
      {/* ears */}
      <ellipse cx="-99" cy="18" rx="19" ry="25" fill="url(#kidSkin)" />
      <ellipse cx="99" cy="18" rx="19" ry="25" fill="url(#kidSkin)" />
      <path d="M-102 10 q -6 8 0 18" stroke={C.kidShade} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M102 10 q 6 8 0 18" stroke={C.kidShade} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* face */}
      <ellipse cx="0" cy="8" rx="100" ry="98" fill="url(#kidSkin)" />
      {/* bangs */}
      <path
        d={
          wet
            ? 'M-100 -10 Q -96 -88 -10 -96 Q 80 -100 100 -20 Q 80 -40 60 -30 Q 50 -50 20 -40 Q 0 -60 -24 -44 Q -50 -58 -66 -36 Q -84 -40 -100 -10Z'
            : 'M-102 -8 Q -106 -98 -6 -106 Q 90 -108 102 -22 Q 96 -48 72 -58 Q 44 -66 14 -60 Q -20 -56 -50 -44 Q -40 -30 -66 -26 Q -84 -26 -102 -8Z M-70 -40 Q -40 -76 26 -66 Q -6 -54 -36 -30 Q -52 -26 -70 -40Z'
        }
        fill={hair}
      />
      <path d="M-50 -82 Q -10 -96 40 -86" stroke={C.hairHi} strokeWidth={wet ? 7 : 5} fill="none" strokeLinecap="round" opacity={wet ? 0.9 : 0.6} />
      {wet && <path d="M30 -72 Q 60 -66 76 -48" stroke="#a9c3cf" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />}
      {/* cheeks */}
      <ellipse cx="-62" cy="46" rx="26" ry="18" fill="url(#cheek)" />
      <ellipse cx="62" cy="46" rx="26" ry="18" fill="url(#cheek)" />
      {eye(-1)}
      {eye(1)}
      {/* eyebrows */}
      <path d={`M-60 ${-14 - (eyes === 'happy' ? 4 : 0)} q 18 -10 38 -4`} stroke={hair} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d={`M60 ${-14 - (eyes === 'happy' ? 4 : 0)} q -18 -10 -38 -4`} stroke={hair} strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* nose */}
      <path d="M-9 38 Q 0 48 9 38" stroke={C.kidShade} strokeWidth="5" fill="none" strokeLinecap="round" />
      {mouthEl()}
      {crown > 0 && (
        <g opacity={crown}>
          {[[-60, -98, 22], [-28, -116, 26], [8, -122, 30], [44, -112, 24], [72, -92, 20], [-84, -74, 16], [92, -66, 15], [24, -150, 14], [-8, -146, 12]].map(([x, y, r], i) => (
            <Bubble key={i} x={x} y={y + Math.sin(t * 2 + i) * 2} r={r} />
          ))}
        </g>
      )}
      {wet &&
        [[-90, 40], [86, 60], [-40, -60]].map(([x, y], i) => {
          const dy = ((t * 40 + i * 30) % 60);
          return <path key={i} d={`M${x} ${y + dy} q 4 8 0 12 q -4 -4 0 -12`} fill="#cfe3ea" opacity={1 - dy / 60} />;
        })}
    </g>
  );
};

export const Bubble: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill="#f4f8fb" opacity="0.9" />
    <circle cx={x} cy={y} r={r} fill="none" stroke="#c7d8e4" strokeWidth={Math.max(1.5, r * 0.08)} />
    <path d={`M${x - r * 0.55} ${y - r * 0.2} a ${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.45} ${-r * 0.4}`} stroke="#fff" strokeWidth={Math.max(2, r * 0.14)} fill="none" strokeLinecap="round" />
    <circle cx={x + r * 0.35} cy={y + r * 0.35} r={r * 0.12} fill="#e9c7d8" opacity="0.6" />
  </g>
);

export type DadMouth = 'smile' | 'sing' | 'kiss' | 'laugh' | 'talk';

/** Daddy's head, 3/4 view facing left. About 280 tall, centred near (0,0). */
export const DadHead: React.FC<{mouth?: DadMouth; blinkAmt?: number; open?: number; look?: [number, number]; sleepyEyes?: boolean}> = ({
  mouth = 'smile',
  blinkAmt = 0,
  open = 0.5,
  look = [0, 0],
  sleepyEyes = false,
}) => {
  const eye = (x: number, y: number, s: number) => {
    const closed = blinkAmt > 0.55 || mouth === 'laugh';
    if (closed)
      return <path d={`M${x - 15 * s} ${y + 2} Q ${x} ${y - (mouth === 'laugh' ? 12 : -8)} ${x + 15 * s} ${y + 2}`} stroke={C.ink} strokeWidth={5 * s} fill="none" strokeLinecap="round" />;
    return (
      <g>
        <ellipse cx={x + look[0] * 3} cy={y + look[1] * 3} rx={12 * s} ry={14 * s} fill="#2b1a14" />
        <circle cx={x - 4 * s + look[0] * 3} cy={y - 5 * s + look[1] * 3} r={4.5 * s} fill="#fff" />
        {(sleepyEyes || mouth === 'smile') && (
          <path d={`M${x - 16 * s} ${y - (sleepyEyes ? 4 : 12) * s} Q ${x} ${y - (sleepyEyes ? 10 : 18) * s} ${x + 16 * s} ${y - (sleepyEyes ? 4 : 12) * s}`} stroke={C.skinShade} strokeWidth={4 * s} fill="none" strokeLinecap="round" />
        )}
      </g>
    );
  };
  const m = () => {
    switch (mouth) {
      case 'sing':
        return <ellipse cx="-58" cy="96" rx={12} ry={6 + 14 * open} fill="#6f2622" />;
      case 'talk':
        return <path d={`M-90 88 Q -60 ${100 + 16 * open} -30 90 Q -60 ${96 + 4 * open} -90 88Z`} fill="#6f2622" stroke="#7b2f2a" strokeWidth="5" strokeLinejoin="round" />;
      case 'kiss':
        return (
          <g>
            <ellipse cx="-72" cy="96" rx="9" ry="10" fill="#b5524a" />
            <ellipse cx="-74" cy="96" rx="4" ry="5" fill="#6f2622" />
          </g>
        );
      case 'laugh':
        return (
          <g>
            <path d="M-92 82 Q -58 84 -28 80 Q -36 122 -64 122 Q -88 118 -92 82Z" fill="#6f2622" />
            <path d="M-86 84 L -34 82 L -36 92 L -84 94Z" fill="#fff" opacity="0.9" />
          </g>
        );
      default:
        return (
          <g>
            <path d="M-96 84 Q -60 92 -24 84 Q -32 118 -62 120 Q -90 116 -96 84Z" fill="#5e201c" />
            <path d="M-92 86 Q -60 94 -28 86 L -31 97 Q -60 103 -89 97Z" fill="#fffaf2" />
            <path d="M-112 70 q -8 26 6 44 M-12 76 q 12 22 -2 40" stroke={C.skinShade} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </g>
        );
    }
  };
  return (
    <g>
      {/* neck */}
      <path d="M-36 110 L -26 160 L 46 160 L 48 100 Z" fill={C.skinShade} />
      {/* back of head / hair mass */}
      <path d="M-70 -110 Q 10 -170 90 -110 Q 130 -60 112 20 Q 104 40 92 50 L 40 -40 Z" fill={C.hair} />
      {/* face */}
      <path d="M-96 -60 Q -100 -130 -10 -138 Q 80 -140 102 -60 Q 118 30 82 92 Q 40 148 -40 136 Q -88 128 -100 70 Q -110 0 -96 -60Z" fill="url(#dadSkin)" />
      {/* ear */}
      <ellipse cx="88" cy="10" rx="22" ry="34" fill={C.skin} />
      <path d="M86 -8 q 12 14 0 34" stroke={C.skinShade} strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* stubble */}
      <path d="M-100 60 Q -90 128 -30 136 Q 46 140 84 86 Q 70 60 40 76 Q 0 84 -30 60 Q -70 50 -100 60Z" fill="#5a4234" opacity="0.05" />
      {/* hair front */}
      <path d="M-104 -40 Q -118 -128 -30 -150 Q 60 -168 108 -96 Q 122 -60 110 -20 Q 100 -60 70 -74 Q 40 -92 0 -84 Q -30 -96 -60 -78 Q -88 -66 -104 -40Z" fill={C.hair} />
      <path d="M-104 -40 Q -118 -150 -20 -168 Q 70 -180 112 -100 Q 100 -128 40 -140 Q -40 -150 -104 -40Z" fill={C.hair} />
      <path d="M80 -40 Q 96 -10 92 20 L 104 16 Q 110 -20 104 -50Z" fill="#8f8b88" />
      <path d="M58 -84 Q 98 -76 110 -30 Q 96 -46 70 -58Z" fill="#8f8b88" />
      <path d="M-70 -128 Q -20 -158 40 -150 M-50 -112 Q 0 -138 60 -128 M30 -100 Q 70 -100 96 -80" stroke="#a7a29e" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M-60 -118 Q -10 -140 50 -126" stroke={C.hairHi} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* brows */}
      <path d="M-104 -26 q 16 -12 34 -6" stroke={C.hair} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M-34 -32 q 24 -12 50 -2" stroke={C.hair} strokeWidth="9" fill="none" strokeLinecap="round" />
      {eye(-84, 8, 0.8)}
      {eye(-14, 6, 1)}
      {/* cheek */}
      <ellipse cx="-14" cy="62" rx="30" ry="20" fill="url(#cheek)" opacity="0.8" />
      {/* long nose */}
      <path d="M-56 8 Q -72 40 -104 56 Q -112 68 -96 75 Q -78 79 -62 70" fill={C.skin} stroke={C.skinShade} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-92 62 q 10 4 18 0" stroke={C.cheek} strokeWidth="4" fill="none" opacity="0.6" strokeLinecap="round" />
      {m()}
    </g>
  );
};

/** A little foot seen from the sole. Toes at the top. About 80 wide, 140 tall. */
export const Foot: React.FC<{
  toeLift?: number[];
  toeGlow?: number[];
  mirror?: boolean;
  shade?: string;
}> = ({toeLift = [0, 0, 0, 0, 0], toeGlow = [0, 0, 0, 0, 0], mirror = false}) => {
  const toes = [
    [-24, -62, 15],
    [-1, -74, 11.5],
    [17, -71, 10.5],
    [31, -62, 9.5],
    [41, -48, 8.5],
  ];
  return (
    <g transform={mirror ? 'scale(-1,1)' : undefined}>
      <path d="M-38 -40 Q -44 -66 -16 -62 Q 30 -66 46 -40 Q 52 10 32 50 Q 22 76 -4 76 Q -32 74 -34 40 Q -30 10 -38 -40Z" fill="url(#kidSkin)" stroke={C.kidShade} strokeWidth="3" />
      <ellipse cx="-4" cy="46" rx="22" ry="20" fill="#e7a58a" opacity="0.55" />
      <ellipse cx="2" cy="-30" rx="32" ry="16" fill="#e7a58a" opacity="0.5" />
      <path d="M-26 0 Q -14 14 -20 30" stroke={C.kidShade} strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
      {toes.map(([x, y, r], i) => {
        const lift = toeLift[i] || 0;
        const g = toeGlow[i] || 0;
        return (
          <g key={i} transform={`translate(${x},${y - lift * 10}) scale(${1 + g * 0.18})`}>
            {g > 0 && <circle r={r * 2.2} fill="#ffe7a8" opacity={0.55 * g} filter="url(#soft4)" />}
            <ellipse rx={r} ry={r * 1.08} fill="url(#kidSkin)" stroke={C.kidShade} strokeWidth="2.5" />
            <ellipse cx={-r * 0.15} cy={-r * 0.2} rx={r * 0.45} ry={r * 0.35} fill="#efc9aa" opacity="0.8" />
            <ellipse cy={r * 0.3} rx={r * 0.55} ry={r * 0.4} fill="#d9937a" opacity="0.4" />
          </g>
        );
      })}
    </g>
  );
};

export const Heart: React.FC<{x: number; y: number; s: number; o: number; color?: string}> = ({x, y, s, o, color = '#e8786b'}) => (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M0 10 C -18 -2, -13 -20, 0 -10 C 13 -20, 18 -2, 0 10z" fill={color} opacity={o} />
);

/** hearts rising from a point while `strength` > 0 */
export const HeartStream: React.FC<{t: number; x: number; y: number; strength: number; count?: number; spread?: number; rise?: number}> = ({t, x, y, strength, count = 8, spread = 60, rise = 200}) => {
  if (strength <= 0.01) return null;
  return (
    <g>
      {Array.from({length: count}, (_, i) => {
        const period = 3.2;
        const p = ((t + (i * period) / count) % period) / period;
        const hx = x + Math.sin(i * 2.3 + p * 5) * spread * 0.5 + (rand(i) - 0.5) * spread;
        const hy = y - p * rise;
        const o = Math.sin(Math.PI * p) * strength;
        return <Heart key={i} x={hx} y={hy} s={0.8 + rand(i + 9) * 0.9} o={o} color={i % 3 === 0 ? '#f0a08f' : '#e8786b'} />;
      })}
    </g>
  );
};

export const Sparkle: React.FC<{x: number; y: number; s: number; o: number; color?: string}> = ({x, y, s, o, color = '#fff3c4'}) => (
  <path transform={`translate(${x},${y}) scale(${s})`} d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3Z" fill={color} opacity={o} />
);

export const Burst: React.FC<{t: number; t0: number; x: number; y: number; n?: number; r?: number; color?: string}> = ({t, t0, x, y, n = 9, r = 120, color}) => {
  const p = (t - t0) / 1.1;
  if (p <= 0 || p >= 1) return null;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rand(i) * 0.5;
        const d = r * (0.3 + 0.7 * Math.sqrt(p)) * (0.7 + rand(i + 3) * 0.5);
        return <Sparkle key={i} x={x + Math.cos(a) * d} y={y + Math.sin(a) * d} s={(1.4 - p) * (0.8 + rand(i) * 0.8)} o={1 - p} color={color} />;
      })}
    </g>
  );
};

/** hand-lettered floating word, e.g. "Pop!" */
export const Word: React.FC<{text: string; x: number; y: number; t: number; t0: number; dur?: number; size?: number; color?: string; rot?: number}> = ({
  text,
  x,
  y,
  t,
  t0,
  dur = 1.6,
  size = 90,
  color = '#fff4d8',
  rot = -8,
}) => {
  const p = (t - t0) / dur;
  if (p <= 0 || p >= 1) return null;
  const s = spring(t, t0, 14, 6);
  const o = Math.min(1, (1 - p) * 4);
  return (
    <g transform={`translate(${x},${y - p * 40}) rotate(${rot}) scale(${s})`} opacity={o}>
      <text textAnchor="middle" fontFamily="Fraunces" fontWeight={800} fontSize={size} fill={color} stroke="#5e2420" strokeWidth={size * 0.1} paintOrder="stroke" style={{fontVariationSettings: '"SOFT" 100, "WONK" 1'}}>
        {text}
      </text>
    </g>
  );
};

/** soft star-shaped twinkles */
export const Twinkles: React.FC<{t: number; spots: number[][]; o?: number}> = ({t, spots, o = 1}) => (
  <g>
    {spots.map(([x, y, s = 1], i) => (
      <Sparkle key={i} x={x} y={y} s={s * (0.6 + 0.4 * Math.sin(t * 2.2 + i * 1.7))} o={o * (0.35 + 0.6 * Math.max(0, Math.sin(t * 1.4 + i * 2.1)))} />
    ))}
  </g>
);

/** how open Daddy's mouth is while he's "reading" a line (0 when quiet) */
export const talk = (t: number) => {
  const l = LINES.find((x) => t >= x.start && t <= x.end);
  if (!l) return -1;
  return 0.25 + 0.75 * Math.abs(Math.sin(t * 13) * Math.sin(t * 5.3 + 1));
};

/** a soft mitten-like hand. Points toward +x by default. */
export const Hand: React.FC<{x: number; y: number; rot?: number; s?: number; fill?: string}> = ({x, y, rot = 0, s = 1, fill = C.skin}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-30 -22 Q 10 -34 34 -18 Q 48 -6 40 8 Q 30 22 0 22 Q -26 24 -34 6 Z" fill={fill} stroke={C.skinShade} strokeWidth="3" />
    <path d="M-8 -20 Q 6 -44 22 -38 Q 30 -30 16 -18" fill={fill} stroke={C.skinShade} strokeWidth="3" />
    <path d="M14 -2 q 14 0 22 4 M10 10 q 12 2 20 2" stroke={C.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
  </g>
);

/** a limb: a thick tapered stroke from a to b with optional bend */
export const Limb: React.FC<{a: [number, number]; b: [number, number]; bend?: number; w: number; fill: string; shade?: string}> = ({a, b, bend = 0, w, fill, shade}) => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * bend;
  const cy = my + (dx / len) * bend;
  const d = `M${a[0]} ${a[1]} Q ${cx} ${cy} ${b[0]} ${b[1]}`;
  return (
    <g>
      {shade && <path d={d} stroke={shade} strokeWidth={w + 6} fill="none" strokeLinecap="round" />}
      <path d={d} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** soft out-of-focus foreground lights/bubbles drifting past the "lens" (screen space) */
export const Bokeh: React.FC<{t: number; dx?: number; n?: number; seed?: number; color?: string; o?: number}> = ({t, dx = 0, n = 7, seed = 1, color = '#fff2d0', o = 0.16}) => (
  <g filter="url(#soft)">
    {Array.from({length: n}, (_, i) => {
      const k = i + seed * 17;
      const sp = 8 + rand(k) * 14;
      const x = ((rand(k + 1) * (W + 400) + t * sp + dx * (1.2 + rand(k + 2))) % (W + 400)) - 200;
      const y = 60 + rand(k + 3) * (H - 420) + Math.sin(t * 0.4 + i) * 30;
      const r = 40 + rand(k + 4) * 70;
      return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={o * (0.6 + 0.4 * Math.sin(t * 0.7 + i * 2))} />;
    })}
  </g>
);

/** wrap background art so it moves less than the camera (depth). zoom/pan are the scene camera's. */
export const bgDepth = (zoom: number, panX: number, depth = 0.45) => {
  const s = (1 + (zoom - 1) * (1 - depth)) / zoom;
  return `translate(${W / 2 - (panX * depth) / zoom},${H / 2}) scale(${s}) translate(${-W / 2},${-H / 2})`;
};
