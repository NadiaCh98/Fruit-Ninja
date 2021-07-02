type RandomValueFunc = (min: number, max: number) => number;

export const getRandomValue: RandomValueFunc = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const getRandomValueInclusive: RandomValueFunc = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};
