import { cn } from '@/lib/utils';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import type { EditorState } from 'lexical';
import { forwardRef } from 'react';

import { Theme } from './Theme';
import { MentionNode } from './nodes/MentionNode';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import { EditorCapturePlugin } from './plugins/EditorCapturePlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';

interface changeCallbackType {
  (editorState: EditorState): void;
}

const Editor = forwardRef(
  (
    {
      onChange = () => ({}),
      placeholder,
      value,
      className,
      readonly = false,
    }: {
      onChange?: changeCallbackType;
      placeholder?: string;
      value?: string;
      className?: string;
      readonly?: boolean;
    },
    ref,
  ) => {
    const editorConfig = {
      theme: Theme,
      namespace: 'default',
      editorState: value,
      editable: !readonly,
      onError(error: Error) {
        throw error;
      },
      nodes: [AutoLinkNode, LinkNode, MentionNode],
    };

    return (
      <LexicalComposer initialConfig={editorConfig} key={value}>
        <div className="relative">
          {readonly ? (
            <PlainTextPlugin
              contentEditable={
                <ContentEditable
                  className={cn('h-auto w-full bg-transparent p-0', className)}
                />
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
          ) : (
            <>
              <PlainTextPlugin
                contentEditable={
                  <ContentEditable
                    className={cn(
                      'resize-y overflow-y-auto h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      className,
                    )}
                  />
                }
                placeholder={
                  <div className="absolute top-2 left-3 -z-10 text-muted-foreground text-sm">
                    {placeholder || 'Enter some text...'}
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <LinkPlugin />
              <OnChangePlugin onChange={onChange} />
              <AutoLinkPlugin />
              <EditorCapturePlugin ref={ref} />
              {typeof document !== 'undefined' && (
                <>
                  <MentionsPlugin />
                  <EmojisPlugin />
                </>
              )}
            </>
          )}
        </div>
      </LexicalComposer>
    );
  },
);

Editor.displayName = 'editor';
export default Editor;
