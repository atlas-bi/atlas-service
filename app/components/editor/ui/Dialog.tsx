// This file was sourced from Github (MIT License)
// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/DraggableBlockPlugin/index.tsx
import * as React from 'react';
import { ReactNode } from 'react';

import './Dialog.css';

type Props = Readonly<{
  'data-test-id'?: string;
  children: ReactNode;
}>;

export function DialogButtonsList({ children }: Props): JSX.Element {
  return <div className="DialogButtonsList">{children}</div>;
}

export function DialogActions({
  'data-test-id': dataTestId,
  children,
}: Props): JSX.Element {
  return (
    <div className="DialogActions" data-test-id={dataTestId}>
      {children}
    </div>
  );
}
