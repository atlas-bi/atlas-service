// This file was sourced from Github (MIT License)
// https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/ui/ContentEditable.tsx
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import * as React from 'react';

import './ContentEditable.css';

export default function LexicalContentEditable({
  className,
}: {
  className?: string;
}): JSX.Element {
  return <ContentEditable className={className || 'ContentEditable__root'} />;
}
