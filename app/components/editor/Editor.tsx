// import {$getRoot, $getSelection} from 'lexical';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import type { EditorState } from 'lexical';
import {
  type MutableRefObject,
  type RefObject,
  forwardRef,
  useEffect,
  useState,
} from 'react';

import { Theme } from './Theme';
import { ImageNode } from './nodes/ImageNode';
import { MentionNode } from './nodes/MentionNode';
import TableCellNodes from './nodes/TableCellNodes';
import { TableNode as NewTableNode } from './nodes/TableNode';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableCellResizerPlugin from './plugins/TableCellResizer';
import { TablePlugin as NewTablePlugin } from './plugins/TablePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { CAN_USE_DOM } from './utils/canUseDom';

function PlaceholderBuilder() {
  return <div className="editor-placeholder">...</div>;
}

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
      readonly = false,
    }: {
      onChange: changeCallbackType;
      activeEditor: MutableRefObject<HTMLDivElement | undefined>;
      MEILISEARCH_URL: string;
      MEILISEARCH_KEY: string;
      userIndex: string;
      readonly?: boolean;
    },
    ref,
  ) => {
    const isEditable = !readonly;
    const [floatingAnchorElem, setFloatingAnchorElem] =
      useState<HTMLDivElement | null>(null);
    const [isSmallWidthViewport, setIsSmallWidthViewport] =
      useState<boolean>(false);

    const editorConfig = {
      theme: Theme,
      namespace: 'default',
      onError(error: Error) {
        throw error;
      },
      // Any custom nodes go here
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        NewTableNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        CodeHighlightNode,
        AutoLinkNode,
        LinkNode,
        MentionNode,
        ImageNode,
        HorizontalRuleNode,
      ],
    };

    const cellEditorConfig = {
      namespace: 'default',
      nodes: [...TableCellNodes],
      onError: (error: Error) => {
        throw error;
      },
      theme: Theme,
    };

    useEffect(() => {
      const updateViewPortWidth = () => {
        const isNextSmallWidthViewport =
          CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

        if (isNextSmallWidthViewport !== isSmallWidthViewport) {
          setIsSmallWidthViewport(isNextSmallWidthViewport);
        }
      };
      updateViewPortWidth();
      window.addEventListener('resize', updateViewPortWidth);

      return () => {
        window.removeEventListener('resize', updateViewPortWidth);
      };
    }, [isSmallWidthViewport]);

    return (
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <div
            ref={ref as RefObject<HTMLDivElement>}
            className={`editor-toolbar ${
              ref !== activeEditor ? 'is-hidden' : ''
            }`}
          ></div>
          {typeof document !== 'undefined' && <>{/*<ToolbarPlugin />*/}</>}

          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<PlaceholderBuilder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {typeof document !== 'undefined' && (
              <>
                <MentionsPlugin
                  MEILISEARCH_URL={MEILISEARCH_URL}
                  MEILISEARCH_KEY={MEILISEARCH_KEY}
                  searchIndex={userIndex}
                />
                <EmojisPlugin />

                <DragDropPaste />

                <ClearEditorPlugin />
                <AutoLinkPlugin />
                <HistoryPlugin />
                <MarkdownShortcutPlugin />
                <CodeHighlightPlugin />
                <ListPlugin />
                <CheckListPlugin />
                <ListMaxIndentLevelPlugin maxDepth={7} />
                <TablePlugin
                  hasCellMerge={true}
                  hasCellBackgroundColor={true}
                />
                <TableCellResizerPlugin />
                <NewTablePlugin cellEditorConfig={cellEditorConfig}>
                  <AutoFocusPlugin />
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable className="TableNode__contentEditable" />
                    }
                    placeholder={null}
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <HistoryPlugin />
                  <ImagesPlugin captionsEnabled={false} />
                  <LinkPlugin />
                  <LexicalClickableLinkPlugin />
                  <FloatingTextFormatToolbarPlugin />
                </NewTablePlugin>
                <ImagesPlugin />
                <LinkPlugin />
                {!isEditable && <LexicalClickableLinkPlugin />}
                <HorizontalRulePlugin />

                {floatingAnchorElem && !isSmallWidthViewport && (
                  <>
                    <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                    <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                    <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                    <TableCellActionMenuPlugin
                      anchorElem={floatingAnchorElem}
                      cellMerge={true}
                    />
                    <FloatingTextFormatToolbarPlugin
                      anchorElem={floatingAnchorElem}
                    />
                  </>
                )}

                <OnChangePlugin onChange={onChange} />
                <EditorCapturePlugin ref={ref} />
              </>
            )}
          </div>
        </div>
      </LexicalComposer>
    );
  },
);

Editor.displayName = 'editor';
export default Editor;
