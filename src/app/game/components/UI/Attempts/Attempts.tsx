import React from 'react';
import { times } from 'lodash';
import { RIGHT_POSITION } from '../../../../common/constant';
import { GameControls } from '../../GameControls/GameControls';
import { ActiveAttempt, CanceledAttempt } from '../Icons/Icons';
import { NegativeNumberException } from '../../../../util/negativeNumberException';

interface AttemptsProps {
  readonly totalAttempts: number;
  readonly remainingAttempts: number;
}

export const Attempts: React.FC<AttemptsProps> = React.memo(
  ({ totalAttempts, remainingAttempts }) => {
    if (remainingAttempts > totalAttempts) {
      throw new Error('Total attemps can not be less than remaining');
    }
    if (remainingAttempts < 0 || totalAttempts < 0) {
      throw new NegativeNumberException();
    }
    const attempts = [
      ...times(totalAttempts - remainingAttempts).map((_, i) => (
        <CanceledAttempt key={i} />
      )),
      ...times(remainingAttempts).map((_, i) => (
        <ActiveAttempt key={totalAttempts + i} />
      )),
    ];
    return <GameControls style={RIGHT_POSITION}>{attempts}</GameControls>;
  }
);

Attempts.displayName = 'Attemps';
