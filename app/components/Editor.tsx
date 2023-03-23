// import {$getRoot, $getSelection} from 'lexical';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import type { EditorState } from 'lexical';
import {
  type MutableRefObject,
  type RefObject,
  forwardRef,
  useEffect,
} from 'react';

import { MentionNode } from '../nodes/MentionNode';
import { TextTokenNode } from '../nodes/TextTokenNode';
import AutoLinkPlugin from '../plugins/AutoLinkPlugin';
import CodeHighlightPlugin from '../plugins/CodeHighlightPlugin';
import EmojiPlugin from '../plugins/EmojiPlugin';
import ListMaxIndentLevelPlugin from '../plugins/ListMaxIndentLevelPlugin';
import MentionsPlugin from '../plugins/MentionsPlugin';
import ToolbarPlugin from '../plugins/ToolbarPlugin';
import { EditorTheme } from './EditorTheme';

function PlaceholderBuilder() {
  return <div className="editor-placeholder">...</div>;
}

// function onChange(editorState) {
//   editorState.read(() => {
//     // Read the contents of the EditorState here.
//     const root = $getRoot();
//     const selection = $getSelection();

//     console.log(root, selection);
//   });
// }

interface changeCallbackType {
  (editorState: EditorState): void;
}

const EditorCapturePlugin = forwardRef((props: any, ref: any) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    ref.current = editor;
    return () => {
      ref.current = null;
    };
  }, [editor, ref]);

  return null;
});

const Editor = forwardRef(
  (
    {
      onChange,
      activeEditor,
      MEILISEARCH_URL,
      MEILISEARCH_KEY,
      userIndex,
    }: {
      onChange: changeCallbackType;
      activeEditor: MutableRefObject<HTMLDivElement | undefined>;
      MEILISEARCH_URL: string;
      MEILISEARCH_KEY: string;
      userIndex: string;
    },
    ref,
  ) => {
    const editorConfig = {
      // The editor theme
      theme: EditorTheme,
      namespace: 'default',

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
        TextTokenNode,
      ],
    };

    return (
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <div
            ref={ref as RefObject<HTMLDivElement>}
            className={`editor-toolbar ${
              ref !== activeEditor ? 'is-hidden' : ''
            }`}
          >
            <ToolbarPlugin />
            {typeof document !== 'undefined' && (
              <MentionsPlugin
                MEILISEARCH_URL={MEILISEARCH_URL}
                MEILISEARCH_KEY={MEILISEARCH_KEY}
                searchIndex={userIndex}
              />
            )}
          </div>
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<PlaceholderBuilder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <CodeHighlightPlugin />
            <ListPlugin />
            <LinkPlugin />
            <OnChangePlugin onChange={onChange} />
            <AutoLinkPlugin />
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <EditorCapturePlugin ref={ref} />
            {/*{typeof document !== 'undefined' && <EmojiPlugin />}*/}
          </div>
        </div>
      </LexicalComposer>
    );
  },
);

Editor.displayName = 'editor';
export default Editor;
