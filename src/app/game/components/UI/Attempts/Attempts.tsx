import { times } from 'lodash';
import { ReactComponent as ActiveAttempt } from '../../../../../assets/icons/activeAttempt.svg';
import { ReactComponent as CanceledAttempt } from '../../../../../assets/icons/canceledAttempt.svg';
import { RIGHT_POSITION } from '../../../../common/constant';
import { GameControls } from '../../GameControls/GameControls';

interface AttemptsProps {
  readonly totalAttempts: number;
  readonly remainingAttempts: number;
}

export const Attempts: React.FC<AttemptsProps> = ({
  totalAttempts,
  remainingAttempts,
}) => {
  const attempts = [
    ...times(totalAttempts - remainingAttempts).map((_, i) => (
      <CanceledAttempt key={i} />
    )),
    ...times(remainingAttempts).map((_, i) => <ActiveAttempt key={totalAttempts + i} />),
  ];
  return <GameControls style={RIGHT_POSITION}>{attempts}</GameControls>;
};
