import React from 'react';
import {Composition} from 'remotion';
import {Story} from './Story';
import timing from './timing.json';

export const Root: React.FC = () => (
  <Composition id="DaddyLovesYourToes" component={Story} fps={30} width={1920} height={1080} durationInFrames={Math.ceil(timing.total * 30)} />
);
