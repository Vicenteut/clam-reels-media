import React from 'react';
import {Composition} from 'remotion';
import {Solar} from './Solar';

export const Root: React.FC = () => (
  <Composition id="Solar" component={Solar} durationInFrames={2334} fps={30} width={1080} height={1920} />
);
