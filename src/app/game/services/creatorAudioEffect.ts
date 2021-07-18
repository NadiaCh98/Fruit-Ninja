import { Sound, SOUND_PATH } from '../../common/constant';

export const createAudioEffect = (name: Sound): HTMLAudioElement => {
  return new Audio(`${SOUND_PATH}/${name}.wav`);
};
