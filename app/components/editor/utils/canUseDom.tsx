// This file was sourced from Github (MIT License)
// https://github.com/facebook/lexical/blob/main/packages/shared/src/canUseDOM.ts

export const CAN_USE_DOM: boolean =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';
