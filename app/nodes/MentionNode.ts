import type { Spread } from 'lexical';
import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  DecoratorNode,
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  TextNode,
} from 'lexical';

var utils = require('@lexical/utils');

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    type: 'mention';
    version: 1;
  },
  SerializedTextNode
>;

export class MentionNode extends ElementNode {
  __mention: string;

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

  constructor(url: string, userId: string, attributes = {}, key: NodeKey) {
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

    utils.addClassNamesToElement(element, config.theme.link);
    return element;
  }

  updateDOM(prevNode, anchor, config) {
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
      a: (domNode: HTMLAnchorElement) => ({
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

  setURL(url) {
    const writable = this.getWritable();
    writable.__url = url;
  }

  getUserId() {
    return this.getLatest().__userId;
  }

  setUserId(userId) {
    const writable = this.getWritable();
    writable.__userId = UserId;
  }

  getTarget() {
    return this.getLatest().__target;
  }

  setTarget(target) {
    const writable = this.getWritable();
    writable.__target = target;
  }

  getRel() {
    return this.getLatest().__rel;
  }

  setRel(rel) {
    const writable = this.getWritable();
    writable.__rel = rel;
  }

  insertNewAfter(selection, restoreSelection = true) {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection,
    );

    if (lexical.$isElementNode(element)) {
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

  extractWithChild(child, selection, destination) {
    if (!lexical.$isRangeSelection(selection)) {
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

function convertMentionElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  let node = null;

  if (utils.isHTMLAnchorElement(domNode)) {
    const content = domNode.textContent;

    if (content !== null && content !== '') {
      node = $createMentionNode(content, domNode.getAttribute('href') || '', {
        rel: domNode.getAttribute('rel'),
        target: domNode.getAttribute('target'),
      });
    }
  }

  return node;
}

export function $createMentionNode(
  url: string,
  userId: string,
  key?: string,
  attributes,
): MentionNode {
  return $applyNodeReplacement(new MentionNode(url, userId, key, attributes));
}

export function $isMentionNode(
  node: LexicalNode | null | undefined,
): node is MentionNode {
  return node instanceof MentionNode;
}
