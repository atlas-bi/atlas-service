// import {$getRoot, $getSelection} from 'lexical';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import {
  type InitialEditorStateType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { forwardRef } from 'react';

import { Theme } from './Theme';
import { MentionNode } from './nodes/MentionNode';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';

const Reader = forwardRef(
  (
    { initialEditorState }: { initialEditorState: InitialEditorStateType },
    ref,
  ) => {
    const editorConfig = {
      // The editor theme
      theme: Theme,
      namespace: 'default',
      editable: false,
      editorState: initialEditorState,

      // Handling of errors during update
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError(error: any) {
        throw error;
      },
      // Any custom nodes go here
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
        MentionNode,
      ],
    };
    return (
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="editor-input readonly" />
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <CodeHighlightPlugin />
            <ListPlugin />
            <LinkPlugin />
            <AutoLinkPlugin />
            <LexicalClickableLinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          </div>
        </div>
      </LexicalComposer>
    );
  },
);

EditorReader.displayName = 'editorReader';
export default EditorReader;
