import React, { memo } from 'react';
import styled from 'styled-components';
import { RIGHT_POSITION } from '../../../../common/constant';
import { NegativeNumberException } from '../../../../util/negativeNumberException';
import { GameControls } from '../../GameControls/GameControls';

interface StyledTimerProps {
  readonly minutes: number;
  readonly seconds: number;
}

const StyledTimer = styled.p`
  font-size: var(--text-size);
  background: ${({ seconds, minutes }: StyledTimerProps) =>
    `var(--${minutes === 0 && seconds <= 10 ? 'red' : 'yellow'}-gradient)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

interface TimerProps {
  readonly time: number;
}

const convertMillisecondsToMinutes = (time: number): [number, number] => {
  const minutes = Math.floor(time / 60000);
  const seconds = (time % 60000) / 1000;
  return [minutes, seconds];
};

export const Timer: React.FC<TimerProps> = memo(({ time }) => {
  if (time < 0) {
    throw new NegativeNumberException();
  }
  const [minutes, seconds] = convertMillisecondsToMinutes(time);
  const timer = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  return (
    <GameControls style={RIGHT_POSITION}>
      <StyledTimer seconds={seconds} minutes={minutes}>
        {timer}
      </StyledTimer>
    </GameControls>
  );
});

Timer.displayName = 'Timer';
