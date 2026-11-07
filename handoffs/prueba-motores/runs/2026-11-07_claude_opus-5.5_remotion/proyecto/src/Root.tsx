import React from 'react';
import {Composition} from 'remotion';
import {Plano} from './Plano';

export const Root: React.FC = () => (
  <Composition id="Plano" component={Plano} durationInFrames={413} fps={30} width={1080} height={1920} />
);
