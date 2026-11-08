import React from 'react';
import {Composition} from 'remotion';
import {Calentador} from './Calentador';
import {ChatGPT} from './ChatGPT';

export const Root: React.FC = () => (
  <>
    <Composition id="Calentador" component={Calentador} durationInFrames={1437} fps={30} width={1080} height={1920} />
    <Composition id="ChatGPT" component={ChatGPT} durationInFrames={1652} fps={30} width={1080} height={1920} />
  </>
);
