import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/800.css';
import '@fontsource/fraunces/400-italic.css';
import timing from './timing.json';
import story from '../story.json';
import {H, LINES, SCENES, STANZAS, W, ramp} from './lib';
import {Bath} from './scenes/Bath';
import {Towel} from './scenes/Towel';
import {Pjs} from './scenes/Pjs';
import {Toes} from './scenes/Toes';
import {Bedroom} from './scenes/Bedroom';

const SCENE_COMPONENTS: Record<string, React.FC<{t: number}>> = {
  bath: Bath,
  towel: Towel,
  pjs: Pjs,
  toes: Toes,
  song: (p) => <Bedroom t={p.t} mode="song" />,
  night: (p) => <Bedroom t={p.t} mode="night" />,
};

const TURN = 1.5; // seconds the page takes to turn
const turnStart = (i: number) => SCENES[i].start - 1.9;

const SceneLayer: React.FC<{i: number; t: number}> = ({i, t}) => {
  const Comp = SCENE_COMPONENTS[SCENES[i].scene];
  return <Comp t={t} />;
};

const PageTurn: React.FC<{i: number; t: number}> = ({i, t}) => {
  // page i-1 turns away to reveal page i
  const p = ramp(t, turnStart(i), turnStart(i) + TURN);
  const angle = -180 * p;
  const front = angle > -90;
  const shade = Math.sin(Math.PI * p);
  return (
    <AbsoluteFill style={{perspective: 2600, perspectiveOrigin: '0% 50%'}}>
      {/* shadow cast on the page underneath */}
      <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(20,10,6,${0.55 * shade}) 0%, rgba(20,10,6,0) ${30 + 60 * (1 - p)}%)`}} />
      <AbsoluteFill style={{transformOrigin: '0% 50%', transform: `rotateY(${angle}deg)`, transformStyle: 'preserve-3d'}}>
        {front ? (
          <AbsoluteFill style={{backfaceVisibility: 'hidden', overflow: 'hidden'}}>
            <SceneLayer i={i - 1} t={t} />
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
              textShadow: '0 4px 30px rgba(0,0,0,0.6)',
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
          background: 'linear-gradient(180deg, rgba(38,20,14,0.58), rgba(30,14,10,0.72))',
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
            <div
              key={i}
              style={{
                fontFamily: 'Fraunces',
                fontWeight: 600,
                fontStyle: st.song ? 'italic' : 'normal',
                fontSize: 40,
                lineHeight: 1.36,
                color,
                textAlign: 'center',
                transform: `scale(${active ? 1.02 : 1})`,
              }}
            >
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
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: `rgba(26,12,8,${0.5 * o})`}}>
      <div style={{opacity: o, textAlign: 'center', transform: `translateY(${(1 - ramp(t, 0.6, 2.2)) * 24}px)`}}>
        <div style={{fontFamily: 'Fraunces', fontWeight: 800, fontSize: 136, color: '#fbeed2', textShadow: '0 6px 40px rgba(0,0,0,0.5)', lineHeight: 1.05}}>
          Daddy Loves
          <br />
          Your Toes
        </div>
        <div style={{fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 48, color: '#f3dcb4', marginTop: 28, opacity: ramp(t, 2, 3)}}>{story.subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Story: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;

  // which page is showing / turning
  let current = 0;
  for (let i = 0; i < SCENES.length; i++) if (t >= turnStart(i) || i === 0) current = i;
  const turning = current > 0 && t < turnStart(current) + TURN;

  const fadeIn = 1 - ramp(t, 0, 0.8);
  const fadeOut = ramp(frame, durationInFrames - 45, durationInFrames - 1);

  return (
    <AbsoluteFill style={{background: '#140a07', overflow: 'hidden'}}>
      <Audio src={staticFile('audio.wav')} />
      <AbsoluteFill style={{width: W, height: H}}>
        <SceneLayer i={current} t={t} />
      </AbsoluteFill>
      {turning && <PageTurn i={current} t={t} />}
      <Img src={staticFile('grain.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'overlay', opacity: 0.55}} />
      <Img src={staticFile('paper.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.35}} />
      {t < timing.title && <Title t={t} />}
      <ReadAlong t={t} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
    </AbsoluteFill>
  );
};
