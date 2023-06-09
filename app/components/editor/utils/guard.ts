// This file was sourced from Github (MIT License)
// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/utils/guard.ts
export function isHTMLElement(x: unknown): x is HTMLElement {
  return x instanceof HTMLElement;
}
