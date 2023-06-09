// This file was sourced from Github (MIT License)
// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/ui/Placeholder.tsx
import * as React from 'react';
import { ReactNode } from 'react';

import './Placeholder.css';

export default function Placeholder({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return <div className={className || 'Placeholder__root'}>{children}</div>;
}
