export const preset = 'ts-jest';
export const testEnvironment = 'jsdom';
export const globals = {
  'ts-jest': {
    tsconfig: 'tsconfig.test.json',
  },
};
export const setupFilesAfterEnv = ['./setupTests.ts'];
