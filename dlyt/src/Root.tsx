import React from 'react';
import {Composition} from 'remotion';
import {Story} from './Story';
import {Painted} from './Painted';
import {Pages} from './Pages';
import {Cover} from './Cover';
import timing from './timing.json';

export const Root: React.FC = () => (
  <>
    <Composition id="DaddyLovesYourToes" component={Story} fps={30} width={1920} height={1080} durationInFrames={Math.ceil(timing.total * 30)} />
    <Composition id="Cover" component={Cover} fps={30} width={1600} height={2400} durationInFrames={1} />
    <Composition id="Pages" component={Pages} fps={30} width={1920} height={1080} durationInFrames={Math.ceil(timing.total * 30)} />
    <Composition id="Painted" component={Painted} fps={30} width={1920} height={1080} durationInFrames={Math.ceil(timing.total * 30)} />
  </>
);
