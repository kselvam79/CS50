import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/800.css';
import '@fontsource/fraunces/400-italic.css';
import timing from './timing.json';
import story from '../story.json';
import look from './look.json';
import {LINES, ramp} from './lib';

// Still picture book: one page per two lines, no animation, short dissolve between pages.
type Page = {lines: typeof LINES; start: number; end: number};
const PAGES: Page[] = [];
for (let s = 0; s < story.stanzas.length; s++) {
  const ls = LINES.filter((l) => l.stanza === s);
  for (let k = 0; k < ls.length; k += 2) PAGES.push({lines: ls.slice(k, k + 2), start: 0, end: 0});
}
PAGES.forEach((p, i) => {
  const prevEnd = i === 0 ? timing.title : PAGES[i - 1].lines[PAGES[i - 1].lines.length - 1].end;
  p.start = i === 0 ? timing.title : (prevEnd + p.lines[0].start) / 2;
});
PAGES.forEach((p, i) => (p.end = i + 1 < PAGES.length ? PAGES[i + 1].start : timing.total));

const FADE = 0.5;
const pic = (i: number) => staticFile(`pages/p${String(i).padStart(2, '0')}.png`);

const PageView: React.FC<{i: number}> = ({i}) => (
  <AbsoluteFill style={{background: '#fdfaf3', alignItems: 'center'}}>
    <Img src={pic(i)} style={{marginTop: 28, width: 1296, height: 864, objectFit: 'cover', borderRadius: 18, boxShadow: '0 10px 40px rgba(60,30,10,0.28)'}} />
    <div style={{height: 188, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      {PAGES[i].lines.map((l, k) => (
        <div key={k} style={{fontFamily: 'Fraunces', fontWeight: 600, fontSize: 46, lineHeight: 1.32, color: '#3a2216', textAlign: 'center'}}>
          {l.text}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// look.json says which picture set is installed in public/pages: ink-wash (white paper cover) or watercolor.
const Title: React.FC = () => {
  const ink = look.ink;
  const color = ink ? '#2f2a4a' : '#fff3d6';
  return (
    <AbsoluteFill style={{background: ink ? '#fdfaf3' : '#2a1710'}}>
      <Img src={staticFile('pages/cover.png')} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, objectFit: 'cover'}} />
      {!ink && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(30,14,8,0.62) 0%, rgba(30,14,8,0) 34%, rgba(30,14,8,0) 76%, rgba(30,14,8,0.7) 100%)'}} />}
      <div style={{position: 'absolute', top: 42, left: 0, right: 0, textAlign: 'center', fontFamily: 'Fraunces', fontWeight: 800, fontSize: 134, color, lineHeight: 1.04, textShadow: ink ? 'none' : '0 6px 30px rgba(0,0,0,0.65)'}}>
        Daddy Loves Those Toes
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: ink ? '22px 0 26px' : '0 0 46px', textAlign: 'center', background: ink ? 'rgba(253,250,243,0.88)' : 'transparent', fontFamily: 'Fraunces', fontWeight: 600, fontSize: 52, color, textShadow: ink ? 'none' : '0 4px 20px rgba(0,0,0,0.7)'}}>
        Written by Kumar and Soren Selvam
      </div>
    </AbsoluteFill>
  );
};

export const PAGE_COUNT = PAGES.length;

export const Pages: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  let i = -1;
  PAGES.forEach((p, k) => {
    if (t >= p.start) i = k;
  });
  const fade = i >= 0 ? ramp(t, PAGES[i].start, PAGES[i].start + FADE) : 1;
  const edge = Math.max(1 - ramp(t, 0, 0.6), ramp(frame, durationInFrames - 40, durationInFrames - 1));
  return (
    <AbsoluteFill style={{background: '#140a07'}}>
      <Audio src={staticFile('audio.wav')} />
      {i < 0 && <Title />}
      {i === 0 && fade < 1 && <Title />}
      {i > 0 && fade < 1 && <PageView i={i - 1} />}
      {i >= 0 && (
        <AbsoluteFill style={{opacity: fade}}>
          <PageView i={i} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: '#000', opacity: edge}} />
    </AbsoluteFill>
  );
};
