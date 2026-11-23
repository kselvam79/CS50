import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/800.css';
import '@fontsource/fraunces/400-italic.css';
import timing from './timing.json';
import story from '../story.json';
import {Bubble, H, HeartStream, LINES, SCENES, STANZAS, Twinkles, W, Word, cue, rand, ramp, wordAt} from './lib';

// One painted page per stanza. Pages within a scene crossfade; scenes turn like a book page.
const PAGES = ['bath1', 'bath2', 'towel', 'pjs1', 'pjs2', 'toes1', 'toes2', 'toes3', 'toes4', 'song1', 'song2', 'night', 'title'];
const XFADE = 1.0;

const stanzaAt = (t: number, scene?: number) => {
  // index of the stanza whose page is showing at t, restricted to a scene when given
  let lo = 0, hi = STANZAS.length - 1;
  if (scene !== undefined) {
    const name = SCENES[scene].scene;
    lo = STANZAS.findIndex((s) => s.scene === name);
    hi = STANZAS.length - 1 - [...STANZAS].reverse().findIndex((s) => s.scene === name);
  }
  let i = lo;
  for (let k = lo; k <= hi; k++) if (t >= STANZAS[k].start - 1.3) i = k;
  return i;
};

const Page: React.FC<{i: number; t: number; o: number}> = ({i, t, o}) => {
  const st = STANZAS[i];
  const p = Math.min(1, Math.max(0, (t - st.start + 1.5) / (st.end - st.start + 3)));
  const dir = i % 2 === 0 ? 1 : -1;
  const z = 1.06 + 0.1 * p;
  const x = dir * (p - 0.5) * 60;
  const y = ((i % 3) - 1) * (p - 0.5) * 30;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Img src={staticFile(`pages/${PAGES[i]}.png`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${x}px,${y}px) scale(${z})`}} />
    </AbsoluteFill>
  );
};

const Overlays: React.FC<{i: number; t: number}> = ({i, t}) => {
  const name = PAGES[i];
  const st = STANZAS[i];
  const vis = t > st.start - 1 && t < st.end;
  if (!vis) return null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {(name === 'bath1' || name === 'bath2') &&
        Array.from({length: 14}, (_, k) => {
          const life = 7 + rand(k) * 4;
          const q = ((t + rand(k + 9) * life) % life) / life;
          const x = 120 + rand(k + 3) * 1680 + Math.sin(t * 1.2 + k) * 30;
          const y = H + 60 - q * (H + 200);
          const r = 14 + rand(k + 5) * 34;
          return <Bubble key={k} x={x} y={y} r={r} o={0.75 * Math.sin(Math.PI * q)} />;
        })}
      {name === 'bath2' &&
        [0, 1, 2, 3].map((k) => <Word key={k} text="pop!" x={420 + k * 360} y={300 + (k % 2) * 90} t={t} t0={wordAt(1, 2, 'pop') + k * 0.18} size={60} rot={-8 + k * 6} />)}
      {name === 'bath1' && <Word text="splish!" x={520} y={260} t={t} t0={cue(0, 0)} size={80} rot={-8} />}
      {name === 'bath1' && <Word text="splash!" x={1420} y={300} t={t} t0={wordAt(0, 0, 'splash')} size={80} rot={6} />}
      {name === 'towel' && <Word text="whoosh!" x={960} y={240} t={t} t0={cue(2, 0) - 0.2} size={90} rot={-6} />}
      {name === 'towel' && <Word text="boop!" x={1300} y={420} t={t} t0={wordAt(2, 2, 'boop')} size={64} />}
      {name === 'towel' && <HeartStream t={t} x={960} y={520} strength={ramp(t, wordAt(2, 3, 'kiss') - 0.3, wordAt(2, 3, 'kiss') + 0.4) * (1 - ramp(t, wordAt(2, 3, 'kiss') + 2, wordAt(2, 3, 'kiss') + 3))} count={10} />}
      {name === 'pjs2' && <Word text="Pop!" x={960} y={300} t={t} t0={cue(3, 3) - 0.05} size={120} rot={-5} />}
      {name === 'pjs2' && <Word text="whee!" x={1400} y={420} t={t} t0={wordAt(4, 0, 'whee')} size={70} rot={8} />}
      {name === 'toes1' && <HeartStream t={t} x={960} y={520} strength={ramp(t, cue(5, 0), cue(5, 0) + 1) * (1 - ramp(t, cue(5, 2), cue(5, 3)))} count={8} />}
      {name === 'toes2' && <Word text="hee hee!" x={1350} y={300} t={t} t0={wordAt(6, 2, 'tickle')} size={70} rot={6} />}
      {name === 'toes2' && <Word text="stinky?" x={560} y={340} t={t} t0={wordAt(6, 3, 'stinky')} size={64} rot={-6} color="#b7c26a" />}
      {name === 'toes2' && <Word text="sweet!" x={1380} y={520} t={t} t0={wordAt(6, 3, 'sweet')} size={64} rot={4} color="#f5b9c9" />}
      {name === 'toes3' && <HeartStream t={t} x={960} y={500} strength={ramp(t, wordAt(7, 1, 'kiss') - 0.2, wordAt(7, 1, 'kiss') + 0.4) * (1 - ramp(t, wordAt(7, 1, 'kiss') + 1.5, wordAt(7, 1, 'kiss') + 2.5))} count={8} />}
      {name === 'toes4' && <Word text="yum!" x={520} y={300} t={t} t0={wordAt(8, 2, 'yummy')} size={70} rot={-8} />}
      {name === 'toes4' && <Word text="nom nom nom!" x={1250} y={340} t={t} t0={wordAt(8, 3, 'Nom')} size={84} rot={5} />}
      {(name === 'song1' || name === 'song2') &&
        [0, 1, 2, 3, 4].map((k) => {
          const life = 5;
          const q = ((t - cue(9, 0) + k * 1.1) % life) / life;
          if (t < cue(9, 0)) return null;
          const x = 1250 + k * 110 + Math.sin(t * 2 + k) * 18;
          const y = 520 - q * 420;
          return (
            <text key={k} x={x} y={y} fontSize={54 + (k % 2) * 16} fill="#fff1cf" opacity={0.85 * Math.sin(Math.PI * q)} style={{fontFamily: 'Fraunces'}}>
              {k % 2 ? '♪' : '♫'}
            </text>
          );
        })}
      {(name === 'night' || name === 'title' || name === 'song2') && (
        <Twinkles t={t} spots={[[160, 120, 1], [320, 80, 0.7], [1700, 110, 1], [1820, 220, 0.8], [1560, 70, 0.6], [90, 260, 0.6]]} o={0.9} />
      )}
      {name === 'title' && <HeartStream t={t} x={960} y={600} strength={ramp(t, cue(12, 1), cue(12, 1) + 1) * (1 - ramp(t, cue(12, 1) + 4, cue(12, 1) + 6))} count={14} spread={400} rise={360} />}
    </svg>
  );
};

/** All pages of one scene, with crossfades between stanzas. */
export const PaintedScene: React.FC<{scene: number; t: number}> = ({scene, t}) => {
  const i = stanzaAt(t, scene);
  const name = SCENES[scene].scene;
  const first = STANZAS.findIndex((s) => s.scene === name);
  const prev = i > first ? i - 1 : -1;
  const fade = prev >= 0 ? ramp(t, STANZAS[i].start - 1.3, STANZAS[i].start - 1.3 + XFADE) : 1;
  return (
    <AbsoluteFill style={{background: '#1a100c'}}>
      {prev >= 0 && fade < 1 && <Page i={prev} t={t} o={1} />}
      <Page i={i} t={t} o={fade} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(30,12,6,0.45) 100%)'}} />
      {prev >= 0 && fade < 1 && <Overlays i={prev} t={t} />}
      <Overlays i={i} t={t} />
    </AbsoluteFill>
  );
};

const TURN = 1.5;
const turnStart = (i: number) => SCENES[i].start - 1.9;

const PageTurn: React.FC<{i: number; t: number}> = ({i, t}) => {
  const p = ramp(t, turnStart(i), turnStart(i) + TURN);
  const angle = -180 * p;
  const front = angle > -90;
  const shade = Math.sin(Math.PI * p);
  return (
    <AbsoluteFill style={{perspective: 2600, perspectiveOrigin: '0% 50%'}}>
      <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(20,10,6,${0.55 * shade}) 0%, rgba(20,10,6,0) ${30 + 60 * (1 - p)}%)`}} />
      <AbsoluteFill style={{transformOrigin: '0% 50%', transform: `rotateY(${angle}deg)`, transformStyle: 'preserve-3d'}}>
        {front ? (
          <AbsoluteFill style={{backfaceVisibility: 'hidden', overflow: 'hidden'}}>
            <PaintedScene scene={i - 1} t={t} />
            <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(0,0,0,0) 40%, rgba(30,15,8,${0.5 * shade}) 100%)`}} />
          </AbsoluteFill>
        ) : (
          <AbsoluteFill style={{transform: 'scaleX(-1)', background: '#efe2c6', overflow: 'hidden'}}>
            <Img src={staticFile('paper.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.8}} />
            <AbsoluteFill style={{background: `linear-gradient(270deg, rgba(0,0,0,0) 40%, rgba(60,30,10,${0.35 * shade}) 100%)`}} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ReadAlong: React.FC<{t: number}> = ({t}) => {
  const si = STANZAS.findIndex((s, i) => {
    const first = LINES.find((l) => l.stanza === i)!.start;
    return t >= first - 0.6 && t < s.end - 0.2;
  });
  if (si < 0) return null;
  const st = story.stanzas[si] as {lines: string[]; ending?: boolean; song?: boolean};
  const lines = LINES.filter((l) => l.stanza === si);
  const first = lines[0].start;
  const o = Math.min(ramp(t, first - 0.6, first - 0.1), 1 - ramp(t, STANZAS[si].end - 0.9, STANZAS[si].end - 0.2));
  if (st.ending) {
    return (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: o}}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: 'Fraunces',
              fontWeight: i === 1 ? 800 : 400,
              fontStyle: i === 0 ? 'italic' : 'normal',
              fontSize: i === 1 ? 76 : 56,
              color: '#fbeed2',
              textAlign: 'center',
              marginTop: i === 1 ? 30 : 0,
              opacity: ramp(t, l.start - 0.3, l.start + 0.5),
              transform: `translateY(${(1 - ramp(t, l.start - 0.3, l.start + 0.8)) * 20}px)`,
              textShadow: '0 4px 30px rgba(0,0,0,0.8)',
              width: 1840,
            }}
          >
            {l.text}
          </div>
        ))}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 32, opacity: o}}>
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(38,20,14,0.6), rgba(30,14,10,0.74))',
          borderRadius: 30,
          padding: '18px 56px 22px',
          width: 1560,
          boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
          border: '2px solid rgba(246,234,212,0.18)',
        }}
      >
        {lines.map((l, i) => {
          const seen = ramp(t, l.start - 0.25, l.start + 0.25);
          const active = t >= l.start - 0.25 && t < (lines[i + 1]?.start ?? STANZAS[si].end) - 0.25;
          const color = active ? '#fff3d6' : seen > 0 ? 'rgba(246,234,212,0.62)' : 'rgba(246,234,212,0.22)';
          return (
            <div key={i} style={{fontFamily: 'Fraunces', fontWeight: 600, fontStyle: st.song ? 'italic' : 'normal', fontSize: 40, lineHeight: 1.36, color, textAlign: 'center', transform: `scale(${active ? 1.02 : 1})`}}>
              {l.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Title: React.FC<{t: number}> = ({t}) => {
  const o = Math.min(ramp(t, 0.6, 1.8), 1 - ramp(t, timing.title - 1.6, timing.title - 0.4));
  const z = 1.08 + t * 0.01;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: '#1a100c'}}>
      <Img src={staticFile('pages/title.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
      <AbsoluteFill style={{background: `rgba(26,12,8,${0.45 * o})`}} />
      <div style={{opacity: o, textAlign: 'center', transform: `translateY(${(1 - ramp(t, 0.6, 2.2)) * 24}px)`}}>
        <div style={{fontFamily: 'Fraunces', fontWeight: 800, fontSize: 136, color: '#fbeed2', textShadow: '0 6px 40px rgba(0,0,0,0.6)', lineHeight: 1.05}}>
          Daddy Loves
          <br />
          Those Toes
        </div>
        <div style={{fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 48, color: '#f3dcb4', marginTop: 28, opacity: ramp(t, 2, 3)}}>{story.subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Painted: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  let current = 0;
  for (let i = 0; i < SCENES.length; i++) if (t >= turnStart(i) || i === 0) current = i;
  const turning = current > 0 && t < turnStart(current) + TURN;
  const fadeIn = 1 - ramp(t, 0, 0.8);
  const fadeOut = ramp(frame, durationInFrames - 45, durationInFrames - 1);
  const titleFade = 1 - ramp(t, timing.title - 0.6, timing.title + 0.3);
  return (
    <AbsoluteFill style={{background: '#140a07', overflow: 'hidden'}}>
      <Audio src={staticFile('audio.wav')} />
      <AbsoluteFill style={{width: W, height: H}}>
        <PaintedScene scene={current} t={t} />
      </AbsoluteFill>
      {turning && <PageTurn i={current} t={t} />}
      {titleFade > 0 && (
        <AbsoluteFill style={{opacity: titleFade}}>
          <Title t={t} />
        </AbsoluteFill>
      )}
      <Img src={staticFile('grain.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: 0.35}} />
      <ReadAlong t={t} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};
