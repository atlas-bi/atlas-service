import type { Spread } from 'lexical';
import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  TextNode,
} from 'lexical';

var utils = require('@lexical/utils');

export class TextTokenNode extends TextNode {
  static getType(): string {
    return 'text_token';
  }
  constructor(text, key) {
    super(text, key);
  }
  static clone(node) {
    return new TextTokenNode(node.__text, node.__key);
  }
  isToken(): true {
    return true;
  }

  static importJSON(serializedNode) {
    const node = $createTextTokenNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  isTextEntity() {
    return true;
  }

  exportJSON() {
    return { ...super.exportJSON(), type: 'text_token' };
  }
}

export function $createTextTokenNode(text: string): TextTokenNode {
  return new TextTokenNode(text);
}

function $isTextTokenNode(node) {
  return node instanceof TextTokenNode;
}
