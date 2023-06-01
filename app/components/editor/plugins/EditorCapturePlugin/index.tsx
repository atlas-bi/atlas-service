import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { forwardRef, useEffect } from 'react';

export const EditorCapturePlugin = forwardRef((props, ref) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (ref !== null && typeof ref !== 'function') {
      ref.current = editor;
      return () => {
        ref.current = null;
      };
    }
    return () => undefined;
  }, [editor, ref]);
  return null;
});

EditorCapturePlugin.displayName = 'EditorCapturePlugin';
