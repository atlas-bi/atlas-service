// This file was sourced from Github (MIT License)
// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/CodeActionMenuPlugin/utils.ts
import { debounce } from 'lodash-es';
import { useMemo, useRef } from 'react';

export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
  maxWait?: number,
) {
  const funcRef = useRef<T | null>(null);
  funcRef.current = fn;

  return useMemo(
    () =>
      debounce(
        (...args: Parameters<T>) => {
          if (funcRef.current) {
            funcRef.current(...args);
          }
        },
        ms,
        { maxWait },
      ),
    [ms, maxWait],
  );
}
