// This file was sourced from Github (MIT License)
// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/utils/joinClasses.ts
export default function joinClasses(
  ...args: Array<string | boolean | null | undefined>
) {
  return args.filter(Boolean).join(' ');
}
