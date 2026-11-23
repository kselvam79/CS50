import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/800.css';

// Tall book cover (2:3) for print or a thumbnail.
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#fdfaf3'}}>
    <Img src={staticFile('pages/cover-tall.png')} style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontFamily: 'Fraunces', fontWeight: 800, fontSize: 196, color: '#2f2a4a', lineHeight: 1.0}}>
      Daddy Loves
      <br />
      Those Toes
    </div>
    <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '34px 0 40px', textAlign: 'center', background: 'rgba(253,250,243,0.9)', fontFamily: 'Fraunces', fontWeight: 600, fontSize: 76, color: '#2f2a4a'}}>
      Written by Kumar and Soren Selvam
    </div>
  </AbsoluteFill>
);
