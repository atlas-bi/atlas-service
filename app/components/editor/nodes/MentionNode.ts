import { addClassNamesToElement, isHTMLAnchorElement } from '@lexical/utils';
import {
  $applyNodeReplacement,
  $isElementNode,
  $isRangeSelection,
  type DOMConversionMap,
  type DOMConversionOutput,
  type EditorConfig,
  ElementNode,
  type GridSelection,
  type LexicalNode,
  type NodeKey,
  type NodeSelection,
  type RangeSelection,
  type SerializedElementNode,
  type Spread,
} from 'lexical';

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    type: 'mention';
    version: 1;
    rel?: string;
    target?: string;
    url: string;
    userId: string;
  },
  SerializedElementNode
>;

export class MentionNode extends ElementNode {
  __mention: string | undefined;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      node.__url,
      node.__userId,
      {
        rel: node.__rel,
        target: node.__target,
      },
      node.__key,
    );
  }

  constructor(
    url: string,
    userId: string,
    attributes: { rel?: string; target?: string } = {},
    key: NodeKey | undefined,
  ) {
    super(key);
    const { rel = null, target = null } = attributes;
    this.__url = url;
    this.__userId = userId;
    this.__target = target;
    this.__rel = rel;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('a');
    element.href = this.__url;

    if (this.__target !== null) {
      element.target = this.__target;
    }

    if (this.__rel !== null) {
      element.rel = this.__rel;
    }

    addClassNamesToElement(element, config.theme.link);
    return element;
  }

  updateDOM(prevNode: MentionNode, anchor: HTMLAnchorElement) {
    const url = this.__url;
    const target = this.__target;
    const rel = this.__rel;

    if (url !== prevNode.__url) {
      anchor.href = url;
    }

    if (target !== prevNode.__target) {
      if (target) {
        anchor.target = target;
      } else {
        anchor.removeAttribute('target');
      }
    }

    if (rel !== prevNode.__rel) {
      if (rel) {
        anchor.rel = rel;
      } else {
        anchor.removeAttribute('rel');
      }
    }

    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (node: Node) => ({
        conversion: convertMentionElement,
        priority: 1,
      }),
    };
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(serializedNode.url, serializedNode.userId, {
      rel: serializedNode.rel,
      target: serializedNode.target,
    });
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.mentionName,
      rel: this.getRel(),
      target: this.getTarget(),
      type: 'mention',
      url: this.getURL(),
      userId: this.getUserId(),
      version: 1,
    };
  }

  getURL() {
    return this.getLatest().__url;
  }

  setURL(url: string) {
    const writable = this.getWritable();
    writable.__url = url;
  }

  getUserId() {
    return this.getLatest().__userId;
  }

  setUserId(userId: string) {
    const writable = this.getWritable();
    writable.__userId = userId;
  }

  getTarget() {
    return this.getLatest().__target;
  }

  setTarget(target: string) {
    const writable = this.getWritable();
    writable.__target = target;
  }

  getRel() {
    return this.getLatest().__rel;
  }

  setRel(rel: string) {
    const writable = this.getWritable();
    writable.__rel = rel;
  }

  insertNewAfter(selection: RangeSelection, restoreSelection = true) {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection,
    );

    if ($isElementNode(element)) {
      const mentionNode = $createMentionNode(this.__url, this.__userId, {
        rel: this.__rel,
        target: this.__target,
      });
      element.append(mentionNode);
      return mentionNode;
    }

    return null;
  }

  canInsertTextBefore() {
    return false;
  }

  canInsertTextAfter() {
    return false;
  }

  canBeEmpty() {
    return false;
  }

  isInline() {
    return true;
  }

  isToken(): true {
    return true;
  }

  collapseAtStart(): true {
    return true;
  }

  extractWithChild(
    child: LexicalNode,
    selection: RangeSelection | NodeSelection | GridSelection,
    destination: 'clone' | 'html',
  ) {
    if (!$isRangeSelection(selection)) {
      return false;
    }

    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      selection.getTextContent().length > 0
    );
  }
}

function convertMentionElement(domNode: Node): DOMConversionOutput {
  let node = null;

  if (isHTMLAnchorElement(domNode)) {
    const content = domNode.textContent;

    if (content !== null && content !== '') {
      node = $createMentionNode(content, domNode.getAttribute('href') || '', {
        rel: domNode.getAttribute('rel') || undefined,
        target: domNode.getAttribute('target') || undefined,
      });
    }
  }

  return { node };
}

export function $createMentionNode(
  url: string,
  userId: string,
  attributes?: { rel?: string; target?: string },
  key?: string,
): MentionNode {
  return $applyNodeReplacement(new MentionNode(url, userId, attributes, key));
}

export function $isMentionNode(
  node: LexicalNode | null | undefined,
): node is MentionNode {
  return node instanceof MentionNode;
}
